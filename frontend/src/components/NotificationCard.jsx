import React, {useState, useContext} from 'react'
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import NotificationCommentField from './NotificationCommentField';
import { userContext } from "../App";
import axios from "axios";


function NotificationCard ({data, index, notificationState}) {

    const {seen, reply, type, comment, replied_on_comment, createdAt, user, 
        _id: notification_id,
        blog: { _id, title },
        user: { personal_info: { fullname, username, profile_img }}
    } = data;

    const {userAuth: { username: author_username, profile_img: author_profile_img, access_token}} = useContext(userContext);

    const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    const [isReplying , setIsReplying ] = useState(false);

    const handleReplyClick =()=>{
        setIsReplying(preVal=> !preVal);
    }

    const handleDelete =(comment_id, type, target)=>{

        target.setAttribute("disabled", true);

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, { _id: comment_id}, {
            headers:{
                "Authorization":`Bearer ${access_token}`
            }
        })
        .then(()=>{
            if(type === "comment"){
                results.splice(index, 1);
            }else{
                delete results[index].reply
            }

            target.removeAttribute("disabled");
            setNotifications({
                ...notifications, 
                results, 
                totalDocs: totalDocs - 1, 
                deletedDocCount: notifications.deletedDocCount + 1
            })
        })
        .catch(err=>{
            console.log(err);
        })
    }

  return (
    <div className={"p-6 border-b border-grey border-l-black" + ( !seen && "border-l-2" )}>
        <div className="flex gap-5 mb-3">
            <img src={profile_img} className="w-14 h-14 flex-none rounded-full" alt=""/>
            <div className="w-full">
                <h1 className="flex gap-3 text-xl text-dark-grey">
                    <span className="lg:inline-block hidden capitalize">{fullname}</span>
                    <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                    <span className="font-normal">
                        {
                            type === "like" ? "Liked your blog": 
                            type === "comment" ? "Commented on" : "Replied on"
                        }
                    </span>
                </h1>
                {
                    type=== "reply" ?
                    <div className="">
                        <p className=" p-4 mt-4 rounded-md bg-grey">
                            {replied_on_comment.comment}
                        </p>
                    </div>
                    :
                    <Link to={`/blog/${_id}`} className="inline font-medium text-dark-grey line-clamp-1 hover:underline">
                        {`"${title}"`}
                    </Link>
                }
            </div>
        </div>
        {
            type !== "like" &&
            <p className="ml-14 pl-5 font-gelasio text-xl my-5">
                {comment.comment}
            </p>
        }

        <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
            <p className="">{getDay(createdAt)}</p>
            {
                type !== "like" && 
                <>
                    {
                        !reply &&
                        <button className="underline hover:text-black" onClick={handleReplyClick}>
                            Relpy
                        </button>
                    }

                    <button className="underline hover:text-black" 
                    onClick={(e)=>handleDelete(comment._id, "comment", e.target)}
                    >Delete</button>
                </>
            }
        </div>

        {
            isReplying && 
            <div className="mt-8">
               <NotificationCommentField
                _id={_id}
                blog_author={user}
                index={index}
                replyingTo={comment._id}
                setReplying={setIsReplying}
                notification={notification_id}
                notificationData={notificationState}
               />
            </div>
        }

        {
            reply &&
            <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
                <div className="flex gap-4 mb-3">
                    <img src={author_profile_img}className="w-8 h-8 rounded-full" />

                    <div>
                        <h1 className="font-medium text-xl text-dark-grey">
                            <Link to={`/user/${author_username}`} className="mx-1 text-black underline">
                                @{author_username}
                            </Link>

                            <span className="font-normal">replied to</span>

                            <Link to={`/user/${username}`} className="mx-1 text-black underline">
                                @{username}
                            </Link>

                        </h1>
                    </div>
                </div>

                <p className="font-gelasio ml-14 text-xl my-2">
                    {reply.comment}
                </p>

                <button className="underline hover:text-black ml-14 mt-2" 
                onClick={(e)=> handleDelete(comment._id, "reply", e.target)}>
                    Delete
                </button>

            </div> 
        }

    </div>
  )}

export default NotificationCard;
