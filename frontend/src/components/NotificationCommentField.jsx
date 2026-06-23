import React, {useState, useContext} from 'react';
import {Toaster, toast} from "react-hot-toast";
import { userContext } from '../App';
import axios from "axios";


function NotificationCommentField ({_id, blog_author, index=undefined, replyingTo=undefined, setReplying, notification_id, notificationData}) {

    const [comment, setComment] = useState("");

    const { _id: user_id } = blog_author;
    const { userAuth: { access_token } } = useContext(userContext);
    const { notifications, notifications: { results }, setNotifications } = notificationData;

    const handleComment =()=>{
        if(!comment.length){
            return toast.error("Write something to leave a comment")
        }

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`, {
                _id, blog_author: user_id, comment, 
                replying_to: replyingTo, 
                notification_id
            },
            {
                headers:{
                    "Authorization": `Bearer ${access_token}`
                }
            }
        )
        .then(({data})=>{
            setReplying(false);
            results[index].reply = { comment, _id: data._id }
            setNotifications({ ...notifications, results });
        })
        .catch(error=>{
            console.log(error)
        })
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
            Reply
        </button>
    </> 
  )
}

export default NotificationCommentField
