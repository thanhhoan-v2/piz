import DesktopSideBar from "./SidebarDesktop"
import MobileSideBar from "./SidebarMobile"

/**
 * A responsive sidebar component which renders a desktop sidebar
 * and a mobile sidebar.
 *
 * @param mobileSideBarClassName - The class name to be applied to the
 * mobile sidebar.
 *
 * @returns A JSX element containing the desktop sidebar and mobile sidebar.
 */
export default function SideBar({
	mobileSideBarClassName,
}: { mobileSideBarClassName: string }) {
	return (
		<>
			<DesktopSideBar />
			<MobileSideBar mobileSideBarClassName={mobileSideBarClassName} />
		</>
	)
}
