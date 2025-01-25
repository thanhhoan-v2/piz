export function firstLetterToUpper(str?: string | null) {
	return str
		?.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
}
