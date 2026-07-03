import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Maximum number of retry attempts for MongoDB connection
 * After 3 failed attempts, the app will exit
 */
const MAX_RETRIES = 3;

/**
 * Delay (in milliseconds) between connection retry attempts
 * 5000ms = 5 seconds - gives the server time to recover
 */
const RETRY_INTERVAL = 5000;

/**
 * Maximum number of reconnection attempts after unexpected disconnection
 * Prevents infinite reconnection loops
 */
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * Tracks reconnection attempts to prevent infinite loops
 */
let reconnectAttempts = 0;

/**
 * DatabaseConnection Class
 * Manages MongoDB connection lifecycle with automatic retry logic,
 * connection monitoring, and graceful shutdown handling.
 *
 * Features:
 * - Auto-retry on connection failure
 * - Connection event monitoring
 * - Graceful app termination
 * - Connection status tracking
 */
class DatabaseConnection {
  /**
   * Constructor
   * Initializes connection state and sets up event listeners
   */
  constructor() {
    /**
     * Tracks how many connection attempts have been made
     * Reset to 0 on successful connection
     */
    this.retryCount = 0;

    /**
     * Tracks current connection status
     * Used to determine if MongoDB is accessible
     */
    this.isConnected = false;

    // Configure mongoose settings
    /**
     * strictQuery: true
     * Only allows querying fields that exist in the schema
     * Prevents typos and accidental data access
     * Example: {age: 30} ignored if 'age' not in schema
     */
    mongoose.set("strictQuery", true);

    // ========== CONNECTION EVENT LISTENERS ==========

    /**
     * 'connected' event
     * Fired when MongoDB connection is successfully established
     */
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
      this.isConnected = true;
      reconnectAttempts = 0; // Reset reconnection attempts on successful connection
    });

    /**
     * 'error' event
     * Fired when a connection error occurs
     * Updates connection status but doesn't trigger reconnection
     * (handled separately in handleDisconnection)
     */
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      this.isConnected = false;
    });

    /**
     * 'disconnected' event
     * Fired when MongoDB connection is lost or closed
     * Automatically attempts to reconnect
     */
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    // ========== GRACEFUL SHUTDOWN HANDLERS ==========

    /**
     * SIGINT: Signal Interrupt (Ctrl+C in terminal)
     * Triggers graceful shutdown with database cleanup
     * .bind(this) ensures proper 'this' context in event handler
     */
    process.on("SIGINT", this.handleAppTermination.bind(this));

    /**
     * SIGTERM: Signal Terminate (kill command)
     * Allows process managers (Docker, PM2) to gracefully stop the app
     * .bind(this) ensures proper 'this' context in event handler
     */
    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  /**
   * Connects to MongoDB
   *
   * Process:
   * 1. Checks if MONGO_URI environment variable exists
   * 2. Sets connection options for pooling and timeouts
   * 3. Enables debug mode in development
   * 4. Connects to MongoDB
   * 5. Resets retry counter on success
   * 6. Handles errors with retry logic
   */
  async connect() {
    try {
      /**
       * Validate MONGO_URI is set
       * MONGO_URI should be in format: mongodb+srv://username:password@host/database
       * Set in .env file
       */
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI is not defined in environment variables");
      }

      /**
       * Connection options for MongoDB
       */
      const connectionOptions = {
        /**
         * maxPoolSize: 10
         * Maximum number of concurrent connections to keep in the pool
         * More connections = better for high-traffic apps
         * Fewer connections = less resource usage
         */
        maxPoolSize: 10,

        /**
         * minPoolSize: 2
         * Minimum number of connections to maintain in the pool
         */
        minPoolSize: 2,

        /**
         * serverSelectionTimeoutMS: 5000 (5 seconds)
         * How long to wait for MongoDB server before timing out
         * If server not found in 5 sec, throws error
         */
        serverSelectionTimeoutMS: 5000,

        /**
         * socketTimeoutMS: 45000 (45 seconds)
         * How long to wait for operation before timing out
         * If no response for 45 sec, connection is closed
         */
        socketTimeoutMS: 45000,
      };

      /**
       * Enable debug mode in development
       * Logs all MongoDB operations and queries
       * Helpful for debugging but slows down in production
       */
      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      /**
       * Attempt to connect to MongoDB
       * Waits until connection is established before continuing
       */
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);

      /**
       * Reset retry count and reconnect attempts on successful connection
       * Next failure will start from attempt 1 again
       */
      this.retryCount = 0;
      reconnectAttempts = 0;
    } catch (error) {
      /**
       * Log the error and trigger retry logic
       * handleConnectionError() will retry or exit the app
       */
      console.error("Failed to connect to MongoDB:", error.message);
      await this.handleConnectionError();
    }
  }

  /**
   * Handles connection errors with retry logic
   *
   * Strategy:
   * - If retries remaining: Wait 5 seconds and try again
   * - If max retries reached: Log error and exit the app
   *
   * This prevents the app from running without a database connection
   */
  async handleConnectionError() {
    /**
     * Check if we haven't exceeded max retry attempts
     * retryCount starts at 0, increments on each attempt
     * MAX_RETRIES = 3, so attempts: 1, 2, 3 (then fail)
     */
    if (this.retryCount < MAX_RETRIES) {
      /**
       * Increment retry counter
       * Tracks which attempt this is (1st, 2nd, 3rd, etc.)
       */
      this.retryCount++;

      /**
       * Log the retry attempt
       * Shows user which attempt we're on and total allowed attempts
       * Example output: "Retrying connection... Attempt 1 of 3"
       */
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`,
      );

      /**
       * Wait 5 seconds before retrying
       * new Promise(...) makes setTimeout work with async/await
       * Prevents hammering the server with immediate reconnection attempts
       *
       * How it works:
       * 1. Creates a new promise
       * 2. setTimeout waits 5000ms (5 seconds)
       * 3. Calls resolve() after 5 seconds
       * 4. await pauses execution until resolve() is called
       */
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));

      /**
       * Recursively call connect() to retry
       * If this attempt fails, handleConnectionError() will be called again
       * Process repeats until success or max retries reached
       */
      return this.connect();
    } else {
      /**
       * Max retries exceeded - app cannot start without database
       * Log error message and force app exit
       * process.exit(1) = exit with error code
       *
       * Error code 1 signals to OS/container that app crashed
       * Allows monitoring tools (Docker, PM2, systemd) to detect failure
       */
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts`,
      );
      process.exit(1);
    }
  }

  /**
   * Handles unexpected disconnections
   *
   * Triggered by: mongoose 'disconnected' event
   * Purpose: Automatically attempt to reconnect to MongoDB
   *
   * Difference from handleConnectionError():
   * - handleConnectionError() = initial connection attempt failed
   * - handleDisconnection() = was connected, then lost connection
   */
  async handleDisconnection() {
    /**
     * Check if not currently connected AND haven't exceeded reconnect attempts
     * Only reconnect if we're actually disconnected
     * Prevents multiple reconnect attempts and infinite loops
     */
    if (!this.isConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(
        `Reconnection attempt ${reconnectAttempts} of ${MAX_RECONNECT_ATTEMPTS}...`,
      );

      /**
       * Wait 5 seconds before reconnecting
       * Prevents immediate reconnection attempts
       */
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));

      /**
       * Attempt to reconnect asynchronously
       * Don't await here - let it run in background
       * This doesn't block the application
       */
      this.connect().catch(() => {
        // Connection failed, will retry on next disconnection event
      });
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached. Exiting...");
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handler
   *
   * Triggered by:
   * - SIGINT (Ctrl+C in terminal)
   * - SIGTERM (kill command / process manager shutdown)
   *
   * Purpose: Close database connection cleanly before exiting
   * Prevents:
   * - Data corruption
   * - Orphaned database connections
   * - Incomplete operations
   */
  async handleAppTermination() {
    try {
      /**
       * Close MongoDB connection gracefully
       * Waits for any pending operations to complete
       * Then cleanly closes the connection
       *
       * Without this:
       * - App terminates abruptly
       * - MongoDB connection left open
       * - Potential data loss
       */
      await mongoose.connection.close();

      /**
       * Log successful shutdown
       * Helps with monitoring and debugging
       */
      console.log("MongoDB connection closed through app termination");

      /**
       * Exit the app with success code (0)
       * Signals to OS that app shutdown normally
       */
      process.exit(0);
    } catch (err) {
      /**
       * Error occurred while closing connection
       * Log the error but still exit the app
       * Exit code 1 = error, helps monitoring tools detect the issue
       */
      console.error("Error during database disconnection:", err);
      process.exit(1);
    }
  }

  /**
   * Returns current MongoDB connection status
   *
   * Useful for:
   * - Health checks
   * - API endpoints that return server status
   * - Monitoring and diagnostics
   *
   * @returns {Object} Connection status object
   *   - isConnected: Boolean - our tracked connection state
   *   - readyState: Number - mongoose internal state (0-3)
   *     0 = disconnected
   *     1 = connected
   *     2 = connecting
   *     3 = disconnecting
   *   - host: String - MongoDB server hostname
   *   - name: String - database name
   */
  getConnectionStatus() {
    return {
      /**
       * Our custom tracking of connection status
       * Updated by connection event listeners
       */
      isConnected: this.isConnected,

      /**
       * Mongoose connection state
       * More detailed than our isConnected
       * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
       */
      readyState: mongoose.connection.readyState,

      /**
       * MongoDB server hostname
       * Example: "mongodb.example.com" or "localhost"
       */
      host: mongoose.connection.host,

      /**
       * Database name being used
       * Example: "payment_gateway" or "myapp_db"
       */
      name: mongoose.connection.name,
    };
  }
}

