import { Button } from "@components/atoms/button"

export default function PostSaveButton({
	userId,
	postId,
}: { userId: string; postId: string }) {
	const handleSavePost = () => {}

	return (
		<>
			<Button variant="ghost" className="w-full" onClick={handleSavePost}>
				Save
			</Button>
		</>
	)
}
