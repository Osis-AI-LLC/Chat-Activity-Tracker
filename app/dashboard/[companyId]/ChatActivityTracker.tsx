"use client";

import { useState } from "react";

interface MessageUser {
	name?: string;
	username?: string;
	profilePicture?: {
		sourceUrl?: string;
	};
}

interface Message {
	id: string;
	createdAt: string;
	content: string;
	isEdited?: boolean;
	isPinned?: boolean;
	user?: MessageUser;
}

interface ActivityData {
	chatExperienceId: string;
	date: string;
	totalMessages: number;
	messages: Message[];
}

export default function ChatActivityTracker() {
	const [chatExperienceId, setChatExperienceId] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [loading, setLoading] = useState(false);
	const [activityData, setActivityData] = useState<ActivityData | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchChatActivity = async () => {
		setLoading(true);
		setError(null);
		setActivityData(null);

		try {
			const response = await fetch(
				`/api/chat-activity?chatExperienceId=${encodeURIComponent(chatExperienceId)}&date=${encodeURIComponent(date)}`,
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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-8">
						<div className="flex items-center gap-3 mb-2">
							<svg
								className="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Chat Icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
								/>
							</svg>
							<h1 className="text-3xl font-bold text-white">
								Chat Activity Tracker
							</h1>
						</div>
						<p className="text-blue-100 mt-2 text-lg">
							Track and analyze message activity in your chat experiences
						</p>
					</div>

					{/* Form */}
					<div className="p-8 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
						<div className="space-y-6">
							<div>
								<label
									htmlFor="chatExperienceId"
									className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
								>
									Chat Experience ID
								</label>
								<input
									id="chatExperienceId"
									type="text"
									value={chatExperienceId}
									onChange={(e) => setChatExperienceId(e.target.value)}
									placeholder="exp_XXXXXXXX"
									className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
								/>
							</div>

							<div>
								<label
									htmlFor="date"
									className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
								>
									Date
								</label>
								<input
									id="date"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100"
								/>
							</div>

							<button
								type="button"
								onClick={fetchChatActivity}
								disabled={loading || !chatExperienceId || !date}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
							<div className="mt-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-lg">
								<div className="flex">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400 dark:text-red-300"
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
										<p className="text-sm font-medium text-red-800 dark:text-red-200">
											{error}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Results */}
						{activityData && (
							<div className="mt-8 space-y-4">
								<div className="bg-gradient-to-r from-green-50/80 via-emerald-50/80 to-teal-50/80 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm border-l-4 border-green-500 dark:border-green-400 p-6 rounded-r-lg">
									<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
										Activity Summary
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Chat Experience ID
											</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
												{activityData.chatExperienceId}
											</p>
										</div>
										<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Date
											</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
												{activityData.date}
											</p>
										</div>
										<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-lg shadow-sm md:col-span-2 border border-gray-200 dark:border-gray-700">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Total Messages
											</p>
											<p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
												{activityData.totalMessages}
											</p>
										</div>
									</div>
								</div>

								{/* Message Details */}
								{activityData.messages && activityData.messages.length > 0 && (
									<div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-lg border border-gray-200 dark:border-gray-700">
										<h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Messages Icon</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
												/>
											</svg>
											Recent Messages (First 10)
										</h3>
										<div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
											{activityData.messages.slice(0, 10).map((msg) => (
												<div
													key={msg.id}
													className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
												>
													<div className="flex justify-between items-start mb-2">
														<div className="flex items-center gap-2">
															{msg.user?.profilePicture?.sourceUrl && (
																<img
																	src={msg.user.profilePicture.sourceUrl}
																	alt="User avatar"
																	className="w-8 h-8 rounded-full"
																/>
															)}
															<div>
																<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
																	{msg.user?.name ||
																		msg.user?.username ||
																		"Unknown User"}
																</p>
																{msg.user?.username && msg.user?.name && (
																	<p className="text-xs text-gray-500 dark:text-gray-400">
																		@{msg.user.username}
																	</p>
																)}
															</div>
														</div>
														<div className="text-right">
															<p className="text-xs text-gray-500 dark:text-gray-400">
																{new Date(
																	Number(msg.createdAt),
																).toLocaleString()}
															</p>
															{msg.isEdited && (
																<span className="text-xs text-gray-400 dark:text-gray-500 italic">
																	edited
																</span>
															)}
														</div>
													</div>
													<p className="text-sm text-gray-700 dark:text-gray-300 break-words">
														{msg.content || "(No text content)"}
													</p>
													{msg.isPinned && (
														<div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs">
															<svg
																className="w-3 h-3"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<title>Pin Icon</title>
																<path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
															</svg>
															Pinned
														</div>
													)}
												</div>
											))}
										</div>
										{activityData.messages.length > 10 && (
											<p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
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
				<div className="mt-8 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-md border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Info Icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						How to Use
					</h3>
					<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
						<li className="flex items-start">
							<svg
								className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
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
							Enter the Chat Experience ID (starts with "exp_") of the chat you
							want to track
						</li>
						<li className="flex items-start">
							<svg
								className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
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
								className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
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
							along with message details
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
