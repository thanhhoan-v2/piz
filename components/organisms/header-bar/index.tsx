"use client"

import { userAtom } from "@atoms/user"
import { Logo } from "@components/atoms/logo"
import HeaderBarMenu from "@components/organisms/header-bar/header-bar-dropdown-menu"
import HeaderBarLogo from "@components/organisms/header-bar/header-bar-logo"
import HeaderBarNavigation from "@components/organisms/header-bar/header-bar-navigation"
import { useAtomValue } from "jotai"

export default function HeaderBar() {
	const user = useAtomValue(userAtom)

	return (
		<>
			<header className="sticky top-0 z-40 mb-3 flex h-24 w-full items-center justify-between px-6 py-1 transition-colors duration-300">
				{/* lefty - desktop view */}
				<div className="desktop-only gap-4">
					<Logo />
				</div>

				{/* lefty - mobile view */}
				<HeaderBarNavigation />

				{/* center */}
				<HeaderBarLogo />

				{/* righty */}
				<div className="ml-auto flex items-center gap-4">
					{user && <HeaderBarMenu />}
				</div>
			</header>
		</>
	)
}
