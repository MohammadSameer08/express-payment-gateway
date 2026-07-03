# Database Connection Management

## Overview

The `db.js` file implements a robust MongoDB connection management system with automatic retry logic, connection monitoring, and graceful shutdown handling. It uses the **Singleton Pattern** to ensure only one database connection instance exists throughout the application lifecycle.

## Architecture

### Class: DatabaseConnection

The `DatabaseConnection` class manages all aspects of MongoDB connectivity:

```
┌─────────────────────────────────────────────────────┐
│         DatabaseConnection Instance                 │
├─────────────────────────────────────────────────────┤
│ Properties:                                         │
│ - retryCount: Tracks connection attempts            │
│ - isConnected: Connection status flag               │
├─────────────────────────────────────────────────────┤
│ Methods:                                            │
│ - connect(): Establish connection with options      │
│ - handleConnectionError(): Retry logic              │
│ - handleDisconnection(): Auto-reconnect             │
│ - handleAppTermination(): Graceful shutdown         │
│ - getConnectionStatus(): Check connection state     │
└─────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Automatic Retry Logic**

When MongoDB connection fails, the system automatically retries with exponential backoff:

```
Attempt 1 → Fail → Wait 5 sec
    ↓
Attempt 2 → Fail → Wait 5 sec
    ↓
Attempt 3 → Fail → Wait 5 sec
    ↓
Attempt 4 (>MAX_RETRIES) → Exit App
```

**Configuration:**
```javascript
const MAX_RETRIES = 3;           // Try 3 times
const RETRY_INTERVAL = 5000;     // Wait 5 seconds between attempts
```

**Behavior:**
```javascript
if (retryCount < MAX_RETRIES) {
    // Retry: Increment counter → Wait → Call connect()
    retryCount++;
    await new Promise(resolve => setTimeout(resolve, 5000));
    return this.connect();
} else {
    // Give up: Log error and exit app
    console.error('Failed after 3 attempts');
    process.exit(1);  // Exit code 1 = error
}
```

### 2. **Connection Monitoring**

Event listeners track connection status in real-time:

| Event | Fired When | Action |
|-------|-----------|--------|
| `connected` | MongoDB connection established | Set `isConnected = true` |
| `error` | Connection error occurs | Set `isConnected = false`, log error |
| `disconnected` | Connection lost | Set `isConnected = false`, call `handleDisconnection()` |

```javascript
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    this.isConnected = true;
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
    this.isConnected = false;
    this.handleDisconnection();  // Auto-reconnect
});
```

### 3. **Graceful Shutdown**

When the application terminates (Ctrl+C or kill signal), the database connection closes cleanly:

```
User Presses Ctrl+C
    ↓
SIGINT Signal Sent
    ↓
handleAppTermination() Called
    ↓
Close MongoDB Connection
    ↓
Log: "MongoDB connection closed"
    ↓
Exit App (exit code 0)
```

**Signal Handlers:**
```javascript
process.on('SIGINT', this.handleAppTermination.bind(this));  // Ctrl+C
process.on('SIGTERM', this.handleAppTermination.bind(this)); // kill command
```

**Why `.bind(this)` is important:**
- `handleAppTermination()` uses `this.isConnected` and `mongoose.connection`
- Without `.bind(this)`, `this` would be undefined
- `.bind(this)` ensures proper context preservation

### 4. **Connection Pooling**

The connection maintains a pool of reusable connections:

```javascript
maxPoolSize: 10  // Maximum 10 concurrent connections
```

Benefits:
- Reuses connections instead of creating new ones
- Improves performance for high-traffic applications
- Reduces resource usage

## Configuration Options

### Connection Parameters

```javascript
const connectionOptions = {
    useNewUrlParser: true,           // Uses new URL parser (prevents warnings)
    useUnifiedTopology: true,        // Modern connection pooling
    maxPoolSize: 10,                 // Max 10 connections
    serverSelectionTimeoutMS: 5000,  // 5 sec to find server
    socketTimeoutMS: 45000,          // 45 sec inactivity timeout
    family: 4,                       // IPv4 (not IPv6)
};
```

### Mongoose Settings

```javascript
mongoose.set('strictQuery', true);  // Only query schema fields
```

**What strictQuery does:**
```javascript
// With strictQuery: true (Recommended)
User.find({ name: "John", age: 30 });
// Result: Only 'name' is queried, 'age' is ignored if not in schema

// With strictQuery: false (Not recommended)
User.find({ name: "John", age: 30 });
// Result: Queries both fields even if not in schema (security risk)
```

### Debug Mode

In development, enable debug logging:

```javascript
if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);  // Logs all MongoDB operations
}
```

## Connection States

MongoDB connection has 4 internal states:

| State | Code | Meaning |
|-------|------|---------|
| Disconnected | 0 | Not connected |
| Connected | 1 | Successfully connected |
| Connecting | 2 | Connection attempt in progress |
| Disconnecting | 3 | Connection closing |

Check current state:
```javascript
const { getDBStatus } = require('./database/db.js');
const status = getDBStatus();
console.log(status.readyState);  // Returns 0-3
```

## Usage Examples

### 1. Starting the Server

In `index.js`:
```javascript
import connectDB from './database/db.js';

