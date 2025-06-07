import { render, screen } from '../utils/test-utils'
import React from 'react'

// Mock a simple HomePage component for demonstration
const HomePage = () => {
    return (
        <main>
            <h1>Welcome to Piz</h1>
            <p>An experimental social media platform. WIP.</p>
            <nav>
                <a href="/dashboard">Go to Dashboard</a>
                <a href="/profile">View Profile</a>
            </nav>
        </main>
    )
}

describe('HomePage Integration Tests', () => {
    it('renders main heading and description', () => {
        render(<HomePage />)

        expect(screen.getByRole('heading', { name: /welcome to piz/i })).toBeInTheDocument()
        expect(screen.getByText(/an experimental social media platform/i)).toBeInTheDocument()
    })

    it('renders navigation links', () => {
        render(<HomePage />)

        const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i })
        const profileLink = screen.getByRole('link', { name: /view profile/i })

        expect(dashboardLink).toBeInTheDocument()
        expect(dashboardLink).toHaveAttribute('href', '/dashboard')

        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', '/profile')
    })

    it('has proper semantic structure', () => {
        render(<HomePage />)

        const main = screen.getByRole('main')
        const nav = screen.getByRole('navigation')

        expect(main).toBeInTheDocument()
        expect(nav).toBeInTheDocument()
    })

    it('renders all content in correct order', () => {
        render(<HomePage />)

        const main = screen.getByRole('main')
        const children = Array.from(main.children)

        expect(children[0].tagName).toBe('H1')
        expect(children[1].tagName).toBe('P')
        expect(children[2].tagName).toBe('NAV')
    })
})

// Example of testing with different props/states
describe('HomePage with different states', () => {
    it('renders correctly when user is authenticated', () => {
        // In a real app, you might pass user authentication state
        const AuthenticatedHomePage = () => (
            <main>
                <h1>Welcome back!</h1>
                <p>You're logged in.</p>
            </main>
        )

        render(<AuthenticatedHomePage />)

        expect(screen.getByRole('heading', { name: /welcome back!/i })).toBeInTheDocument()
        expect(screen.getByText(/you're logged in/i)).toBeInTheDocument()
    })

    it('renders correctly when user is not authenticated', () => {
        const UnauthenticatedHomePage = () => (
            <main>
                <h1>Welcome to Piz</h1>
                <p>Please sign in to continue.</p>
                <a href="/sign-in">Sign In</a>
            </main>
        )

        render(<UnauthenticatedHomePage />)

        expect(screen.getByRole('heading', { name: /welcome to piz/i })).toBeInTheDocument()
        expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    })
}) 