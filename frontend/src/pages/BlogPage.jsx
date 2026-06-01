import React,{useState, useEffect, createContext} from 'react';
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import AnimationWrapper from '../common/pageAnimation';
import Loader from '../components/Loader';
import { getDay } from '../common/date';
import BlogInteraction from '../components/BlogInteraction';

export const blogStructure = {
    title:"",
    banner:"",
    desc:"",
    content:[],
    tags:[],
    author:{personal_info: {}},
    activity:"",
    publishedAt:""
}

export const BlogContext = createContext({});

function BlogPage() {
    const [blogDetail, setBlogDetail]= useState(blogStructure);
    const [loading, setLoading] = useState(true);

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
            const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, {blog_id:id});
            const {blog} = await response.data;
            setLoading(false);
            setBlogDetail(blog);
            // console.log(blog);
        } catch (error) {
            console.log(error);
        }
    }
    

    useEffect(()=>{
        fetchBlogDetail();
    },[])

  return (
    <AnimationWrapper>
    {
        loading ? <Loader/> 
        : 
        <BlogContext.Provider value={{blogDetail, setBlogDetail}}>
            <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                <img src={banner} alt="" className="aspect-video" />

                <div className="mt-12">
                    <h2 className="blog-title">{title}</h2>

                    <div className="flex max-sm:flex-col justify-between my-8">
                        <div className="flex gap-5 items-center">
                            <img src={profile_img} alt="author-profile-image" className="w-14 h-14 rounded-full" />

                            <p className="capitalize">
                                {fullname} <br />
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
            </div>
        </BlogContext.Provider>
    }

    </AnimationWrapper>
  )
}

export default BlogPage;
