import { render, screen } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Input } from '@/components/ui/Input'

describe('Input Component Integration Tests', () => {
    const user = userEvent.setup()

    it('renders with default props', () => {
        render(<Input placeholder="Enter text" />)

        const input = screen.getByPlaceholderText(/enter text/i)
        expect(input).toBeInTheDocument()
        // Input component doesn't set type="text" explicitly, browser defaults to text
        expect(input.tagName).toBe('INPUT')
    })

    it('handles text input correctly', async () => {
        render(<Input placeholder="Type here" />)

        const input = screen.getByPlaceholderText(/type here/i)
        await user.type(input, 'Hello World')

        expect(input).toHaveValue('Hello World')
    })

    it('renders different input types correctly', () => {
        const { rerender } = render(<Input type="email" placeholder="Email" />)

        let input = screen.getByPlaceholderText(/email/i)
        expect(input).toHaveAttribute('type', 'email')

        rerender(<Input type="password" placeholder="Password" />)
        input = screen.getByPlaceholderText(/password/i)
        expect(input).toHaveAttribute('type', 'password')

        rerender(<Input type="number" placeholder="Number" />)
        input = screen.getByPlaceholderText(/number/i)
        expect(input).toHaveAttribute('type', 'number')
    })

    it('handles change events', async () => {
        const handleChange = jest.fn()
        render(<Input onChange={handleChange} placeholder="Change test" />)

        const input = screen.getByPlaceholderText(/change test/i)
        await user.type(input, 'test')

        expect(handleChange).toHaveBeenCalledTimes(4) // Once for each character
    })

    it('handles focus and blur events', async () => {
        const handleFocus = jest.fn()
        const handleBlur = jest.fn()
        render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />)

        const input = screen.getByPlaceholderText(/focus test/i)

        await user.click(input)
        expect(handleFocus).toHaveBeenCalledTimes(1)
        expect(input).toHaveFocus()

        await user.tab()
        expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is true', async () => {
        render(<Input disabled placeholder="Disabled input" />)

        const input = screen.getByPlaceholderText(/disabled input/i)
        expect(input).toBeDisabled()
        expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')

        await user.type(input, 'should not work')
        expect(input).toHaveValue('')
    })

    it('accepts custom className and merges it correctly', () => {
        render(<Input className="custom-input-class" placeholder="Custom" />)

        const input = screen.getByPlaceholderText(/custom/i)
        expect(input).toHaveClass('custom-input-class')
        expect(input).toHaveClass('flex', 'h-9', 'w-full') // Should still have default classes
    })

    it('forwards ref correctly', () => {
        const ref = { current: null }
        render(<Input ref={ref} placeholder="Ref input" />)

        expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('supports controlled input', async () => {
        const TestComponent = () => {
            const [value, setValue] = React.useState('')
            return (
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Controlled input"
                />
            )
        }

        render(<TestComponent />)

        const input = screen.getByPlaceholderText(/controlled input/i)
        await user.type(input, 'controlled')

        expect(input).toHaveValue('controlled')
    })

    it('handles file input correctly', () => {
        render(<Input type="file" />)

        const input = document.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'file')
    })

    it('applies focus styles correctly', async () => {
        render(<Input placeholder="Focus styles" />)

        const input = screen.getByPlaceholderText(/focus styles/i)

        await user.click(input)
        expect(input).toHaveFocus()
        expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1')
    })

    it('renders with initial value', () => {
        render(<Input defaultValue="Initial value" />)

        const input = screen.getByDisplayValue(/initial value/i)
        expect(input).toBeInTheDocument()
        expect(input).toHaveValue('Initial value')
    })

    it('supports accessibility attributes', () => {
        render(
            <Input
                placeholder="Accessible input"
                aria-label="Test input"
                aria-describedby="test-description"
                required
            />
        )

        const input = screen.getByLabelText(/test input/i)
        expect(input).toHaveAttribute('aria-describedby', 'test-description')
        expect(input).toBeRequired()
    })
}) 