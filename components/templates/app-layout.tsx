import HeaderBar from "@components/organisms/header-bar"
import SideBar from "@components/organisms/side-bar"
import { fetchUser } from "@supabase/functions/fetchUser"
import SetUserStore from "@utils/user.helpers"
import type React from "react"

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
	// Fetch user for first time on server-side
	const user = await fetchUser()

	return (
		<>
			{/* does not render anything  */}
			{/* set user store */}
			<SetUserStore user={user} />

			<div className="flex w-full flex-col text-foreground transition-colors duration-300">
				<HeaderBar />

				<div>
					<SideBar />

					<main className="mobile_s:mx-1 ml-[100px] mobile_s:ml-0 h-auto mobile_s:w-full flex-center">
						{children}
					</main>
				</div>
			</div>
		</>
	)
}

export { AppLayout }
