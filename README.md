# Todo Application Backend

A robust and scalable backend for a Todo application built with NestJS, featuring user authentication, collections, and nested todos.

## Features

- 🔐 **Authentication**
  - User registration and login
  - JWT-based authentication
  - Password hashing with bcrypt
  - Protected routes

- 📁 **Collections**
  - Create, read, update, and delete collections
  - Group todos by collections
  - Mark collections as favorites
  - Track task completion status

- ✅ **Todos**
  - CRUD operations for todos
  - Nested todos (subtasks) support
  - Due date management
  - Task completion tracking
  - Organize todos within collections

- 🛠 **Technical Features**
  - TypeScript support
  - PostgreSQL database with TypeORM
  - Swagger API documentation
  - Rate limiting
  - CORS enabled
  - Security headers with Helmet
  - Comprehensive test coverage

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd to-do-back-end
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=todo_db

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=60m

# Server Configuration
PORT=8000
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at: http://localhost:800/docs

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

### Collections
- `GET /collections` - Get all collections for user
- `POST /collections` - Create a new collection
- `PATCH /collections/:id` - Update a collection
- `DELETE /collections/:id` - Delete a collection

### Todos
- `GET /todos/collection/:id` - Get all todos in a collection
- `POST /todos` - Create a new todo
- `PATCH /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```