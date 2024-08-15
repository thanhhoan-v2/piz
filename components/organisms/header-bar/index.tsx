import { Logo } from "@components/atoms/logo"
import HeaderBarLogo from "@components/organisms/header-bar/header-bar-logo"
import HeaderBarMenu from "@components/organisms/header-bar/header-bar-menu"
import HeaderBarNavigation from "@components/organisms/header-bar/header-bar-navigation"

export default function HeaderBar() {
	return (
		<>
			<header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between px-4 transition-colors duration-300">
				{/* left */}
				{/* left, desktop view */}
				<div className="desktop-only gap-4">
					<Logo />
				</div>

				{/* left, mobile view */}
				<HeaderBarNavigation />

				{/* center */}
				<HeaderBarLogo />

				{/* right */}
				<div className="ml-auto flex items-center gap-4">
					<HeaderBarMenu />
				</div>
			</header>
		</>
	)
}
