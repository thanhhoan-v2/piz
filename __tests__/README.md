# Testing Setup for Piz

This directory contains integration tests using React Testing Library and Jest for the Piz social media platform.

## 🧪 Testing Stack

- **Jest** - JavaScript testing framework
- **React Testing Library** - Testing utilities for React components
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Additional Jest matchers

## 📁 Test Structure

```
__tests__/
├── components/          # Component-specific tests
├── pages/              # Page component tests
├── integration/        # Complex integration tests
├── utils/              # Utility function tests
└── utils/test-utils.tsx # Custom render function with providers
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Recommended for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## 📋 Test Categories

### Component Tests
Located in `__tests__/components/`

Tests individual UI components in isolation:
- Rendering with different props
- User interactions (clicks, typing, etc.)
- Accessibility features
- State changes

**Example:**
```tsx
import { render, screen } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests
Located in `__tests__/integration/`

Tests multiple components working together:
- Form submissions with validation
- Complex user workflows
- Component interactions
- State management across components

### Page Tests
Located in `__tests__/pages/`

Tests complete page components:
- Full page rendering
- Navigation elements
- SEO and accessibility
- Different authentication states

### Utility Tests
Located in `__tests__/utils/`

Tests utility functions and custom hooks:
- Pure function logic
- Custom React hooks
- Helper functions
- Edge cases and error handling

## 🛠️ Test Utilities

### Custom Render Function
The `test-utils.tsx` file provides a custom render function that includes all necessary providers:

```tsx
import { render, screen } from '../utils/test-utils'

// This render function includes:
// - QueryClient provider
// - Theme provider
// - Mock Stack providers
```

### Mock Setup
Common mocks are configured in `jest.setup.js`:
- Next.js router
- Next.js Image component
- IntersectionObserver
- ResizeObserver
- matchMedia

## 📝 Writing Good Integration Tests

### 1. Test User Behavior, Not Implementation
```tsx
// ✅ Good - Tests what the user sees and does
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
await user.click(screen.getByRole('button', { name: /submit/i }))

// ❌ Bad - Tests implementation details
expect(wrapper.find('.submit-button')).toHaveLength(1)
```

### 2. Use Accessible Queries
```tsx
// ✅ Good - Uses accessible queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email address/i)
screen.getByText(/welcome back/i)

// ❌ Bad - Uses non-accessible queries
screen.getByTestId('submit-btn')
screen.getByClassName('email-input')
```

### 3. Test Async Operations
```tsx
// ✅ Good - Properly waits for async operations
await user.click(submitButton)
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})

// ❌ Bad - Doesn't wait for async operations
user.click(submitButton)
expect(screen.getByText(/success/i)).toBeInTheDocument()
```

### 4. Test Error States
```tsx
it('shows validation errors for invalid input', async () => {
  render(<LoginForm />)
  
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i)
})
```

### 5. Test Keyboard Navigation
```tsx
it('supports keyboard navigation', async () => {
  render(<Form />)
  
  await user.tab() // Focus first input
  await user.tab() // Focus second input
  await user.keyboard('{Enter}') // Submit form
  
  expect(screen.getByText(/submitting/i)).toBeInTheDocument()
})
```

## 🎯 Testing Best Practices

### Arrange, Act, Assert Pattern
```tsx
it('validates email format', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<LoginForm />)
  
  // Act
  await user.type(screen.getByLabelText(/email/i), 'invalid-email')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // Assert
  expect(screen.getByRole('alert')).toHaveTextContent(/invalid email/i)
})
```

### Use Descriptive Test Names
```tsx
// ✅ Good
it('shows validation error when email field is empty')
it('disables submit button while form is submitting')
it('redirects to dashboard after successful login')

// ❌ Bad
it('works correctly')
it('handles input')
it('test form')
```

### Group Related Tests
```tsx
describe('Form Validation', () => {
  describe('Email Field', () => {
    it('shows error for empty email')
    it('shows error for invalid email format')
    it('clears error when valid email is entered')
  })
  
  describe('Password Field', () => {
    it('shows error for short password')
    it('shows error for weak password')
  })
})
```

## 🚫 Common Pitfalls

### 1. Testing Implementation Details
Avoid testing internal state, component methods, or CSS classes directly.

### 2. Not Using User Events
Always use `@testing-library/user-event` instead of `fireEvent` for realistic interactions.

### 3. Forgetting to Wait for Async Operations
Always use `waitFor` or `findBy` queries for async operations.

### 4. Over-mocking
Only mock what's necessary. Prefer using real implementations when possible.

### 5. Not Testing Edge Cases
Include tests for loading states, error states, empty states, and boundary conditions.

## 📊 Coverage Guidelines

Aim for:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Focus on testing critical user paths and business logic rather than achieving 100% coverage.

## 🔧 Configuration Files

- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Global test setup and mocks
- `__tests__/utils/test-utils.tsx` - Custom render utilities

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro/)