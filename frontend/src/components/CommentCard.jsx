import React, {useState, useContext} from 'react'
import { getDay } from '../common/date';
import { userContext } from '../App';
import toast from "react-hot-toast";
import CommentField from './CommentField';
import { BlogContext } from '../pages/BlogPage';
import axios from "axios";

function CommentCard({commentData, index, leftVal}) {

    const { _id, commentedAt, comment, children,
        commented_by: {
            personal_info: { fullname, username: commented_by_username, profile_img } 
        },
    } = commentData;

    const {userAuth, userAuth: { access_token, username }} = useContext(userContext);

    const { blogDetail, setBlogDetail, setTotalParentsCommentsLoaded,
        blogDetail: { comments, activity,
            activity:{
                total_parent_comments
            },
            comments: { 
                results: commentsArr 
            },
            author:{
                personal_info: { username: blog_author_username }
            }
        }, 
      
    } = useContext(BlogContext);

    const [isReplying , setIsReplying] = useState(false);

    const handleReplyClick =()=>{
        if(!access_token){
            return toast.error("Login first to leave a reply");
        }
        setIsReplying(preVal => !preVal);
    }

    const getParentIndex =()=>{
        let startingPoint = index - 1;
        try {
            while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel){
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined;
        }
        return startingPoint;
    }

    const removeCommentsCard=(startingPoint, isDelete = false)=>{
        if(commentsArr[startingPoint]){
            while(commentsArr[startingPoint].childrenLevel > commentData.childrenLevel){
                commentsArr.splice(startingPoint, 1);

                if(!commentsArr[startingPoint]){
                    break;
                }
            }
        }

        if(isDelete){
            let parentIndex = getParentIndex();

            if(parentIndex !== undefined){
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child !== _id)
                if(!commentsArr[parentIndex].children.length){
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }
            commentsArr.splice(index, 1);
        }

        if(commentData.childrenLevel === 0 && isDelete){
            setTotalParentsCommentsLoaded(preVal => preVal - 1)
        }

        setBlogDetail({
            ...blogDetail, 
            comments: { results: commentsArr } ,
            activity: { 
                ...activity, 
                total_parent_comments: total_parent_comments - commentData.childrenLevel === 0 && isDelete ? 1 : 0
            }
        });
    }

    const handleReplies = ()=>{
        commentData.isReplyLoaded = false;
        removeCommentsCard(index + 1);
    }

    const loadReplies =({skip = 0, currentIndex = index })=>{
        if(commentsArr[currentIndex].children.length){
            handleReplies();

            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, {_id: commentsArr[currentIndex]._id, skip })
            .then(({data: { replies }})=>{
                commentsArr[currentIndex].isReplyLoaded = true;

                for(let i = 0; i < replies.length; i++){
                    replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;
                    commentsArr.splice(currentIndex + 1 + i + skip, 0 , replies[i])
                }

                setBlogDetail({
                    ...blogDetail, 
                    comments: { ...comments, results: commentsArr }
                });
            })
            .catch(error => {
                console.log(error)
            })
        }
    }

    const deleteComment =(e)=>{
        e.target.setAttribute("disabled", true);

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, {_id},
            {
                headers:{
                    "Authorization":`Bearer ${access_token}`
                }
            }
        )
        .then((data)=>{
            e.target.removeAttribute("disabled");
            removeCommentsCard(index + 1 , true);
        })
        .catch(error=>{
            console.log(error);
        })
    
    }

    const LoadMoreRepliesButton = ()=>{

        let parentIndex = getParentIndex();

        const Button = <button 
                            onClick={()=>loadReplies({skip: index - parentIndex, currentIndex: parentIndex})} 
                            className="text-dark-grey p-2 px-3 rounded-md flex items-center gap-2 hover:bg-grey/30"
                        >
                            Load More Replies
                        </button>

        if(commentsArr[index + 1]){
            if(commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel){
                if((index - parentIndex) < commentsArr[parentIndex].children.length){
                    return Button;
                }
            }
        } else{
            if(parentIndex){
                if((index - parentIndex) < commentsArr[parentIndex].children.length){
                    return Button;
                }
            }
        }
    }

  return (
    <div className= "w-full" style={{paddingLeft:`${leftVal * 10}px`}}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
            <img src={profile_img} alt={commented_by_username} className="w-6 h-6 rounded-full" />
            <p className="line-clam-1">@{commented_by_username}</p>
            <p>{getDay(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex items-center gap-5 mt-5">
            {
                commentData.isReplyLoaded ? 
                <button 
                    className='text-dark-grey p-2 px-3 flex items-center gap-2 hover:bg-grey/30'
                    onClick={handleReplies}
                >
                    {/* <i className="fi fi-rs-comment-dots"></i> Hide Reply */}
                    Hide Reply
                </button>
                : 
                <button 
                    className='text-dark-grey p-2 px-3 rounded-md flex items-center gap-2 hover:bg-grey/30'
                    onClick={loadReplies}
                >
                    <i className="fi fi-rs-comment-dots"></i> {children.length} {children.length > 1 ? " Replies" : " Reply"}
                </button>
            }

            <div className="flex gap-5 items-center">
                <button className="underline" onClick={handleReplyClick}>
                    Reply
                </button>
            </div>

            { 
                username === commented_by_username || username === blog_author_username ?
                <button className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
                    onClick={deleteComment}
                >
                    <i className="fi fi-rr-trash pointer-events-none"></i>
                </button>
                : ""
            }

        </div>

        {
            isReplying ?
            <div className="mt-8">
                <CommentField 
                    action="Reply" 
                    index={index}
                    replyingTo={_id}
                    setReplying={setIsReplying}
                />
            </div>
            : ""
        }
      </div>

      <LoadMoreRepliesButton/>
    </div>
  )
}

export default CommentCard
