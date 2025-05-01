const jwt = require("jsonwebtoken")
require("dotenv").config();
const JWT_ADMIN_SECRET= process.env.JWT_ADMIN_SECRET;

function adminMiddleware(req, res,next){
    const token = req.headers.token;
    const decodeAdmin= jwt.verify(token, JWT_ADMIN_SECRET);
    if(decodeAdmin){
        req.adminId = decodeAdmin.id;
        next();
    } else{
        res.status(403).json({
            message:"you are not signed in"
        })
    }
}

module.exports={
    adminMiddleware: adminMiddleware
}