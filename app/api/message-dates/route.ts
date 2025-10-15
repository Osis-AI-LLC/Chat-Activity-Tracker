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

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const experienceId = searchParams.get("experienceId");

		// Validate required parameters
		if (!experienceId) {
			return Response.json(
				{ error: "experienceId is required" },
				{ status: 400 },
			);
		}

		console.log(`🔍 Finding date range for experience: ${experienceId}`);

		// Fetch just a few pages to get a sample of dates
		const allTimestamps: number[] = [];
		let cursor: string | null = null;
		let pageCount = 0;
		const maxPages = 10; // Only fetch first 10 pages for speed

		while (pageCount < maxPages) {
			try {
				const { data, page_info } = await fetchPageDirect(experienceId, cursor);
				
				if (data.length === 0) {
					break;
				}

				pageCount++;
				console.log(`📄 Fetched page ${pageCount} with ${data.length} messages`);

				// Collect timestamps from this page
				const pageTimestamps = data.map((msg: any) => Number(msg.createdAt)).filter((ts: number) => !isNaN(ts));
				allTimestamps.push(...pageTimestamps);

				// Show date range for this page
				if (pageTimestamps.length > 0) {
					const minTs = Math.min(...pageTimestamps);
					const maxTs = Math.max(...pageTimestamps);
					console.log(`  📅 Page date range: ${new Date(minTs).toISOString()} to ${new Date(maxTs).toISOString()}`);
				}

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

		// Calculate overall date range
		let dateRange = null;
		if (allTimestamps.length > 0) {
			const minTs = Math.min(...allTimestamps);
			const maxTs = Math.max(...allTimestamps);
			
			// Get unique dates
			const uniqueDates = [...new Set(allTimestamps.map(ts => new Date(ts).toISOString().split('T')[0]))].sort();
			
			dateRange = {
				oldest: new Date(minTs).toISOString(),
				newest: new Date(maxTs).toISOString(),
				totalMessages: allTimestamps.length,
				pagesSampled: pageCount,
				availableDates: uniqueDates.slice(0, 20), // Show first 20 dates
				totalUniqueDates: uniqueDates.length
			};
			
			console.log(`📊 Overall date range from ${allTimestamps.length} messages:`);
			console.log(`  📅 Oldest: ${new Date(minTs).toISOString()}`);
			console.log(`  📅 Newest: ${new Date(maxTs).toISOString()}`);
			console.log(`  📅 Available dates: ${uniqueDates.slice(0, 10).join(', ')}${uniqueDates.length > 10 ? ` ... and ${uniqueDates.length - 10} more` : ''}`);
		}

		return Response.json({
			experienceId,
			dateRange,
			message: dateRange ? "Use one of the available dates for filtering" : "No messages found"
		});

	} catch (error) {
		console.error("Error finding message dates:", error);
		return Response.json(
			{
				error: "Failed to find message dates",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
