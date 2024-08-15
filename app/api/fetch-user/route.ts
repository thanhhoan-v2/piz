import { fetchUser } from "@services/user-data/user-general";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const fetchData = await fetchUser();
		return NextResponse.json({
			message: "Fetch user information successfully",
			data: fetchData,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: `Error while fetching: ${error}` },
			{ status: 500 },
		);
	}
}
