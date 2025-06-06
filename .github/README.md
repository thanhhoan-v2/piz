# CI/CD Pipeline Documentation

This repository uses GitHub Actions for continuous integration and deployment, working in conjunction with Vercel for optimal deployment workflow. This guide provides comprehensive instructions for understanding and configuring the CI/CD pipeline.

## Pipeline Overview

Our streamlined CI/CD pipeline combines GitHub Actions for validation with Vercel for deployment:

1. **CI Workflow** (`ci.yml`) - Comprehensive quality checks on every push and pull request
2. **Deploy Workflow** (`deploy.yml`) - Database migrations and deployment coordination with Vercel

## Architecture: Vercel + GitHub Actions

This hybrid approach combines the strengths of both platforms:

**Vercel Responsibilities:**
- Fast, automatic deployments
- Preview environments for pull requests
- Edge distribution and CDN
- Build optimization
- Environment management

**GitHub Actions Responsibilities:**
- Code quality assurance (linting, formatting, type checking)
- Security vulnerability scanning
- Database schema validation and migrations
- Production deployment approvals
- Performance monitoring and auditing
- Automated dependency management

## Workflow Details

### CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Validation Steps:**
- **Install Dependencies** - Installs and caches dependencies using pnpm
- **Lint & Format** - Runs Biome linter and formatter checks
- **Type Check** - Validates TypeScript types and generates Prisma client
- **Build Application** - Builds the Next.js application
- **Security Audit** - Checks for security vulnerabilities in dependencies
- **Database Schema Validation** - Validates Prisma schema structure

### Deploy Workflow (`deploy.yml`)

**Triggers:**
- Successful completion of CI workflow on `main` or `develop` branches

**Process:**
1. **Pre-deployment**
   - Generates Prisma client for type safety
   
2. **Post-deployment**
   - Waits for Vercel deployment completion
   - Generates deployment summary

**Environments:**
- **Staging** - Automatic deployment from `develop` branch
- **Production** - Automatic deployment from `main` branch

## Required Configuration

### GitHub Repository Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):



#### Supabase Configuration
```bash
# Staging Environment
STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STAGING_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Production Environment
PRODUCTION_SUPABASE_URL=https://your-production-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Stack Auth Configuration
```bash
# Staging Environment
STAGING_STACK_PROJECT_ID=your-staging-stack-project-id
STAGING_STACK_PUBLISHABLE_CLIENT_KEY=pck_staging_key...
STAGING_STACK_SECRET_SERVER_KEY=ssk_staging_key...

# Production Environment
PRODUCTION_STACK_PROJECT_ID=your-production-stack-project-id
PRODUCTION_STACK_PUBLISHABLE_CLIENT_KEY=pck_production_key...
PRODUCTION_STACK_SECRET_SERVER_KEY=ssk_production_key...
```

#### Notifications (Optional)
```bash
DISCORD_WEBHOOK=https://discord.com/api/webhooks/your_webhook_url
```

### Vercel Environment Variables

Configure these in your Vercel project dashboard for each environment:

## 🚀 Deployment Process

### With Vercel Integration (Recommended)

#### Staging Deployment
1. Push changes to `develop` branch
2. CI workflow runs automatically (quality checks)
3. Vercel deploys to staging environment automatically
4. GitHub Actions runs database migrations
5. Post-deployment validation ensures everything works

#### Production Deployment
1. Merge `develop` into `main` branch
2. CI workflow runs automatically (quality checks)
3. Vercel deploys to production automatically
4. GitHub Actions requires manual approval for database migrations
5. Post-deployment validation and notifications

#### Staging Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your-staging-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_staging_key...
STACK_SECRET_SERVER_KEY=ssk_staging_key...
```

