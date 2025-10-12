"use client";

import { useState } from "react";

export default function ChatActivityTracker() {
	const [channelId, setChannelId] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [loading, setLoading] = useState(false);
	const [activityData, setActivityData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchChatActivity = async () => {
		setLoading(true);
		setError(null);
		setActivityData(null);

		try {
			const response = await fetch(
				`/api/chat-activity?channelId=${encodeURIComponent(channelId)}&date=${encodeURIComponent(date)}`,
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch chat activity");
			}

			const data = await response.json();
			setActivityData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white shadow-xl rounded-2xl overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							Chat Activity Tracker
						</h1>
						<p className="text-blue-100 mt-2">
							Track total messages sent in a specific channel on a specific day
						</p>
					</div>

					{/* Form */}
					<div className="p-8">
						<div className="space-y-6">
							<div>
								<label
									htmlFor="channelId"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Channel ID
								</label>
								<input
									id="channelId"
									type="text"
									value={channelId}
									onChange={(e) => setChannelId(e.target.value)}
									placeholder="Enter channel ID"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
								/>
							</div>

							<div>
								<label
									htmlFor="date"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Date
								</label>
								<input
									id="date"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
								/>
							</div>

							<button
								type="button"
								onClick={fetchChatActivity}
								disabled={loading || !channelId || !date}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<title>Loading</title>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Fetching Activity...
									</span>
								) : (
									"Track Activity"
								)}
							</button>
						</div>

						{/* Error Message */}
						{error && (
							<div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
								<div className="flex">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<title>Error</title>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-red-800">{error}</p>
									</div>
								</div>
							</div>
						)}

						{/* Results */}
						{activityData && (
							<div className="mt-8 space-y-4">
								<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
									<h2 className="text-lg font-bold text-gray-900 mb-4">
										Activity Summary
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="bg-white p-4 rounded-lg shadow-sm">
											<p className="text-sm text-gray-600 mb-1">Channel ID</p>
											<p className="text-lg font-semibold text-gray-900 break-all">
												{activityData.channelId}
											</p>
										</div>
										<div className="bg-white p-4 rounded-lg shadow-sm">
											<p className="text-sm text-gray-600 mb-1">Date</p>
											<p className="text-lg font-semibold text-gray-900">
												{activityData.date}
											</p>
										</div>
										<div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
											<p className="text-sm text-gray-600 mb-1">
												Total Messages
											</p>
											<p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
												{activityData.totalMessages}
											</p>
										</div>
									</div>
								</div>

								{/* Message Details */}
								{activityData.messages && activityData.messages.length > 0 && (
									<div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
										<h3 className="text-md font-bold text-gray-900 mb-4">
											Recent Messages (First 10)
										</h3>
										<div className="space-y-3 max-h-96 overflow-y-auto">
											{activityData.messages.slice(0, 10).map((msg: any) => (
												<div
													key={msg.id}
													className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
												>
													<div className="flex justify-between items-start mb-2">
														<p className="text-sm font-semibold text-gray-900">
															User: {msg.user_id || "Unknown"}
														</p>
														<p className="text-xs text-gray-500">
															{new Date(
																msg.created_at * 1000,
															).toLocaleString()}
														</p>
													</div>
													<p className="text-sm text-gray-700 break-words">
														{msg.text || "(No text content)"}
													</p>
												</div>
											))}
										</div>
										{activityData.messages.length > 10 && (
											<p className="text-sm text-gray-500 mt-3 text-center">
												Showing 10 of {activityData.messages.length} messages
											</p>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Info Card */}
				<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-blue-900 mb-2">
						How to Use
					</h3>
					<ul className="text-sm text-blue-800 space-y-2">
						<li className="flex items-start">
							<svg
								className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Check</title>
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Enter the Channel ID of the chat you want to track
						</li>
						<li className="flex items-start">
							<svg
								className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Check</title>
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Select the specific date you want to analyze
						</li>
						<li className="flex items-start">
							<svg
								className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Check</title>
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Click "Track Activity" to see the total messages sent that day
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
