# FreelanceConnect - Full-Stack Freelancing Platform

## Overview

FreelanceConnect is a comprehensive freelancing platform that connects clients with freelancers. The application features project posting, freelancer discovery, bidding, messaging, and project management capabilities. Built with a modern stack including React, Express.js, JavaScript, and in-memory storage (converted from TypeScript to JavaScript per user request).

## User Preferences

Preferred communication style: Simple, everyday language.
Programming language preference: JavaScript (not TypeScript) for everything.

## System Architecture

This is a full-stack web application following a monorepo structure with clear separation between client and server code. The architecture implements a traditional client-server model with a React frontend and Express.js backend, connected through RESTful APIs.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and local React state
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Radix UI primitives with custom Tailwind configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API with structured error handling
- **Development**: Hot reload with Vite integration in development mode

## Key Components

### Database Schema (Drizzle ORM)
- **users**: Core user information with support for client/freelancer roles
- **freelancerProfiles**: Extended profiles for freelancers with skills, portfolio, ratings
- **projects**: Project listings with requirements and status tracking
- **applications**: Freelancer proposals for projects
- **messages**: Real-time messaging system between users
- **reviews**: Rating and feedback system

### Authentication System
- JWT token-based authentication stored in localStorage
- Middleware for protected routes
- Role-based access control (client vs freelancer)
- Secure password hashing with bcrypt

### API Structure
- `/api/auth/*` - Authentication endpoints (login, register)
- `/api/projects/*` - Project CRUD operations and search
- `/api/freelancers/*` - Freelancer profile management
- `/api/applications/*` - Project application handling
- `/api/messages/*` - Messaging functionality

### Frontend Pages
- **Home**: Landing page with search and featured content
- **Projects**: Project listing and search functionality
- **Freelancers**: Freelancer discovery and filtering
- **Dashboard**: User-specific dashboard for managing projects/applications
- **Messages**: Real-time messaging interface
- **Profile Pages**: Detailed freelancer and project views

## Data Flow

1. **User Registration/Login**: Client authenticates via JWT, token stored locally
2. **Project Creation**: Clients create projects with requirements and budget
3. **Freelancer Discovery**: Search and filter freelancers by skills and experience
4. **Application Process**: Freelancers submit proposals with rates and timelines
5. **Messaging**: Real-time communication between clients and freelancers
6. **Project Management**: Status updates and milestone tracking

## External Dependencies

### UI/Component Libraries
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, etc.
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with Tailwind styling

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for type safety

### Database & Authentication
- **@neondatabase/serverless**: PostgreSQL serverless client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single deployment artifact with both client and server code

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- JWT secret configuration for token signing
- Development vs production mode handling

### Development Setup
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production build
- `npm run db:push`: Pushes schema changes to database
- Integrated Vite development server for client-side hot reload

The application is designed for easy deployment to platforms like Replit, with built-in development tooling and a streamlined build process that handles both frontend and backend components in a single deployment.