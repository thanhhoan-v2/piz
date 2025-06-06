import { StackHandler } from "@stackframe/stack"
import { stackServerApp } from "../../../stack"

/**
 * Handles StackFrame routes for the app.
 *
 * @remarks
 *
 * This component is used as a catch-all route handler for StackFrame routes.
 * It is used to handle routes such as `/sign-in`, `/sign-up`, etc.
 *
 * @param props - The props passed to the component.
 * @returns The rendered component.
 */
export default function Handler(props: unknown) {
	return (
		<>
			<div className="w-[300px]">
				<StackHandler fullPage app={stackServerApp} routeProps={props} />
			</div>
		</>
	)
}
