import DesktopSideBar from "@components/organisms/side-bar/side-bar-desktop";
import MobileSideBar from "@components/organisms/side-bar/side-bar-mobile";

export default function SideBar() {
	return (
		<>
			<DesktopSideBar />
			<MobileSideBar />
		</>
	);
}
