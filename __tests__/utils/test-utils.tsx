import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import React, { ReactElement } from 'react'

// Mock the Stack provider since it requires server-side configuration
const MockStackProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-stack-provider">{children}</div>
}

const MockStackTheme = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-stack-theme">{children}</div>
}

// Create a test-specific query client
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    })

interface AllTheProvidersProps {
    children: React.ReactNode
    queryClient?: QueryClient
}

const AllTheProviders = ({ children, queryClient }: AllTheProvidersProps) => {
    const testQueryClient = queryClient || createTestQueryClient()

    return (
        <MockStackProvider>
            <MockStackTheme>
                <QueryClientProvider client={testQueryClient}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </QueryClientProvider>
            </MockStackTheme>
        </MockStackProvider>
    )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    queryClient?: QueryClient
}

const customRender = (
    ui: ReactElement,
    options?: CustomRenderOptions
) => {
    const { queryClient, ...renderOptions } = options || {}

    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders queryClient={queryClient}>
                {children}
            </AllTheProviders>
        ),
        ...renderOptions,
    })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient } 