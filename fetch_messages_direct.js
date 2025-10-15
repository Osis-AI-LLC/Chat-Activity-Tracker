/* Direct Whop API Message Fetcher with Pagination

This script fetches messages directly from the Whop API using cursor-based pagination.
It's more reliable than the SDK approach for getting all messages.

Usage: 
1. Get an app api key: https://whop.com/dashboard/developer 
2. Go to the permissions tab and request the `chat:read` permission
3. Install the app in your community.
4. Find the url of a channel you wanna check: https://whop.com/joined/emoney/online-important-JMvZrC0Iz2kBIp/app/
5. Extract the experience id (example: JMvZrC0Iz2kBIp) and prepend `exp_` to it.
6. Run the script using: `WHOP_API_KEY=XXXXXXXXX node fetch_messages_direct.js`

*/

const fs = require('fs');

// Example usage - replace with your experience ID
const EXPERIENCE_ID = "exp_AMVsGdHu1vbJYZ";
const DATE_FILTER = null; // Set to "YYYY-MM-DD" format to filter by date, or null for all messages

fetchAllMessagesDirect(EXPERIENCE_ID, DATE_FILTER);

async function fetchAllMessagesDirect(experienceId, dateFilter = null) {
	const messages = [];
	let cursor = null;
	let pageCount = 0;
	let totalFetched = 0;
	
	console.log(`🚀 Starting to fetch messages for experience: ${experienceId}`);
	if (dateFilter) {
		console.log(`📅 Filtering messages for date: ${dateFilter}`);
	}
	
	const startTime = Date.now();
	
	try {
		while (true) {
			const { data, page_info, hasError } = await fetchPageDirect(experienceId, cursor);
			
			if (hasError) {
				console.error("❌ Error occurred while fetching messages");
				break;
			}
			
			pageCount++;
			console.log(`📄 Fetched page ${pageCount} with ${data.length} messages`);
			
			// Apply date filter if provided
			let filteredMessages = data;
			if (dateFilter) {
				filteredMessages = filterMessagesByDate(data, dateFilter);
				console.log(`📅 Filtered to ${filteredMessages.length} messages for date ${dateFilter}`);
			}
			
			messages.push(...filteredMessages);
			totalFetched += data.length;
			
			if (page_info.has_next_page && page_info.end_cursor) {
				cursor = page_info.end_cursor;
				// Add a small delay to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 200));
			} else {
				break;
			}
		}
		
		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;
		
		console.log("\n" + "=".repeat(50));
		console.log(`✅ Successfully fetched ${messages.length} messages in ${pageCount} pages`);
		console.log(`📊 Total messages from API: ${totalFetched}`);
		console.log(`⏱️  Time taken: ${duration.toFixed(2)} seconds`);
		console.log(`📈 Average: ${(messages.length / duration).toFixed(2)} messages/second`);
		
		// Save messages to file
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `messages_${experienceId}_${timestamp}.json`;
		fs.writeFileSync(filename, JSON.stringify(messages, null, 2));
		console.log(`💾 Messages saved to ${filename}`);
		
		// Show some statistics
		if (messages.length > 0) {
			const firstMessage = messages[messages.length - 1]; // Oldest message
			const lastMessage = messages[0]; // Newest message
			
			console.log(`📅 Date range: ${new Date(Number(firstMessage.createdAt)).toISOString()} to ${new Date(Number(lastMessage.createdAt)).toISOString()}`);
		}
		
		return messages;
		
	} catch (error) {
		console.error("❌ Fatal error:", error.message);
		throw error;
	}
}

async function fetchPageDirect(experienceId, cursor) {
	const url = new URL("https://api.whop.com/v1/messages");
	url.searchParams.set("limit", "100");
	url.searchParams.set("channel_id", experienceId);
	if (cursor) {
		url.searchParams.set("after", cursor);
	}
	
	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
				"Content-Type": "application/json",
			},
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ HTTP error! status: ${response.status}`);
			console.error(`❌ Error response: ${errorText}`);
			return { data: [], page_info: { has_next_page: false, end_cursor: null }, hasError: true };
		}
		
		const data = await response.json();
		return { data: data.data || [], page_info: data.page_info || { has_next_page: false, end_cursor: null }, hasError: false };
		
	} catch (error) {
		console.error("❌ Network error:", error.message);
		return { data: [], page_info: { has_next_page: false, end_cursor: null }, hasError: true };
	}
}

function filterMessagesByDate(messages, dateString) {
	const targetDate = new Date(dateString);
	const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
	const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
	
	return messages.filter(message => {
		if (!message.createdAt) return false;
		
		const messageDate = new Date(Number(message.createdAt));
		return messageDate >= startOfDay && messageDate <= endOfDay;
	});
}

// Export functions for use in other scripts
module.exports = {
	fetchAllMessagesDirect,
	filterMessagesByDate
};
