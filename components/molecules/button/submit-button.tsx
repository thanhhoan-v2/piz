"use client";

import { Button } from "@components/atoms/button";
import { cn } from "@utils/cn";
import type { ComponentProps, Ref } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<"button"> & {
	pendingText?: string;
	placeholder: string;
	className?: string;
};

export function SubmitButton({
	children,
	pendingText,
	placeholder,
	className,
	...props
}: Props) {
	const { pending, action } = useFormStatus();

	const isPending = pending && action === props.formAction;

	return (
		<Button
			{...props}
			type="submit"
			ref={props.ref as Ref<HTMLButtonElement>}
			aria-disabled={pending}
			className={cn("text-black", className)}
		>
			{isPending ? (
				pendingText ?? "Submitting..."
			) : (
				<>
					<p>{placeholder}</p>
				</>
			)}
		</Button>
	);
}
