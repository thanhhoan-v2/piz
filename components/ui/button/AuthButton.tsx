import { Button } from "@components/ui/Button"
import { RotateCw } from "lucide-react"

const AuthButton = ({
	isLoading,
	normalLabel,
	loadingLabel,
}: { isLoading: boolean; normalLabel: string; loadingLabel: string }) => {
	if (isLoading)
		return (
			<Button type="submit" disabled={isLoading}>
				<div className="flex-y-center gap-4">
					<RotateCw className="size-4 animate-spin" />
					<p>{loadingLabel}</p>
				</div>
			</Button>
		)

	return (
		<>
			<Button type="submit" disabled={isLoading}>
				{normalLabel}
			</Button>
		</>
	)
}

export default AuthButton
