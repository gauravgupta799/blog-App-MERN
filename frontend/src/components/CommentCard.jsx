import React, {useState, useContext} from 'react'
import { getDay } from '../common/date';
import { userContext } from '../App';
import toast from "react-hot-toast";
import CommentField from './CommentField';

function CommentCard({commentData, index, leftVal}) {

    const { _id, commentedAt, comment,
        commented_by: {
            personal_info: { fullname, username, profile_img } 
        },
     
    } = commentData;

    const {userAuth: { access_token }} = useContext(userContext)

    const [isReplying , setIsReplying] = useState(false);

    const handleReply =()=>{
        if(!access_token){
            return toast.error("Login first to leave a reply");
        }
        setIsReplying(preVal => !preVal);
    }
    
    
  return (
    <div className= "w-full" style={{paddingLeft:`${leftVal * 10}px`}}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
            <img src={profile_img} alt={username} className="w-6 h-6 rounded-full" />
            <p className="line-clam-1">{fullname} @{username}</p>
            <p>{getDay(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">
            {comment}
        </p>

        <div className="flex gap-5 items-center mt-5">
            <button className="underline" onClick={handleReply}>
                Reply
            </button>
        </div>

        {
            isReplying && (
                <div className="mt-8">
                    <CommentField 
                        action="Reply" 
                        index={index}
                        replyingTo={_id}
                        setReplying={setIsReplying}
                    />
                </div>
            ) 
        }

      </div>
    </div>
  )
}

export default CommentCard
