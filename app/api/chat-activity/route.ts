import type { NextRequest } from "next/server";

// Helper function to fetch a single page of messages using direct API
async function fetchPageDirect(chatExperienceId: string, cursor: string | null = null) {
	const url = new URL("https://api.whop.com/v1/messages");
	url.searchParams.set("limit", "100");
	url.searchParams.set("channel_id", chatExperienceId);
	if (cursor) {
		url.searchParams.set("after", cursor);
	}

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
	}

	const data = await response.json();
	
	// Log raw API response for debugging
	console.log(`🔍 Raw API response for page ${cursor ? 'with cursor' : 'first'}:`);
	console.log(`📊 Response structure:`, {
		hasData: !!data.data,
		dataLength: data.data?.length || 0,
		hasPageInfo: !!data.page_info,
		pageInfo: data.page_info,
		hasNextPage: data.page_info?.has_next_page,
		endCursor: data.page_info?.end_cursor
	});
	
	// Log sample message structure if we have data
	if (data.data && data.data.length > 0) {
		console.log(`📝 Sample message structure:`, {
			firstMessage: {
				id: data.data[0].id,
				createdAt: data.data[0].createdAt,
				createdAtType: typeof data.data[0].createdAt,
				createdAtValue: data.data[0].createdAt,
				createdAtParsed: new Date(Number(data.data[0].createdAt)).toISOString(),
				hasContent: !!data.data[0].content,
				hasAuthor: !!data.data[0].author
			}
		});
	}
	
	return {
		data: data.data || [],
		page_info: data.page_info || { has_next_page: false, end_cursor: null }
	};
}

// Helper function to fetch all messages with pagination support
async function fetchAllMessagesWithPagination(chatExperienceId: string, startTimestamp: number, endTimestamp: number) {
	const allMessages = [];
	let cursor: string | null = null;
	let pageCount = 0;
	const maxPages = 500; // Support up to 50,000 messages (500 pages * 100 messages per page)

	console.log(`Starting to fetch messages for experience: ${chatExperienceId}`);

	while (pageCount < maxPages) {
		try {
			const { data, page_info } = await fetchPageDirect(chatExperienceId, cursor);
			
			if (data.length === 0) {
				break;
			}

			pageCount++;
			console.log(`Fetched page ${pageCount} with ${data.length} messages`);

			// Filter messages by the specified date range
			// If the entire page is older than the requested start date, we can stop
			const pageTimestamps = data
				.map((message: any) => Number(message?.createdAt))
				.filter((n: number) => !Number.isNaN(n));
			if (pageTimestamps.length > 0) {
				const pageMaxTs = Math.max(...pageTimestamps); // newest in page
				if (pageMaxTs < startTimestamp) {
					break;
				}
			}

			const filteredMessages = data.filter((message: any) => {
				if (!message.createdAt) return false;
				const messageTimestamp = Number(message.createdAt);
				if (isNaN(messageTimestamp)) {
					console.warn("Invalid timestamp found:", message.createdAt);
					return false;
				}
				const isInRange = messageTimestamp >= startTimestamp && messageTimestamp <= endTimestamp;
				
				if (isInRange) {
					console.log(`✅ Found matching message: ${new Date(messageTimestamp).toISOString()}`);
				}
				
				return isInRange;
			});
			
			console.log(`📊 Page ${pageCount}: Filtered ${filteredMessages.length} messages from ${data.length} total`);

			allMessages.push(...filteredMessages);

			if (page_info.has_next_page && page_info.end_cursor) {
				cursor = page_info.end_cursor;
				// Add a small delay to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 200));
			} else {
				break;
			}
		} catch (error) {
			console.error("Error fetching page:", error);
			break;
		}
	}

	if (pageCount >= maxPages) {
		console.warn(`Reached maximum pages (${maxPages}). Some messages might be missing.`);
	}

	console.log(`Total messages fetched: ${allMessages.length}`);
	return allMessages;
}

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const chatExperienceId = searchParams.get("chatExperienceId");
		const date = searchParams.get("date"); // Expected format: YYYY-MM-DD

		// Validate required parameters
		if (!chatExperienceId) {
			return Response.json(
				{ error: "chatExperienceId is required" },
				{ status: 400 },
			);
		}

		if (!date) {
			return Response.json({ error: "date is required" }, { status: 400 });
		}

		// Parse the date and get start/end timestamps for the day
		// Parse YYYY-MM-DD format properly to avoid timezone issues
		const dateParts = date.split('-');
		if (dateParts.length !== 3) {
			return Response.json({ error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
		}

		const year = parseInt(dateParts[0], 10);
		const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
		const day = parseInt(dateParts[2], 10);

		if (isNaN(year) || isNaN(month) || isNaN(day)) {
			return Response.json({ error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
		}

		// Use UTC dates to avoid timezone issues
		const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
		const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

		// Validate the dates are valid
		if (Number.isNaN(startOfDay.getTime()) || Number.isNaN(endOfDay.getTime())) {
			return Response.json({ error: "Invalid date" }, { status: 400 });
		}

		// Convert to Unix timestamps (milliseconds as per Whop SDK)
		const startTimestamp = startOfDay.getTime();
		const endTimestamp = endOfDay.getTime();
		
		console.log(`🔍 Filtering for date: ${date}`);
		console.log(`📅 UTC Start of day: ${startOfDay.toISOString()}`);
		console.log(`📅 UTC End of day: ${endOfDay.toISOString()}`);

	// Fetch messages from the chat using Whop SDK with pagination support
	const allMessages = await fetchAllMessagesWithPagination(chatExperienceId, startTimestamp, endTimestamp);

	// Log information about the API response for debugging
	console.log(`Total messages fetched: ${allMessages.length}`);
	console.log(`Messages filtered for date ${date}: ${allMessages.length}`);

		// Return the activity data
		return Response.json({
			chatExperienceId,
			date,
			totalMessages: allMessages.length,
			messages: allMessages,
			dateRange: {
				start: startOfDay.toISOString(),
				end: endOfDay.toISOString(),
			},
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
