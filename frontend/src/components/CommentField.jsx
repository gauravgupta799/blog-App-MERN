import React,{ useState, useContext} from 'react'
import { userContext } from '../App';
import {Toaster, toast} from "react-hot-toast";

function CommentField({action}) {
    const [comment, setComment] = useState("");

    const {userAuth: { access_token }} = useContext(userContext)

    const handleComment=()=>{
        if(!access_token){
            return toast.error("Please!, Login first to leave a comment")
        }
        if(!comment.length){
            return toast.error("Write something to leave a comment....")
        }

        console.log("Clicked", comment)

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
