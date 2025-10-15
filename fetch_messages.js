/* Usage: 

1. Get an app api key: https://whop.com/dashboard/developer 
2. Go to the permissions tab and request the `chat:read` permission
3. Install the app in your community.
4. Find the url of a channel you wanna check: https://whop.com/joined/emoney/online-important-JMvZrC0Iz2kBIp/app/
5. Extract the experience id (example: JMvZrC0Iz2kBIp) and prepend `exp_` to it.
   Paste that experience id into the fetchAllMessages function below:
6. Run the script using: `WHOP_API_KEY=XXXXXXXXX node fetch_messages.js`

*/

// Example usage - replace with your experience ID
fetchAllMessages("exp_AMVsGdHu1vbJYZ");

async function fetchAllMessages(experienceId) {
	const messages = [];
	let cursor = null;
	let index = 0;
	
	console.log(`Starting to fetch messages for experience: ${experienceId}`);
	
	while (true) {
		const { data, page_info } = await fetchPage(experienceId, cursor);
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
	return messages;
}

async function fetchPage(experienceId, cursor) {
	const url = new URL("https://api.whop.com/v1/messages");
	url.searchParams.set("limit", "100");
	url.searchParams.set("channel_id", experienceId);
	if (cursor) url.searchParams.set("after", cursor);
	
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
		},
	});
	
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	const data = await response.json();
	return data;
}
