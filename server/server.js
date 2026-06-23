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
import Notification from "./Schema/Notification.js"
import Comment from "./Schema/Comment.js";
import { error } from "console";

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

server.post("/change-password", verifyToken, (req, res)=>{
    console.log(req.body.formData);

    let { currentPassword, newPassword } = req.body.formData;

    if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
        return res.status(403).json({error:"Password must be 6–20 chars, include uppercase, lowercase, and number"})
    }

    User.findOne({_id: req.user})
    .then((user)=>{
        if(user.google_auth){
            return res.status(403).json({error:"You've logged in with google account so you can't change the password"})
        }

        bcrypt.compare(currentPassword, user.personal_info.password, (error, result)=>{
            if(error){
                return res.status(500).json({error:"Some error occured while changing the password, please try again later"})
            }
            if(!result){
                return res.status(403).json({error:"Incorrect current password"})
            }

            bcrypt.hash(newPassword, 10, (err, hashed_password)=>{
                User.findOneAndUpdate({_id: req.user }, {"personal_info.password": hashed_password})
                .then((u)=>{
                    return res.status(200).json({status:"Password Changed"})
                })
                .catch(error=>{
                    return res.status(500).json({error:"Some error occured while saving the new password"})
                })
            })
        })
    })
    .catch(error=>{
        console.log(error);
        return res.status(500).json({error: "User not found"});
    })
})

server.post("/latest-blogs",(req, res)=>{
    let {page} = req.body;

    let maxLimit= 5;

    Blog.find({draft:false})
    .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({"publishedAt": -1})
    .select("blog_id title banner activity tags desc publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs)=>{
        return res.status(200).json({blogs});
    }).catch(error=>{
        return res.status(500).json({error:error.message})
    });
});

server.post("/all-latest-blogs-count", (req,res)=>{
    Blog.countDocuments({draft:false})
    .then(count=>{
        return res.status(200).json({totalDocs: count})
    }).catch(error=>{
        console.log(error.message);
        return res.status(500).json({error:error.message})
    })
});

server.get("/trending-blogs", (req, res)=>{
    Blog.find({draft:false})
    .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({"activity.total-read": -1, "activity.total_likes": -1, "publishedAt":-1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs)=>{
        return res.status(200).json({blogs});
    }).catch((error)=>{
        return res.status(500).json({error:error.message});
    });
});

server.post("/search-blogs", (req, res)=>{
    let {tag, query, page, author, limit, eliminate_blog} = req.body;

    let findQuery;
    if(tag){
        findQuery = { tags: tag, draft:false, blog_id: { $ne: eliminate_blog } };
    }else if(query){
        findQuery = { draft:false, title: new RegExp(query, 'i') }
    } else if(author){
        findQuery = { author, draft:false }
    }

    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({"publishedAt": -1})
    .select("blog_id title banner activity tags desc publishedAt -_id")
    .skip((page - 1 ) * maxLimit)
    .limit(maxLimit)
    .then((blogs)=>{
        return res.status(200).json({blogs});
    }).catch(error=>{
        return res.status(500).json({error:error.message})
    });

});

server.post("/search-blogs-count", (req, res)=>{
    let {tag, query, author} = req.body;

    let findQuery;
    if(tag){
        findQuery = {tags: tag, draft:false};
    }else if(query){
        findQuery = {draft:false, title: new RegExp(query, 'i')}
    } else if(author){
        findQuery = {author, draft:false}
    }

    Blog.countDocuments(findQuery)
    .then((count)=>{
        return res.status(200).json({totalDocs:count})
    })
    .catch((error)=>{
        console.log(error.message);
        return res.status(500).json({error: error.message})
    })
})

server.post("/search-users", (req, res)=>{
    let {query} = req.body;
    User.find({"personal_info.username": new RegExp(query, "i")})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users=>{
        return res.status(200).json({users})
    })
    .catch(error=>{
        return res.status(500).json({error:error.message})
    })
})

server.post("/get-user-profile", (req, res)=>{
    const {username}= req.body;

    User.findOne({"personal_info.username": username})
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user=>{
        return res.status(200).json(user);
    })
    .catch(error=> {
        console.log(error.message);
        return res.status(500).json({error:error.message})
    })
})

server.post("/update-profile-img", verifyToken, (req, res)=>{
    const { url } = req.body;

    User.findOneAndUpdate({_id: req.user}, { "personal_info.profile_img": url }).
    then(()=>{
        return res.status(200).json({profile_img: url });
    })
    .catch(err =>{
        return res.status(500).json({error:err})
    })
});


