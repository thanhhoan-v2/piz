"use server"

import { prisma } from "@prisma/createClient"

export type CreateSnippetProps = {
	id: string
	userId?: string
	value: string
	lang: string
	theme: string
}

export const createSnippet = async ({ id, userId, value, lang, theme }: CreateSnippetProps) => {
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
				theme: theme,
			},
			create: {
				id: id,
				userId: userId,
				value: value,
				lang: lang,
				theme: theme,
			},
		})
		return newSnippet
	} catch (error) {
		console.error("[SNIPPET] Error when creating...", JSON.stringify(error, null, 2))
	}
}

export const getSnippetById = async (id: string | null) => {
	if (id !== null) {
		try {
			const snippet = await prisma.snippet.findUnique({
				where: {
					id: id,
				},
			})

			console.log(snippet)

			return snippet
		} catch (error) {
			console.error("[SNIPPET] Error when getting...", JSON.stringify(error, null, 2))
		}
	} else {
		console.error("[SNIPPET] id is null")
	}
}
