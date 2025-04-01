"use client"
import { Button } from "@components/ui/Button"
import { ROUTE } from "@constants/route"
import {
	useQueryClientClearCache,
	useQueryClientRemoveQueries,
} from "@queries/client/remove"
import { UserButton, useUser } from "@stackframe/stack"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { Archive, SettingsIcon } from "lucide-react"
import type { Route } from "next"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"

const iconClass = "mr-2 h-4 w-4"

const items = [
	{
		href: ROUTE.SAVED_POSTS,
		label: "Saved posts",
		icon: <Archive className={iconClass} />,
	},
	{
		href: ROUTE.SETTINGS,
		label: "Settings",
		icon: <SettingsIcon className={iconClass} />,
	},
]

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
	const { theme, setTheme } = useTheme()
	const router = useRouter()
	const dropdownMenuItemClass = cn(
		"cursor-pointer",
		theme === "dark" ? "dark-common" : "light-common",
	)

	const queryClient = useQueryClient()
	// const [user, setUser] = useAtom(userAtom)

	const handleSignOut = async () => {
		try {
			// Clear query cache before signing out
			useQueryClientClearCache(queryClient)
			// Remove queries from cache
			useQueryClientRemoveQueries(queryClient, queryKey.user.all.toString())
			// Reset user atom
			// setUser(RESET)
			// Sign out
			// await supabase.auth.signOut()
			// Redirect to sign-in page
			router.push("/sign-in" as Route)
		} catch (error) {
			console.error("An error occurred during sign out", error)
		}
	}

	if (!user)
		return (
			<div className="flex gap-2 text-gray-400">
				<Link href={ROUTE.SIGN_UP} className="desktop-only text-gray-400">
					<Button variant="link" className="text-gray-400">Create account</Button>
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
			{/* 			<div className="flex w-full items-center"> */}
			{/* 				<LogOut className={iconClass} /> */}
			{/* 				<span>Log out</span> */}
			{/* 			</div> */}
			{/* 		</DropdownMenuItem> */}
			{/* 	</DropdownMenuContent> */}
			{/* </DropdownMenu> */}
		</div>
	)
}
