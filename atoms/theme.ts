import { atomWithStorage } from "jotai/utils"

type ICustomTheme = {
	group: "light" | "dark"
	label: string
	value: string
}

export const customThemes: ICustomTheme[] = [
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

export const customThemeAtom = atomWithStorage<ICustomTheme>(
	"piz_custom_theme",
	customThemes[5],
)
