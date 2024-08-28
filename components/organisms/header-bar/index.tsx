"use client"
import { Logo } from "@components/atoms/logo"
import HeaderDropdownMenu from "@components/organisms/header-bar/header-bar-dropdown-menu"
import HeaderBarLogo from "@components/organisms/header-bar/header-bar-logo"
import HeaderBarNavigation from "@components/organisms/header-bar/header-bar-navigation"

export default function HeaderBar({ className }: { className: string }) {
	return (
		<>
			<header className={className}>
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
					<HeaderDropdownMenu />
				</div>
			</header>
		</>
	)
}
