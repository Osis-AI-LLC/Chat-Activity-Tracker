"use client";

import {
	Avatar,
	Badge,
	Button,
	Callout,
	Card,
	Dialog,
	Heading,
	Select,
	Spinner,
	Text,
	TextField,
} from "frosted-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface ChatExperience {
	id: string;
	name: string;
	description?: string;
	logo?: string | null;
}

interface ChatActivityTrackerProps {
	companyId: string;
}

interface SavedChat {
	id: string;
	name: string;
	expId: string;
	date: string;
	savedAt: string;
}

export default function ChatActivityTracker({
	companyId,
}: ChatActivityTrackerProps) {
	const router = useRouter();
	const [availableChats, setAvailableChats] = useState<ChatExperience[]>([]);
	const [loadingChats, setLoadingChats] = useState(true);
	const [chatExperienceId, setChatExperienceId] = useState("");
	const [selectedDate, setSelectedDate] = useState("");
	const [chatName, setChatName] = useState("");
	const [loading, setLoading] = useState(false);
	const [activityData, setActivityData] = useState<ActivityData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [useCustomId, setUseCustomId] = useState(false);

	// Load saved chats from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem("savedChats");
		if (stored) {
			try {
				setSavedChats(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse saved chats:", e);
			}
		}
	}, []);

	// Save to localStorage whenever savedChats changes
	useEffect(() => {
		if (savedChats.length > 0) {
			localStorage.setItem("savedChats", JSON.stringify(savedChats));
		}
	}, [savedChats]);

	// Fetch available chats when component mounts
	useEffect(() => {
		const fetchChats = async () => {
			setLoadingChats(true);
			try {
				const response = await fetch(
					`/api/chats?companyId=${encodeURIComponent(companyId)}`,
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to fetch chats");
				}

				const data = await response.json();
				setAvailableChats(data.chats);

				// Auto-select the first chat if available
				if (data.chats.length > 0) {
					setChatExperienceId(data.chats[0].id);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load chats");
			} finally {
				setLoadingChats(false);
			}
		};

		fetchChats();
	}, [companyId]);

	const fetchChatActivity = async () => {
		setLoading(true);
		setError(null);
		setActivityData(null);
		setSaveSuccess(false);

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

	const saveChat = () => {
		if (!chatExperienceId || !selectedDate) {
			return;
		}

		const newSavedChat: SavedChat = {
			id: `${chatExperienceId}-${selectedDate}-${Date.now()}`,
			name: chatName || `Chat ${chatExperienceId} - ${selectedDate}`,
			expId: chatExperienceId,
			date: selectedDate,
			savedAt: new Date().toISOString(),
		};

		setSavedChats((prev) => [newSavedChat, ...prev]);
		setSaveSuccess(true);
		setTimeout(() => setSaveSuccess(false), 3000);
	};

	const loadChat = (savedChat: SavedChat) => {
		setChatExperienceId(savedChat.expId);
		setSelectedDate(savedChat.date);
		setChatName(savedChat.name);
	};

	const deleteChat = (chatId: string) => {
		setSavedChats((prev) => prev.filter((chat) => chat.id !== chatId));
		if (savedChats.length === 1) {
			localStorage.removeItem("savedChats");
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
					<div className="flex gap-2">
						<Button
							variant="solid"
							size="2"
							onClick={() => router.push(`/push-notifications/dashboard/${companyId}`)}
						>
							Push Notifications
						</Button>
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
									→ Select a chat from the dropdown (automatically loaded from
									your shop) OR click "Enter Custom ID" to manually input an
									experience ID
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
				</div>

				{/* Loading State */}
				{loadingChats && (
					<Card size="3">
						<div className="flex items-center justify-center py-8">
							<Spinner size="3" />
						</div>
					</Card>
				)}

				{/* Input Form */}
				{!loadingChats && (
					<Card size="3">
						<div className="space-y-4">
							<div>
								<div className="flex justify-between items-center mb-2">
									<Text size="2" weight="medium" as="label">
										{useCustomId ? "Enter Custom Experience ID" : "Select Chat"}
									</Text>
									<Button
										size="1"
										variant="ghost"
										onClick={() => {
											setUseCustomId(!useCustomId);
											setChatExperienceId("");
										}}
									>
										{useCustomId ? "← Use Dropdown" : "Enter Custom ID →"}
									</Button>
								</div>

								{useCustomId ? (
									<TextField.Root size="3" variant="surface">
										<TextField.Input
											placeholder="exp_xxxxxxxxxx"
											value={chatExperienceId}
											onChange={(e) => setChatExperienceId(e.target.value)}
										/>
									</TextField.Root>
								) : availableChats.length > 0 ? (
									<>
										<Select.Root
											value={chatExperienceId}
											onValueChange={setChatExperienceId}
										>
											<Select.Trigger className="w-full" />
											<Select.Content className="max-h-60 overflow-y-auto z-50">
												{availableChats.map((chat) => (
													<Select.Item key={chat.id} value={chat.id}>
														{chat.name}
													</Select.Item>
												))}
											</Select.Content>
										</Select.Root>
									</>
								) : (
									<Callout.Root color="amber" size="1">
										<Callout.Text>
											<Text size="2">
												No chat experiences found. Use custom ID instead.
											</Text>
										</Callout.Text>
									</Callout.Root>
								)}

								{chatExperienceId && (
									<Text size="1" color="gray" className="mt-1 block">
										{useCustomId ? "Custom " : ""}ID: {chatExperienceId}
									</Text>
								)}
							</div>

							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
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

							<div className="pt-2 flex gap-2">
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
								<Button
									onClick={saveChat}
									disabled={!chatExperienceId || !selectedDate}
									size="2"
									variant="surface"
								>
									Save Chat
								</Button>
							</div>
						</div>
					</Card>
				)}

				{/* Success Message */}
				{saveSuccess && (
					<Callout.Root color="green" size="2">
						<Callout.Text>
							<Text size="2" weight="medium">
								✓ Chat saved successfully!
							</Text>
						</Callout.Text>
					</Callout.Root>
				)}

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

				{/* Saved Chats */}
				{savedChats.length > 0 && (
					<Card size="3">
						<Heading size="5" className="mb-4">
							Saved Chats
						</Heading>
						<div className="space-y-2">
							{savedChats.map((chat) => (
								<Card key={chat.id} size="2" variant="surface">
									<div className="flex justify-between items-center">
										<div className="flex-1">
											<Text size="2" weight="medium" className="block">
												{chat.name}
											</Text>
											<Text size="1" color="gray">
												{chat.date} • Saved{" "}
												{(() => {
													try {
														const savedDate = new Date(chat.savedAt);
														if (isNaN(savedDate.getTime())) {
															return "Invalid date";
														}
														return savedDate.toLocaleDateString();
													} catch (error) {
														return "Invalid date";
													}
												})()}
											</Text>
										</div>
										<div className="flex gap-2">
											<Button
												size="1"
												variant="soft"
												onClick={() => loadChat(chat)}
											>
												Load
											</Button>
											<Button
												size="1"
												variant="soft"
												color="red"
												onClick={() => deleteChat(chat.id)}
											>
												Delete
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>
					</Card>
				)}

				{/* Results */}
				{activityData && (
					<Card size="3">
						<div className="space-y-6">
							<div>
								<Heading size="6" className="mb-4">
									Activity Summary
								</Heading>

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
									<Heading size="8">{activityData.totalMessages}</Heading>
								</Card>
							</div>

							{activityData.messages && activityData.messages.length > 0 && (
								<div>
									<Heading size="5" className="mb-4">
										Recent Messages
									</Heading>
									<div className="space-y-3">
										{activityData.messages.slice(0, 10).map((msg) => (
											<Card key={msg.id} size="2" variant="surface">
												<div className="flex justify-between items-start mb-2">
													<div className="flex items-center gap-3">
														{msg.user?.profilePicture?.sourceUrl && (
															<Avatar
																size="2"
																src={msg.user.profilePicture.sourceUrl}
																fallback={
																	msg.user?.name?.[0] ||
																	msg.user?.username?.[0] ||
																	"?"
																}
															/>
														)}
														<div>
															<Text size="2" weight="medium">
																{msg.user?.name ||
																	msg.user?.username ||
																	"Unknown User"}
															</Text>
															{msg.user?.username && msg.user?.name && (
																<Text size="1" color="gray">
																	@{msg.user.username}
																</Text>
															)}
														</div>
													</div>
													<Text size="1" color="gray">
														{(() => {
															try {
																const timestamp = Number(msg.createdAt);
																if (isNaN(timestamp)) {
																	return "Invalid date";
																}
																return new Date(timestamp).toLocaleString();
															} catch (error) {
																return "Invalid date";
															}
														})()}
													</Text>
												</div>
												<Text size="2" className="mb-2">
													{msg.content || "(No text content)"}
												</Text>
												<div className="flex gap-2">
													{msg.isPinned && (
														<Badge color="yellow" size="1">
															📌 Pinned
														</Badge>
													)}
													{msg.isEdited && (
														<Badge color="gray" size="1" variant="soft">
															edited
														</Badge>
													)}
												</div>
											</Card>
										))}
									</div>
									{activityData.messages.length > 10 && (
										<Text
											size="2"
											color="gray"
											className="text-center mt-4 block"
										>
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
