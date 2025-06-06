"use client"
import { GooeyText } from "@components/animation/text-morphing"
import { Backdrop } from "@components/ui/Backdrop"
import { isPageReload } from "@utils/page.helpers"
import React from "react"

const LoadingScreen = ({ duration = 2000 }: { duration?: number }) => {
	const [show, setShow] = React.useState(true)

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setShow(false)
		}, duration)

		document.body.style.overflow = "hidden"
		return () => {
			clearTimeout(timer)
			document.body.style.overflow = "auto"
		}
	}, [duration])

	React.useEffect(() => {
		if (isPageReload()) {
			setShow(true)
		}
		setShow(true)
	}, [])

	if (!show) return null

	return (
		<>
			{/* <div className="absolute z-[1000] flex h-[190vh] w-screen items-center justify-center bg-black"> */}
			{/* 	<div className=""></div> */}
			{/* </div> */}

			<Backdrop open={show} variant="dim">
				{/* <GlibberishText */}
				{/* 	text='"&nbsp;piz&nbsp;"' */}
				{/* 	className="font-black text-[3rem] tracking-widest" */}
				{/* 	colors={["text-pink-500", "text-cyan-400", "text-yellow-500"]} */}
				{/* /> */}
				<GooeyText
					texts={["0%", "3%", "9%", "25%", "32%", "39%", "45%", "90%"]}
					morphTime={1}
					cooldownTime={0.1}
					className="font-bold"
				/>
			</Backdrop>
		</>
	)
}

export { LoadingScreen }
