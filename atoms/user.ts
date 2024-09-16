import type { User } from "@supabase/supabase-js"
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
		label: "Small Squares",
		value: "light_small_squares",
	},
	{
		group: "light",
		label: "Gradient Violet",
		value: "light_gradient_violet",
	},
	{
		group: "dark",
		label: "Gradient Violet",
		value: "dark_gradient_violet",
	},
	{
		group: "dark",
		label: "Small Squares",
		value: "dark_small_squares",
	},
]

export const userAtom = atomWithStorage<User | null>("piz_current_user", null)
export const customThemeAtom = atomWithStorage<ICustomTheme>(
	"piz_custom_theme",
	customThemes[0],
)

userAtom.debugLabel = "user"
