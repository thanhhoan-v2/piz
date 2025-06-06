import { NextResponse } from "next/server"
import { stackServerApp } from "../../../stack"

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const userName = searchParams.get("userName")

	if (!userName) {
		return NextResponse.json({ error: "Username is required" }, { status: 400 })
	}

	const user = await stackServerApp.getUser(userName)
	return NextResponse.json(user)
}
