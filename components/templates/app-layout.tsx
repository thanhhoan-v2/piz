import HeaderBar from "@components/organisms/header-bar"
import SideBar from "@components/organisms/side-bar"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import type React from "react"

const AppLayout = async ({
	children,
}: { children: React.ReactNode }) => {
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return <>{children}</>

	return (
		<div className="flex w-full flex-col text-foreground transition-colors duration-300">
			<HeaderBar />

			<div className="">
				<SideBar />

				<main className="mt-3 tablet:mr-[100px] mobile_s:ml-0 tablet:ml-[200px] tablet:max-h-[60vh] flex-1 rounded-tl-2xl rounded-tr-2xl bg-background-item p-4 ">
					{children}
				</main>
			</div>
		</div>
	)
}

export { AppLayout }
