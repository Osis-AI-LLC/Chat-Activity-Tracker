import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const channelId = searchParams.get("channelId");
		const date = searchParams.get("date"); // Expected format: YYYY-MM-DD

		// Validate required parameters
		if (!channelId) {
			return Response.json(
				{ error: "channelId is required" },
				{ status: 400 },
			);
		}

		if (!date) {
			return Response.json({ error: "date is required" }, { status: 400 });
		}

		// Validate API credentials
		const apiKey = process.env.WHOP_API_KEY;
		if (!apiKey) {
			console.error("WHOP_API_KEY is not configured");
			return Response.json(
				{ error: "API key is not configured" },
				{ status: 500 },
			);
		}

		// Parse the date and get start/end timestamps for the day
		const targetDate = new Date(date);
		if (Number.isNaN(targetDate.getTime())) {
			return Response.json({ error: "Invalid date format" }, { status: 400 });
		}

		// Set to start of day (00:00:00)
		const startOfDay = new Date(targetDate);
		startOfDay.setHours(0, 0, 0, 0);

		// Set to end of day (23:59:59.999)
		const endOfDay = new Date(targetDate);
		endOfDay.setHours(23, 59, 59, 999);

		// Convert to Unix timestamps (seconds)
		const afterTimestamp = Math.floor(startOfDay.getTime() / 1000);
		const beforeTimestamp = Math.floor(endOfDay.getTime() / 1000);

		// Fetch messages from the Whop Chat API using REST API
		let allMessages: any[] = [];
		let nextCursor: string | null = null;
		let hasMore = true;
		let pageCount = 0;
		const maxPages = 100; // Safety limit to prevent infinite loops

		// Paginate through all messages for the day
		while (hasMore && pageCount < maxPages) {
			pageCount++;

			// Build query parameters
			const params = new URLSearchParams({
				after: afterTimestamp.toString(),
				before: beforeTimestamp.toString(),
				per: "100", // Max limit per page
			});

			if (nextCursor) {
				params.append("cursor", nextCursor);
			}

			// Make API request to Whop Chat API
			const apiUrl = `https://api.whop.com/api/v5/chat/${channelId}/messages?${params.toString()}`;

			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Whop API request failed: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			const data = await response.json();

			// Add messages from this page
			if (data.data && Array.isArray(data.data)) {
				allMessages = allMessages.concat(data.data);
			}

			// Check if there are more messages to fetch
			if (data.next_cursor) {
				nextCursor = data.next_cursor;
			} else {
				hasMore = false;
			}

			// Safety check: if no messages were returned, stop
			if (!data.data || data.data.length === 0) {
				hasMore = false;
			}
		}

		// Return the activity data
		return Response.json({
			channelId,
			date,
			totalMessages: allMessages.length,
			messages: allMessages,
			dateRange: {
				start: startOfDay.toISOString(),
				end: endOfDay.toISOString(),
			},
			pagesProcessed: pageCount,
		});
	} catch (error) {
		console.error("Error fetching chat activity:", error);
		return Response.json(
			{
				error: "Failed to fetch chat activity",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
