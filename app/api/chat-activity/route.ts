import { whopSdk } from "@/lib/whop-sdk";
import type { NextRequest } from "next/server";

// Helper function to fetch all messages with pagination support
async function fetchAllMessagesWithPagination(chatExperienceId: string, startTimestamp: number, endTimestamp: number) {
	const allMessages = [];
	let hasMoreMessages = true;
	let attempts = 0;
	const maxAttempts = 10; // Prevent infinite loops

	while (hasMoreMessages && attempts < maxAttempts) {
		try {
			const result = await whopSdk.messages.listMessagesFromChat({
				chatExperienceId,
			});

			if (!result || !result.posts || result.posts.length === 0) {
				hasMoreMessages = false;
				break;
			}

			// Filter messages by the specified date range
			const filteredMessages = result.posts.filter((post) => {
				if ("createdAt" in post && post.createdAt) {
					const messageTimestamp = Number(post.createdAt);
					if (isNaN(messageTimestamp)) {
						console.warn("Invalid timestamp found:", post.createdAt);
						return false;
					}
					return messageTimestamp >= startTimestamp && messageTimestamp <= endTimestamp;
				}
				return false;
			});

			allMessages.push(...filteredMessages);

			// If we got less than 50 messages, we've likely reached the end
			// If we got exactly 50, there might be more messages
			hasMoreMessages = result.posts.length === 50;
			attempts++;

			// Add a small delay to avoid rate limiting
			if (hasMoreMessages) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		} catch (error) {
			console.error("Error fetching messages in pagination:", error);
			hasMoreMessages = false;
		}
	}

	if (attempts >= maxAttempts) {
		console.warn(`Reached maximum attempts (${maxAttempts}) for fetching messages. Some messages might be missing.`);
	}

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

		// Create dates in local timezone to avoid UTC/local confusion
		const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
		const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

		// Validate the dates are valid
		if (Number.isNaN(startOfDay.getTime()) || Number.isNaN(endOfDay.getTime())) {
			return Response.json({ error: "Invalid date" }, { status: 400 });
		}

		// Convert to Unix timestamps (milliseconds as per Whop SDK)
		const startTimestamp = startOfDay.getTime();
		const endTimestamp = endOfDay.getTime();

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