/**
 * SINGLETON PATTERN
 *
 * A singleton ensures only ONE instance of DatabaseConnection exists
 * throughout the entire application lifetime.
 *
 * Benefits:
 * - Single connection pool shared by entire app
 * - Consistent state across all modules
 * - Memory efficient
 * - Easy to manage connection lifecycle
 */

/**
 * Create and instantiate the database connection singleton
 * Constructor runs here:
 * - Initializes retryCount and isConnected
 * - Sets up connection event listeners
 * - Sets up SIGINT/SIGTERM handlers
 */
const dbConnection = new DatabaseConnection();

/**
 * EXPORT 1: Default export - the connect function
 *
 * Why .bind(this)?
 * The connect() method uses 'this' to access instance properties
 * Without .bind(), 'this' would be undefined when the function is called
 *
 * Usage in index.js:
 * import connectDB from './database/db.js';
 * await connectDB(); // Connects to MongoDB
 */
export default dbConnection.connect.bind(dbConnection);

/**
 * EXPORT 2: Named export - the status checker function
 *
 * Why .bind(this)?
 * The getConnectionStatus() method uses 'this' to access instance properties
 * Without .bind(), 'this' would be undefined when the function is called
 *
 * Usage in index.js:
 * import { getDBStatus } from './database/db.js';
 * const status = getDBStatus();
 * console.log(status.isConnected); // true or false
 */
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
