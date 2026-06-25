import React,{useState, useContext, useEffect} from 'react';
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import {userContext} from "../App";
import { filterPaginationData } from '../common/filterPaginationData';
import InpageNavigation from '../components/InpageNavigation';
import Loader from '../components/Loader';
import NoData from '../components/NoData';
import AnimationWrapper from '../common/pageAnimation';
import {ManagePublishedBlogCard, ManageDraftBlogCard} from '../components/ManagePublishedBlogCard';
import LoadMoreDataButton from '../components/LoadMoreDataButton';
import { useSearchParams } from 'react-router-dom';


function ManageBlogs() {
    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState(null);

    const {userAuth: { access_token }} = useContext(userContext);

    const activeTab = useSearchParams()[0].get("tab");

    const getBlogs = ({page, draft, deletedDocCount=0})=>{

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/user-written-blogs`, { page, draft}, {
            headers:{
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(async ({data})=>{
            let formatedData = await filterPaginationData({
                state:draft ? drafts : blogs,
                data:data.blogs, 
                page,
                user: access_token,
                countRoute: "/user-written-blogs-count",
                data_to_send:{ draft, query }
            });

            if(draft){
                setDrafts(formatedData);
            } else{
                setBlogs(formatedData);
            }
        })
        .catch(err=>{
            console.log(err);
        })
    }

    useEffect(()=>{
        if(access_token){
            if(blogs===null){
                getBlogs({page:1, draft:false})
            }
            if(drafts===null){
                getBlogs({page:1, draft:true})
            }
        }

    },[access_token, blogs, drafts, query])


    const handleSearch =(e)=>{
        let searchQuery = e.target.value;
        setQuery(searchQuery);

        if(e.keyCode === 13 && searchQuery.length){
            setBlogs(null);
            setDrafts(null);
        }
    }

    const handleChange=(e)=>{
        if(!e.target.value.length){
            setQuery("");
            setBlogs(null);
            setDrafts(null);
        }
    }

    // console.log(activeTab)

  return (
    <>
        <h1 className="max-md:hidden">Manage Blogs</h1>
        <Toaster/>

        <div className="relative max-md:mt-5 md:mt-8 mb-10">
            <input 
                type="search" 
                placeholder="Search Blog..."
                className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
                onChange={handleChange}
                onKeyDown={handleSearch}
            />
            <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        <InpageNavigation routes={["Published Blogs", "Draft"]} defaultActiveIndex={activeTab !== "draft" ? 0 : 1}>
            {
                blogs === null ? <Loader/> : 
                blogs.results.length ?
                <>
                    {
                        blogs.results.map((blog, i)=>{
                            return <AnimationWrapper key={i} transition={{delay: i * 0.04 }}>
                                <ManagePublishedBlogCard blog={{...blog, index: i, setStateFunc:setBlogs}} />
                            </AnimationWrapper>
                        })
                    }
                    <LoadMoreDataButton
                        state={blogs}
                        fetchDataFun={getBlogs}
                        additionalParams={{draft:false, deletedDocCount: blogs.deletedDocCount}}
                    />
                </>
                : <NoData message="No Published Blogs"/>
            }

            {
                drafts === null ? <Loader/> : 
                drafts.results.length ?
                <>
                    {
                        drafts.results.map((blog, i)=>{
                            return <AnimationWrapper key={i} transition={{delay: i * 0.04 }}>
                                <ManageDraftBlogCard blog={{...blog, index: i, setStateFunc:setDrafts}}/>
                            </AnimationWrapper>
                        })
                    }

                    <LoadMoreDataButton
                        state={drafts}
                        fetchDataFun={getBlogs}
                        additionalParams={{draft:true, deletedDocCount: drafts.deletedDocCount}}
                    />
                </>
                : <NoData message="No Draft Blogs"/>
            }

        </InpageNavigation>

      
    </>
  )
}

export default ManageBlogs
