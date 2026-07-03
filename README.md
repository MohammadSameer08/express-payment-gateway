# Payment Gateway LMS Backend

A robust Express.js backend server for a Learning Management System (LMS) with integrated payment gateway functionality. This project provides secure API endpoints with comprehensive security measures, automatic database connection management, and production-ready error handling.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - Authorization and credential management
- 💳 **Payment Processing** - Integrated payment gateway support
- 📚 **LMS Functionality** - Learning management system capabilities
- 🛡️ **Enterprise Security** - Multiple layers of protection

### Technical Features
- ✅ **Automatic Database Retry** - Handles connection failures gracefully
- ✅ **Rate Limiting** - Prevents API abuse (100 requests per 15 minutes)
- ✅ **CORS Support** - Cross-origin resource sharing configured
- ✅ **Request Logging** - HTTP request tracking in development
- ✅ **Error Handling** - Global error handler with detailed responses
- ✅ **Data Sanitization** - Protection against NoSQL injection
- ✅ **Security Headers** - Helmet.js security headers
- ✅ **Cookie Parsing** - Cookie-based session management

## 🛠️ Tech Stack

### Backend Framework
- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM for schema validation

### Security Packages
- **Helmet** - HTTP headers security
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention
- **hpp** - HTTP Parameter Pollution prevention
- **CORS** - Cross-origin request handling

### Development Tools
- **Nodemon** - Auto-restart on file changes
- **Morgan** - HTTP request logging
- **Dotenv** - Environment variable management
- **Cookie-parser** - Cookie parsing middleware

## 📁 Project Structure

```
Payment-Gatway/SERVER/
├── database/
│   ├── db.js                 # MongoDB connection manager
│   └── DATABASE.md           # Database documentation
├── index.js                  # Main application entry point
├── package.json              # Project dependencies
├── package-lock.json         # Locked dependency versions
├── .env                      # Environment variables (not in git)
├── .env.example              # Example environment template
├── .gitignore                # Git ignore rules
├── README.md                 # This file
└── node_modules/             # Installed packages
```

### Directory Descriptions

| Directory | Purpose |
|-----------|---------|
| `database/` | MongoDB connection configuration and management |
| `node_modules/` | Installed npm packages (auto-generated) |

## 🚀 Installation

### Prerequisites

- **Node.js** - Version 18+ recommended
- **npm** - Version 9+ (comes with Node.js)
- **MongoDB** - Local instance or MongoDB Atlas account
- **Git** - For version control

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Payment-Gatway/SERVER
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:
```
✓ express, mongoose, dotenv
✓ Security: helmet, cors, express-mongo-sanitize, hpp
✓ Utilities: morgan, cookie-parser
✓ Development: nodemon
```

### Step 3: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values (see Configuration below).

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/payment_gateway

# Server Configuration
PORT=3000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### Detailed Configuration

#### MONGO_URI

Format: `mongodb+srv://username:password@host/database`

**Examples:**

Local MongoDB:
```env
MONGO_URI=mongodb://localhost:27017/payment_gateway
```

MongoDB Atlas (Cloud):
```env
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/payment_gateway
```

#### PORT

Default: `3000`

```env
PORT=3000
```

#### NODE_ENV

- `development` - Development mode with debug logging
- `production` - Production mode, optimized

```env
NODE_ENV=development
```

#### CLIENT_URL

CORS allowed origin:

```env
CLIENT_URL=http://localhost:3000
```

For production:
```env
CLIENT_URL=https://yourdomain.com
```

### .env.example Template

Reference template showing all required variables:

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/payment_gateway

# Server Port
PORT=3000

# Environment
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**⚠️ Important:** Never commit `.env` file to git. Use `.env.example` as template only.

## 🏃 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

- Uses Nodemon to auto-restart on file changes
- Enables debug logging
- Shows detailed error messages

**Output:**
```
✅ MongoDB connected successfully
Server is running on port 3000
```

### Production Mode

```bash
npm start
```

