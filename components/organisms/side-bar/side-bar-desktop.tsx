"use client"
import SideBarItem from "@components/organisms/side-bar/side-bar-item"
import { ROUTE } from "@constants/route"
import { Heart, Home, Search, User } from "lucide-react"

export default function DesktopSideBar() {
	return (
		<>
			<div className="desktop-only fixed left-0 h-screen p-2">
				<div className="h-[80%] flex-center flex-col gap-2">
					<SideBarItem href={ROUTE.HOME} icon={Home} />
					<SideBarItem href={ROUTE.SEARCH} icon={Search} />
					<SideBarItem href={ROUTE.ACTIVITY} icon={Heart} />
					<SideBarItem href="profile" icon={User} />
				</div>
			</div>
		</>
	)
}
