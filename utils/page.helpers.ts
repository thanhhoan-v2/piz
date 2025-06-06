// Returns true if the page was reloaded, otherwise return false.
export const isPageReload = () => {
	const navigationEntries = performance.getEntriesByType(
		"navigation"
	) as PerformanceNavigationTiming[]
	if (navigationEntries.length > 0) {
		const navigationType = navigationEntries[0].type
		if (navigationType === "reload") {
			return true
		}
	}
	return false
}
