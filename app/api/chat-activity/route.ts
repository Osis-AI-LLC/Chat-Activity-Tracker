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
