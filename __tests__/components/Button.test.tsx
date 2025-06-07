import { render, screen } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button Component Integration Tests', () => {
    const user = userEvent.setup()

    it('renders with default props', () => {
        render(<Button>Click me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('handles click events', async () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        await user.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders different variants correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>)

        let button = screen.getByRole('button')
        expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')

        rerender(<Button variant="outline">Outline</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('border', 'border-input', 'bg-background')

        rerender(<Button variant="secondary">Secondary</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')

        rerender(<Button variant="ghost">Ghost</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('hover:bg-background')

        rerender(<Button variant="link">Link</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })

    it('renders different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)

        let button = screen.getByRole('button')
        expect(button).toHaveClass('h-8', 'px-3', 'text-xs')

        rerender(<Button size="lg">Large</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('h-10', 'px-8')

        rerender(<Button size="icon">Icon</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('h-9', 'w-9')
    })

    it('renders as a child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
        expect(link).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('is disabled when disabled prop is true', async () => {
        const handleClick = jest.fn()
        render(<Button disabled onClick={handleClick}>Disabled</Button>)

        const button = screen.getByRole('button', { name: /disabled/i })
        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')

        await user.click(button)
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('accepts custom className and merges it correctly', () => {
        render(<Button className="custom-class">Custom</Button>)

        const button = screen.getByRole('button', { name: /custom/i })
        expect(button).toHaveClass('custom-class')
        expect(button).toHaveClass('bg-primary') // Should still have default classes
    })

    it('forwards ref correctly', () => {
        const ref = { current: null }
        render(<Button ref={ref}>Ref Button</Button>)

        expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('applies focus styles correctly', async () => {
        render(<Button>Focus me</Button>)

        const button = screen.getByRole('button', { name: /focus me/i })

        await user.tab()
        expect(button).toHaveFocus()
        expect(button).toHaveClass('focus-visible:outline-none')
    })
}) 