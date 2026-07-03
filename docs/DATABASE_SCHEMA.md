# Database Schema Documentation

Complete database schema design and field definitions.

## Database: MongoDB Atlas

### Collections Overview

```
Users (user collection)
├── Courses (Referenced)
└── Course Purchases (Referenced)

Courses
├── Instructor (Referenced from Users)
├── Lectures (Nested/Referenced)
└── Reviews (Optional nested)

Course Purchases
├── User (Referenced)
└── Course (Referenced)

Lectures (Optional separate collection)
└── Course (Referenced)
```

---

## 1. Users Collection

**Collection Name:** `users`

### Schema Definition

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, select: false),
  role: String (enum: ["student", "instructor", "admin"], default: "student"),
  
  // Profile
  avatar: String (default: "default-avatar.png"),
  bio: String (max 200 chars),
  
  // Courses
  enrolledCourses: [
    {
      course: ObjectId (ref: "Course"),
      enrolledAt: Date (default: now)
    }
  ],
  createdCourses: [ObjectId] (ref: "Course"),
  
  // Password Reset
  resetPasswordToken: String (optional),
  resetPasswordExpire: Date (optional),
  
  // Activity Tracking
  lastActive: Date (default: now),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: 1 })
```

### Example Document

```json
{
  "_id": "6499f4b8e5c8f1234567890a",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$12$hashedPasswordHere...",
  "role": "student",
  "avatar": "https://cloudinary.com/image.jpg",
  "bio": "Learning full-stack development",
  "enrolledCourses": [
    {
      "course": "6499f4b8e5c8f1234567890b",
      "enrolledAt": "2023-06-30T10:00:00Z"
    }
  ],
  "createdCourses": [],
  "resetPasswordToken": null,
  "resetPasswordExpire": null,
  "lastActive": "2023-06-30T10:30:00Z",
  "createdAt": "2023-06-30T10:00:00Z",
  "updatedAt": "2023-06-30T10:30:00Z"
}
```

### Field Descriptions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | String | Yes | 8-50 characters |
| email | String | Yes | Unique, lowercase |
| password | String | Yes | Hidden by default (select: false) |
| role | String | No | student, instructor, admin |
| avatar | String | No | URL to profile image |
| bio | String | No | Max 200 characters |
| enrolledCourses | Array | No | Courses user is enrolled in |
| createdCourses | Array | No | Courses created by instructor |
| lastActive | Date | No | For activity tracking |

---

## 2. Courses Collection

**Collection Name:** `courses`

### Schema Definition

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  title: String (required, max 100),
  description: String (required),
  thumbnail: String (optional),
  
  // Pricing & Content
  price: Number (required, default: 0),
  duration: String (e.g., "10 hours"),
  level: String (enum: ["beginner", "intermediate", "advanced"]),
  
  // Instructor
  instructor: ObjectId (ref: "User", required),
  
  // Lectures & Content
  lectures: [ObjectId] (ref: "Lecture"),
  totalLectures: Number,
  
  // Enrollment
  enrolledStudents: [ObjectId] (ref: "User"),
  totalStudents: Number (default: 0),
  
  // Status
  isPublished: Boolean (default: false),
  isPaid: Boolean (default: false),
  
  // Ratings (Optional)
  rating: Number,
  reviews: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.courses.createIndex({ instructor: 1 })
db.courses.createIndex({ isPublished: 1 })
db.courses.createIndex({ price: 1 })
db.courses.createIndex({ title: "text" }) // For search
```

### Example Document

```json
{
  "_id": "6499f4b8e5c8f1234567890b",
  "title": "JavaScript Mastery",
  "description": "Complete guide to JavaScript",
  "thumbnail": "https://cloudinary.com/course.jpg",
  "price": 999,
  "duration": "40 hours",
  "level": "beginner",
  "instructor": "6499f4b8e5c8f1234567890a",
  "lectures": [
    "6499f4b8e5c8f1234567890c",
    "6499f4b8e5c8f1234567890d"
  ],
  "totalLectures": 2,
  "enrolledStudents": [
    "6499f4b8e5c8f1234567890e"
  ],
  "totalStudents": 1,
  "isPublished": true,
  "isPaid": true,
  "rating": 4.5,
  "reviews": 12,
  "createdAt": "2023-06-30T09:00:00Z",
  "updatedAt": "2023-06-30T10:00:00Z"
}
```

### Field Descriptions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | Yes | Course name |
| description | String | Yes | Course overview |
| price | Number | No | In INR (paise × 100 for Razorpay) |
| instructor | ObjectId | Yes | Course creator |
| lectures | Array | No | Array of Lecture IDs |
| isPublished | Boolean | No | Can students see it? |
| isPaid | Boolean | No | Requires payment? |

---

## 3. Lectures Collection

**Collection Name:** `lectures`

### Schema Definition

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  title: String (required),
  description: String (optional),
  
  // Content
  videoUrl: String (optional),
  videoLength: Number (in seconds),
  resources: [
    {
      name: String,
      url: String,
      type: String (pdf, doc, etc)
    }
  ],
  
  // Course Reference
  course: ObjectId (ref: "Course", required),
  
  // Order
  lectureNumber: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Example Document

