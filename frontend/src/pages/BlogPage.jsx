import React,{useState, useEffect, createContext} from 'react';
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import AnimationWrapper from '../common/pageAnimation';
import Loader from '../components/Loader';
import { getDay } from '../common/date';
import BlogInteraction from '../components/BlogInteraction';
import BlogPostCard from '../components/BlogPostCard';
import BlogContent from '../components/BlogContent';
import CommentsContainer, { fetchComments } from "../components/CommentsContainer";


export const blogStructure = {
    title:"",
    banner:"",
    desc:"",
    content:[],
    author:{personal_info: {}},
    activity:"",
    publishedAt:""
}

export const BlogContext = createContext({});

function BlogPage() {
    const [blogDetail, setBlogDetail]= useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [isLikedByUser, setIsLikedByUser] = useState(false);
    const [commentsWrapper , setCommentsWrapper] = useState(true);
    const [totalParentsCommentsLoaded, setTotalParentsCommentsLoaded] = useState(0);

    const { title, banner, content, 
        author:{
            personal_info: {
                fullname, 
                username:author_username,
                profile_img
            }
        },
        publishedAt
    } = blogDetail;

    const {id} = useParams();

    const fetchBlogDetail= async()=>{
        try {
            // fetch blog
            const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id:id });
            const {blog} = response.data;

            // Fetch Comments
            blog.comments = await fetchComments({
                blog_id: blog._id, 
                setParentCommentCountFun: setTotalParentsCommentsLoaded
            })

            setBlogDetail(blog);

            console.log("Blog Comment Data:", blog) 

            // Stop if no tags are available
            if (!blog.tags?.length) {
                return;
            }

            // Fetch Similar Blogs
            const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                    tag: blog.tags[0], limit:6, eliminate_blog:id
                }
            )
            const data = res.data;
            setSimilarBlogs(data.blogs);

        } catch (error) {
            console.error("Error fetching blog details:", error);
             // More detailed debugging
            if (error.response) {
                console.log("Server Response:", error.response.data);
                console.log("Status:", error.response.status);
            }
        } finally {
            setLoading(false);
        }
    }
    

    useEffect(()=>{
        resetState();
        fetchBlogDetail();
    },[id]);

    const resetState= ()=>{
        setBlogDetail(blogStructure)
        setSimilarBlogs(null);
        setLoading(true);
        setCommentsWrapper(false);
        setTotalParentsCommentsLoaded(0)
    }

    // console.log(content[0]?.blocks)

  return (
    <AnimationWrapper>
    {
        loading ? <Loader/> : 
        <BlogContext.Provider value={{
            blogDetail, setBlogDetail, isLikedByUser, setIsLikedByUser,
            commentsWrapper, setCommentsWrapper, 
            totalParentsCommentsLoaded, setTotalParentsCommentsLoaded
        }}>

            <CommentsContainer/>

            <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                <img src={banner} alt="" className="aspect-video" />
                <div className="mt-12">
                    <h2 className="blog-title">{title}</h2>
                    <div className="flex max-sm:flex-col justify-between my-8">
                        <div className="flex gap-5 items-center">
                            <img src={profile_img} alt="author-profile-image" className="w-14 h-14 rounded-full" />
                            <p className="capitalize">
                                <strong className="text-xl">{fullname}</strong> <br />
                                @<Link to={`/user/${author_username}`} className="underline">
                                    {author_username}
                                </Link>
                            </p>
                        </div>
                        <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                            Published on {getDay(publishedAt)}
                        </p>
                    </div>
                </div>

                <BlogInteraction/>

                <div className="my-12 font-gelasio blog-page-content">
                    {
                        content[0]?.blocks.map((block, i)=>{
                            return (
                                <div className="my-4 md:my-8" key={i}>
                                    <BlogContent block={block}/>
                                </div>
                            )
                        })
                    }
                </div>

                <BlogInteraction/>

                {
                    similarBlogs !== null && similarBlogs.length ? 
                    <>
                        <h1 className="text-2xl my-12 font-medium">Similar Blogs</h1>
                        {
                            similarBlogs.map((sBlog, i)=>{
                                const {author: {personal_info}} = sBlog;
                                return <AnimationWrapper key={i} transition={{duration:1, delay:i*0.5}}>
                                        <BlogPostCard blogContent ={sBlog} authorInfo={sBlog.author.personal_info}/>
                                </AnimationWrapper>
                            })
                        }
                    </>
                    : ""
                } 
            </div>
        </BlogContext.Provider>
    }

    </AnimationWrapper>
  )
}

export default BlogPage;
