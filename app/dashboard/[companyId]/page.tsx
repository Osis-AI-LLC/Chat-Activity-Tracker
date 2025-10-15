import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import ChatActivityTracker from "./ChatActivityTracker";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	try {
		// The headers contains the user token
		const headersList = await headers();

		// The companyId is a path param
		const { companyId } = await params;

		// The user token is in the headers - verify user is authenticated
		const { userId } = await whopSdk.verifyUserToken(headersList);

		// No longer checking company membership - allow access for any authenticated user
		return <ChatActivityTracker companyId={companyId} />;
	} catch (error) {
		console.error("Error loading dashboard page:", error);
		
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
