"use client"

import { ROUTE } from "@constants/route"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PublicTeamsRedirect() {
	const router = useRouter()

	useEffect(() => {
		// Redirect to the teams page
		router.replace(ROUTE.TEAMS)
	}, [router])

	return (
		<div className="flex justify-center items-center h-screen">
			<p className="text-gray-500">Redirecting to Teams page...</p>
		</div>
	)
}
