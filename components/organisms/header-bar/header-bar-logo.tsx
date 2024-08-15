"use client";
import { Logo } from "@components/atoms/logo";
import { cn } from "@utils/cn";
import { usePathname } from "next/navigation";

export default function HeaderBarLogo() {
	const pathname = usePathname();
	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment);
	return (
		<>
			{/* if URL length has more than 2 items then show in center, else show in leftmost */}
			<div
				className={cn(
					"mobile-only flex-grow",
					pathSegments.length >= 2 && "flex-center",
				)}
			>
				<Logo className="font-black text-2xl" />
			</div>
		</>
	);
}