#### Production Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your-production-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_production_key...
STACK_SECRET_SERVER_KEY=ssk_production_key...
```

### Vercel Project Setup

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Branch Configuration**:
   - Production branch: `main`
   - Preview branch: `develop` (and all other branches)
3. **Build Settings**:
   - Framework: Next.js
   - Build command: `pnpm build`
   - Install command: `pnpm install`
4. **Environment Variables**: Configure as shown above for each environment

## Performance Monitoring

### Lighthouse Performance Audits

Automated performance testing runs on every pull request preview deployment:

- **Audit Scope**: Performance, Accessibility, Best Practices, SEO
- **Execution**: Runs 3 times and averages results for consistency
- **Reporting**: Results available in GitHub Actions logs
- **Configuration**: Thresholds defined in `.lighthouserc.json`

### Performance Standards

The pipeline enforces these minimum standards:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Performance Score | ≥ 80% | Warning if below |
| Accessibility Score | ≥ 90% | Error if below |
| Best Practices Score | ≥ 90% | Warning if below |
| SEO Score | ≥ 90% | Warning if below |
| First Contentful Paint | ≤ 2.0s | Warning if above |
| Largest Contentful Paint | ≤ 2.5s | Warning if above |
| Cumulative Layout Shift | ≤ 0.1 | Warning if above |

### Monitoring Integration

- **Vercel Analytics**: Built-in performance monitoring
- **Core Web Vitals**: Tracked automatically by Vercel
- **Real User Metrics**: Available in Vercel dashboard

## Dependency Management

### Automated Updates with Dependabot

- **Schedule**: Weekly updates every Monday at 09:00 UTC
- **Grouping**: Related packages updated together (React, Radix UI, Prisma, etc.)
- **Review Process**: Minor/patch updates auto-created, major updates flagged for review
- **Security**: Critical security updates processed immediately

### Dependency Categories

| Category | Update Policy | Review Required |
|----------|---------------|-----------------|
| Security fixes | Immediate | Automatic |
| Minor/Patch updates | Weekly | Optional |
| Major framework updates | Weekly | Required |
| Database tools | Weekly | Required |
| Development tools | Weekly | Optional |

### Protected Dependencies

These require manual review for major version updates:
- React and React DOM
- Next.js framework
- Prisma ORM and client
- TypeScript compiler

## Development Workflow

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development & Testing**
   - Make your changes
   - Test locally with `pnpm dev`
   - Run quality checks: `pnpm lint`, `pnpm type-check`

3. **Create Pull Request**
   - Push branch to GitHub
   - Create PR targeting `develop` branch
   - Add descriptive title and description

4. **Automated Validation**
   - CI workflow runs quality checks
   - Vercel creates preview deployment
   - Lighthouse audit tests performance
   - Automatic labeling based on changes

5. **Code Review & Deployment**
   - Request team member reviews
   - Address feedback and update code
   - Once approved, merge to `develop`
   - Automatic staging deployment via Vercel

### Code Quality Standards

The pipeline enforces these quality standards:

| Check | Tool | Scope |
|-------|------|-------|
| Linting | Biome | Code style and best practices |
| Formatting | Biome | Consistent code formatting |
| Type Safety | TypeScript | Static type checking |
| Build Validation | Next.js | Compilation and bundling |
| Security | npm audit | Dependency vulnerabilities |
| Database | Prisma | Schema validation and migrations |

### Automatic Pull Request Features

**Labeling System** - PRs are automatically labeled:

| Label | Criteria |
|-------|----------|
| `frontend` | Changes to components or UI files |
| `backend` | Changes to API routes or server logic |
| `database` | Changes to Prisma schema or migrations |
| `tests` | Changes to test files |
| `documentation` | Changes to markdown or documentation |
| `size/S` | < 50 lines changed |
| `size/M` | 50-200 lines changed |
| `size/L` | 200-500 lines changed |
| `size/XL` | > 500 lines changed |

**Automated Analysis** - Each PR receives:
- Impact assessment summary
- File change breakdown
- Breaking change detection
- Automated status updates

## Troubleshooting

### Common Issues

#### CI Workflow Failures

**Build Errors**
```bash
# Check environment variables
- Verify all required secrets are configured in GitHub
- Ensure Prisma client generation succeeds
- Review TypeScript compilation errors

# Debug steps
1. Check GitHub Actions logs for specific error messages
2. Verify package.json scripts are correct
3. Test build locally: pnpm build
```

**Database Issues**
```bash
# Migration failures
- Verify DATABASE_URL is correct
- Check database connectivity
- Ensure migrations are valid

# Debug steps
1. Test connection: npx prisma db pull
2. Validate schema: npx prisma validate
3. Check migration status: npx prisma migrate status
```

#### Vercel Deployment Issues

**Environment Configuration**
```bash
# Common problems
- Missing environment variables in Vercel dashboard
- Incorrect database URLs
- Build command configuration

# Debug steps
1. Check Vercel build logs
2. Verify environment variables match GitHub secrets
3. Test build locally with production environment
```

**Performance Issues**
```bash
# Lighthouse failures
- Review Core Web Vitals metrics
- Check bundle size and optimization
- Verify accessibility compliance

# Debug steps
1. Run Lighthouse locally
2. Check Vercel Analytics dashboard
3. Review performance budgets
```

### Getting Help

1. **Check Logs**: Review GitHub Actions and Vercel deployment logs
2. **Verify Configuration**: Ensure all secrets and environment variables are set
3. **Test Locally**: Reproduce issues in local development environment
4. **Branch Protection**: Confirm branch protection rules are configured
5. **Create Issue**: Document the problem with relevant logs and context

## Monitoring and Analytics

### Pipeline Metrics

**CI/CD Performance**
- Build success rate and duration
- Deployment frequency and reliability
- Test coverage and quality trends
- Security vulnerability detection

**Application Performance**
- Core Web Vitals from Vercel Analytics
- Lighthouse audit scores over time
- Bundle size and optimization metrics
- Database query performance

### Security and Compliance

**Automated Security**
- Dependency vulnerability scanning via Dependabot
- Secret scanning and leak detection
- Branch protection and required reviews
- Automated security patch deployment

**Compliance Features**
- Audit trail for all deployments
- Approval workflows for production changes
- Environment separation and access controls
- Database migration safety checks

## Quick Start Guide

### Initial Setup

1. **Configure GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add all required secrets (see Required Configuration section)

2. **Configure Vercel**
   - Connect your GitHub repository to Vercel
   - Set up environment variables for staging and production
   - Configure branch settings (main for production, develop for staging)

3. **Create Development Branch**
   ```bash
   git checkout -b develop
   git push origin develop
   ```

4. **Test the Pipeline**
   ```bash
   # Create feature branch and test workflow
   git checkout -b feature/test-pipeline
   # Make a small change
   git commit -am "test: pipeline setup"
   git push origin feature/test-pipeline
   # Create PR and watch automated checks
   ```

### Daily Development

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Develop and test
pnpm dev
pnpm lint
pnpm type-check

# Create PR
git push origin feature/new-feature
# Create PR via GitHub UI

# Deploy to production
# Merge develop -> main via GitHub UI
# Approve production deployment in GitHub Actions
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/git)
- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Biome Linter Configuration](https://biomejs.dev/reference/configuration/)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)

---

For questions or improvements to this CI/CD pipeline, please create an issue or pull request in this repository. 