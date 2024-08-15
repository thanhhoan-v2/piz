import { ROUTE } from "@constants/route";
import { createSupabaseClientWithCookies } from "@utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
	const supabase = createSupabaseClientWithCookies();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect(ROUTE.SIGN_IN);
	}

	return (
		<div className="flex w-full flex-1 flex-col items-center gap-20">
			<div className="w-full">
				<div className="bg-purple-950 py-6 text-center font-bold">
					This is a protected page that you can only see as an
					authenticated user
				</div>
				<nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
					<div className="flex w-full max-w-4xl items-center justify-between p-3 text-sm">
						{/* <AuthButton /> */}
					</div>
				</nav>
			</div>
		</div>
	);
}
