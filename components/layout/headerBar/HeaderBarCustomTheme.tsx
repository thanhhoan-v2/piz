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
import { Moon, PaintbrushVertical, Sun } from "lucide-react"
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
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost">
						<PaintbrushVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Select a theme</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={customTheme.value}
						onValueChange={handleCustomTheme}
					>
						{customThemes.map((theme) => (
							<DropdownMenuRadioItem key={theme.label} value={theme.value}>
								<div className="flex-y-center gap-2">
									{theme.group === "dark" ? (
										<Moon size={13} />
									) : (
										<Sun size={13} />
									)}
									<p>{theme.label}</p>
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
