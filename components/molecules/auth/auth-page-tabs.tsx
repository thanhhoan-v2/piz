"use client";
import { TabsList, TabsTrigger } from "@components/atoms/tabs";
import type { Route } from "next";
import { useRouter } from "next/navigation";

export default function AuthPageTabs() {
	const router = useRouter();

	const clearQueryParams = () => {
		const url = new URL(window.location.href);
		url.searchParams.delete("type");
		url.searchParams.delete("message");
		router.push(url.pathname as Route);
	};

	return (
		<>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="sign-in" onClick={clearQueryParams}>
					Sign In
				</TabsTrigger>
				<TabsTrigger value="sign-up" onClick={clearQueryParams}>
					Sign Up
				</TabsTrigger>
			</TabsList>
		</>
	);
}
