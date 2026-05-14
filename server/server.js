import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from "cors"; 
import fs from "fs";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";
// Schema
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";

const serversAccountKey = JSON.parse(
    fs.readFileSync("./config/blog-website-mern-firebase-adminsdk.json", "utf-8")
)

const server = express();
const port = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serversAccountKey)
});


let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json()); 
server.use(cors()); // enable to server access the data from any route

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true})

// Setting S3 Bucket
const s3 = new aws.S3({
    region:"ap-south-1",
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});

const generateUploadImgUrl = async (fileType)=> {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!fileType || typeof fileType !== "string") throw new Error("Invalid file type");
    if(!allowedTypes.includes(fileType)) throw new Error("Only JPG, JPEG, PNG and WebP images are allowed")

    const date = new Date();
    const extension = fileType.split("/")[1];

    let imageName = `${nanoid()}-${date.getTime()}.${extension}`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket:"blogging-mern-website",
        Key:`image-blogging-mearn-site/${imageName}`,
        Expires:300,
        ContentType:fileType
    });
}

const formatedData =(user)=>{
    const access_token = jwt.sign({id: user._id}, process.env.PRIVATE_KEY, { expiresIn: "7d" })
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

// Upload Image URL route
server.get("/get-upload-url", async (req, res)=>{
    try {
        const {fileType} = req.query;
        const url = await generateUploadImgUrl(fileType);
        return res.status(200).json({ uploadURL:url });
    } catch (error) {
        return res.status(500).json({error: error.message})  
    }
})

// REGISTER ROUTE
server.post("/signup", async (req, res)=>{
    try {
        const {fullname, email, password} = req.body;

        if(!fullname || !email || !password){
            return res.status(400).json({"error":"All field are required"})
        }
        if(fullname.trim().length < 3){
            return res.status(400).json({error:"Fullname must be atleast 3 letters long"})
        }
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Email in invalid"})
        }
        if(!passwordRegex.test(password)){
            return res.status(400).json({error:"Password should be 6–20 characters long with at least 1 numeric, 1 lowercase, and 1 uppercase letter"
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
server.post("/signin", async (req, res)=>{
    try {
        const {email, password} = req.body;

        // Validation
        if(!email || !password){
            return res.status(400).json({error:"Email and password are required"})
        }

        const user = await User.findOne({"personal_info.email": email})
        if(!user){
            return res.status(404).json({error:"Email not found"});  
        } 

        if(!user.google_auth){
            const isMatched = await bcrypt.compare(password, user.personal_info.password);
            if(!isMatched) res.status(401).json({error:"Invalid email or password"})
        }else{
            return res.status(403).json({error:"Account was created using google. Try login with google."})
        }  
            
        return res.status(200).json(formatedData(user));
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Something went wrong. Please try again."})
    }
});


// Google Signin
server.post("/google-auth", async (req, res)=>{
    try {
        let {access_token} = req.body;

        if(!access_token){
            return res.status(400).json({
                error:"Access token is required"
            });
        }

        // verify Google token
        const decodedUser = await getAuth().verifyIdToken(access_token);
        let {email, name, picture} = decodedUser;

        // Improve Image quality
        // if(picture){
        //     picture = picture.replace("s96-c", "s384-c");
        // }

        // Check if user exists
        let user = await User.findOne({"personal_info.email":email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");

        if(user){
            if(!user.google_auth){
                return res.status(403).json({
                    error:"This email was signed up without Google. Please log in with password."
                });
            }
        }else{
            // Generate username
            let username = await generateUsername(email);

            // create new user
            user = new User({
                personal_info:{ fullname:name, email, username}, 
                google_auth:true
            });

            await user.save();
        }

        return res.status(200).json(formatedData(user))
        
    } catch (error) {
        console.log("Google Authentication Error", error.message);
        if(error.code === "auth/id-token-expired"){
            return res.status(401).json({
                error:"Google token is expried"
            })
        }
        return res.status(500).json({error:"Failed to authenticate with Google"})
    }
});

const verifyToken = (req, res, next)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log(token);

    if(token === null){
        return res.status(401).json({error: "No access token"});
    }
    jwt.verify(token, process.env.PRIVATE_KEY, (err, user)=>{
        if(err){
            return res.status(403).json({error:"Invalid Token"})
        } 
        req.user = user.id;
        next();
    });
}

server.post("/create-blog", verifyToken, (req, res)=>{
    let authorId = req.user;
    let {title, desc, banner, tags, content, draft} = req.body;

    if(!title.length){
        return res.status(403).json({error:"You must provide a title to publish the blog"})
    }
    if(!desc.length || desc.length > 200){
        return res.status(403).json({error:"You must provide blog description under 200 characters"});
    }
    if(!banner.length){
        return res.status(403).json({error:"You must provide blog banner to publish it"})
    }
    if(!content.blocks.length){
        return res.status(403).json({error:"There must be some blog content to publish it"})
    }
    if(!tags.length || tags.length > 10){
        return res.status(403).json({error:"Provide tags in order to publish the blog, Maximum 10"})
    }

    tags = tags.map(tag => tag.toLowerCase());
    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    let blog = new Blog({
        title, desc, banner, content, tags, author:authorId, blog_id, draft:Boolean(draft)
    });

    blog.save().then(blog=>{
        let increamentVal = draft ? 0 : 1;

        User.findOneAndUpdate(
            { _id: authorId }, 
            { 
                $inc: {"account_info.total_posts": increamentVal }, 
                $push: {"blogs": blog._id}
            }
        ).then(user =>{
            return res.status(200).json({id: blog.blog_id});
        }).catch(error =>{
            return res.status(500).json({error:"Failed to update total posts number"})
        })

    }).catch(error =>{
        return res.status(500).json({error:error.message});
    })
})


server.listen(port, ()=>{
    console.log(`Running on port: ${port}`)
});