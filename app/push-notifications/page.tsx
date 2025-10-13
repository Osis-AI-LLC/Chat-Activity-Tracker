import { whopSdk } from "@/lib/whop-sdk";
import { redirect } from "next/navigation";

export default async function PushNotificationsRedirect() {
	// Try to get the companyId from environment
	const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

	// If we have a companyId configured, redirect to it
	if (companyId) {
		redirect(`/push-notifications/${companyId}`);
	}

	// Otherwise show an error message
	return (
		<div className="flex justify-center items-center h-screen px-8">
			<div className="text-center max-w-2xl">
				<h1 className="text-2xl font-bold text-amber-600 mb-4">
					Company ID Required
				</h1>
				<p className="text-gray-700 mb-4">
					To access the push notifications page, you need to specify your company
					ID in the URL.
				</p>
				<p className="text-gray-600 text-sm">
					Use the URL format:{" "}
					<code className="bg-gray-100 px-2 py-1 rounded">
						/push-notifications/[your-company-id]
					</code>
				</p>
				<p className="text-gray-600 text-sm mt-4">
					Replace <code className="bg-gray-100 px-2 py-1 rounded">[your-company-id]</code> with your actual Whop company ID (e.g., biz_XXXXXXXX).
				</p>
			</div>
		</div>
	);
}
