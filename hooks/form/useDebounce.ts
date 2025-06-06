export const useDebounce = (func: (...args: string[]) => void, wait: number) => {
	let timeout: NodeJS.Timeout
	return function executedFunction(...args: string[]) {
		const later = () => {
			clearTimeout(timeout)
			func(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}
