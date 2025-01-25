import Icon from "@app/icon.png"
import { ROUTE } from "@constants/route"
import Image from "next/image"
import Link from "next/link"

const Logo = () => {
	return (
		<>
			<Link href={ROUTE.HOME}>
				<Image src={Icon} alt="logo" width={50} height={50} />
			</Link>
		</>
	)
}

Logo.displayName = "Logo"

export { Logo }
