import { Account, Client, Databases } from "appwrite"

export const client = new Client()

client
	.setEndpoint("https://cloud.appwrite.io/v1")
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	.setProject(process.env.APPWRITE_PROJECT_ID!) // Replace with your project ID

export const account = new Account(client)
export { ID } from "appwrite"

const databases = new Databases(client)

const promise = databases.createDocument(
	"<DATABASE_ID>",
	"<COLLECTION_ID>",
	ID.unique(),
	{ title: "Hamlet" },
)

promise.then(
	(response) => {
		console.log(response)
	},
	(error) => {
		console.log(error)
	},
)
