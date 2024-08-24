"use client"
import { Button } from "@components/atoms/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/atoms/dropdown-menu"
import { ThemeToggle } from "@components/molecules/toggle/theme-toggle"
import { USER } from "@constants/query-key"
import { ROUTE } from "@constants/route"
import { useQueryDataAppUser } from "@hooks/queries/app-user"
import {
	useQueryClientClearCache,
	useQueryClientRemoveQueries,
} from "@hooks/queries/client"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { createSupabaseClientForBrowser } from "@utils/supabase/client"
import { Archive, LogOut, MenuIcon, SettingsIcon } from "lucide-react"
import type { Route } from "next"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

const supabase = createSupabaseClientForBrowser()

export default function HeaderBarMenu() {
	const { theme, setTheme } = useTheme()
	const router = useRouter()
	const dropdownMenuItemClass = cn(
		"cursor-pointer",
		theme === "dark" ? "dark-common" : "light-common",
	)

	const user = useQueryDataAppUser()

	const queryClient = useQueryClient()

	const handleSignOut = async () => {
		console.log("Signing out ...")
		try {
			// Clear query cache before signing out
			useQueryClientClearCache(queryClient)
			// Remove
			useQueryClientRemoveQueries(queryClient, USER.APP)
			// Sign out
			await supabase.auth.signOut()
			// Redirect to sign-in page
			router.push("/sign-in" as Route)
		} catch (error) {
			console.error("An error occurred during sign out", error)
		}
	}

	if (!user || !user.id) return null

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost">
						<MenuIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuGroup>
						{items.map(({ href, icon, label }, index) => (
							<Link key={href + index.toString()} href={href}>
								<DropdownMenuItem key={label} className={dropdownMenuItemClass}>
									{icon}
									<span>{label}</span>
								</DropdownMenuItem>
							</Link>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className={dropdownMenuItemClass}
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						<ThemeToggle
							noButton
							iconClassName={iconClass}
							darkModeLabel="Toggle dark mode"
							lightModeLabel="Toggle light mode"
						/>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className={dropdownMenuItemClass}
						onClick={handleSignOut}
					>
						<div className="flex w-full items-center">
							<LogOut className={iconClass} />
							<span>Log out</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
