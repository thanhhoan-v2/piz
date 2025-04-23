"use server"

import { prisma } from "@prisma/createClient"

export type CreateSnippetProps = {
	id: string
	userId?: string
	value: string
	lang: string
}

export const createSnippet = async ({ id, userId, value, lang }: CreateSnippetProps) => {
	// Validate required fields
	if (!id) {
		console.error("[SNIPPET] Cannot create snippet: Missing ID")
		throw new Error("Missing snippet ID")
	}

	if (!userId) {
		console.error("[SNIPPET] Cannot create snippet: Missing userId")
		throw new Error("Missing userId for snippet creation")
	}

	if (!value) {
		console.error("[SNIPPET] Cannot create snippet: Missing code value")
		throw new Error("Missing code value for snippet creation")
	}

	if (!lang) {
		console.log("[SNIPPET] No language specified, defaulting to 'plaintext'")
		lang = "plaintext"
	}

	try {
		console.log(`[SNIPPET] Creating/updating snippet with ID: ${id}`)

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

		console.log(`[SNIPPET] Successfully created/updated snippet with ID: ${id}`)
		return newSnippet
	} catch (error) {
		console.error(
			`[SNIPPET] Error creating/updating snippet with ID ${id}:`,
			JSON.stringify(error, null, 2),
		)
		throw error
	}
}

export const getSnippetById = async (id: string | null) => {
	if (!id) {
		console.error("[SNIPPET] Cannot get snippet: ID is null or empty")
		return null
	}

	try {
		console.log(`[SNIPPET] Attempting to fetch snippet with ID: ${id}`)
		const snippet = await prisma.snippet.findUnique({
			where: {
				id: id,
			},
		})

		if (!snippet) {
			console.error(`[SNIPPET] No snippet found with ID: ${id}`)
			return null
		}

		console.log(`[SNIPPET] Successfully retrieved snippet with ID: ${id}`)
		return snippet
	} catch (error) {
		console.error(
			`[SNIPPET] Error retrieving snippet with ID ${id}:`,
			JSON.stringify(error, null, 2),
		)
		return null
	}
}
