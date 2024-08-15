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
import { ROUTE } from "@constants/route"
import { signOut } from "@services/auth/sign-out"
import { cn } from "@utils/cn"
import { Archive, LogOut, MenuIcon, SettingsIcon } from "lucide-react"
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

export default function HeaderBarMenu() {
	const { theme, setTheme } = useTheme()
	const router = useRouter()
	const dropdownMenuItemClass = cn(
		"cursor-pointer",
		theme === "dark" ? "dark-common" : "light-common",
	)

	const handleSignOut = async () => {
		try {
			await signOut()
			router.push(ROUTE.SIGN_IN)
		} catch (error) {
			console.error("An error occurred during sign out", error)
		}
	}

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
								<DropdownMenuItem
									key={label}
									className={dropdownMenuItemClass}
								>
									{icon}
									<span>{label}</span>
								</DropdownMenuItem>
							</Link>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className={dropdownMenuItemClass}
						onClick={() =>
							setTheme(theme === "dark" ? "light" : "dark")
						}
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
