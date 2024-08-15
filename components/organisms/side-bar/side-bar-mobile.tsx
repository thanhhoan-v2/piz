"use client"
import SideBarItem from "@components/organisms/side-bar/side-bar-item"
import { ROUTE } from "@constants/route"
import { Heart, Home, Plus, Search, User } from "lucide-react"

export default function MobileSideBar() {
	return (
		<div className="mobile-only fixed right-0 bottom-0 left-0 h-18 w-screen p-2">
			<div className="flex-center">
				<div className="max-w-[425px] flex-between gap-0 mobile-l:gap-5 mobile_m:gap-3 mobile_s:gap-0">
					<SideBarItem href={ROUTE.HOME} icon={Home} />
					<SideBarItem href={ROUTE.SEARCH} icon={Search} />
					<SideBarItem href="post" icon={Plus} />
					<SideBarItem href={ROUTE.ACTIVITY} icon={Heart} />
					<SideBarItem href="profile" icon={User} />
				</div>
			</div>
		</div>
	)
}
