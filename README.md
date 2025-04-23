<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#technologies"><strong>Technologies</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#important-notes"><strong>Important Notes</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#todos"><strong>Todos</strong></a>
</p>
<br/>

**A Real-time Social Media and Collaborative Coding Platform for Developers**

> You can visit deployed version [here](https://piz-one.vercel.app/)

## Features

### Social Platform for Developers
- **Developer-focused Feed**: Timeline of posts from followed users and joined teams
- **User Profiles**: Customizable profiles with bio, avatar, and activity history
- **Following System**: Follow other developers to see their posts and activities
- **Facebook-style Notifications**: Real-time alerts for follows, new posts, comments, and team activities

### Team Collaboration
- **Public & Private Teams**: Create teams with configurable visibility settings
- **Team Roles**: Admin and member roles with different permissions
- **Team Posts**: Share updates, code, and media within team spaces
- **Join Requests**: Request system for joining teams with admin approval workflow

### Code Sharing & Collaboration
- **Code Snippets**: Share code with syntax highlighting for multiple languages
- **Real-time Collaborative Editor**: Work on code simultaneously with other developers
- **Collaborative Rooms**: Create and join coding sessions with real-time presence
- **Chat in Collaborative Rooms**: Communicate with other developers while coding

### Rich Content Creation
- **Multimedia Posts**: Create posts with text, images, videos, and code snippets
- **Code Editor**: Built-in Monaco editor with syntax highlighting
- **Commenting System**: Nested comments with reactions
- **Reactions**: Express responses to posts and comments

### Discovery & Search
- **Advanced Search**: Find users, teams, posts, and code snippets
- **Public Team Discovery**: Browse and join public teams
- **Follow Suggestions**: Discover new developers to follow
- **Trending Content**: See popular posts and discussions

## Technologies

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Components**:
  - ShadcnUI (Components)
  - Lucide React (Icons)
  - Tailwind CSS (Styling)
  - Framer Motion (Animations)
  - Monaco Editor (Code editor)
- **State Management**:
  - TanStack Query (React Query) for server state
  - React Context for local state

### Backend

- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Stack Auth (@stackframe/stack)
- **File Storage**: Supabase Storage

### DevOps

- **Deployment**: Vercel
- **Analytics**: Vercel Analytics
- **Performance Monitoring**: Vercel Speed Insights

## Project Structure

```
./
├── app/                    # Next.js App Router structure
│   ├── (home-page)/       # Home page routes
│   ├── (user-auth)/       # Authentication routes
│   ├── (user-profile)/    # User profile routes
│   ├── api/               # API routes
│   ├── collab/            # Collaborative coding features
│   ├── team/              # Team-related pages
│   └── ...                # Other app routes
├── components/            # Reusable UI components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── prisma/                # Prisma ORM configuration and schema
├── providers/             # Provider components
├── queries/               # TanStack Query definitions
│   ├── client/            # Client-side queries
│   └── server/            # Server-side queries
├── public/                # Static assets
├── styles/                # Global styles
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Supabase account (for storage)
- Stack Auth account

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://..."  # Your PostgreSQL connection string
DIRECT_URL="postgresql://..."    # Direct connection URL for Prisma

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stack Auth
NEXT_PUBLIC_STACK_API_KEY=your_stack_api_key
STACK_API_SECRET=your_stack_api_secret

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_api_key
```

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Important Notes

### Authentication

- The project uses Stack Auth for authentication and team management
- When using the `StackHandler` component, it must be placed in a file within a folder named `[...stack]` and must receive the `routeProps` prop
- The `hasPermission()` method only exists on the user object returned from `useUser()`, not on team user objects

### Team Management

- Team creators are automatically assigned as 'admin' in the `clientMetadata`
- Public teams can be discovered and joined by any user
- Team join requests notify all team members with accept/reject options

### Database Operations

- Use the provided npm scripts for database operations:
  - `npm run db:studio` - Open Prisma Studio to view/edit data
  - `npm run db:migrate` - Create and apply migrations
  - `npm run db:push` - Push schema changes without migrations

### Next.js Best Practices

- In Next.js, params should be unwrapped with `React.use()` before accessing properties
- Use Next.js `Link` components instead of `router.push` for navigation to enable prefetching

### UI Components

- The project uses Lucide React for icons
- UI decorations and enhancements use `@21st-dev/magic`
- Prefer skeleton loaders positioned exactly where the actual UI elements will appear