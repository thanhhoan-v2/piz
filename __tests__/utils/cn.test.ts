import { cn } from '@/utils/cn'

describe('cn utility function', () => {
    it('merges multiple class names', () => {
        const result = cn('class1', 'class2', 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    it('handles conditional classes', () => {
        const condition = true
        const result = cn('base-class', condition && 'conditional-class')
        expect(result).toBe('base-class conditional-class')
    })

    it('filters out falsy values', () => {
        const result = cn('class1', false, null, undefined, '', 'class2')
        expect(result).toBe('class1 class2')
    })

    it('merges Tailwind classes correctly (deduplicates conflicting classes)', () => {
        // twMerge should handle conflicting Tailwind classes
        const result = cn('px-2 py-1 px-4')
        expect(result).toBe('py-1 px-4') // px-4 should override px-2
    })

    it('handles arrays of class names', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    it('handles objects with conditional keys', () => {
        const result = cn({
            'active': true,
            'disabled': false,
            'loading': true
        })
        expect(result).toBe('active loading')
    })

    it('handles mixed types of inputs', () => {
        const result = cn(
            'base',
            { 'conditional': true },
            ['array-class'],
            false && 'hidden',
            'final'
        )
        expect(result).toBe('base conditional array-class final')
    })

    it('handles empty inputs', () => {
        const result = cn()
        expect(result).toBe('')
    })

    it('handles complex Tailwind class conflicts', () => {
        const result = cn(
            'bg-red-500 text-white',
            'bg-blue-500', // should override bg-red-500
            'text-black'   // should override text-white
        )
        expect(result).toBe('bg-blue-500 text-black')
    })

    it('preserves non-conflicting classes', () => {
        const result = cn(
            'flex items-center justify-center',
            'px-4 py-2',
            'rounded-md border'
        )
        expect(result).toBe('flex items-center justify-center px-4 py-2 rounded-md border')
    })
}) 