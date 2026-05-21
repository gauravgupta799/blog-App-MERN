import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/pageAnimation';
import InpageNavigation from '../components/InpageNavigation';
import axios from "axios";
import BlogPost from '../components/BlogPostCard';
import Loader from '../components/Loader';
import BlogPostCard from '../components/BlogPostCard';
import TrendingBlogs from '../components/TrendingBlogs';
import {activeTabRef} from "../components/InpageNavigation";

function Home() {
  const [latestBlogs , setLatestBlogs] = useState(null);
  const [trendingBlogs , setTrendingBlogs] = useState(null);
  const [isLoading , setIsLoading] = useState(true);
  const [pageState, setPageState] = useState("home")

  const categories = [
    "programming", "tech", "finance", "travel",
     "AI", "tools", "software", "tag1", "inpsection"
  ]

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

  const fetchTrendingBlogs = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`);
      const {blogs} = await response.data;
      setTrendingBlogs(blogs);
      // console.log(blogs);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchBlogsByCategory = async ()=>{
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {tag: pageState});
      const {blogs} = await res.data;
      setLatestBlogs(blogs);
      // console.log(blogs);
      
    } catch (error) {
      console.log(error);
    }
  }

  const handlepageState = (e)=>{
    let category = e.target.innerText.toLowerCase();
    setLatestBlogs(null);
    if(pageState === category){
      setPageState("home");
      return;
    }
    setPageState(category);
  }

  useEffect(()=>{
    if(pageState === "home") {
      fetchLatestBlogs()
    }else{
      fetchBlogsByCategory();
    }

    if(pageState) fetchTrendingBlogs()
    activeTabRef.current.click();

  },[pageState])


  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="latest-blog w-full">
          <InpageNavigation routes={[pageState, "trending blogs"]} defaultHidden ={["trending blogs"]}>
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
            {
              trendingBlogs === null ? <Loader/> : trendingBlogs.map((blog, i)=>{
                return (
                  <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                    <TrendingBlogs blog={blog} index={i} />
                  </AnimationWrapper>
                )
              })
            }
          </InpageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Stroies from all interests</h1>
              <div className="flex gap-3 flex-wrap">
              {
                categories.map((category, i)=>{
                  return (
                    <button 
                      key={i} 
                      className={`tag ${pageState === category.toLowerCase() ? "bg-black text-white" : ""}`} 
                      onClick={handlepageState}
                    >
                      {category}
                    </button>
                  )
                })
              }
              </div>
            </div>
            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {
                trendingBlogs === null ? <Loader/> : trendingBlogs.map((blog, i)=>{
                  return (
                    <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                      <TrendingBlogs blog={blog} index={i} />
                    </AnimationWrapper>
                  )
                })
              }
            </div>
          </div>
        </div>

      </section>
    </AnimationWrapper>
  )
}

export default Home;
