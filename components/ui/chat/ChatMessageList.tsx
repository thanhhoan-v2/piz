import { Button } from "@components/ui/Button"
import { useAutoScroll } from "@hooks/use-auto-scroll"
import { ArrowDown } from "lucide-react"
import * as React from "react"

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
	smooth?: boolean
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
	({ className, children, smooth = false, ...props }, _ref) => {
		const { scrollRef, isAtBottom, autoScrollEnabled, scrollToBottom, disableAutoScroll } =
			useAutoScroll({
				smooth,
				content: children,
			})

		return (
			<div className="w-full h-auto">
				<div
					className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
					ref={scrollRef}
					onWheel={disableAutoScroll}
					onTouchMove={disableAutoScroll}
					{...props}
				>
					<div className="flex flex-col gap-6">{children}</div>
				</div>

				{!isAtBottom && (
					<Button
						onClick={() => {
							scrollToBottom()
						}}
						size="icon"
						variant="outline"
						className="inline-flex bottom-2 left-1/2 absolute shadow-md rounded-full -translate-x-1/2 transform"
						aria-label="Scroll to bottom"
					>
						<ArrowDown className="w-4 h-4" />
					</Button>
				)}
			</div>
		)
	}
)

ChatMessageList.displayName = "ChatMessageList"

export { ChatMessageList }
