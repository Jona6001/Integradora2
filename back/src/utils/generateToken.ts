import jwt from 'jsonwebtoken';
const ACCESS_SECRET = "secret123utd";

export const generateAccessToken = (userId: string) => {
    const jwt = require("jsonwebtoken");
    return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "1h" });
}