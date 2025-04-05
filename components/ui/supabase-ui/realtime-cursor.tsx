"use client"

import { Cursor } from "@components/ui/supabase-ui/cursor"
import { useRealtimeCursors } from "@components/ui/supabase-ui/use-realtime-cursor"
import { useRef } from "react"

const THROTTLE_MS = 50

export const RealtimeCursors = ({ roomName, username }: { roomName: string; username: string }) => {
	const { cursors } = useRealtimeCursors({ roomName, username, throttleMs: THROTTLE_MS })
	// Reference to the cursor container for relative positioning
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<div ref={containerRef} className="absolute inset-0 overflow-hidden">
			{Object.keys(cursors).map((id) => {
				// Ensure cursor positions stay within container bounds
				const pos = cursors[id].position
				const containerBounds = containerRef.current?.getBoundingClientRect()

				// If no container bounds yet, use the raw position
				const x = containerBounds
					? Math.min(Math.max(0, pos.x - containerBounds.left), containerBounds.width)
					: pos.x
				const y = containerBounds
					? Math.min(Math.max(0, pos.y - containerBounds.top), containerBounds.height)
					: pos.y

				return (
					<Cursor
						key={id}
						className="absolute transition-transform ease-in-out z-50"
						style={{
							transitionDuration: "20ms",
							top: 0,
							left: 0,
							transform: `translate(${x}px, ${y}px)`,
						}}
						color={cursors[id].color}
						name={cursors[id].user.name}
					/>
				)
			})}
		</div>
	)
}
