"use client"
import { Logo } from "@components/ui/Logo"
import HeaderDropdownMenu from "./HeaderBarDropdownMenu"
import HeaderBarLogo from "./HeaderBarLogo"
import HeaderBarNavigation from "./HeaderBarNavigation"

/**
 * A header bar component that displays a logo, navigation links, a custom theme toggle, and a dropdown menu.
 *
 * @prop {string} className - The class name for the header element.
 *
 * @returns A JSX element representing the header bar.
 */
export default function HeaderBar({ className }: { className: string }) {
	return (
		<>
			<style jsx>{`
				@keyframes slideDown {
					from { transform: translateY(-100%); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}
				.header-animate {
					animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
				}
				.glass-effect {
					background: rgba(255, 255, 255, 0.01);
					backdrop-filter: blur(8px);
					-webkit-backdrop-filter: blur(8px);
				}
				.dark .glass-effect {
					background: rgba(0, 0, 0, 0.01);
				}
				@media (max-width: 640px) {
					.glass-effect {
						backdrop-filter: blur(6px);
						-webkit-backdrop-filter: blur(6px);
					}
				}
			`}</style>
			<header
				className={`${className} header-animate glass-effect fixed top-0 left-0 right-0 z-50 border-b border-border/40 shadow-sm transition-all duration-300 hover:shadow-md px-4 sm:px-6 py-2 sm:py-3`}
			>
				{/* lefty - desktop view */}
				<div className="desktop-only gap-4 transition-all duration-300 hover:scale-105 hover:brightness-110">
					<Logo />
				</div>

				{/* lefty - mobile view */}
				<div className="transition-all duration-300 hover:scale-105 hover:brightness-110">
					<HeaderBarNavigation />
				</div>

				{/* center */}
				<div className="transition-all duration-300 hover:scale-105 hover:brightness-110">
					<HeaderBarLogo />
				</div>

				{/* righty */}
				<div className="ml-auto flex items-center gap-3 sm:gap-6">
					<div className="transition-all duration-300 hover:scale-105 hover:brightness-110">
						{/* <HeaderBarCustomTheme /> */}
					</div>
					<div className="transition-all duration-300 hover:scale-105 hover:brightness-110">
						<HeaderDropdownMenu />
					</div>
				</div>
			</header>
		</>
	)
}
