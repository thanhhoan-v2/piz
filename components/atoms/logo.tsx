import { ROUTE } from "@constants/route";
import Link from "next/link";

const Logo = ({ className }: { className?: string }) => {
	return (
		<>
			<div className={className}>
				<Link href={ROUTE.HOME}>piz</Link>
			</div>
		</>
	);
};

Logo.displayName = "Logo";

export { Logo };
