"use client"
import { ROUTE } from "@constants/route"
import { Bell, Home, Search, User } from "lucide-react"
import SideBarItem from "./SidebarItem"

export default function DesktopSideBar() {
	return (
		<>
			<div className="desktop-only fixed bottom-0 h-screen p-2">
				<div className="h-full flex-center flex-col gap-2">
					<SideBarItem href={ROUTE.HOME} icon={Home} />
					<SideBarItem href={ROUTE.SEARCH} icon={Search} />
					<SideBarItem href={ROUTE.NOTIFICATION} icon={Bell} />
					<SideBarItem href="profile" icon={User} />
				</div>
			</div>
		</>
	)
}
