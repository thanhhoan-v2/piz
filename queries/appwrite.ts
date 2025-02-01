import { Account, Client } from "appwrite"

export const appwriteClient = new Client()

const appwriteProjectID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

if (appwriteProjectID !== undefined) {
	appwriteClient
		.setEndpoint("https://cloud.appwrite.io/v1")
		.setProject(appwriteProjectID)
} else {
	console.error("Appwrite project ID is not defined")
}

export const account = new Account(appwriteClient)
export { ID as AppwriteID } from "appwrite"
