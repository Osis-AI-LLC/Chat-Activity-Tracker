import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import ChatActivityTracker from "./ChatActivityTracker";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
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

	// Only allow admins/moderators to access the chat activity tracker
	if (!result.hasAccess || accessLevel === "no_access") {
		return (
			<div className="flex justify-center items-center h-screen px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
				<div className="text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-12 border border-gray-200/50 dark:border-slate-700/50 max-w-lg">
					<div className="mb-6">
						<svg
							className="mx-auto h-16 w-16 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Access Denied</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
						Access Denied
					</h1>
					<p className="text-gray-700 dark:text-slate-300 leading-relaxed">
						You do not have permission to access the Chat Activity Tracker.
						<br />
						<br />
						Only company administrators and moderators can view this page.
					</p>
				</div>
			</div>
		);
	}

	return <ChatActivityTracker />;
}
