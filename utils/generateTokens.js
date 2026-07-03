import jwt from "jsonwebtoken";

export const generateAccessToken = (res, user, message) => {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .cookie("token", token, { httpOnly: true })
    .json({ message: message || "Token generated successfully" });
};