// Connect to database
await connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 2. Checking Connection Status

```javascript
import { getDBStatus } from './database/db.js';

app.get('/api/health', (req, res) => {
    const status = getDBStatus();
    res.json({
        status: status.isConnected ? 'connected' : 'disconnected',
        database: status.name,
        host: status.host,
        readyState: status.readyState
    });
});
```

### 3. Example Output

**Successful Connection:**
```
✅ MongoDB connected successfully
Server running on port 3000
```

**Connection Failure with Retry:**
```
❌ MongoDB connection error: ECONNREFUSED 127.0.0.1:27017
Failed to connect to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
Retrying connection... Attempt 1 of 3
(5 second wait...)
✅ MongoDB connected successfully
```

**Auto-Reconnection:**
```
⚠️ MongoDB disconnected
Attempting to reconnect to MongoDB...
(connection process)
✅ MongoDB connected successfully
```

**Graceful Shutdown (Ctrl+C):**
```
^C
MongoDB connection closed through app termination
(Process exits cleanly)
```

## Environment Variables

Required in `.env`:

```env
# MongoDB connection string
# Format: mongodb+srv://username:password@host/database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/payment_gateway

# Environment
NODE_ENV=development  # or production

# Server port
PORT=3000
```

Example `.env.example`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/payment_gateway
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:3000
```

## Error Handling

### Connection Errors

If connection fails after all retries:
```
❌ Failed to connect to MongoDB after 3 attempts
[App exits with code 1]
```

Possible causes:
- Invalid `MONGO_URI` in `.env`
- MongoDB server not running
- Network connectivity issue
- Invalid credentials
- Firewall blocking connection

**Solutions:**
1. Verify `MONGO_URI` format: `mongodb+srv://user:pass@host/db`
2. Check MongoDB server is running
3. Verify network connectivity: `ping <hostname>`
4. Check firewall and IP whitelist
5. Verify credentials in MongoDB Atlas

### Disconnection Errors

If connection drops during operation:
```
⚠️ MongoDB disconnected
Attempting to reconnect to MongoDB...
```

Automatic recovery:
- System automatically attempts to reconnect
- No manual intervention needed
- Application continues running during reconnect

## Performance Optimization

### For High-Traffic Applications:

```javascript
const connectionOptions = {
    maxPoolSize: 20,                 // Increase from 10 to 20
    minPoolSize: 5,                  // Keep minimum 5 connections
    serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
};
```

### For Low-Traffic Applications:

```javascript
const connectionOptions = {
    maxPoolSize: 5,    // Reduce to save resources
    maxIdleTimeMS: 30000,  // Close idle connections after 30 sec
};
```

## Singleton Pattern Explanation

The database connection uses the **Singleton Pattern**:

```javascript
// STEP 1: Create instance
const dbConnection = new DatabaseConnection();

// STEP 2: Export bound methods
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
```

**Why Singleton?**
- ✅ Single connection pool shared by entire app
- ✅ Consistent state across all modules
- ✅ Memory efficient
- ✅ Easy lifecycle management

**How it works:**
```javascript
// Module 1
import connectDB from './database/db.js';
await connectDB();  // Uses SAME instance

// Module 2
import { getDBStatus } from './database/db.js';
getDBStatus();  // Uses SAME instance

// Both modules share the same connection!
```

## Testing Connection

### Test Connection Script

Create `test-db.js`:
```javascript
import connectDB, { getDBStatus } from './database/db.js';

async function testConnection() {
    console.log('Testing MongoDB connection...');
    
    try {
        await connectDB();
        
        // Wait 2 seconds for connection to establish
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const status = getDBStatus();
        console.log('Connection Status:', status);
        
        process.exit(0);
    } catch (error) {
        console.error('Connection test failed:', error);
        process.exit(1);
    }
}

testConnection();
```

Run with: `node test-db.js`

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `Cannot find module 'mongoose'` | Not installed | `npm i mongoose` |
| `MONGO_URI is not defined` | Missing `.env` file | Create `.env` with MONGO_URI |
| `ECONNREFUSED` | MongoDB not running | Start MongoDB server |
| `Failed after 3 attempts` | Connection fails 3 times | Check MONGO_URI and network |
| `Hanging on connect` | Firewall blocking | Add server IP to whitelist |

## Summary

The database connection module provides:
- ✅ Automatic retry logic with exponential backoff
- ✅ Real-time connection monitoring
- ✅ Graceful shutdown handling
- ✅ Connection pooling for performance
- ✅ Singleton pattern for memory efficiency
- ✅ Error handling and logging
- ✅ Development-friendly debug mode

This ensures robust, reliable MongoDB connectivity for the LMS Payment Gateway backend.
