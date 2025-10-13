"use client";

import {
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

interface ChatExperience {
	id: string;
	name: string;
	description?: string;
	logo?: string | null;
}

interface PushNotificationSenderProps {
	companyId: string;
}

export default function PushNotificationSender({
	companyId,
}: PushNotificationSenderProps) {
	const [availableExperiences, setAvailableExperiences] = useState<
		ChatExperience[]
	>([]);
	const [loadingExperiences, setLoadingExperiences] = useState(true);
	const [experienceId, setExperienceId] = useState("");
	const [useCustomId, setUseCustomId] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [subtitle, setSubtitle] = useState("");
	const [link, setLink] = useState("");
	const [restPath, setRestPath] = useState("");
	const [userIds, setUserIds] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Fetch available experiences when component mounts
	useEffect(() => {
		const fetchExperiences = async () => {
			setLoadingExperiences(true);
			try {
				const response = await fetch(
					`/api/chats?companyId=${encodeURIComponent(companyId)}`,
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to fetch experiences");
				}

				const data = await response.json();
				setAvailableExperiences(data.chats);

				// Auto-select the first experience if available
				if (data.chats.length > 0) {
					setExperienceId(data.chats[0].id);
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load experiences",
				);
			} finally {
				setLoadingExperiences(false);
			}
		};

		fetchExperiences();
	}, [companyId]);

	const sendNotification = async () => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Parse userIds if provided
			const userIdArray = userIds
				.split(",")
				.map((id) => id.trim())
				.filter((id) => id.length > 0);

			const response = await fetch("/api/push-notifications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					companyTeamId: companyId,
					experienceId,
					title,
					content,
					subtitle: subtitle || undefined,
					link: link || undefined,
					restPath: restPath || undefined,
					userIds: userIdArray.length > 0 ? userIdArray : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to send notification");
			}

			setSuccess(true);
			// Reset form
			setTitle("");
			setContent("");
			setSubtitle("");
			setLink("");
			setRestPath("");
			setUserIds("");

			// Hide success message after 5 seconds
			setTimeout(() => setSuccess(false), 5000);
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
							Push Notifications
						</Heading>
						<Text size="3" color="gray">
							Send push notifications to users in your company experiences
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
								Follow these steps to send a push notification
							</Dialog.Description>
							<div className="space-y-3">
								<Text size="2" className="block">
									→ Select an experience from the dropdown (automatically loaded
									from your shop) OR click "Enter Custom ID" to manually input an
									experience ID
								</Text>
								<Text size="2" className="block">
									→ Enter a title and content for your notification (required)
								</Text>
								<Text size="2" className="block">
									→ Optionally add a subtitle, link, or specific user IDs
								</Text>
								<Text size="2" className="block">
									→ Click "Send Notification" to send to all users in the
									experience
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

				{/* Loading State */}
				{loadingExperiences && (
					<Card size="3">
						<div className="flex items-center justify-center py-8">
							<Spinner size="3" />
						</div>
					</Card>
				)}

				{/* Input Form */}
				{!loadingExperiences && (
					<Card size="3">
						<div className="space-y-4">
							{/* Experience Selection */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<Text size="2" weight="medium" as="label">
										{useCustomId
											? "Enter Custom Experience ID"
											: "Select Experience"}
									</Text>
									<Button
										size="1"
										variant="ghost"
										onClick={() => {
											setUseCustomId(!useCustomId);
											setExperienceId("");
										}}
									>
										{useCustomId ? "← Use Dropdown" : "Enter Custom ID →"}
									</Button>
								</div>

								{useCustomId ? (
									<TextField.Root size="3" variant="surface">
										<TextField.Input
											placeholder="exp_xxxxxxxxxx"
											value={experienceId}
											onChange={(e) => setExperienceId(e.target.value)}
										/>
									</TextField.Root>
								) : availableExperiences.length > 0 ? (
									<>
										<Select.Root
											value={experienceId}
											onValueChange={setExperienceId}
										>
											<Select.Trigger className="w-full" />
											<Select.Content>
												{availableExperiences.map((exp) => (
													<Select.Item key={exp.id} value={exp.id}>
														{exp.name}
													</Select.Item>
												))}
											</Select.Content>
										</Select.Root>
									</>
								) : (
									<Callout.Root color="amber" size="1">
										<Callout.Text>
											<Text size="2">
												No experiences found. Use custom ID instead.
											</Text>
										</Callout.Text>
									</Callout.Root>
								)}

								{experienceId && (
									<Text size="1" color="gray" className="mt-1 block">
										{useCustomId ? "Custom " : ""}ID: {experienceId}
									</Text>
								)}
							</div>

							{/* Title */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									Title <span className="text-red-500">*</span>
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="Enter notification title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
									/>
								</TextField.Root>
							</div>

							{/* Content */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									Content <span className="text-red-500">*</span>
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="Enter notification content"
										value={content}
										onChange={(e) => setContent(e.target.value)}
									/>
								</TextField.Root>
							</div>

							{/* Subtitle (Optional) */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									Subtitle (Optional)
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="Enter subtitle (optional)"
										value={subtitle}
										onChange={(e) => setSubtitle(e.target.value)}
									/>
								</TextField.Root>
							</div>

							{/* Link (Optional) */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									Link (Optional)
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="https://example.com (optional)"
										value={link}
										onChange={(e) => setLink(e.target.value)}
									/>
								</TextField.Root>
								<Text size="1" color="gray" className="mt-1 block">
									Full URL to open when notification is clicked
								</Text>
							</div>

							{/* Rest Path (Optional) */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									Rest Path (Optional)
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="/path/to/resource (optional)"
										value={restPath}
										onChange={(e) => setRestPath(e.target.value)}
									/>
								</TextField.Root>
								<Text size="1" color="gray" className="mt-1 block">
									Path to append to deep link for in-app navigation
								</Text>
							</div>

							{/* User IDs (Optional) */}
							<div>
								<Text
									size="2"
									weight="medium"
									className="block mb-2"
									as="label"
								>
									User IDs (Optional)
								</Text>
								<TextField.Root size="3" variant="surface">
									<TextField.Input
										placeholder="user_xxx, user_yyy (comma separated)"
										value={userIds}
										onChange={(e) => setUserIds(e.target.value)}
									/>
								</TextField.Root>
								<Text size="1" color="gray" className="mt-1 block">
									Leave empty to send to all users in the experience
								</Text>
							</div>

							<div className="pt-2">
								<Button
									onClick={sendNotification}
									disabled={loading || !experienceId || !title || !content}
									size="2"
									variant="soft"
								>
									{loading ? (
										<span className="flex items-center gap-2">
											<Spinner size="1" />
											<span>Sending...</span>
										</span>
									) : (
										"Send Notification"
									)}
								</Button>
							</div>
						</div>
					</Card>
				)}

				{/* Success Message */}
				{success && (
					<Callout.Root color="green" size="2">
						<Callout.Text>
							<Text size="2" weight="medium">
								✓ Push notification sent successfully!
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
			</div>
		</div>
	);
}
