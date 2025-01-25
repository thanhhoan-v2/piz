/**
 * The component for the footer of every page.
 *
 * The footer is placed at the bottom of the page and is only visible on desktop
 * devices. The footer contains a copyright notice.
 */
export default function Footer() {
	return (
		<>
			<footer className="desktop-only absolute bottom-0 m-2 w-screen flex-center">
				<div className="mx-auto w-full max-w-screen-xl p-4 text-center md:flex md:items-center md:justify-between">
					<span className="text-sm text-white sm:text-center">
						© 2024-2025 <span className="hover:underline">Piz™</span>. &nbsp;All
						Rights Reserved.
					</span>
				</div>
			</footer>
		</>
	)
}
