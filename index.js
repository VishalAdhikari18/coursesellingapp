require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const {userRouter} = require("./routes/user");
const {courseRouter} = require("./routes/course");
const {adminRouter} =require("./routes/admin");

const app = express();
app.use(express.json());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/admin', adminRouter);

async function main(){
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3000);
}

main();
