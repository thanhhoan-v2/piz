import { createSupabaseClientWithCookies } from "@utils/supabase/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

export const signIn = async (formData: FormData) => {
	"use server";
	const supabase = createSupabaseClientWithCookies();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return redirect(
			`${"/sign-in" as Route}?type=signin&message=Wrong email or password`,
		);
	}

	return redirect("/" as Route);
};
