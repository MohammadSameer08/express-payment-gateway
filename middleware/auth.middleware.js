/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.error("❌ No token found in cookies");
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("✅ Token decoded:", decoded);
    req.id = decoded.id;

    if (!req.id) {
      console.error("❌ No id in decoded token:", decoded);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
