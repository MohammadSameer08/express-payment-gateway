# API Documentation

Complete API reference for the Payment Gateway LMS Backend.

## Base URL
```
http://localhost:8000/api/v1
```

## Health Check
```
GET /api/health
```

Returns server and database health status.

---

## User Authentication API

### 1. Sign Up (Create Account)
```
POST /api/v1/user/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "User account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Status Codes:**
- `200` - Account created successfully
- `400` - User already exists or invalid input
- `500` - Server error

---

### 2. Sign In (Login)
```
POST /api/v1/user/signin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User authenticated successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid email or password
- `500` - Server error

---

### 3. Get User Profile
```
GET /api/v1/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
Cookie: token=<your_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "default-avatar.png",
    "enrolledCourses": [],
    "createdCourses": [],
    "totalEnrolledCourses": 0,
    "createdAt": "2026-07-02T10:00:00Z",
    "updatedAt": "2026-07-02T10:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Profile retrieved successfully
- `401` - Unauthorized (no token or invalid token)
- `404` - User not found
- `500` - Server error

---

### 4. Sign Out (Logout)
```
POST /api/v1/user/signout
```

**Response:**
```json
{
  "message": "User signed out successfully"
}
```

**Status Codes:**
- `200` - Signed out successfully
- `500` - Server error

---

## Payment API (Razorpay)

### 1. Create Payment Order
```
POST /api/v1/payment/create-order
```

**Authentication:** Required (Cookie or Bearer token)

**Request Body:**
```json
{
  "courseId": "course-mongodb-id"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_ABC123",
    "entity": "order",
    "amount": 99900,
    "amount_paid": 0,
    "amount_due": 99900,
    "currency": "INR",
    "receipt": "purchase-id",
    "status": "created",
    "created_at": 1625000000
  },
  "purchase": {
    "_id": "purchase-id",
    "user": "user-id",
    "course": "course-id",
    "amount": 999,
    "status": "pending",
    "paymentId": "order_ABC123"
  }
}
```

**Status Codes:**
- `201` - Order created successfully
- `400` - Missing course ID
- `401` - Unauthorized
- `404` - Course not found
- `500` - Server error

---

### 2. Verify Payment
```
POST /api/v1/payment/verify-payment
```

**Authentication:** Required

**Request Body:**
```json
{
  "orderId": "order_ABC123",
  "paymentId": "pay_ABC123",
  "signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "purchase": {
    "_id": "purchase-id",
    "status": "completed",
    "paymentId": "pay_ABC123"
  },
  "user": {
    "_id": "user-id",
    "enrolledCourses": [
      {
        "course": "course-id",
        "enrolledAt": "2026-07-02T10:00:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Payment verified successfully
- `400` - Invalid signature or missing fields
- `401` - Unauthorized
- `404` - Purchase not found
- `500` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | No token provided or token expired |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:8000/api/v1/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/v1/user/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8000/api/v1/user/profile \
  -b cookies.txt
```

### Create Order
```bash
curl -X POST http://localhost:8000/api/v1/payment/create-order \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "courseId": "course-id-here"
  }'
```

---

## Testing with Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Paste the API documentation

2. **Set Environment Variables**
   - `base_url`: http://localhost:8000/api/v1
   - `token`: (Automatically saved after signup)

3. **Cookie Management**
   - Postman auto-manages cookies
   - After signin, cookies are automatically included in subsequent requests

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## CORS Configuration

**Allowed Origins:** `http://localhost:3000` (configurable in `.env`)

**Allowed Methods:** GET, POST, PUT, DELETE, PATCH

**Allowed Headers:** Content-Type, Authorization, X-Requested-With, Accept
