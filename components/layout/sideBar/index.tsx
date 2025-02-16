import DesktopSideBar from "./SidebarDesktop"
import MobileSideBar from "./SidebarMobile"

export default function SideBar({ mobileSideBarClassName }: { mobileSideBarClassName: string }) {
	return (
		<>
			<DesktopSideBar />
			<MobileSideBar mobileSideBarClassName={mobileSideBarClassName} />
		</>
	)
}
