"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function NavigationEvents() {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		const url = `${pathname}?${searchParams}`
		console.log(url)
		// You can now use the current URL
		// ...
	}, [pathname, searchParams])
	return null
}