server.post("/update-profile", verifyToken, (req, res)=>{
    const { username, bio, social_links } = req.body;

    const bioLimit = 150;

    if(username.trim().length < 3){
        return res.status(403).json({error:"Username should be at least 3 letters long"})
    }
    if(bio.length > bioLimit){
        return res.status(403).json({error:`Bio should not more than ${bioLimit} characters`})
    }

    let socialLinksArr  = Object.keys(social_links);

    try {
        for(let i = 0; i < socialLinksArr.length; i++){
            if(social_links[socialLinksArr[i]].length){
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== "website"){
                    return res.status(403).json({error:`${socialLinksArr[i]} link is invalid. You must enter a full url`})
                }
            }
        }
    } catch (error) {
        return res.status(500).json({error:"You must provide full social links with http(s) included"})
    }

    const updateObj = {
        "personal_info.username": username.trim(),
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({ _id: req.user }, updateObj , { runValidators: true })
    .then(()=>{
        return res.status(200).json({username})
    })
    .catch(error=>{
        if(error.code === 11000){
            return res.status(409).json({error:"Username already taken"})
        }
        return res.status(500).json({error: error.message})
    })
  
});

server.post("/create-blog", verifyToken, (req, res)=>{
    let authorId = req.user;
    let {title, desc, banner, tags, content, draft, id} = req.body;

    if(!title.length){
        return res.status(403).json({error:"You must provide a title to publish the blog"})
    }
    if(!draft){
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
    }

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){
        Blog.findOneAndUpdate({blog_id}, {title, desc, banner, tags, content, draft: draft ? draft : false })
        .then(()=>{
            return res.status(200).json({id:blog_id});
        })
        .catch((error)=>{
            return res.status(500).json({error:error.message});
        })

    }else{

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
    }
})

server.post("/get-blog", async (req, res)=>{
    try {
        const {blog_id, draft, mode} = req.body;

        let incrementVal= mode === "edit" ? 0 : 1 ;

        const blog = await Blog.findOneAndUpdate(
            { blog_id }, 
            { $inc: { "activity.total_reads": incrementVal }},
            { new: true }
        )
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title desc content banner activity publishedAt blog_id tags")
        
        // console.log(blog.draft);
        if(!blog){
            return res.status(404).json({error:"Blog not found"})
        }
        await User.findOneAndUpdate(
            {"personal_info.username": blog.author.personal_info.username}, 
            { $inc: {"account_info.total_reads":incrementVal}}
        )

        if(blog?.draft && !draft){
            return res.status(500).json({error: "You can't access draft blogs"})
        }

        return res.status(200).json({blog})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error.message})
    }
})

server.post("/like-blog", verifyToken, (req, res)=>{ 
    const user_id = req.user; 
    const {_id, isLikedByUser} = req.body; 
    let incrementVal = isLikedByUser ? -1 : 1; 

    Blog.findOneAndUpdate({_id}, { $inc: { "activity.total_likes": incrementVal } }) 
    .then(blog =>{ 
         if(!isLikedByUser){ 
            let like = new Notification({ type:"like", blog:_id, notification_for: blog.author, user: user_id }) 
            like.save().then(notification=>{ 
                return res.status(200).json({"liked_by_user": true}) 
            }) 
            .catch(error=>{ return res.status(500).json({error:error.message}) }) 
        }else{ 
            Notification.findOneAndDelete({user:user_id, type:"like", blog:_id}) 
            .then(data=>{ 
                return res.status(200).json({"liked_by_user":false, data}) 
            })
            .catch((error)=>{ 
                return res.status(500).json({error:error.message}) 
            }) 
        } 
    }) 
    .catch(error =>{ return res.status(500).json({error: error.message}) }) 
})

server.post("/isLiked-by-user", verifyToken, async (req, res)=>{
    try {
        const user_id = req.user;
        const { _id } = req.body;
        const result = await Notification.exists({user:user_id, type:"like", blog:_id})
        return res.status(200).json({result})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:error.message});
    }
})

server.post("/add-comment", verifyToken, (req, res)=>{
    const user_id = req.user;
    const {_id, comment, replying_to, blog_author, notification_id } = req.body;

    if(!comment.length){
        return res.status(403).json({error:"Write something to leave a comment"});
    }

    let commentObj = {
        blog_id:_id,
        blog_author,
        comment, 
        commented_by:user_id,
        isReady:false,
    }
    if(replying_to){
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async (commentFile)=>{
        const {comment, commentedAt, children } = commentFile;

        Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1  } })
        .then(blog=>{
            console.log("New Comment Created")
        })

        let notificationObj = new Notification({
            type: replying_to ? "reply" : "comment",
            blog:_id,
            notification_for:blog_author,
            user:user_id,
            comment:commentFile._id
        })

        if(replying_to){
            notificationObj.replied_on_comment = replying_to;
            await Comment.findOneAndUpdate({ _id: replying_to }, { $push : { children: commentFile._id }})
            .then((replyingToCommonDoc)=>{
                notificationObj.notification_for = replyingToCommonDoc.commented_by
            })

            if(notification_id){
                Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
                .then(notification=>{
                    console.log("Notification updated")
                })
            }
        }

        notificationObj.save().then((notification)=>{
            console.log("New Notification Created");
        })

        return res.status(200).json({
            _id:commentFile._id,
            comment, 
            commentedAt, 
            user_id,
            children
        })
    })

})

