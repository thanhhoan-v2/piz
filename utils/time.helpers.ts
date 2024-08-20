export const calculateTimeDiff = (createdAt: Date, updatedAt: Date | null) => {
	const currentTime = new Date()
	const givenTime = updatedAt ?? createdAt

	// Calculate the difference in milliseconds
	const differenceInMilliseconds = currentTime.getTime() - givenTime?.getTime()

	// Convert milliseconds to seconds, minutes, hours, days
	const seconds = Math.floor(differenceInMilliseconds / 1000)
	const minutes = Math.floor(differenceInMilliseconds / (1000 * 60))
	const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60))
	const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24))

	let timeAgo = `${seconds} seconds ago`
	if (seconds > 60) {
		timeAgo = `${minutes} minutes ago`
	}
	if (minutes > 60) {
		timeAgo = `${hours} hours ago`
	}
	if (hours > 24) {
		timeAgo = `${days} days ago`
	}

	return timeAgo
}
