"use client"
import { Button } from "@components/ui/Button"
import { ROUTE } from "@constants/route"
import { UserButton, useUser } from "@stackframe/stack"
import Link from "next/link"

/**
 * HeaderDropdownMenu is a component that renders a dropdown menu for the header bar.
 * It manages user authentication states and theme toggling.
 *
 * - If the user is not authenticated, it provides options to sign up or log in.
 * - If the user is authenticated, it displays user-related menu items.
 * - Includes a theme toggle feature to switch between light and dark modes.
 * - Provides a sign-out option that clears cache and redirects the user to the sign-in page.
 */
export default function HeaderDropdownMenu() {
	const user = useUser()

	if (!user)
		return (
			<div className="flex gap-2 text-gray-400">
				<Link href={ROUTE.SIGN_UP} className="text-gray-400 desktop-only">
					<Button variant="link" className="text-gray-400">
						Create account
					</Button>
				</Link>
				<Link href={ROUTE.SIGN_IN}>
					<Button>Log in</Button>
				</Link>
			</div>
		)

	return (
		<div className="flex gap-2 text-gray-400">
			<UserButton />
			{/* <DropdownMenu> */}
			{/* 	<DropdownMenuTrigger asChild> */}
			{/* 		<Button variant="ghost"> */}
			{/* 			<MenuIcon /> */}
			{/* 		</Button> */}
			{/* 	</DropdownMenuTrigger> */}
			{/* 	<DropdownMenuContent className="w-56"> */}
			{/* 		<DropdownMenuGroup> */}
			{/* 			{items.map(({ href, icon, label }, index) => ( */}
			{/* 				<Link key={href + index.toString()} href={href}> */}
			{/* 					<DropdownMenuItem key={label} className={dropdownMenuItemClass}> */}
			{/* 						{icon} */}
			{/* 						<span>{label}</span> */}
			{/* 					</DropdownMenuItem> */}
			{/* 				</Link> */}
			{/* 			))} */}
			{/* 		</DropdownMenuGroup> */}
			{/* 		<DropdownMenuSeparator /> */}
			{/* <DropdownMenuItem */}
			{/* 	className={dropdownMenuItemClass} */}
			{/* 	onClick={() => setTheme(theme === "dark" ? "light" : "dark")} */}
			{/* > */}
			{/* <ThemeToggle */}
			{/* 	noButton */}
			{/* 	iconClassName={iconClass} */}
			{/* 	darkModeLabel="Toggle dark mode" */}
			{/* 	lightModeLabel="Toggle light mode" */}
			{/* /> */}
			{/* </DropdownMenuItem> */}
			{/* <DropdownMenuSeparator /> */}
			{/* 		<DropdownMenuItem */}
			{/* 			className={dropdownMenuItemClass} */}
			{/* 			onClick={handleSignOut} */}
			{/* 		> */}
			{/* 			<div className="flex items-center w-full"> */}
			{/* 				<LogOut className={iconClass} /> */}
			{/* 				<span>Log out</span> */}
			{/* 			</div> */}
			{/* 		</DropdownMenuItem> */}
			{/* 	</DropdownMenuContent> */}
			{/* </DropdownMenu> */}
		</div>
	)
}
