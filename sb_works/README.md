# SB Works - Freelancing Platform

A comprehensive freelancing marketplace platform built with JavaScript for the entire stack.

## Features

- User authentication (register/login)
- Project posting and browsing
- Freelancer profiles and discovery
- Application/bidding system
- Real-time messaging between clients and freelancers
- User dashboard for both clients and freelancers
- Responsive design with modern UI components

## Tech Stack

- **Frontend**: React 18, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, JWT authentication, bcrypt password hashing
- **Storage**: In-memory storage (MemStorage class)
- **Build Tool**: Vite

## Project Structure

```
sb_works/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and client setup
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   └── index.html          # HTML template
├── server/                 # Backend Express server
│   ├── index.js            # Server entry point
│   ├── routes.js           # API routes
│   ├── storage.js          # In-memory storage implementation
│   └── vite.ts             # Vite integration
├── shared/
│   └── schema.js           # Data schemas and validation
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5000`

## Key Files

- `shared/schema.js` - Database schema definitions and validation
- `server/storage.js` - In-memory storage implementation
- `server/routes.js` - API endpoints for authentication, projects, applications, messages
- `client/src/App.jsx` - Main React application with routing
- `client/src/lib/auth.js` - Authentication utilities
- `client/src/lib/queryClient.js` - TanStack Query setup

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/projects` - List/search projects
- `POST /api/projects` - Create new project
- `GET /api/freelancers` - List freelancers
- `POST /api/projects/:id/applications` - Apply to project
- `GET /api/projects/:id/messages` - Get project messages
- `POST /api/projects/:id/messages` - Send message

## Notes

- This version uses JavaScript instead of TypeScript as requested
- Storage is in-memory (data resets on server restart)
- Authentication uses JWT tokens stored in localStorage
- All passwords are hashed with bcrypt
- The platform supports both client and freelancer user types