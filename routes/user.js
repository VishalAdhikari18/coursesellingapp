const express = require('express');
const Router = express.Router;
// either above two lines or 
// const {Router} = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {z} = require("zod");
const { userModel, purchaseModel, courseModel } = require('../db');
require("dotenv").config();
const {userMiddleware} = require("../middleware/user")

const JWT_USER_SECRET= process.env.JWT_USER_SECRET;
const userRouter = Router();

userRouter.post("/signup", async function( req, res){
     
    const requireData = z.object({
        email: z.string().max(30).min(3).email(),
        password: z.string().max(100),
        firstName: z.string().max(20),
        lastName: z.string().max(20)
    })

    const parseDataWithSuccess = requireData.safeParse(req.body);
    if(!parseDataWithSuccess){
        res.json({
            message: "incorrect format!",
            error: parseDataWithSuccess.error
        })
        return
    }

    const {email, password, firstName, lastName} = req.body;
    const hashedPassword= await bcrypt.hash(password, 5);
    //console.log(hashedPassword);
    try{
        await userModel.create({
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName
    })

    res.json({
        message:"signup successful"
    })} catch (e){
        res.status(403).json({
            error: e
        })
    }
})

userRouter.post("/signin", async function( req, res){
    const {email, password}= req.body;
    const user = await userModel.findOne({
        email: email
    })

    if(!user){
        res.status(403).json({
            message:"User Does Not exist in our DB"
        })
        return
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if(passwordMatched){
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_USER_SECRET);

        res.json({
            token: token
        })
    }else{
        res.status(403).json({
            message: "Incorrect Credentials!"
        })
    }
})

userRouter.get("/purchases", userMiddleware, async function( req, res){
    const userId = req.userId;
    const purchases = await purchaseModel.find({
        userId
    });
    const coursesData = await courseModel.finnd({
        _id:{$in: purchases.map(x=>x.courseId)}
    })

    res.json({
        purchases, 
        coursesData
    })
})

module.exports = {
    userRouter: userRouter
}