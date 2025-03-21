import { customThemeAtom, customThemes } from "@atoms/theme"
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
import { useAtom } from "jotai"
import { Check, Moon, PaintbrushVertical, Sun } from "lucide-react"
import { useTheme } from "next-themes"

/**
 * A dropdown menu component that allows users to select their preferred theme.
 * The currently selected theme is stored in the "customTheme" atom, and can be
 * retrieved using the `useAtom` hook.
 *
 * @returns A JSX element representing the dropdown menu.
 */
export const HeaderBarCustomTheme = () => {
	const [customTheme, setCustomTheme] = useAtom(customThemeAtom)
	const { setTheme } = useTheme()

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
						className={`theme-button relative overflow-hidden ${customTheme.value === 'default' ? 'active-theme text-background' : ''}`}
					>
						<PaintbrushVertical className="w-4 h-4" />
						<span className="sr-only">Change theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-64 p-2">
					<DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
						Select your vibe
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="my-1" />
					<DropdownMenuRadioGroup
						value={customTheme.value}
						onValueChange={handleCustomTheme}
					>
						{customThemes.map((theme) => (
							<DropdownMenuRadioItem 
								key={theme.label} 
								value={theme.value}
								className="px-2 py-1.5 cursor-pointer transition-colors hover:bg-accent rounded-md"
							>
								<div className="flex items-center justify-between w-full">
									<div className="flex items-center gap-3">
										<div className={`p-1 rounded-md ${theme.value === customTheme.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
											{theme.group === "dark" ? (
												<Moon className="w-3.5 h-3.5" />
											) : (
												<Sun className="w-3.5 h-3.5" />
											)}
										</div>
										<span className={`text-sm ${theme.value === customTheme.value ? 'font-medium' : ''}`}>
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