```json
{
  "_id": "6499f4b8e5c8f1234567890c",
  "title": "Variables and Data Types",
  "description": "Learn about JavaScript variables",
  "videoUrl": "https://cloudinary.com/video.mp4",
  "videoLength": 1800,
  "resources": [
    {
      "name": "Lecture Notes",
      "url": "https://cloudinary.com/notes.pdf",
      "type": "pdf"
    }
  ],
  "course": "6499f4b8e5c8f1234567890b",
  "lectureNumber": 1,
  "createdAt": "2023-06-30T09:00:00Z",
  "updatedAt": "2023-06-30T09:00:00Z"
}
```

---

## 4. Course Purchases Collection

**Collection Name:** `coursepurchases`

### Schema Definition

```javascript
{
  _id: ObjectId,
  
  // References
  user: ObjectId (ref: "User", required),
  course: ObjectId (ref: "Course", required),
  
  // Payment Information
  amount: Number (in INR, required),
  paymentId: String (Razorpay order/payment ID),
  
  // Status
  status: String (enum: ["pending", "completed", "failed"], default: "pending"),
  
  // Additional
  transactionId: String (optional),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.coursepurchases.createIndex({ user: 1 })
db.coursepurchases.createIndex({ course: 1 })
db.coursepurchases.createIndex({ status: 1 })
db.coursepurchases.createIndex({ paymentId: 1 })
```

### Example Document

```json
{
  "_id": "6499f4b8e5c8f1234567890d",
  "user": "6499f4b8e5c8f1234567890a",
  "course": "6499f4b8e5c8f1234567890b",
  "amount": 999,
  "paymentId": "order_K7MNL4ZvFGe5uI",
  "status": "completed",
  "transactionId": "txn_123456789",
  "createdAt": "2023-06-30T10:00:00Z",
  "updatedAt": "2023-06-30T10:05:00Z"
}
```

---

## Database Relationships

### One-to-Many

**User → Courses (Instructor)**
```
One instructor creates many courses
instructor: ObjectId (ref: "User")
```

**Course → Lectures**
```
One course has many lectures
lectures: [ObjectId] (ref: "Lecture")
```

**User → Course Purchases**
```
One user makes many purchases
// Tracked in CoursePurchase.user
```

### Many-to-Many

**User ↔ Courses (Enrollment)**
```
Many users enroll in many courses
enrolledCourses: [{ course: ObjectId, enrolledAt: Date }]
```

---

## Queries Examples

### Find User with Enrolled Courses

```javascript
db.users.findOne(
  { _id: ObjectId("...") }
).populate('enrolledCourses.course')
```

### Find All Courses by Instructor

```javascript
db.courses.find({ instructor: ObjectId("...") })
```

### Find User's Purchases

```javascript
db.coursepurchases.find({ user: ObjectId("...") })
  .populate('course')
```

### Find Course with Lectures

```javascript
db.courses.findOne({ _id: ObjectId("...") })
  .populate('lectures')
```

---

## Data Validation Rules

### User
- ✅ Email must be unique
- ✅ Name length: 1-50 characters
- ✅ Password length: minimum 8 characters
- ✅ Role must be: student, instructor, or admin
- ✅ Email format must be valid

### Course
- ✅ Title length: 1-100 characters
- ✅ Price must be positive number
- ✅ Instructor must exist
- ✅ Cannot enroll in unpublished course

### Course Purchase
- ✅ Amount must match course price
- ✅ User and Course must exist
- ✅ Status must be: pending, completed, failed

---

## Backup & Recovery

### Export Database

```bash
# Export specific collection
mongoexport --uri "mongodb+srv://user:pass@host/db" \
  --collection users \
  --out users.json

# Export entire database
mongodump --uri "mongodb+srv://user:pass@host/db" \
  --out ./backup
```

### Import Database

```bash
# Import collection
mongoimport --uri "mongodb+srv://user:pass@host/db" \
  --collection users \
  --file users.json

# Restore entire database
mongorestore --uri "mongodb+srv://user:pass@host/db" ./backup
```

---

## Performance Tips

1. **Add Indexes**
   - Index frequently queried fields
   - Unique fields (email)
   - Sort fields (createdAt)

2. **Use Projections**
   - Select only needed fields
   - Don't return passwords

3. **Pagination**
   - Use skip() and limit()
   - Prevents loading all documents

4. **Cache Data**
   - Cache popular courses
   - Cache user profiles

5. **Monitor Queries**
   - Check MongoDB Atlas metrics
   - Identify slow queries
   - Optimize as needed

---

## Database Limits

- **Document Size**: Max 16MB per document
- **Array Size**: No hard limit, but use caution
- **String Length**: No limit (but affects performance)
- **Collection Size**: Unlimited
- **Database Size**: Depends on plan

For large datasets (like enrolled students), consider moving to separate collection.
