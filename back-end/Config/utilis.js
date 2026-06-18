import jwt from "jsonwebtoken";  // ✅ Import jsonwebtoken
export const generateToken = (userId, res) => {
    console.log("Signing Token with", process.env.JWT_SECRET);
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "8d" });
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development"
    });
    console.log("Generated Token:", token);
    return token;  
}