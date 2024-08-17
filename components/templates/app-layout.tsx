import HeaderBar from "@components/organisms/header-bar"
import SideBar from "@components/organisms/side-bar"
import { fetchUser } from "@supabase/functions/fetchUser"
import FetchUser from "@utils/user.helpers"
import type React from "react"

const AppLayout = async ({
	children,
}: { children: React.ReactNode }) => {
	const user = await fetchUser()

	if (!user) return <>{children}</>

	return (
		<div className="flex w-full flex-col text-foreground transition-colors duration-300">
			<FetchUser user={user} />

			<HeaderBar />

			<div>
				<SideBar />

				<main className="mobile_s:mx-1 ml-[100px] mobile_s:ml-0 h-auto mobile_s:w-full flex-center">
					{children}
				</main>
			</div>
		</div>
	)
}

export { AppLayout }
