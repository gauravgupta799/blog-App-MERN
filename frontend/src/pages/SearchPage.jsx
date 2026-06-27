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
import UserCard from '../components/UserCard';

function SearchPage() {
    const [blogs , setBlogs] = useState(null);
    const [users, setUsers] = useState(null);
    let {query} = useParams();

    // Fetch Blogs through search query
    const searchBlogs = async ({page = 1, create_new_arr = false})=>{
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {query, page});
            const data = await response.data;
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

    // Fetch Users through search query (username)
    const fetchUsers = async()=>{
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-users`, {query});
            const  usersData = await res.data.users;
            setUsers(usersData);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        resetState();
        searchBlogs({page:1, create_new_arr: true});
        fetchUsers();
    },[query]);

    const resetState =()=>{
        setBlogs(null);
        setUsers(null);
    }

    const UserCardWrapper =()=>{
        return (
            <>
                {
                    users === null ? <Loader/> : users.length ? 
                    users.map((user, i)=>{
                        return (
                            <AnimationWrapper key={i} transition={{duration:1, delay: i*0.08 }}>
                                <UserCard user={user}/>
                            </AnimationWrapper>
                        )
                    })
                    :
                    <NoData message="No User found"/>
                }

            </>
        )
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
                <>
                    <UserCardWrapper/>
                </>
            </InpageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
            <h1 className="font-medium text-xl mb-8">
                User related to search <i className="fi fi-rr-user mt-1"></i>
            </h1>
            <UserCardWrapper/>
        </div>
    </section>
  )
}

export default SearchPage
