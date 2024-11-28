import { Button } from "@components/ui/Button"
import { RotateCw } from "lucide-react"

const AuthButton = ({
	isLoading,
	isPasswordStrong,
	normalLabel,
	loadingLabel,
}: {
	isLoading: boolean
	isPasswordStrong: boolean
	normalLabel: string
	loadingLabel: string
}) => {
	if (isLoading || !isPasswordStrong)
		return (
			<Button type="submit" disabled={true}>
				<div className="flex-y-center gap-4">
					{isLoading && <RotateCw className="size-4 animate-spin" />}
					<p>{normalLabel}</p>
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
