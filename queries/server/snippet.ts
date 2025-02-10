"use server"

import { prisma } from "@prisma/createClient"

export type CreateSnippetProps = {
	id: string
	userId?: string
	value: string
	lang: string
}

export const createSnippet = async ({
	id,
	userId,
	value,
	lang,
}: CreateSnippetProps) => {
	try {
		if (!userId) {
			console.log("[SNIPPET] Missing userId when creating...")
			return
		}

		const newSnippet = await prisma.snippet.upsert({
			where: {
				id: id,
			},
			update: {
				value: value,
				lang: lang,
			},
			create: {
				id: id,
				userId: userId,
				value: value,
				lang: lang,
			},
		})

		console.log(newSnippet)

		return newSnippet
	} catch (error) {
		console.error(
			"[SNIPPET] Error when creating...",
			JSON.stringify(error, null, 2),
		)
	}
}