- Standard Node.js execution
- No auto-restart on file changes
- Optimized for performance

### Health Check

Once running, test the server:

```bash
# Linux/Mac
curl http://localhost:3000/

# Windows PowerShell
Invoke-WebRequest http://localhost:3000/
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Response Format

All responses follow standard JSON format:

**Success:**
```json
{
    "status": "success",
    "data": { /* response data */ }
}
```

**Error:**
```json
{
    "status": "error",
    "message": "Error description",
    "stack": "Stack trace (development only)"
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Route doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### 404 Error Handler

When an unknown route is requested:

```json
{
    "error": "Route not found"
}
```

## 📖 Documentation

Complete documentation is available in the `docs/` folder:

### 📋 [API Documentation](./docs/API_DOCUMENTATION.md)
- Complete API reference
- All endpoints with examples
- Request/response formats
- cURL and Postman examples
- Error codes and troubleshooting

### 🔐 [Authentication Guide](./docs/AUTHENTICATION.md)
- JWT authentication flow
- Password hashing and verification
- Protected routes
- Token management
- Security best practices
- Common auth issues and solutions

### 💳 [Payment Gateway Setup](./docs/PAYMENT_GATEWAY.md)
- Razorpay integration guide
- Payment flow explanation
- Creating orders and verifying payments
- Frontend integration examples (Vanilla JS and React)
- Testing with test credentials
- Production deployment checklist

### 🚀 [Setup & Installation Guide](./docs/SETUP_GUIDE.md)
- Step-by-step installation instructions
- Environment configuration
- Troubleshooting common issues
- Docker setup (optional)
- Database initialization
- First run checklist

### 🗄️ [Database Schema Documentation](./docs/DATABASE_SCHEMA.md)
- Complete MongoDB schema design
- Collection definitions
- Field types and validation
- Database relationships
- Query examples
- Performance tips
- Backup and recovery procedures

### Quick Links

| Document | Purpose |
|----------|---------|
| [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | API endpoints and usage |
| [AUTHENTICATION.md](./docs/AUTHENTICATION.md) | Auth setup and security |
| [PAYMENT_GATEWAY.md](./docs/PAYMENT_GATEWAY.md) | Razorpay integration |
| [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) | Installation and setup |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Database structure |

## 🔒 Security Features

### 1. **Helmet.js - HTTP Headers**

Sets secure HTTP headers to prevent common attacks:
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME type sniffing
- Content Security Policy

```javascript
app.use(helmet());
```

### 2. **CORS - Cross-Origin Requests**

Configured to allow requests from specified client URL:

```javascript
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
```

**Features:**
- ✓ Specific origin whitelist
- ✓ Allowed HTTP methods
- ✓ Credentials support (cookies, auth headers)
- ✓ Custom header support

### 3. **Rate Limiting**

Prevents API abuse:

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per window
});
app.use(limiter);
```

**Effect:** Each IP address limited to 100 requests per 15 minutes.

### 4. **NoSQL Injection Prevention**

mongo-sanitize prevents MongoDB injection attacks:

```javascript
app.use(mongoSanitize());
```

**Example Attack Prevented:**
```javascript
// Malicious input
{ username: { $ne: null }, password: { $ne: null } }

