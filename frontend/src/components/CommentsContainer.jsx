import React, { useContext } from "react";
import { BlogContext } from "../pages/BlogPage";
import CommentField from "./CommentField";
import axios from "axios";
import NoData from "./NoData";
import AnimationWrapper from "../common/pageAnimation";
import CommentCard from "./CommentCard";

export const fetchComments = async ({skip = 0, blog_id, setParentCommentCountFun, comment_array = null})=>{
    let res;
    
    await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog-comments`, 
        { blog_id, skip }
    )
    .then(({data})=>{
        data.map(comment=>{
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + data.length );
        
        if(comment_array === null){
            res = { results: data }
        }else{
            res = { results: [...comment_array, ...data] }
        }
    })
    return res;
}

function CommentsContainer() {
	const {blogDetail,
		blogDetail: { _id, title, comments,
            comments: { results: commentsArr },
            activity: { total_parent_comments, }
        },
        setBlogDetail,
		commentsWrapper,
		setCommentsWrapper,
        totalParentsCommentsLoaded,
        setTotalParentsCommentsLoaded
	} = useContext(BlogContext);


    const handleLoadMoreComments = async()=>{
        try {
            let newCommentsArr = await fetchComments({
                skip:totalParentsCommentsLoaded, 
                blog_id:_id, 
                setParentCommentCountFun:setTotalParentsCommentsLoaded,
                comment_array:commentsArr
            });

            setBlogDetail({...blogDetail, comments: newCommentsArr });
            
        } catch (error) {
            console.log(error);
        }
    }

	return (
        <div className={`max-sm:w-full fixed ${commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"} duration-500 max-sm:right-0 sm:top-0 sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[32%] 
        min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-10 
        overflow-y-auto overflow-x-hidden`}>
            <div className='relative'>
                <h1 className='text-2xl font-medium'>Comments</h1>
                <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>
                    {title}
                </p>
                <button 
                    className='w-12 h-12 rounded-full bg-grey absolute top-0 right-0 flex items-center justify-center hover:text-purple' 
                    onClick = {()=> setCommentsWrapper(preVal => !preVal)}
                >
                    <i className='fi fi-br-cross text-xl mt-1'></i>
                </button>
            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10"/>

            <CommentField action="Comment"/>

            {
                commentsArr && commentsArr.length ? 
                commentsArr.map((comment, i)=>{
                    return <AnimationWrapper key={i}>
                        <CommentCard 
                            commentData={comment} 
                            index={i} 
                            leftVal={comment.childrenLevel * 4}
                        />
                    </AnimationWrapper>
                })
                : <NoData message= "No Comments" />
            }

            {
                total_parent_comments > totalParentsCommentsLoaded ? 
                <button 
                    onClick={handleLoadMoreComments}
                    className="text-dark-grey border border-grey p-2 px-3 rounded-md flex items-center gap-2 hover:bg-purple hover:text-white">
                    Load More
                </button>

                : ""
            }
        </div>
	);
}

export default CommentsContainer;
