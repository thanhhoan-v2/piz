"use client"

import { Button } from "@components/ui/Button"
import { Input, type InputProps } from "@components/ui/Input"
import { cn } from "@utils/cn"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false)
		const disabled =
			props.value === "" || props.value === undefined || props.disabled

		return (
			<div className="relative">
				<Input
					name="password"
					id="password"
					required
					type={showPassword ? "text" : "password"}
					className={cn("hide-password-toggle pr-10", className)}
					ref={ref}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
					onClick={() => setShowPassword((prev) => !prev)}
					disabled={disabled}
				>
					{showPassword && !disabled ? (
						<EyeIcon className="h-4 w-4" aria-hidden="true" />
					) : (
						<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
					)}
					<span className="sr-only">
						{showPassword ? "Hide password" : "Show password"}
					</span>
				</Button>

				{/* hides browsers password toggles */}
				<style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
			</div>
		)
	},
)
InputPassword.displayName = "InputPassword"

export { InputPassword }
