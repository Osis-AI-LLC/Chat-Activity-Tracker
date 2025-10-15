import type { NextRequest } from "next/server";

// Helper function to fetch a single page of messages using direct API
async function fetchPageDirect(experienceId: string, cursor: string | null = null) {
	const url = new URL("https://api.whop.com/v1/messages");
	url.searchParams.set("limit", "100");
	url.searchParams.set("channel_id", experienceId);
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
		const firstMsg = data.data[0];
		let createdAtParsed = 'Invalid date';
		try {
			const timestamp = Number(firstMsg.createdAt);
			if (!isNaN(timestamp)) {
				const date = new Date(timestamp);
				if (!isNaN(date.getTime())) {
					createdAtParsed = date.toISOString();
				}
			}
		} catch (error) {
			createdAtParsed = `Error parsing: ${error}`;
		}
		
		console.log(`📝 Sample message structure:`, {
			firstMessage: {
				id: firstMsg.id,
				createdAt: firstMsg.createdAt,
				createdAtType: typeof firstMsg.createdAt,
				createdAtValue: firstMsg.createdAt,
				createdAtParsed,
				hasContent: !!firstMsg.content,
				hasAuthor: !!firstMsg.author,
				// Show all available fields to find the actual date field
				allFields: Object.keys(firstMsg),
				// Show a few key fields that might contain dates
				possibleDateFields: {
					created_at: firstMsg.created_at,
					createdAt: firstMsg.createdAt,
					date: firstMsg.date,
					timestamp: firstMsg.timestamp,
					time: firstMsg.time,
					posted_at: firstMsg.posted_at,
					postedAt: firstMsg.postedAt
				}
			}
		});
	}
	
	return {
		data: data.data || [],
		page_info: data.page_info || { has_next_page: false, end_cursor: null }
	};
}

// Helper function to fetch all messages with pagination
async function fetchAllMessagesWithPagination(experienceId: string, startTimestamp?: number, endTimestamp?: number) {
	const allMessages = [];
	let cursor: string | null = null;
	let pageCount = 0;
	const maxPages = 500; // Support up to 50,000 messages (500 pages * 100 messages per page)

	console.log(`Starting to fetch messages for experience: ${experienceId}`);

	while (pageCount < maxPages) {
		try {
			const { data, page_info } = await fetchPageDirect(experienceId, cursor);
			
			if (data.length === 0) {
				break;
			}

			pageCount++;
			console.log(`Fetched page ${pageCount} with ${data.length} messages`);
			
			// Show date range for this page to help debug
			if (data.length > 0) {
				const timestamps = data.map((msg: any) => Number(msg.createdAt)).filter((ts: number) => !isNaN(ts));
				if (timestamps.length > 0) {
					const minTs = Math.min(...timestamps);
					const maxTs = Math.max(...timestamps);
					console.log(`  📅 Page date range: ${new Date(minTs).toISOString()} to ${new Date(maxTs).toISOString()}`);
				}
			}

			// Filter messages by date if timestamps are provided
			let filteredMessages = data;
			if (startTimestamp !== undefined && endTimestamp !== undefined) {
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

				filteredMessages = data.filter((message: any) => {
					if (!message.createdAt) return false;
					const messageTimestamp = Number(message.createdAt);
					if (isNaN(messageTimestamp)) return false;
					const isInRange = messageTimestamp >= startTimestamp && messageTimestamp <= endTimestamp;
					
					if (isInRange) {
						console.log(`✅ Found matching message: ${new Date(messageTimestamp).toISOString()}`);
					}
					
					return isInRange;
				});
				
				console.log(`📊 Page ${pageCount}: Filtered ${filteredMessages.length} messages from ${data.length} total`);
			}

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
		const experienceId = searchParams.get("experienceId");
		const date = searchParams.get("date"); // Optional date filter in YYYY-MM-DD format

		// Validate required parameters
		if (!experienceId) {
			return Response.json(
				{ error: "experienceId is required" },
				{ status: 400 },
			);
		}

		// Parse date filter if provided
		let startTimestamp: number | undefined = undefined;
		let endTimestamp: number | undefined = undefined;

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

			// Use UTC dates to avoid timezone issues
			const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
			const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

			if (Number.isNaN(startOfDay.getTime()) || Number.isNaN(endOfDay.getTime())) {
				return Response.json({ error: "Invalid date" }, { status: 400 });
			}

			startTimestamp = startOfDay.getTime();
			endTimestamp = endOfDay.getTime();
			
			console.log(`🔍 Filtering for date: ${date}`);
			console.log(`📅 UTC Start of day: ${startOfDay.toISOString()}`);
			console.log(`📅 UTC End of day: ${endOfDay.toISOString()}`);
		}

		// Fetch all messages with pagination
		const allMessages = await fetchAllMessagesWithPagination(experienceId, startTimestamp, endTimestamp);

		// If no date filter, show the actual date range of messages
		let messageDateRange = null;
		if (!date && allMessages.length > 0) {
			const timestamps = allMessages.map((msg: any) => Number(msg.createdAt)).filter((ts: number) => !isNaN(ts));
			if (timestamps.length > 0) {
				const minTs = Math.min(...timestamps);
				const maxTs = Math.max(...timestamps);
				messageDateRange = {
					oldest: new Date(minTs).toISOString(),
					newest: new Date(maxTs).toISOString(),
					availableDates: [...new Set(timestamps.map((ts: number) => new Date(ts).toISOString().split('T')[0]))].sort().slice(0, 10)
				};
			}
		}

		return Response.json({
			experienceId,
			totalMessages: allMessages.length,
			messages: allMessages,
			pageInfo: {
				hasNextPage: false,
				endCursor: null,
			},
			...(date && {
				dateRange: {
					start: new Date(startTimestamp!).toISOString(),
					end: new Date(endTimestamp!).toISOString(),
				},
			}),
			...(messageDateRange && {
				messageDateRange,
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
