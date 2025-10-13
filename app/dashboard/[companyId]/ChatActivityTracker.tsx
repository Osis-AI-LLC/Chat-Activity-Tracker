"use client";

import { useState } from "react";
import {
	Button,
	TextField,
	Heading,
	Text,
	Badge,
	Avatar,
	Callout,
	Spinner,
	Card,
	Dialog,
} from "frosted-ui";

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
	const [selectedDate, setSelectedDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [activityData, setActivityData] = useState<ActivityData | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchChatActivity = async () => {
		setLoading(true);
		setError(null);
		setActivityData(null);

		try {
			const response = await fetch(
				`/api/chat-activity?chatExperienceId=${encodeURIComponent(chatExperienceId)}&date=${encodeURIComponent(selectedDate)}`,
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
		<div className="min-h-screen bg-gray-1 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header with How to Use button */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<Heading size="8" className="mb-2">
							Chat Activity Tracker
						</Heading>
						<Text size="3" color="gray">
							Track and analyze message activity in your chat experiences
						</Text>
					</div>
					<Dialog.Root>
						<Dialog.Trigger>
							<Button variant="soft" size="2">
								How to Use
							</Button>
						</Dialog.Trigger>
						<Dialog.Content style={{ maxWidth: 450 }}>
							<Dialog.Title>How to Use</Dialog.Title>
							<Dialog.Description size="2" className="mb-4">
								Follow these steps to track chat activity
							</Dialog.Description>
							<div className="space-y-3">
								<Text size="2" className="block">
									→ Enter the Chat Experience ID (starts with "exp_")
								</Text>
								<Text size="2" className="block">
									→ Select the date you want to analyze
								</Text>
								<Text size="2" className="block">
									→ Click "Track Activity" to see message details
								</Text>
							</div>
							<div className="flex justify-end mt-4">
								<Dialog.Close>
									<Button variant="soft">Got it</Button>
								</Dialog.Close>
							</div>
						</Dialog.Content>
					</Dialog.Root>
				</div>

				{/* Input Form */}
				<Card size="3">
					<div className="space-y-4">
						<div>
							<Text size="2" weight="medium" className="block mb-2" as="label">
								Chat Experience ID
							</Text>
							<TextField.Root size="3" variant="surface">
								<TextField.Input
									placeholder="exp_XXXXXXXX"
									value={chatExperienceId}
									onChange={(e) => setChatExperienceId(e.target.value)}
								/>
							</TextField.Root>
						</div>

						<div>
							<Text size="2" weight="medium" className="block mb-2" as="label">
								Date
							</Text>
							<TextField.Root size="3" variant="surface">
								<TextField.Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									className="pr-3"
								/>
							</TextField.Root>
						</div>

						<div className="pt-2">
							<Button
								onClick={fetchChatActivity}
								disabled={loading || !chatExperienceId || !selectedDate}
								size="2"
								variant="soft"
							>
								{loading ? (
									<span className="flex items-center gap-2">
										<Spinner size="1" />
										<span>Fetching...</span>
									</span>
								) : (
									"Track Activity"
								)}
							</Button>
						</div>
					</div>
				</Card>

				{/* Error Message */}
				{error && (
					<Callout.Root color="red" size="2">
						<Callout.Text>
							<Text size="2" weight="medium">
								Error: {error}
							</Text>
						</Callout.Text>
					</Callout.Root>
				)}

				{/* Results */}
				{activityData && (
					<Card size="3">
						<div className="space-y-6">
							<div>
								<Heading size="6" className="mb-4">Activity Summary</Heading>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
									<div>
										<Text size="2" color="gray" className="block mb-1">
											Chat Experience ID
										</Text>
										<Text size="3" weight="medium" className="break-all">
											{activityData.chatExperienceId}
										</Text>
									</div>

									<div>
										<Text size="2" color="gray" className="block mb-1">
											Date
										</Text>
										<Text size="3" weight="medium">
											{activityData.date}
										</Text>
									</div>
								</div>

								<Card size="2" variant="surface">
									<Text size="2" color="gray" className="block mb-2">
										Total Messages
									</Text>
									<Heading size="8">
										{activityData.totalMessages}
									</Heading>
								</Card>
							</div>

							{activityData.messages && activityData.messages.length > 0 && (
								<div>
									<Heading size="5" className="mb-4">Recent Messages</Heading>
									<div className="space-y-3">
										{activityData.messages.slice(0, 10).map((msg) => (
											<Card key={msg.id} size="2" variant="surface">
												<div className="flex justify-between items-start mb-2">
													<div className="flex items-center gap-3">
														{msg.user?.profilePicture?.sourceUrl && (
															<Avatar
																size="2"
																src={msg.user.profilePicture.sourceUrl}
																fallback={msg.user?.name?.[0] || msg.user?.username?.[0] || "?"}
															/>
														)}
														<div>
															<Text size="2" weight="medium">
																{msg.user?.name || msg.user?.username || "Unknown User"}
															</Text>
															{msg.user?.username && msg.user?.name && (
																<Text size="1" color="gray">@{msg.user.username}</Text>
															)}
														</div>
													</div>
													<Text size="1" color="gray">
														{new Date(Number(msg.createdAt)).toLocaleString()}
													</Text>
												</div>
												<Text size="2" className="mb-2">
													{msg.content || "(No text content)"}
												</Text>
												<div className="flex gap-2">
													{msg.isPinned && (
														<Badge color="yellow" size="1">📌 Pinned</Badge>
													)}
													{msg.isEdited && (
														<Badge color="gray" size="1" variant="soft">edited</Badge>
													)}
												</div>
											</Card>
										))}
									</div>
									{activityData.messages.length > 10 && (
										<Text size="2" color="gray" className="text-center mt-4 block">
											Showing 10 of {activityData.messages.length} messages
										</Text>
									)}
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
