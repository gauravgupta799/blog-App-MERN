import React,{useState, useEffect} from 'react';
import {useParams} from "react-router-dom";
import AnimationWrapper from '../common/pageAnimation';
import InpageNavigation from '../components/InpageNavigation';
import Loader from '../components/Loader';
import BlogPostCard from '../components/BlogPostCard';
import NoData from '../components/NoData';
import {filterPaginationData} from "../common/filterPaginationData";
import LoadMoreDataButton from '../components/LoadMoreDataButton';
import axios from 'axios';

function SearchPage() {
    const [blogs , setBlogs] = useState(null);
    let {query} = useParams();

    const searchBlogs = async ({page = 1, create_new_arr = false})=>{
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {query, page});
            const data = await response.data;
            // console.log(data);
            let formatedData = await filterPaginationData({
                state:blogs,
                data:data.blogs,
                page,
                countRoute:"/search-blogs-count",
                data_to_send: {query},
                create_new_arr
            });
            setBlogs(formatedData);

        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(()=>{
        resetState();
        searchBlogs({page:1, create_new_arr: true});
    },[query]);

    const resetState =()=>{
        setBlogs(null);
    }


  return (
    <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
            <InpageNavigation routes = {[`Search Results from ${query}`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
                <>
                    {
                        blogs === null ? (<Loader/> ): (
                        blogs.results.length ? blogs.results.map((blog, i)=>{
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
                    <LoadMoreDataButton state={blogs} fetchDataFun={searchBlogs}/>
                </>
            </InpageNavigation>
        </div>
    </section>
  )
}

export default SearchPage
