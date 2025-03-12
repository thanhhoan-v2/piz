"use client"
import { ROUTE } from "@constants/route"
import { BellIcon, HomeIcon, NetworkIcon, SearchIcon, UserIcon } from "lucide-react"
import SideBarItem from "./SidebarItem"

export default function DesktopSideBar() {
	return (
		<>
			<div className="desktop-only fixed bottom-0 h-screen p-2">
				<div className="h-full flex-center flex-col gap-2">
					<SideBarItem href={ROUTE.HOME} icon={HomeIcon} />
					<SideBarItem href={ROUTE.SEARCH} icon={SearchIcon} />
					<SideBarItem href={ROUTE.NOTIFICATION} icon={BellIcon} />
					<SideBarItem href="collab" icon={NetworkIcon} />
					<SideBarItem href="profile" icon={UserIcon} />
				</div>
			</div>
		</>
	)
}
