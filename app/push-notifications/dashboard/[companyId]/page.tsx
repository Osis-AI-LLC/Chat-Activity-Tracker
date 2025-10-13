import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import PushNotificationSender from "../../PushNotificationSender";

export default async function PushNotificationsPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	try {
		// The headers contains the user token
		const headersList = await headers();

		// The companyId is a path param
		const { companyId } = await params;

		// The user token is in the headers
		const { userId } = await whopSdk.verifyUserToken(headersList);

		const result = await whopSdk.access.checkIfUserHasAccessToCompany({
			userId,
			companyId,
		});

		// Either: 'admin' | 'no_access';
		// 'admin' means the user is an admin of the company, such as an owner or moderator
		// 'no_access' means the user is not an authorized member of the company
		const { accessLevel } = result;

		// Only allow admins/moderators to send push notifications
		if (!result.hasAccess || accessLevel === "no_access") {
			return (
				<div className="flex justify-center items-center h-screen px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Access Denied
						</h1>
						<p className="text-gray-700">
							You do not have permission to send push notifications.
							<br />
							Only company administrators and moderators can access this page.
						</p>
					</div>
				</div>
			);
		}

		return <PushNotificationSender companyId={companyId} />;
	} catch (error) {
		console.error("Error loading push notifications page:", error);
		
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">
						Authentication Error
					</h1>
					<p className="text-gray-700">
						Unable to verify your credentials.
						<br />
						Please make sure you are logged in and try again.
					</p>
					{error instanceof Error && (
						<p className="text-sm text-gray-500 mt-4">
							Error: {error.message}
						</p>
					)}
				</div>
			</div>
		);
	}
}
