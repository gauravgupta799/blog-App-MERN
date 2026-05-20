import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/pageAnimation';
import InpageNavigation from '../components/InpageNavigation';
import axios from "axios";
import BlogPost from '../components/BlogPostCard';
import Loader from '../components/Loader';
import BlogPostCard from '../components/BlogPostCard';

function Home() {
  const [latestBlogs , setLatestBlogs] = useState(null);
  const [isLoading , setIsLoading] = useState(true);

  const fetchLatestBlogs = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`);
      const {blogs} = await response.data;
      setLatestBlogs(blogs);
      // console.log(blogs);
      
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(()=>{
    fetchLatestBlogs();
  },[])


  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="latest-blog w-full">
          <InpageNavigation routes={['home', "trending blogs"]} defaultHidden ={["trending blogs"]}>
            <>
              {
                latestBlogs === null ? <Loader/> : latestBlogs.map((blog,i)=>{
                  return (
                    <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                      <BlogPostCard blogContent ={blog} authorInfo={blog.author.personal_info}/>
                    </AnimationWrapper>
                  )
                })
              }
            </>
            {/* <h1>Trending Blogs</h1> */}
          </InpageNavigation>
        </div>
        {/* Filter & Tranding Blogs */}

        
      </section>
    </AnimationWrapper>
  )
}

export default Home;
