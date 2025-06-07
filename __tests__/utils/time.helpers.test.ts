import { getTimeDiffStatus } from '@/utils/time.helpers'

describe('getTimeDiffStatus', () => {
    const now = new Date('2024-01-01T12:00:00Z')

    beforeEach(() => {
        // Mock current time
        jest.useFakeTimers()
        jest.setSystemTime(now)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns "Just now" when createdAt is null', () => {
        const result = getTimeDiffStatus(null as any, null)
        expect(result).toBe('Just now')
    })

    it('returns "Just now" when time difference is 0 seconds', () => {
        const result = getTimeDiffStatus(now, null)
        expect(result).toBe('Just now')
    })

    it('returns seconds ago for time less than 1 minute', () => {
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
        const result = getTimeDiffStatus(thirtySecondsAgo, null)
        expect(result).toBe('30 seconds ago')
    })

    it('returns minutes ago for time between 1-60 minutes', () => {
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
        const result = getTimeDiffStatus(fifteenMinutesAgo, null)
        expect(result).toBe('15 minutes ago')
    })

    it('returns hours ago for time between 1-24 hours', () => {
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
        const result = getTimeDiffStatus(threeHoursAgo, null)
        expect(result).toBe('3 hours ago')
    })

    it('returns days ago for time more than 24 hours', () => {
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        const result = getTimeDiffStatus(twoDaysAgo, null)
        expect(result).toBe('2 days ago')
    })

    it('uses updatedAt when provided instead of createdAt', () => {
        const createdAt = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        const updatedAt = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago

        const result = getTimeDiffStatus(createdAt, updatedAt)
        expect(result).toBe('30 minutes ago')
    })

    it('uses createdAt when updatedAt is null', () => {
        const createdAt = new Date(now.getTime() - 45 * 60 * 1000) // 45 minutes ago

        const result = getTimeDiffStatus(createdAt, null)
        expect(result).toBe('45 minutes ago')
    })

    it('handles edge case of exactly 1 minute', () => {
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
        const result = getTimeDiffStatus(oneMinuteAgo, null)
        expect(result).toBe('60 seconds ago')
    })

    it('handles edge case of exactly 1 hour', () => {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const result = getTimeDiffStatus(oneHourAgo, null)
        expect(result).toBe('60 minutes ago')
    })

    it('handles edge case of exactly 1 day', () => {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const result = getTimeDiffStatus(oneDayAgo, null)
        expect(result).toBe('24 hours ago')
    })

    it('handles very large time differences', () => {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const result = getTimeDiffStatus(thirtyDaysAgo, null)
        expect(result).toBe('30 days ago')
    })

    it('handles future dates (should return 0 or negative values)', () => {
        const futureDate = new Date(now.getTime() + 60 * 1000) // 1 minute in future
        const result = getTimeDiffStatus(futureDate, null)
        // The function doesn't handle future dates explicitly, so this tests current behavior
        expect(result).toMatch(/ago$/) // Should still end with "ago"
    })
}) 