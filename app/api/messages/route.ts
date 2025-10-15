import { whopSdk } from "@/lib/whop-sdk";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const experienceId = searchParams.get("experienceId");
		const cursor = searchParams.get("cursor");
		const limit = searchParams.get("limit") || "100";
		const date = searchParams.get("date"); // Optional date filter in YYYY-MM-DD format

		// Validate required parameters
		if (!experienceId) {
			return Response.json(
				{ error: "experienceId is required" },
				{ status: 400 },
			);
		}

		// Parse date filter if provided
		let startTimestamp: number | null = null;
		let endTimestamp: number | null = null;

		if (date) {
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

			const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
			const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

			if (Number.isNaN(startOfDay.getTime()) || Number.isNaN(endOfDay.getTime())) {
				return Response.json({ error: "Invalid date" }, { status: 400 });
			}

			startTimestamp = startOfDay.getTime();
			endTimestamp = endOfDay.getTime();
		}

		// Fetch messages from the chat using Whop SDK
		const result = await whopSdk.messages.listMessagesFromChat({
			chatExperienceId: experienceId,
		});

		if (!result || !result.posts) {
			return Response.json({
				experienceId,
				totalMessages: 0,
				messages: [],
				pageInfo: {
					hasNextPage: false,
					endCursor: null,
				},
			});
		}

		// Filter messages by date if date filter is provided
		let filteredMessages = result.posts;
		if (startTimestamp !== null && endTimestamp !== null) {
			filteredMessages = result.posts.filter((post) => {
				if ("createdAt" in post && post.createdAt) {
					const messageTimestamp = Number(post.createdAt);
					if (isNaN(messageTimestamp)) {
						return false;
					}
					return messageTimestamp >= startTimestamp! && messageTimestamp <= endTimestamp!;
				}
				return false;
			});
		}

		// For now, we'll return all messages since the Whop SDK doesn't support cursor-based pagination
		// In a real implementation, you might need to implement your own pagination logic
		const hasNextPage = result.posts.length === 50; // If we got exactly 50, there might be more
		const endCursor = hasNextPage ? result.posts[result.posts.length - 1]?.id || null : null;

		return Response.json({
			experienceId,
			totalMessages: filteredMessages.length,
			messages: filteredMessages,
			pageInfo: {
				hasNextPage,
				endCursor,
			},
			...(date && {
				dateRange: {
					start: new Date(startTimestamp!).toISOString(),
					end: new Date(endTimestamp!).toISOString(),
				},
			}),
		});
	} catch (error) {
		console.error("Error fetching messages:", error);
		return Response.json(
			{
				error: "Failed to fetch messages",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
