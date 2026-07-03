# Authentication Guide

Comprehensive guide for authentication in the Payment Gateway LMS Backend.

## Overview

The system uses JWT (JSON Web Tokens) for stateless authentication with HTTP-only cookies for secure token storage.

## Key Features

- ✅ **JWT-Based** - Stateless authentication
- ✅ **HTTP-Only Cookies** - Secure token storage (XSS protection)
- ✅ **Password Hashing** - Bcrypt encryption with salt rounds = 12
- ✅ **Token Expiry** - 24 hours per token
- ✅ **Automatic Validation** - Middleware-based protection

---

## Authentication Flow

```
1. User Sign Up
   ↓
2. Password Hashed (bcrypt)
   ↓
3. User Created in DB
   ↓
4. JWT Token Generated
   ↓
5. Token Sent as HTTP-Only Cookie
   ↓
6. Client Stores Cookie Automatically
   ↓
7. Subsequent Requests Send Cookie
   ↓
8. Server Validates Token
```

---

## Implementation Details

### 1. Token Generation

**File:** `utils/generateTokens.js`

```javascript
import jwt from "jsonwebtoken";

export const generateAccessToken = (res, user, message) => {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .cookie("token", token, { httpOnly: true })
    .json({ message });
};
```

**What Happens:**
1. JWT is signed with user ID and SECRET_KEY
2. Token expires in 24 hours
3. Cookie is HTTP-Only (JavaScript cannot access)
4. Cookie is automatically sent with requests

---

### 2. Password Hashing

**File:** `models/user.model.js`

```javascript
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});
```

**Features:**
- Passwords are salted and hashed before saving
- Salt rounds: 12 (strong security)
- Only hashed if modified
- Never stored as plain text

---

### 3. Password Verification

```javascript
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

**Process:**
1. Client sends password
2. System compares with stored hash
3. Returns true/false without exposing hash

---

### 4. Authentication Middleware

**File:** `middleware/auth.middleware.js`

```javascript
export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
```

**How It Works:**
1. Extracts token from cookies
2. Verifies signature with SECRET_KEY
3. Decodes to get user ID
4. Adds `req.id` for controller use
5. Allows request to proceed

---

## Security Best Practices

### 1. Password Requirements

**Current:** Minimum 8 characters (enforced in schema)

**Recommended:** 
```javascript
{
  minLength: 8,
  validate: {
    validator: function(v) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
    },
    message: "Password must contain uppercase, lowercase, number, and special character"
  }
}
```

### 2. Token Security

- ✅ Tokens stored in HTTP-Only cookies (not localStorage)
- ✅ SameSite attribute prevents CSRF
- ✅ Secure flag set in production (HTTPS only)
- ✅ Tokens expire after 24 hours

### 3. Password Handling

- ✅ Never expose password in responses (select: false)
- ✅ Always hash before saving
- ✅ Compare with hash, never plain text
- ✅ Reject common/weak passwords

---

## How to Use Authentication

### 1. Sign Up (Create Account)

**Request:**
```bash
POST /api/v1/user/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "User account created successfully"
}
```

**Cookie Set:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Strict
```

---

### 2. Sign In (Login)

**Request:**
```bash
POST /api/v1/user/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User authenticated successfully"
}
```

---

### 3. Access Protected Routes

**Using Cookie (Automatic in Postman/Browser):**
```bash
GET /api/v1/user/profile
```

Cookie is automatically sent by browser/client.

**Using Bearer Token (Manual):**
```bash
GET /api/v1/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### 4. Sign Out (Logout)

**Request:**
```bash
POST /api/v1/user/signout
```

**Response:**
```json
{
  "message": "User signed out successfully"
}
```

**Cookie Cleared:**
The token cookie is cleared and becomes invalid.

---

## Environment Variables

Add to `.env`:

```env
# JWT Configuration
SECRET_KEY=your_super_secret_key_min_32_chars

# Token Expiry (optional, default: 1d)
TOKEN_EXPIRY=1d

# Cookie Settings
COOKIE_SECURE=true        # Set true in production
COOKIE_SAMESITE=Strict    # CSRF protection
```

---

## Common Issues

### Issue: "Unauthorized - No token"
**Cause:** Token not sent in request
**Solution:** 
- Ensure cookies are enabled
- Postman: Check if cookies are being stored
- Browser: Check DevTools → Application → Cookies

### Issue: "Unauthorized - Invalid token"
**Cause:** Token expired or tampered with
**Solution:**
- Sign out and sign in again
- Clear cookies and retry
- Check SECRET_KEY matches

### Issue: "Invalid email or password"
**Cause:** Wrong credentials
**Solution:**
- Verify email is correct
- Check password (case-sensitive)
- Ensure user exists

### Issue: "Password must be at least 8 characters"
**Cause:** Weak password
**Solution:**
- Use password with 8+ characters
- Try: `MySecurePass123`

---

## Token Payload

**What's Inside the JWT:**

```json
{
  "id": "user_mongodb_id",
  "iat": 1625000000,
  "exp": 1625086400
}
```

**Fields:**
- `id` - User's MongoDB ID
- `iat` - Issued At (timestamp)
- `exp` - Expiration (timestamp, 24 hours from issue)

---

## Refresh Token Strategy (Optional Enhancement)

For better security, implement refresh tokens:

```javascript
// Generate both access and refresh tokens
const accessToken = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "15m" });
const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });

// Store refresh token in DB with user
user.refreshToken = refreshToken;
await user.save();

// Client uses access token for API calls
// When access token expires, use refresh token to get new one
```

---

## Production Checklist

- [ ] Change `SECRET_KEY` to a strong, unique value (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Set `COOKIE_SECURE=true` (HTTPS only)
- [ ] Implement refresh token rotation
- [ ] Add password complexity requirements
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up logging for auth failures
- [ ] Configure HTTPS/SSL certificates
- [ ] Regular security audits
