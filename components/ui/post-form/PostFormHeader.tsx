import {
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@components/ui/Drawer"

export function PostFormHeader() {
	return (
		<DrawerHeader>
			<DrawerTitle>New post</DrawerTitle>
			<DrawerDescription>What's on your thinking?</DrawerDescription>
		</DrawerHeader>
	)
}
