# Setup & Installation Guide

Complete step-by-step guide to set up the Payment Gateway LMS Backend.

## Prerequisites

- **Node.js** - v18 or higher ([Download](https://nodejs.org/))
- **npm** - v9 or higher (comes with Node.js)
- **MongoDB** - Cloud or Local instance
- **Git** - For version control ([Download](https://git-scm.com/))
- **Code Editor** - VS Code recommended ([Download](https://code.visualstudio.com/))

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/payment-gateway-lms.git
cd Payment-Gatway/SERVER
```

### Step 2: Install Dependencies

```bash
npm install
```

**This installs:**
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- razorpay - Payment gateway
- dotenv - Environment variables
- cors - Cross-origin support
- helmet - Security headers
- express-rate-limit - Rate limiting
- And more...

### Step 3: Configure Environment Variables

Create `.env` file in the root directory:

```bash
touch .env
```

**Add the following:**

```env
# Server Configuration
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name

# Authentication
SECRET_KEY=your_super_secret_key_min_32_characters

# Cloudinary (Optional - for image uploads)
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### Step 4: Get MongoDB Connection String

**Option A: MongoDB Atlas (Cloud) - Recommended**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy connection string
7. Replace `<password>` with your password
8. Use as `MONGO_URI` in `.env`

**Option B: Local MongoDB**

```env
MONGO_URI=mongodb://localhost:27017/lms_database
```

### Step 5: Verify Installation

```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
Connected to the database
Server is running on port 8000
```

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | 8000 |
| `NODE_ENV` | Environment mode | development, production |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 |
| `MONGO_URI` | Database connection | mongodb+srv://user:pass@host/db |
| `SECRET_KEY` | JWT signing key | anyRandomString32Chars |
| `CLOUD_NAME` | Cloudinary account | my-cloud-123 |
| `API_KEY` | Cloudinary API key | 123456789012345 |
| `API_SECRET` | Cloudinary API secret | abc123def456xyz |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | rzp_test_xxxxx |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | xxxxxxxxxxxxxxx |

---

## Generating SECRET_KEY

### Using OpenSSL

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

### Or use Online Generator

Visit [UUID Generator](https://www.uuidgenerator.net/) and use the output.

---

## Project Structure

```
Payment-Gatway/SERVER/
├── controllers/
│   ├── user.controller.js
│   ├── health.controller.js
│   └── razorpay.controller.js
├── models/
│   ├── user.model.js
│   ├── course.model.js
│   ├── coursePurchase.model.js
│   └── lecture.model.js
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
├── routes/
│   ├── user.routes.js
│   ├── health.routes.js
│   └── razorpay.routes.js
├── utils/
│   ├── generateTokens.js
│   ├── cloudinary.js
│   └── multer.js
├── database/
│   └── db.js
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── AUTHENTICATION.md
│   ├── PAYMENT_GATEWAY.md
│   └── SETUP_GUIDE.md
├── index.js
├── package.json
├── .env
└── .prettierrc
```

---

## NPM Scripts

### Development

```bash
npm run dev
```
Starts server with hot-reload (nodemon).

### Production Build

```bash
npm start
```
Runs the server in production mode.

### Install Specific Package

```bash
npm install <package-name>
```

### Uninstall Package

```bash
npm uninstall <package-name>
```

---

## Troubleshooting Installation

### Issue: MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Check MongoDB is running
2. Verify connection string in `.env`
3. Check IP whitelist in MongoDB Atlas
4. Ensure database name is correct

---

### Issue: PORT Already in Use

```
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution:**
```bash
# Find process using port 8000
# On Mac/Linux
lsof -i :8000

# On Windows
netstat -ano | findstr :8000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

---

### Issue: Module Not Found

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

**Solution:**
1. Ensure all imports include `.js` extension
2. Run `npm install` to install missing packages
3. Check file paths are correct
4. Clear node_modules: `rm -rf node_modules && npm install`

---

### Issue: SECRET_KEY Not Set

```
TypeError: Cannot read property 'replace' of undefined
```

**Solution:**
1. Check `SECRET_KEY` is in `.env`
2. Restart server: `npm run dev`
3. Ensure no extra spaces or quotes

---

### Issue: Razorpay Not Working

**Solution:**
1. Verify API keys in `.env`
2. Check test vs live mode
3. Ensure razorpay package is installed: `npm list razorpay`
4. Check network connectivity

---

## Docker Setup (Optional)

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - NODE_ENV=production
      - MONGO_URI=mongodb+srv://...
      - SECRET_KEY=...
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Run with Docker

```bash
docker-compose up
```

---

## Database Setup

### Create Initial Collections

MongoDB creates collections automatically, but you can pre-create them:

```javascript
// In MongoDB shell or Compass
db.users.createIndex({ email: 1 }, { unique: true })
db.courses.createIndex({ title: 1 })
db.coursepurchases.createIndex({ user: 1 })
```

### Add Sample Data

```javascript
// Sample course
db.courses.insertOne({
  title: "JavaScript Fundamentals",
  description: "Learn JavaScript basics",
  price: 999,
  instructor: "ObjectId(...)",
  duration: "10 hours",
  createdAt: new Date()
})

// Sample user
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedPassword",
  role: "student",
  createdAt: new Date()
})
```

---

## First Run Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB connection verified
- [ ] `.env` file created with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check works (`curl http://localhost:8000/api/health`)
- [ ] Can create user account (sign up)
- [ ] Can authenticate (sign in)
- [ ] Can access profile (with authentication)

---

## Next Steps

1. **API Testing** - See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Authentication** - See [AUTHENTICATION.md](./AUTHENTICATION.md)
3. **Payment Gateway** - See [PAYMENT_GATEWAY.md](./PAYMENT_GATEWAY.md)
4. **Frontend Integration** - Create frontend at `../CLIENT`

---

## Getting Help

- Check logs: `npm run dev`
- Read error messages carefully
- Search [Stack Overflow](https://stackoverflow.com)
- Check package documentation
- Open GitHub issue for bugs

---

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Guide](https://docs.mongodb.com/cloud/)
- [JWT Introduction](https://jwt.io/)
- [Razorpay Documentation](https://razorpay.com/docs/)
