import { whopSdk } from "@/lib/whop-sdk";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const companyId = searchParams.get("companyId");

		// Validate required parameters
		if (!companyId) {
			return Response.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Fetch all experiences from the company
		const result = await whopSdk.experiences.listExperiences({
			companyId,
			first: 100, // Fetch up to 100 experiences
		});

		if (!result) {
			return Response.json(
				{
					error: "Failed to fetch experiences",
					details: "No result returned from SDK",
				},
				{ status: 500 },
			);
		}

		if (result._error) {
			return Response.json(
				{
					error: "Failed to fetch experiences",
					details: result._error.message,
				},
				{ status: 500 },
			);
		}

	// Extract experiences from the result
	const experiences = result.experiencesV2?.nodes || [];

	// Filter and format chat experiences - only include chat apps
	const CHAT_APP_ID = "app_xml5hbizmZPgUT";
	const chatExperiences = experiences
		.filter((exp) => exp !== null && exp.app?.id === CHAT_APP_ID)
		.map((exp) => ({
			id: exp.id,
			name: exp.name || "Unnamed Chat",
			description: exp.description || "",
			logo: exp.logo?.sourceUrl || null,
		}));

		// Return the chat experiences with relevant info
		return Response.json({
			chats: chatExperiences,
			total: chatExperiences.length,
		});
	} catch (error) {
		console.error("Error fetching chats:", error);
		return Response.json(
			{
				error: "Failed to fetch chats",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
