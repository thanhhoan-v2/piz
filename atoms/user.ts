import type { User } from "@supabase/supabase-js"
import { atomWithReset } from "jotai/utils"

export const userAtom = atomWithReset<User | null>(null)

userAtom.debugLabel = "user"
