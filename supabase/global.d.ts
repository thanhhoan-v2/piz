export type SupabaseUserProps = {
	id: string
	aud: string
	role: string
	email: string
	email_confirmed_at: string
	phone: string
	confirmed_at: string
	last_sign_in_at: string
	app_metadata: {
		provider: string
		providers: string[]
	}
	user_metadata: {
		email: string
		email_verified: boolean
		full_name: string
		password: string
		phone_verified: boolean
		sub: string
		user_name: string
		avatar_url?: string
	}
	identities: {
		identity_id: string
		id: string
		user_id: string
		identity_data: Record<string, unknown>
		provider: string
		last_sign_in_at: string
		created_at: string
		updated_at: string
		email: string
	}[]
	created_at: string
	updated_at: string
	is_anonymous: boolean
}
