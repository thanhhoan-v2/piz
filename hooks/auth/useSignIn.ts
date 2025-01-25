"use server"

type signInProps = {
	email: string
	password: string
}

export const useSignIn = async ({ email, password }: signInProps) => {
	// const {
	// 	data: { user, session },
	// 	error,
	// } = await supabase.auth.signInWithPassword({ email, password })

	const foundUser = null
	// if (error) {
	// 	foundUser = await prisma.appUser.findUnique({
	// 		where: { email },
	// 	})
	//
	// 	const {
	// 		name: errorName,
	// 		message: errorMessage,
	// 		status: errorStatus,
	// 	} = error
	// 	return { errorName, errorMessage, errorStatus, foundUser }
	// }
	//
	// return { user, session }
}
