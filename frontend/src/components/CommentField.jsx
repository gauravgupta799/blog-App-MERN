import React,{ useState, useContext} from 'react'
import { userContext } from '../App';
import { BlogContext } from '../pages/BlogPage';
import {Toaster, toast} from "react-hot-toast";
import axios from "axios";

function CommentField({action}) {
    const [comment, setComment] = useState("");

    const {userAuth: { access_token, username, fullname, profile_img }} = useContext(userContext);

    const { blogDetail, setBlogDetail, setTotalParentsCommentsLoaded,
         blogDetail: {
            _id, 
            author: {_id: blog_author }, 
            comments, 
            comments:{results: commentArr},
            activity,
            activity: { total_comments, total_parent_comments}
        } 
    } = useContext(BlogContext);

    // Handle Comment function
    const handleComment = async () =>{
        try {
            if(!access_token){
                return toast.error("Please!, Login first to leave a comment")
            }
            if(!comment.length){
                return toast.error("Write something to leave a comment....")
            }
            
            const {data} = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`, 
                {  _id, blog_author, comment },
                {
                    headers:{
                        "Authorization": `Bearer ${access_token}`
                    }
                }
            )    
              
            setComment("");

            data.commented_by = { personal_info: { username, fullname, profile_img }}
            let newCommentArr;

            data.childrenLevel = 0;
            newCommentArr = [ data, ...commentArr ];
            let parentCommentIncrementVal = 1;

            setBlogDetail({
                ...blogDetail, 
                comments: { ...comments, results: newCommentArr }, 
                activity: { 
                    ...activity, 
                    total_comments: total_comments + 1, 
                    total_parent_comments: total_parent_comments + parentCommentIncrementVal 
                }
            });

            setTotalParentsCommentsLoaded(preVal => preVal + parentCommentIncrementVal)

        } catch (error) {
            console.log(error);
        }
    }

  return (
    <>
        <Toaster/>
        <textarea
            vlaue={comment} 
            onChange={(e)=> setComment(e.target.value)}
            placeholder="Leave a comment..."
            className ="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        >

        </textarea>

        <button 
            className="btn-dark mt-5 px-10"
            onClick={handleComment}
        >
            {action}
        </button>
    </> 
  )
}

export default CommentField
