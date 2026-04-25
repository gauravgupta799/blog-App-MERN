import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyToken = (req, res, next)=>{
    const authHeader = req.headers.authHeader;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({error:"Access denied"})
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = decoded; // contains user id
        next();
    } catch (error) {
        console.log("token verify error", error)
        return res.status(401).json({error:"Invalid token"})
    }
}

