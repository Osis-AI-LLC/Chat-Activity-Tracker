# Message Fetching Implementation

This document describes the message fetching functionality implemented for the Chat Activity Tracker.

## Overview

The implementation provides multiple ways to fetch messages from Whop chat experiences:

1. **Direct API Scripts** - Standalone Node.js scripts for testing and bulk fetching
2. **Next.js API Endpoints** - Server-side endpoints for the web application
3. **Enhanced Chat Activity API** - Updated existing endpoint with pagination support

## Files Created

### API Endpoints

- `app/api/messages/route.ts` - New endpoint for fetching messages with pagination
- `app/api/chat-activity/route.ts` - Updated with pagination support

### Utility Scripts

- `fetch_messages.js` - Basic message fetcher using direct Whop API
- `fetch_messages_advanced.js` - Advanced fetcher using Next.js API endpoints
- `fetch_messages_direct.js` - Comprehensive direct API fetcher with statistics

## Usage

### 1. Direct API Scripts

#### Basic Fetcher
```bash
WHOP_API_KEY=your_api_key node fetch_messages.js
```

#### Advanced Fetcher (requires Next.js dev server)
```bash
# Start your dev server first
npm run dev

# Then run the advanced fetcher
WHOP_API_KEY=your_api_key node fetch_messages_advanced.js
```

#### Direct API Fetcher (recommended)
```bash
WHOP_API_KEY=your_api_key node fetch_messages_direct.js
```

### 2. API Endpoints

#### Fetch Messages
```
GET /api/messages?experienceId=exp_XXXXX&date=YYYY-MM-DD&cursor=XXXXX
```

Parameters:
- `experienceId` (required): The chat experience ID with `exp_` prefix
- `date` (optional): Filter messages by date in YYYY-MM-DD format
- `cursor` (optional): Pagination cursor for fetching next page

#### Chat Activity (Enhanced)
```
GET /api/chat-activity?chatExperienceId=exp_XXXXX&date=YYYY-MM-DD
```

This endpoint now includes pagination support to fetch all messages for a given date.

## Features

### Pagination Support
- Cursor-based pagination for fetching all messages
- Support for up to 50,000 messages (500 pages * 100 messages per page)
- Automatic retry logic with rate limiting protection
- Maximum page limits to prevent infinite loops

### Date Filtering
- Filter messages by specific dates
- Support for YYYY-MM-DD date format
- Timezone-aware date range filtering

### Error Handling
- Comprehensive error handling and logging
- Graceful degradation when API limits are reached
- Detailed error messages for debugging

### Statistics and Monitoring
- Message count tracking
- Performance metrics (messages per second)
- Date range information
- File export capabilities

## Setup Instructions

1. **Get API Key**: Visit https://whop.com/dashboard/developer
2. **Request Permissions**: Go to permissions tab and request `chat:read` permission
3. **Install App**: Install the app in your community
4. **Find Experience ID**: 
   - Navigate to a channel: https://whop.com/joined/emoney/online-important-JMvZrC0Iz2kBIp/app/
   - Extract the experience ID (e.g., `JMvZrC0Iz2kBIp`)
   - Add `exp_` prefix: `exp_JMvZrC0Iz2kBIp`

## Example Usage

### Fetch All Messages
```javascript
const { fetchAllMessagesDirect } = require('./fetch_messages_direct.js');

// Fetch all messages
await fetchAllMessagesDirect("exp_AMVsGdHu1vbJYZ");

// Fetch messages for specific date
await fetchAllMessagesDirect("exp_AMVsGdHu1vbJYZ", "2024-01-15");
```

### Using API Endpoints
```javascript
// Fetch messages via API
const response = await fetch('/api/messages?experienceId=exp_XXXXX&date=2024-01-15');
const data = await response.json();
console.log(`Fetched ${data.totalMessages} messages`);
```

## Recent Improvements (2024)

### Enhanced Pagination
- **Increased Capacity**: Now supports fetching up to 50,000 messages (previously limited to ~500)
- **Direct API Calls**: Replaced Whop SDK with direct API calls for better pagination control
- **Improved Performance**: Better rate limiting and error handling
- **Cursor-based Pagination**: Proper implementation using Whop API's cursor system

### API Endpoint Updates
- **Messages API**: Complete rewrite to use direct API calls with proper pagination
- **Chat Activity API**: Updated to use the same improved pagination logic
- **Better Error Handling**: More robust error handling and logging

## Performance Considerations

- **Rate Limiting**: Built-in delays between requests to avoid API limits
- **Memory Usage**: Messages are processed in batches to manage memory
- **Timeout Protection**: Maximum page limits prevent infinite loops
- **Error Recovery**: Graceful handling of network and API errors

## File Outputs

The direct fetcher scripts automatically save results to JSON files:
- Format: `messages_{experienceId}_{timestamp}.json`
- Includes all message data with metadata
- Preserves original API response structure

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure `WHOP_API_KEY` environment variable is set
   - Verify the API key has `chat:read` permission

2. **Experience ID Format**
   - Must include `exp_` prefix
   - Example: `exp_AMVsGdHu1vbJYZ`

3. **Rate Limiting**
   - Scripts include automatic delays
   - Reduce concurrent requests if needed

4. **Date Filtering**
   - Use YYYY-MM-DD format
   - Ensure timezone consistency

### Debug Information

The scripts provide detailed logging:
- Page-by-page progress updates
- Error messages with context
- Performance statistics
- Date range information

## Integration with Frontend

The enhanced chat activity API automatically uses the new pagination logic, so existing frontend components will benefit from improved message fetching without requiring changes.
