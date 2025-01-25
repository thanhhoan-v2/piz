import { InputPassword } from "@components/ui/input/InputPassword"
import { useEffect, useState } from "react"
import { MdDone } from "react-icons/md"
import { RxCross1 } from "react-icons/rx"

type StrongPasswordProps = {
	onPasswordChange: (password: string) => void
	onSignalStrong: (isSignalStrong: boolean) => void
}

const InputStrongPassword = ({
	onPasswordChange,
	onSignalStrong,
}: StrongPasswordProps) => {
	const [hintDropdownOpen, setHintDropdownOpen] = useState(false)
	const [isEyeOpen, setIsEyeOpen] = useState(false)
	const [passwordValue, setPasswordValue] = useState("")
	const [signal, setSignal] = useState({
		lowercase: false,
		uppercase: false,
		number: false,
		symbol: false,
		length: false,
		strong: false,
	})

	const handleStrongPasswordChecker = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const password = e.target.value
		setPasswordValue(password)

		const hasUpperCase = /[A-Z]/.test(password)
		const hasLowerCase = /[a-z]/.test(password)
		const hasNumber = /[0-9]/.test(password)
		const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)

		setSignal({
			lowercase: hasLowerCase,
			uppercase: hasUpperCase,
			number: hasNumber,
			symbol: hasSymbol,
			length: password.length >= 8,
			strong:
				hasUpperCase &&
				hasLowerCase &&
				hasNumber &&
				hasSymbol &&
				password.length >= 8,
		})

		onPasswordChange(password)
	}

	useEffect(() => {
		if (signal.strong) onSignalStrong(true)
		else onSignalStrong(false)
	}, [signal, onSignalStrong])

	return (
		<div className="1024px:w-[80%] w-full">
			<label htmlFor="password" className="font-[400] text-[15px] text-text">
				Password
			</label>
			<div className="relative w-full">
				<InputPassword
					name="password"
					id="password"
					value={passwordValue}
					onChange={handleStrongPasswordChecker}
					onFocus={() => setHintDropdownOpen(true)}
					onBlur={() => {
						setHintDropdownOpen(false)
					}}
				/>

				<div
					className={`${hintDropdownOpen ? "z-30 translate-y-0 opacity-100" : "z-[-1] translate-y-[-10px] opacity-0"} absolute top-[60px] left-0 w-full rounded-md bg-white px-4 py-3 shadow-md transition-all duration-300`}
				>
					<h3 className="font-[500] text-[1rem] text-gray-900">
						Your password must contain:
					</h3>

					<div className="mt-2 flex w-full flex-col gap-[6px]">
						<div
							className={`${signal.length ? "text-green-500" : "text-gray-500"} flex items-center gap-[8px] text-[0.8rem]`}
						>
							{signal.length ? (
								<MdDone className={"text-[1rem]"} />
							) : (
								<RxCross1 />
							)}
							Minimum number of characters is 8.
						</div>
						<div
							className={`${signal.uppercase ? "text-green-500" : "text-gray-500"} flex items-center gap-[8px] text-[0.8rem]`}
						>
							{signal.uppercase ? (
								<MdDone className={"text-[1rem]"} />
							) : (
								<RxCross1 />
							)}
							Should contain uppercase.
						</div>
						<div
							className={`${signal.lowercase ? "text-green-500" : "text-gray-500"} flex items-center gap-[8px] text-[0.8rem]`}
						>
							{signal.lowercase ? (
								<MdDone className={"text-[1rem]"} />
							) : (
								<RxCross1 />
							)}
							Should contain lowercase.
						</div>
						<div
							className={`${signal.number ? "text-green-500" : "text-gray-500"} flex items-center gap-[8px] text-[0.8rem]`}
						>
							{signal.number ? (
								<MdDone className={"text-[1rem]"} />
							) : (
								<RxCross1 />
							)}
							Should contain numbers.
						</div>
						<div
							className={`${signal.symbol ? "text-green-500" : "text-gray-500"} flex items-center gap-[8px] text-[0.8rem]`}
						>
							{signal.symbol ? (
								<MdDone className={"text-[1rem]"} />
							) : (
								<RxCross1 />
							)}
							Should contain special characters.
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default InputStrongPassword
