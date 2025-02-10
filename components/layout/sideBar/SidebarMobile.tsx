"use client"

import { ROUTE } from "@constants/route"
import { cn } from "@utils/cn"
import { Bell, Home, Plus, Search, User } from "lucide-react"
import SideBarItem from "./SidebarItem"

export default function MobileSideBar({
	mobileSideBarClassName,
}: { mobileSideBarClassName: string }) {
	return (
		<div
			className={cn(
				"mobile-only right-0 bottom-0 left-0 z-50 h-18 w-screen bg-background p-2",
				mobileSideBarClassName,
			)}
		>
			<div className="flex-center">
				<div className="max-w-[425px] flex-between gap-0 mobile-l:gap-5 mobile_m:gap-3 mobile_s:gap-0 py-1">
					<SideBarItem href={ROUTE.HOME} icon={Home} />
					<SideBarItem href={ROUTE.SEARCH} icon={Search} />
					<SideBarItem href="post" icon={Plus} />
					<SideBarItem href={ROUTE.NOTIFICATION} icon={Bell} />
					<SideBarItem href="profile" icon={User} />
				</div>
			</div>
		</div>
	)
}
