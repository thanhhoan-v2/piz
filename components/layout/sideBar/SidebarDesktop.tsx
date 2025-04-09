"use client"
import { ROUTE } from "@constants/route"
import { BellIcon, HomeIcon, NetworkIcon, SearchIcon, UserIcon, UsersIcon } from "lucide-react"
import SideBarItem from "./SidebarItem"

export default function DesktopSideBar() {
	return (
		<>
			<div className="bottom-0 fixed p-2 h-screen desktop-only">
				<div className="flex-col flex-center gap-2 h-full">
					<SideBarItem href={ROUTE.HOME} icon={HomeIcon} />
					<SideBarItem href={ROUTE.SEARCH} icon={SearchIcon} />
					<SideBarItem href="collab" icon={NetworkIcon} />
					<SideBarItem href={ROUTE.NOTIFICATION} icon={BellIcon} />
					<SideBarItem href={ROUTE.TEAMS} icon={UsersIcon} />
					<SideBarItem href="profile" icon={UserIcon} />
				</div>
			</div>
		</>
	)
}
