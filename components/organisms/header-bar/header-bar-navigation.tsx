"use client";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function HeaderBarNavigation() {
	const pathname = usePathname();
	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment);

	return (
		<>
			{/* if URL length has more than 2 items then show */}
			{pathSegments.length >= 2 && (
				<div className="mobile-only">
					<ChevronLeft />
				</div>
			)}
		</>
	);
}
