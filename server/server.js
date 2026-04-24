import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from "cors"; 

// Schema
import User from "./Schema/User.js";


const server = express();
const port = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json()); 
server.use(cors()); // enable to server access the data from any route

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true})

const formatedData =(user)=>{
    const access_token = jwt.sign({id: user._id}, process.env.PRIVATE_KEY)
    return {
        profile_img: user.personal_info.profile_img,
        username:user.personal_info.username,
        fullname:user.personal_info.fullname,
        access_token
    }
}


const generateUsername = async (email)=>{
   let username = email.split("@")[0];
   let isUsernameExist = await User.exists({"personal_info.username": username}).then((result)=> result)
   isUsernameExist ? username += nanoid().substring(0, 6) : "";
   return username;
}

// REGISTER ROUTE
server.post("/signup", async (req, res)=>{
    try {
        const {fullname, email, password} = req.body;

        if(!fullname || !email || !password){
            return res.status(400).json({"error":"All field are required"})
        }
        if(fullname.trim().length < 3){
            return res.status(400).json({"error":"Fullname must be atleast 3 letters long"})
        }
        if(!emailRegex.test(email)){
            return res.status(400).json({"error":"Email in invalid"})
        }
        if(!passwordRegex.test(password)){
            return res.status(400).json({"error":"Password should be 6–20 characters long with at least 1 numeric, 1 lowercase, and 1 uppercase letter"
            })
        }

        // Hashed Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Username
        const username = await generateUsername(email);

        // Save the User
        const user = new User({
            personal_info:{
                fullname, email, password:hashedPassword, username
            }
        });

        const savedUser = await user.save();

        return res.status(201).json(formatedData(savedUser))
        
    } catch (error) {
        // handle dublicate email
        if(error.code === 11000 ) res.status(409).json({error:"Email already exists"})
        console.log(error);
        return res.status(500).json({error:"Something went wrong"})
    }
})


// LOGIN ROUTE
server.post("/signin", (req, res)=>{
    const {email, password} = req.body;

    User.findOne({"personal_info.email": email}).then(user => {
        if(!user) res.status(403).json({"error":"Email not found"})

        bcrypt.compare(password, user.personal_info.password, (err, success)=>{
            if(err) res.status(403).json({"error":"Error occured while log in. Please try again!"})
            success ? res.status(200).json(formatedData(user)) : res.status(403).json({"error":"Incorrect password"})
        })
    })
})


server.listen(port, ()=>{
    console.log(`Running on port: ${port}`)
})