server.post("/get-blog-comments", (req, res)=>{
    const {blog_id, skip} = req.body;
    let maxLimit = 5;

    Comment.find({ blog_id, isReply:false })
    .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
        "commentedAt": -1
    })
    .then(comment=>{
        return res.status(200).json(comment)
    })
    .catch(error=>{
        console.log(error.message);
        return res.status(500).json({error: error.message})
    })
})

server.post("/get-replies", (req,res)=>{
    const {_id, skip} = req.body;
    let maxLimit = 5;

    Comment.findOne({ _id })
    .populate({
        path:"children",
        options:{
            limit:maxLimit,
            skip:skip,
            sort: { 'commentedAt': -1 }
        },
        populate:{
            path: 'commented_by',
            select:"personal_info.profile_img personal_info.fullname personal_info.username"
        },
        select:"-blog_id -updatedAt"
    })
    .select("children")
    .then(doc =>{
        return res.status(200).json({replies: doc.children})
    })
    .catch(error=>{
        return res.status(500).json({error:error.message})
    })
});

const deleteComments = (_id)=>{
    Comment.findOneAndDelete({_id})
    .then(comment =>{
        if(comment.parent){
            Comment.findOneAndUpdate({_id : comment.parent}, 
                { $pull: { children: _id } }
            )
            .then(data => console.log("Comment delete from parent"))
            .catch(error => console.log(error))
        }

        Notification.findOneAndDelete({ comment:_id })
        .then(notification=>{
            console.log("Comment notification deleted");
        })

        Notification.findOneAndUpdate({ reply:_id }, { $unset: { reply :1 } })
        .then(notification =>{
            console.log("Reply notification deleted");
        })

        Blog.findOneAndUpdate({_id : comment.blog_id}, 
            { 
                $pull: { comments: _id }, 
                $inc: { "activity.total_comments": -1 }, 
                "activity.total_parent_comments": comment.parent ? 0 : -1
            }
        )
        .then(blog =>{
            if(comment.children.length){
                comment.children.map(replies=>{
                    deleteComments(replies);
                });
            }
        })
    })
    .catch(error => {
        console.log(error.message);
    })
}

server.post("/delete-comment", verifyToken, (req, res)=>{
    let user_id = req.user;
    const { _id } = req.body;
    
    Comment.findOne({ _id })
    .then(comment=>{
        if(user_id === comment.commented_by || comment.blog_author){
            deleteComments(_id);

            return res.status(200).json({status:"done"});

        }else{
            return res.status(403).json({error: "You can not delete this comment"})
        }
    })
    .catch(error=>{
        console.log(error);
        return res.status(500).json({error: error.message})
    })
})

server.get("/new-notification", verifyToken, (req, res)=>{
    const user_id = req.user;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
    .then(result=>{
        if(result){
            return res.status(200).json({ new_notification_available: true })
        } else{
            return res.status(200).json({ new_notification_available: false })
        }
    })
    .catch(error=>{
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    })
})

server.post("/notifications", verifyToken, (req, res)=>{
    const user_id = req.user;
    const { page, filter, deletedDocCount } = req.body;

    let maxLimit= 10;
    
    const findQuery = { notification_for:user_id, user: { $ne: user_id }}
    const skipDocs = ( page - 1 ) * maxLimit;

    if(filter !== "all"){
        findQuery.type = filter;
    }
    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({"createdAt": -1})
    .select("createdAt type seen reply")
    .then(notifications =>{
        
        Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(()=>{
            console.log("Notification seen")
        })

        return res.status(200).json({ notifications })
    })
    .catch(err=>{
        console.log(err.message)
        return res.status(500).json({error:err.message})
    })
});

server.post("/all-notifications-count", verifyToken, (req, res)=>{
    const user_id = req.user;
    const {filter} = req.body;

    let findQuery ={ notification_for: user_id, user:{$ne: user_id } }

    if(filter !== "all"){
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count=>{
        return res.status(200).json({ totalDocs: count})
    })
    .catch(err=>{
        console.log(err.message);
        return res.status(500).json({error:err.message})
    })
});

server.listen(port, ()=>{
    console.log(`Running on port: ${port}`)
});