import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		// Get the user token from headers
		const headersList = await headers();
		const { userId } = await whopSdk.verifyUserToken(headersList);

		// Parse the request body
		const body = await request.json();
		const {
			companyTeamId,
			experienceId,
			title,
			content,
			subtitle,
			link,
			restPath,
			userIds,
		} = body;

		// Validate required fields
		if (!title || !content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 },
			);
		}

		if (!experienceId) {
			return NextResponse.json(
				{ error: "Experience ID is required" },
				{ status: 400 },
			);
		}

		// Verify user has access to the company
		if (companyTeamId) {
			const accessResult =
				await whopSdk.access.checkIfUserHasAccessToCompany({
					userId,
					companyId: companyTeamId,
				});

			// Only check if user has access to the company (not specific access level)
			// This allows all company members, not just admins
			if (!accessResult.hasAccess) {
				return NextResponse.json(
					{ error: "You must be a member of this company to send notifications" },
					{ status: 403 },
				);
			}
		}

		// Prepare notification parameters
		const notificationParams: {
			companyTeamId?: string;
			experienceId: string;
			title: string;
			content: string;
			subtitle?: string;
			link?: string;
			restPath?: string;
			userIds?: string[];
			senderUserId?: string;
		} = {
			experienceId,
			title,
			content,
			senderUserId: userId,
		};

		// Add optional parameters
		if (companyTeamId) notificationParams.companyTeamId = companyTeamId;
		if (subtitle) notificationParams.subtitle = subtitle;
		if (link) notificationParams.link = link;
		if (restPath) notificationParams.restPath = restPath;
		if (userIds && Array.isArray(userIds) && userIds.length > 0) {
			notificationParams.userIds = userIds;
		}

		// Send the push notification
		const result =
			await whopSdk.notifications.sendPushNotification(notificationParams);

		return NextResponse.json({
			success: true,
			result,
		});
	} catch (error) {
		console.error("Error sending push notification:", error);

		if (error instanceof Error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to send push notification" },
			{ status: 500 },
		);
	}
}
