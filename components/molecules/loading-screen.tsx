"use client";
import GlibberishText from "@components/animations/glibberish-text";
import React from "react";

const LoadingScreen = ({ duration }: { duration: number }) => {
	const [show, setShow] = React.useState(true);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setShow(false);
		}, duration);

		document.body.style.overflow = "auto";
		return () => {
			clearTimeout(timer);
			document.body.style.overflow = "none";
		};
	}, [duration]);

	if (!show) return null;

	return (
		<div className="fixed z-[1000] flex h-screen w-screen items-center justify-center bg-black">
			<GlibberishText
				text='"&nbsp;piz&nbsp;"'
				className="font-black text-[3rem] text-white tracking-widest"
			/>
		</div>
	);
};

export { LoadingScreen };
