const { Router } = require("express");
const adminRouter = Router();
const {adminModel, courseModel} = require('../db');
const { z } = require('zod');
require("dotenv").config();
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {adminMiddleware} = require("../middleware/admin");
const admin = require("../middleware/admin");


adminRouter.post("/signup", async function( req, res){
    const requestedData = z.object({
        email: z.string().max(20).min(3),
        password: z.string().max(20).min(3),
        firstName: z.string().max(10),
        lastName: z.string().max(20)
    })

    const parseDataWithSuccess = requestedData.safeParse(req.body);
    if(!parseDataWithSuccess){
        res.json({
            message: " incorrect format!",
            error: parseDataWithSuccess.error
        })
        return
    }

    const {email, password, firstName, lastName} = req.body;

    const hashedPassword = await bcrypt.hash(password,5);

    try{
        await adminModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
       })
       res.json({
        message: "Sign Up Successful!!!"
       })
    } catch(e){
        res.status(403).json({
            error:e
        })
    }
    
})

adminRouter.post("/signin", async function( req, res){
    const {email, password} = req.body;
    const admin = await adminModel.findOne({
        email: email
    })
    if(!admin){
        res.status(403).json({
            message:"Admin is not in the Database!!"
        })
       return 
    }
    const passwordMatched = await bcrypt.compare(password,admin.password);
    if(passwordMatched){
        const token = jwt.sign({
            id: admin._id.toString()
        }, JWT_ADMIN_SECRET)

        res.json({
            token: token
        })  
    }else{
        res.status(403).json({
            message: "Incorrect Credentials!!!!"
        })
    } 
})

adminRouter.post("/course", adminMiddleware, async function( req, res){
    
    const adminId = req.adminId;

    const {title, description, imageUrl, price } = req.body;
    const course = await courseModel.create({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        creatorId: adminId
    })

    console.log(creatorId);

    res.json({
        message:"course Created!!",
        courseId: course._id
    })
})

adminRouter.put("/course", adminMiddleware, async function( req, res){
        const adminId= req.adminId;
        const {title, description, imageUrl, price, courseId} = req.body;
        
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        },{
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price
        })

        res.json({
            message: "course Updated",
            courseId:course._id
        })
   
})

adminRouter.get("/course/bulk", adminMiddleware, async function( req, res){
    
    const adminId =req.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    });
    res.json({
        message:"courses sees",
        courses: courses
    })
})

module.exports={
    adminRouter:adminRouter
}