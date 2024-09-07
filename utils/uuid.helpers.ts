import { v4 as uuidv4 } from "uuid"

export const generateBase64uuid = () => {
	const uuid = uuidv4()

	// Remove dashes from the UUID and convert it to a byte array
	const hex = uuid.replace(/-/g, "")

	const matches = hex.match(/.{1,2}/g)
	if (!matches) {
		throw new Error("Failed to match hex string")
	}

	const byteArray = new Uint8Array(
		matches.map((byte) => Number.parseInt(byte, 16)),
	)

	// Convert the byte array to a binary string
	let binaryString = ""
	for (let i = 0; i < byteArray.length; i++) {
		binaryString += String.fromCharCode(byteArray[i])
	}

	// Encode the binary string to Base64
	const base64 = btoa(binaryString)

	// Replace Base64 special characters (+, /) with URL-friendly ones (-, _)
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") // Remove any padding
}
