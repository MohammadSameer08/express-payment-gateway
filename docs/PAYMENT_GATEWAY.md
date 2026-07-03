# Payment Gateway Guide (Razorpay)

Complete guide for integrating and using Razorpay payment processing.

## Overview

This system integrates Razorpay for secure payment processing with:
- ✅ Order creation and management
- ✅ Payment signature verification
- ✅ Automatic course enrollment
- ✅ Transaction tracking

---

## Setup

### 1. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Copy **Key ID** and **Key Secret**
5. Test Mode: Use test credentials for development

### 2. Add to `.env`

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### 3. Verify Installation

```bash
npm list razorpay
# Should show: razorpay@x.x.x
```

---

## Payment Flow

```
1. User Selects Course
   ↓
2. Client Calls: POST /api/v1/payment/create-order
   ↓
3. Server Creates Order (amount, currency, receipt)
   ↓
4. Razorpay Returns Order ID + Amount
   ↓
5. Client Opens Razorpay Payment Modal
   ↓
6. User Enters Card Details
   ↓
7. Razorpay Processes Payment
   ↓
8. Payment Success/Failure
   ↓
9. Client Calls: POST /api/v1/payment/verify-payment
   ↓
10. Server Verifies Signature
    ↓
11. Mark Purchase as Completed
    ↓
12. Enroll User in Course
```

---

## API Endpoints

### 1. Create Order

**Endpoint:**
```
POST /api/v1/payment/create-order
```

**Authentication:** Required (Logged-in user)

**Request:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/payment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Send cookies
  body: JSON.stringify({
    courseId: '507f1f77bcf86cd799439011'
  })
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_K7MNL4ZvFGe5uI",
    "entity": "order",
    "amount": 99900,
    "amount_paid": 0,
    "amount_due": 99900,
    "currency": "INR",
    "receipt": "507f1f77bcf86cd799439011",
    "status": "created",
    "attempts": 0,
    "notes": {},
    "created_at": 1688000000
  },
  "purchase": {
    "_id": "6499f4b8e5c8f1234567890a",
    "user": "6499f4b8e5c8f1234567890b",
    "course": "507f1f77bcf86cd799439011",
    "amount": 999,
    "status": "pending",
    "paymentId": "order_K7MNL4ZvFGe5uI",
    "createdAt": "2023-06-30T10:00:00.000Z"
  }
}
```

---

### 2. Verify Payment

**Endpoint:**
```
POST /api/v1/payment/verify-payment
```

**Request:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/payment/verify-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    orderId: 'order_K7MNL4ZvFGe5uI',
    paymentId: 'pay_K7MNL4ZvFGe5uI',
    signature: 'signature_hash_from_razorpay'
  })
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "purchase": {
    "_id": "6499f4b8e5c8f1234567890a",
    "user": "6499f4b8e5c8f1234567890b",
    "course": "507f1f77bcf86cd799439011",
    "amount": 999,
    "status": "completed",
    "paymentId": "pay_K7MNL4ZvFGe5uI"
  },
  "user": {
    "_id": "6499f4b8e5c8f1234567890b",
    "enrolledCourses": [
      {
        "course": "507f1f77bcf86cd799439011",
        "enrolledAt": "2023-06-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Frontend Implementation

### Basic Implementation (Vanilla JS)

```javascript
// 1. Create Order
async function initiatePayment(courseId) {
  try {
    // Get order from backend
    const orderResponse = await fetch('/api/v1/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ courseId })
    });

    const { order, purchase } = await orderResponse.json();

    // Open Razorpay Checkout
    const options = {
      key: 'YOUR_KEY_ID', // From .env (send from backend)
      amount: order.amount,
      currency: order.currency,
      name: 'Course Purchase',
      description: `Course ID: ${courseId}`,
      order_id: order.id,
      handler: async (response) => {
        // 2. Verify Payment
        await verifyPayment(
          order.id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com'
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
}

// 2. Verify Payment
async function verifyPayment(orderId, paymentId, signature) {
  try {
    const response = await fetch('/api/v1/payment/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        orderId,
        paymentId,
        signature
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('Payment successful! Course added to your profile.');
      // Redirect or update UI
    } else {
      alert('Payment verification failed!');
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Usage
document.getElementById('buyButton').addEventListener('click', () => {
  initiatePayment('course_mongodb_id');
});
```

### React Implementation

```jsx
import React from 'react';

function CourseCard({ course }) {
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create Order
      const orderRes = await fetch('/api/v1/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course._id })
      });

      const { order } = await orderRes.json();

      // 2. Open Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/v1/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          const result = await verifyRes.json();
          if (result.success) {
            alert('Enrolled in course successfully!');
            // Refresh user profile or redirect
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>₹{course.price}</p>
      <button 
        onClick={handlePayment} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Enroll Now'}
      </button>
    </div>
  );
}

export default CourseCard;
```

---

## Razorpay Webhook (Optional)

For production, implement webhooks to handle payment events server-side:

```javascript
// routes/webhook.routes.js
import crypto from 'crypto';

router.post('/webhook', async (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'payment.authorized') {
    // Payment successful
    const purchase = await CoursePurchase.findOne({
      paymentId: payload.order.id
    });
    
    if (purchase) {
      purchase.status = 'completed';
      await purchase.save();
      
      // Enroll user
      await User.findByIdAndUpdate(purchase.user, {
        $push: { enrolledCourses: { course: purchase.course } }
      });
    }
  }
  
  res.json({ status: 'ok' });
});
```

---

## Testing

### Test Credentials

**Test Mode (Development):**
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxx
```

### Test Cards

| Card Type | Card Number | Expiry | CVV |
|-----------|-------------|--------|-----|
| Visa | 4111 1111 1111 1111 | 12/25 | 123 |
| MasterCard | 5555 5555 5555 4444 | 12/25 | 123 |

**Note:** Use any future date and any CVV for testing.

---

## Error Handling

### Common Errors

```javascript
// Invalid signature
{
  "success": false,
  "message": "Invalid signature. Payment verification failed."
}

// Course not found
{
  "success": false,
  "message": "Course not found"
}

// Missing fields
{
  "success": false,
  "message": "Order ID, Payment ID, and Signature are required"
}
```

---

## Security Best Practices

1. **Store Keys Securely**
   - Never commit `.env` to Git
   - Use environment variables
   - Rotate keys periodically

2. **Verify Signatures**
   - Always verify payment signature
   - Use HMAC-SHA256 for verification
   - Reject unverified payments

3. **HTTPS Only**
   - Always use HTTPS in production
   - Razorpay requires secure connection

4. **PCI Compliance**
   - Never log credit card details
   - Don't store card data
   - Use Razorpay's vault for saved cards

---

## Troubleshooting

### Issue: "Invalid API Key"
**Solution:** Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env

### Issue: "Order not found"
**Solution:** Verify order ID matches what was returned from create-order

### Issue: "Signature verification failed"
**Solution:** 
- Check KEY_SECRET is correct
- Ensure orderId and paymentId are exact strings
- Check for whitespace in signature

### Issue: "Course not found"
**Solution:**
- Verify courseId is valid MongoDB ObjectId
- Check course exists in database

---

## Production Checklist

- [ ] Switch from test to live API keys
- [ ] Enable HTTPS
- [ ] Set up webhooks
- [ ] Configure email notifications
- [ ] Test with live cards (small amount)
- [ ] Set up monitoring and alerts
- [ ] Document refund policy
- [ ] Implement retry logic
- [ ] Add comprehensive logging
- [ ] Regular security audits
