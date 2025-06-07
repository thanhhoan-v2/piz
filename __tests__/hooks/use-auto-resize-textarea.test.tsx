import { renderHook, act } from '../utils/test-utils'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'

// Mock textarea element for testing
const createMockTextarea = (scrollHeight = 100) => {
    const textarea = document.createElement('textarea')

    // Mock the scrollHeight property
    Object.defineProperty(textarea, 'scrollHeight', {
        value: scrollHeight,
        writable: true,
        configurable: true,
    })

    // Mock style properties
    textarea.style.height = '0px'
    textarea.style.overflowY = 'hidden'

    return textarea
}

describe('useAutoResizeTextarea', () => {
    const defaultProps = {
        minHeight: 40,
        maxHeight: 200,
    }

    it('returns textareaRef and adjustHeight function', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        expect(result.current.textareaRef).toBeDefined()
        expect(result.current.adjustHeight).toBeInstanceOf(Function)
        expect(result.current.textareaRef.current).toBeNull() // Initially null
    })

    it('adjusts height to minimum when content is small', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        const mockTextarea = createMockTextarea(20) // Small scroll height
        result.current.textareaRef.current = mockTextarea

        act(() => {
            result.current.adjustHeight()
        })

        expect(mockTextarea.style.height).toBe('40px') // Should use minHeight
        expect(mockTextarea.style.overflowY).toBe('hidden')
    })

    it('adjusts height to content size when between min and max', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        const mockTextarea = createMockTextarea(120) // Medium scroll height
        result.current.textareaRef.current = mockTextarea

        act(() => {
            result.current.adjustHeight()
        })

        expect(mockTextarea.style.height).toBe('120px') // Should match scrollHeight
        expect(mockTextarea.style.overflowY).toBe('hidden')
    })

    it('limits height to maximum when content is large', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        const mockTextarea = createMockTextarea(300) // Large scroll height
        result.current.textareaRef.current = mockTextarea

        act(() => {
            result.current.adjustHeight()
        })

        expect(mockTextarea.style.height).toBe('200px') // Should use maxHeight
        expect(mockTextarea.style.overflowY).toBe('auto') // Should enable scrolling
    })

    it('handles missing textarea element gracefully', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        // Don't set textarea ref, leave it null
        expect(() => {
            act(() => {
                result.current.adjustHeight()
            })
        }).not.toThrow()
    })

    it('works with different min and max heights', () => {
        const customProps = {
            minHeight: 60,
            maxHeight: 300,
        }

        const { result } = renderHook(() => useAutoResizeTextarea(customProps))

        const mockTextarea = createMockTextarea(50) // Below min
        result.current.textareaRef.current = mockTextarea

        act(() => {
            result.current.adjustHeight()
        })

        expect(mockTextarea.style.height).toBe('60px') // Should use custom minHeight
    })

    it('resets height before calculating new height', () => {
        const { result } = renderHook(() => useAutoResizeTextarea(defaultProps))

        const mockTextarea = createMockTextarea(120)
        mockTextarea.style.height = '150px' // Set initial height
        result.current.textareaRef.current = mockTextarea

        act(() => {
            result.current.adjustHeight()
        })

        // The function should reset to minHeight first, then set to scrollHeight
        expect(mockTextarea.style.height).toBe('120px')
    })

    it('maintains stable references across re-renders', () => {
        const { result, rerender } = renderHook(() => useAutoResizeTextarea(defaultProps))

        const initialRef = result.current.textareaRef

        // Re-render the hook
        rerender()

        expect(result.current.textareaRef).toBe(initialRef)
        expect(typeof result.current.adjustHeight).toBe('function')
    })
})

// Integration test with actual textarea element
describe('useAutoResizeTextarea integration', () => {
    const TestComponent = ({ minHeight = 40, maxHeight = 200 }) => {
        const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight })

        return (
            <textarea
                ref={textareaRef}
                onChange={adjustHeight}
                onInput={adjustHeight}
                data-testid="auto-resize-textarea"
                style={{ resize: 'none' }}
            />
        )
    }

    it('integrates with real textarea element', () => {
        const { render, screen } = require('../utils/test-utils')

        render(<TestComponent />)

        const textarea = screen.getByTestId('auto-resize-textarea')
        expect(textarea).toBeInTheDocument()
        expect(textarea.style.resize).toBe('none')
    })
}) 