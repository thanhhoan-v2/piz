import type { ReactNode } from "react"

export default function UserProfileLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{/* <LoadingScreen /> */}

			{children}
		</>
	)
}
