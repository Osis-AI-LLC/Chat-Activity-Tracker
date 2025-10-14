import { whopSdk } from "@/lib/whop-sdk";
import type { NextRequest } from "next/server";

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

	// Fetch messages from the chat using Whop SDK
	const result = await whopSdk.messages.listMessagesFromChat({
		chatExperienceId,
	});

	if (!result || !result.posts) {
			return Response.json({
				chatExperienceId,
				date,
				totalMessages: 0,
				messages: [],
				dateRange: {
					start: startOfDay.toISOString(),
					end: endOfDay.toISOString(),
				},
			});
		}

	// Filter messages by the specified date
	const filteredMessages = result.posts.filter((post) => {
		// Type guard to ensure post has createdAt property
		if ("createdAt" in post && post.createdAt) {
			const messageTimestamp = Number(post.createdAt);
			// Validate that the timestamp is a valid number
			if (isNaN(messageTimestamp)) {
				console.warn("Invalid timestamp found:", post.createdAt);
				return false;
			}
			return (
				messageTimestamp >= startTimestamp && messageTimestamp <= endTimestamp
			);
		}
		return false;
	});

		// Return the activity data
		return Response.json({
			chatExperienceId,
			date,
			totalMessages: filteredMessages.length,
			messages: filteredMessages,
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
