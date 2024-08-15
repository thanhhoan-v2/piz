"use client";
import { Button } from "@components/atoms/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = ({
	noButton = false,
	iconSize,
	iconClassName,
	darkModeLabel,
	lightModeLabel,
}: {
	noButton?: boolean;
	iconSize?: number;
	iconClassName?: string;
	darkModeLabel?: string;
	lightModeLabel?: string;
}) => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration error, only show when mounted
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	if (noButton)
		return (
			<>
				{theme === "light" ? (
					<>
						<Sun size={iconSize} className={iconClassName} />
						<span>{lightModeLabel ?? ""}</span>
					</>
				) : (
					<>
						<Moon size={iconSize} className={iconClassName} />
						<span>{darkModeLabel ?? ""}</span>
					</>
				)}
			</>
		);

	return (
		<Button
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
		>
			{theme === "light" ? (
				<>
					<Sun size={iconSize} className={iconClassName} />
					<span>{lightModeLabel ?? ""}</span>
				</>
			) : (
				<>
					<Moon size={iconSize} className={iconClassName} />
					<span>{darkModeLabel ?? ""}</span>
				</>
			)}
		</Button>
	);
};

export { ThemeToggle };