// After sanitization
// $ characters removed, safe query
```

### 5. **HTTP Parameter Pollution (HPP) Prevention**

hpp prevents parameter pollution attacks:

```javascript
app.use(hpp());
```

### 6. **Body Parser Security**

Limits request body size to prevent memory attacks:

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 7. **Strict Query Mode**

Only allows querying schema-defined fields:

```javascript
mongoose.set('strictQuery', true);
```

## 📦 Database Documentation

For comprehensive database connection documentation, see:

### **[Database Documentation →](./database/DATABASE.md)**

This document covers:
- Database architecture and design
- Connection management
- Automatic retry logic
- Connection pooling
- Graceful shutdown
- Configuration options
- Environment variables
- Troubleshooting guide

**Key Highlights from Database Module:**

✅ **Automatic Retry Logic** - 3 retry attempts with 5-second intervals
✅ **Connection Monitoring** - Real-time connection status tracking
✅ **Graceful Shutdown** - Clean database closure on app termination
✅ **Connection Pooling** - 10 concurrent connections
✅ **Singleton Pattern** - Single database instance for entire app

## 🔧 Middleware

The application uses multiple middleware layers (in order):

| Middleware | Purpose | Order |
|-----------|---------|-------|
| Body Parser | Parse JSON/URL-encoded requests | 1 |
| Cookie Parser | Parse cookies | 2 |
| CORS | Handle cross-origin requests | 3 |
| Sanitizer | Prevent NoSQL injection | 4 |
| HPP | Prevent parameter pollution | 5 |
| Helmet | Set security headers | 6 |
| Rate Limiter | Prevent abuse | 7 |
| Morgan Logger | Log HTTP requests | 8 |

### Middleware Order Explanation

```javascript
// 1. Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Handle cookies
app.use(cookieParser());

// 3. CORS before security checks
app.use(cors({ /* options */ }));

// 4. Sanitization
app.use(mongoSanitize());
app.use(hpp());

// 5. Security headers
app.use(helmet());

// 6. Rate limiting
app.use(limiter);

// 7. Logging (development only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
```

**Important:** Order matters! Security middleware should run before routes.

## ❌ Error Handling

### Global Error Handler

Catches all errors and returns formatted response:

```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
```

**Features:**
- ✓ Catches all uncaught errors
- ✓ Logs error stack trace
- ✓ Returns consistent JSON format
- ✓ Hides stack trace in production (security)
- ✓ Shows stack trace in development (debugging)

### 404 Handler

Catches requests to non-existent routes:

```javascript
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});
```

## 🔨 Development

### Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Edit files** - Changes auto-reload thanks to Nodemon

3. **Check logs** - Morgan logs all HTTP requests in terminal

4. **Test API** - Use Postman, Insomnia, or curl

### Useful NPM Scripts

```bash
npm start    # Run production server
npm run dev  # Run development server with auto-reload
npm test     # Run tests (not yet configured)
```

### Debug Mode

Enable debug logging in development:

```bash
# Set in .env
NODE_ENV=development
```

This enables:
- ✓ Mongoose query logging
- ✓ HTTP request details (Morgan)
- ✓ Error stack traces
- ✓ Database retry details

### Testing Endpoints

Using curl:

```bash
# Test GET request
curl http://localhost:3000/api/users

# Test POST request with JSON
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# Test with authentication header
curl -H "Authorization: Bearer token123" \
  http://localhost:3000/api/protected
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**
```
Failed to connect to MongoDB: ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- ✓ Check MongoDB is running: `mongosh` or MongoDB Compass
- ✓ Verify MONGO_URI in `.env` is correct
- ✓ Ensure MongoDB credentials are valid
- ✓ Check network connectivity

#### 2. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE :::3000
```

**Solutions:**
```bash
# Change PORT in .env
PORT=3001

# OR kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

#### 3. MONGO_URI Not Defined

**Error:**
```
MongoDB URI is not defined in environment variables
```

**Solutions:**
- ✓ Create `.env` file
- ✓ Add `MONGO_URI=...` to `.env`
- ✓ Restart server

#### 4. Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solutions:**
```bash
# Reinstall dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. CORS Errors

**Error:**
```
Cross-Origin Request Blocked
```

**Solutions:**
- ✓ Check `CLIENT_URL` in `.env`
- ✓ Ensure frontend URL matches `CLIENT_URL`
- ✓ Verify CORS middleware is enabled

## 📋 Project Roadmap

### Completed ✅
- Express server setup
- MongoDB connection management
- Security middleware integration
- Error handling framework
- Rate limiting
- CORS configuration


## 📄 License

Author: Md Sameer

## 📝 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [Helmet.js Security](https://helmetjs.github.io/)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** 2026-07-01

**Version:** 1.0.0

**Status:** Active Development 🚀
