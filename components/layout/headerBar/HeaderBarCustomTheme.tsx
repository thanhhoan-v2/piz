import { Button } from "@components/ui/Button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/DropdownMenu"
import { Check, Moon, PaintbrushVertical, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type ICustomTheme = {
	group: "light" | "dark"
	label: string
	value: string
}

const customThemes: ICustomTheme[] = [
	{
		group: "light",
		label: "Big Squares",
		value: "light_big_squares",
	},
	{
		group: "light",
		label: "Light Small Squares",
		value: "light_small_squares",
	},
	{
		group: "light",
		label: "Light Gradient Violet",
		value: "light_gradient_violet",
	},
	{
		group: "dark",
		label: "Dark Small Squares",
		value: "dark_small_squares",
	},
	{
		group: "dark",
		label: "Dark Gradient Violet",
		value: "dark_gradient_violet",
	},
	{
		group: "dark",
		label: "Dots",
		value: "dark_dots",
	},
]

/**
 * A dropdown menu component that allows users to select their preferred theme.
 * The currently selected theme is stored in local state and localStorage.
 *
 * @returns A JSX element representing the dropdown menu.
 */
export const HeaderBarCustomTheme = () => {
	const [customTheme, setCustomTheme] = useState<ICustomTheme>(() => {
		// Initialize from localStorage if available
		if (typeof window !== "undefined") {
			const savedTheme = localStorage.getItem("piz_custom_theme")
			if (savedTheme) {
				try {
					return JSON.parse(savedTheme)
				} catch (e) {
					console.error("Error parsing saved theme", e)
				}
			}
		}
		return customThemes[5] // Default to the last theme (dark dots)
	})
	const { setTheme } = useTheme()

	// Save to localStorage when theme changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("piz_custom_theme", JSON.stringify(customTheme))
		}
	}, [customTheme])

	const handleCustomTheme = (value: string) => {
		const selectedCustomTheme =
			customThemes.find((theme) => theme.value === value) ?? customThemes[0]

		setTheme(selectedCustomTheme.group)
		setCustomTheme(selectedCustomTheme)
	}

	return (
		<>
			<style jsx>{`
				@keyframes shine {
					0% { background-position: 200% center; }
					100% { background-position: -200% center; }
				}
				.theme-button {
					transition: all 0.2s ease;
				}
				.theme-button:hover {
					transform: scale(1.05);
				}
				.active-theme {
					background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
					background-size: 200% auto;
					animation: shine 4s linear infinite;
				}
			`}</style>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className={`theme-button relative overflow-hidden ${customTheme.value === "default" ? "active-theme text-background" : ""}`}
					>
						<PaintbrushVertical className="w-4 h-4" />
						<span className="sr-only">Change theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="p-2 w-64">
					<DropdownMenuLabel className="px-2 py-1.5 font-medium text-muted-foreground text-sm">
						Select your vibe
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="my-1" />
					<DropdownMenuRadioGroup value={customTheme.value} onValueChange={handleCustomTheme}>
						{customThemes.map((theme) => (
							<DropdownMenuRadioItem
								key={theme.label}
								value={theme.value}
								className="hover:bg-accent px-2 py-1.5 rounded-md transition-colors cursor-pointer"
							>
								<div className="flex justify-between items-center w-full">
									<div className="flex items-center gap-3">
										<div
											className={`p-1 rounded-md ${theme.value === customTheme.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
										>
											{theme.group === "dark" ? (
												<Moon className="w-3.5 h-3.5" />
											) : (
												<Sun className="w-3.5 h-3.5" />
											)}
										</div>
										<span
											className={`text-sm ${theme.value === customTheme.value ? "font-medium" : ""}`}
										>
											{theme.label}
										</span>
									</div>
									{theme.value === customTheme.value && (
										<div className="text-primary">
											<Check className="w-4 h-4" />
										</div>
									)}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
