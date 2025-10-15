/* Advanced Message Fetcher using Next.js API

Usage: 
1. Start your Next.js development server: `npm run dev`
2. Get an app api key: https://whop.com/dashboard/developer 
3. Go to the permissions tab and request the `chat:read` permission
4. Install the app in your community.
5. Find the url of a channel you wanna check: https://whop.com/joined/emoney/online-important-JMvZrC0Iz2kBIp/app/
6. Extract the experience id (example: JMvZrC0Iz2kBIp) and prepend `exp_` to it.
7. Run the script using: `WHOP_API_KEY=XXXXXXXXX node fetch_messages_advanced.js`

*/

const BASE_URL = "http://localhost:3000"; // Adjust if your dev server runs on a different port

// Example usage - replace with your experience ID
fetchAllMessagesAdvanced("exp_AMVsGdHu1vbJYZ");

async function fetchAllMessagesAdvanced(experienceId, date = null) {
	const messages = [];
	let cursor = null;
	let index = 0;
	
	console.log(`Starting to fetch messages for experience: ${experienceId}`);
	if (date) {
		console.log(`Filtering messages for date: ${date}`);
	}
	
	while (true) {
		const { data, page_info } = await fetchPageAdvanced(experienceId, cursor, date);
		console.log(`Fetched page with ${data.length} messages [${index}]`);
		messages.push(...data);
		
		if (page_info.has_next_page) {
			cursor = page_info.end_cursor;
		} else {
			break;
		}
		index++;
	}
	
	console.log("\n ========================= \n");
	console.log(` ✔︎ Fetched ${messages.length} messages in total`);
	
	// Optional: Save messages to a file
	const fs = require('fs');
	const filename = `messages_${experienceId}_${new Date().toISOString().split('T')[0]}.json`;
	fs.writeFileSync(filename, JSON.stringify(messages, null, 2));
	console.log(`Messages saved to ${filename}`);
	
	return messages;
}

async function fetchPageAdvanced(experienceId, cursor, date = null) {
	const url = new URL(`${BASE_URL}/api/messages`);
	url.searchParams.set("experienceId", experienceId);
	if (cursor) url.searchParams.set("cursor", cursor);
	if (date) url.searchParams.set("date", date);
	
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
		},
	});
	
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
	}
	
	const data = await response.json();
	return {
		data: data.messages,
		page_info: data.pageInfo
	};
}

// Helper function to fetch messages for a specific date
async function fetchMessagesForDate(experienceId, date) {
	console.log(`Fetching messages for ${experienceId} on ${date}`);
	return await fetchAllMessagesAdvanced(experienceId, date);
}

// Export functions for use in other scripts
module.exports = {
	fetchAllMessagesAdvanced,
	fetchMessagesForDate
};
