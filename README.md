# Smart Mess - Multitenant Restaurant QR Management System

A modern restaurant management platform with QR code ordering, multitenant architecture, and ML-powered recommendation engine built with Turborepo.

## Features

- 🏪 **Multitenant Architecture** - Support multiple restaurants in a single platform
- 📱 **QR Code Ordering** - Customers can scan QR codes to view menus and place orders
- 🤖 **ML Recommendation Engine** - Intelligent food recommendations based on customer preferences
- ⚡ **Modern Tech Stack** - FastAPI backend with Next.js frontends
- 🔧 **Monorepo Management** - Turborepo for efficient development and builds

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [uv](https://github.com/astral-sh/uv) - Ultra-fast Python package installer

## Quick Start

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd smart-mess
   ```

2. **Install all dependencies:**
   ```sh
   pnpm install
   ```
   This will install all Node.js dependencies and Python packages via uv.

3. **Start development servers:**
   ```sh
   pnpm dev
   ```
   This command starts all three applications simultaneously:
   - FastAPI backend server
   - Restaurant admin frontend (Next.js)
   - Customer ordering frontend (Next.js)

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `backend`: [FastAPI](https://fastapi.tiangolo.com/) server with ML recommendation engine
- `admin`: [Next.js](https://nextjs.org/) restaurant management dashboard
- `customer`: [Next.js](https://nextjs.org/) customer ordering interface
- `@repo/eslint-config`: ESLint configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: shared TypeScript configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) (frontend) and Python (backend).

### Tech Stack

- **Backend**: FastAPI, Python, ML libraries for recommendations
- **Frontend**: Next.js, React, TypeScript
- **Database**: [Your database choice]
- **Package Management**: pnpm (Node.js), uv (Python)
- **Monorepo**: Turborepo

### Development Tools

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turborepo.com/) for build system and task running

## Available Scripts

### Build

To build all apps and packages:

```sh
pnpm build
```

### Development

To start all development servers:

```sh
pnpm dev
```

### Linting

To lint all packages:

```sh
pnpm lint
```

### Type Checking

To run TypeScript type checking:

```sh
pnpm type-check
```

## Project Structure

```
smart-mess/
├── apps/
│   ├── backend/          # FastAPI server
│   ├── admin/            # Restaurant admin dashboard
│   └── customer/         # Customer ordering app
├── packages/
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── turbo.json           # Turborepo configuration
└── package.json         # Root package.json
```

## Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

To enable Remote Caching:

```sh
npx turbo login
npx turbo link
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Useful Links

Learn more about the technologies used:

- [Turborepo Documentation](https://turborepo.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Documentation](https://pnpm.io/)
- [uv Documentation](https://github.com/astral-sh/uv)

## License

[Your License Choice]
