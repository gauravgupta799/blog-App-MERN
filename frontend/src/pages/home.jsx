import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/pageAnimation';
import InpageNavigation from '../components/InpageNavigation';
import axios from "axios";
import {Toaster, toast} from "react-hot-toast";
import BlogPost from '../components/BlogPostCard';
import Loader from '../components/Loader';
import BlogPostCard from '../components/BlogPostCard';
import TrendingBlogs from '../components/TrendingBlogs';
import {activeTabRef} from "../components/InpageNavigation";
import NoData from '../components/NoData';
import {filterPaginationData} from "../common/filterPaginationData";
import LoadMoreDataButton from '../components/LoadMoreDataButton';

function Home() {
  const [blogs , setBlogs] = useState(null);
  const [trendingBlogs , setTrendingBlogs] = useState(null);
  const [isLoading , setIsLoading] = useState(true);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming", "tech", "finance", "travel",
     "AI", "software", "tools"
  ]

  const fetchBlogs = async({page = 1})=>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`, {page});
      const data = await response.data;
      let formatedData = await filterPaginationData({
        state:blogs,
        data:data.blogs,
        page,
        countRoute:"/all-latest-blogs-count"
      });
      setBlogs(formatedData);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchTrendingBlogs = async ()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`);
      const {blogs} = await response.data;
      setTrendingBlogs(blogs);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchBlogsByCategory = async ({page=1})=>{
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {tag: pageState, page});
      const data = await res.data;
      let formatedData = await filterPaginationData({
        state:blogs,
        data:data.blogs,
        page,
        countRoute:"/search-blogs-count",
        data_to_send: {tag:pageState}
      });
      setBlogs(formatedData);
    } catch (error) {
      console.log(error);
    }
  }

  const handlepageState = (e)=>{
    let category = e.target.innerText.toLowerCase();
    setBlogs(null);
    if(pageState === category){
      setPageState("home");
      return;
    }
    setPageState(category);
  }

  useEffect(()=>{
    pageState === "home" ? fetchBlogs({page: 1}) : fetchBlogsByCategory({page:1});

    if(pageState) fetchTrendingBlogs()
    activeTabRef.current.click();

  },[pageState])


  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          <div className="latest-blog w-full">
            <InpageNavigation routes={[pageState, "trending blogs"]} defaultHidden ={["trending blogs"]}>
            <>
              {
                blogs === null ? (<Loader/> ): (
                  blogs?.results.length ? blogs.results.map((blog, i)=>{
                    return (
                      <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                        <BlogPostCard blogContent ={blog} authorInfo={blog.author.personal_info}/>
                      </AnimationWrapper>
                    )
                  })
                  :
                  <NoData message="No Blogs Published"/>
                ) 
              }
              <LoadMoreDataButton state={blogs} fetchDataFun={pageState === "home" ? fetchBlogs : fetchBlogsByCategory}/>
            </>

            <>
              {
                trendingBlogs === null ? <Loader/> :
                trendingBlogs.length ? trendingBlogs.map((blog, i)=>{
                  return (
                    <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                      <TrendingBlogs blog={blog} index={i} />
                    </AnimationWrapper>
                  )
                }) 
                : <NoData message="No Trending Blogs Found "/>
              }
            </>
            </InpageNavigation>
          </div>

          <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
              <div>
                <h1 className="font-medium text-xl mb-8 capitalize">Stories from all interests</h1>
                <div className="flex gap-3 flex-wrap">
                {
                  categories.map((category, i)=>{
                    return (
                      <button 
                        key={i} 
                        className={`tag hover:bg-black hover:text-white ${pageState === category.toLowerCase() && "bg-black text-white"}`} 
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
                  trendingBlogs === null ? <Loader/> : 
                  trendingBlogs.length ? trendingBlogs.map((blog, i)=>{
                    return (
                      <AnimationWrapper transition={{duration:1, delay:i * 0.2}} key={i}>
                        <TrendingBlogs blog={blog} index={i} />
                      </AnimationWrapper>
                    )
                  })
                  :
                  <NoData message="No Trending Blogs Found "/>
                }
              </div>
            </div>
          </div>
        </section>
        <Toaster/>
      </AnimationWrapper>
    </>
  )
}

export default Home;
