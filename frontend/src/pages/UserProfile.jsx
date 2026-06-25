import React, {useState, useEffect, useContext} from 'react';
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import Loader from '../components/Loader';
import AnimationWrapper from '../common/pageAnimation';
import { userContext } from '../App';
import AboutUser from '../components/AboutUser';
import {filterPaginationData} from "../common/filterPaginationData";
import InpageNavigation from '../components/InpageNavigation';
import BlogPostCard from '../components/BlogPostCard';
import NoData from '../components/NoData';
import LoadMoreDataButton from '../components/LoadMoreDataButton';
import PageNotFound from './PageNotFound';


export const profileDataStructure ={
    personal_info:{
        fullname:"", username:"", profile_img:"", bio:""
    },
    account_info:{
        total_posts:0,
        total_reads:0,
    },
    social_links:{
        joinedAt:""
    }
}

function UserProfile() {
    const [profile, setProfile] = useState(profileDataStructure);
    const [isLoading, setIsLoading] = useState(true);
    const [blogs , setBlogs] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState("");

    const { id:profileId } = useParams();

    const {
        personal_info: { fullname, username: profile_username, profile_img, bio },
        account_info:{ total_posts, total_reads },
        social_links, joinedAt
    } = profile;


    const {userAuth: {username}} = useContext(userContext);

    const fetchUserProfile = async()=>{
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-user-profile`, {username:profileId});
            const userProfileData = await res.data;
            if(userProfileData !== null){
                setProfile(userProfileData);   
            }
            setProfileLoaded(profileId);
            getBlogs({user_id: userProfileData._id})
            setIsLoading(false);

        } catch (error) {
            console.log(error.message);
            setIsLoading(false);
        }
    }

    const getBlogs = async ({page=1 , user_id})=>{
        try {
            user_id = user_id === undefined ? blogs.user_id : user_id;

            const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {author: user_id, page})
            const data = await res.data;
            let formatedData = await filterPaginationData({
                state:blogs,
                data:data.blogs,
                page,
                countRoute:"/search-blogs-count",
                data_to_send: { author: user_id }
            });

            formatedData.user_id = user_id;
            // console.log(formatedData);
            setBlogs(formatedData);
            
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        if(profileId !== profileLoaded){
           setBlogs(null);
        }

        if(blogs === null){
            resetState();
            fetchUserProfile();
        }
    },[profileId, blogs]);

    const resetState=()=>{
        setProfile(profileDataStructure);
        setIsLoading(true);
        setProfileLoaded("")
    }


  return (
    <AnimationWrapper>
        {
            isLoading ? <Loader/> : 
            profile_username.length ?
                <section className="h-cover md:flex flex-row-reverse items-center gap-5 min-[1100px]:gap-12">
                    <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10">
                        <img src={profile_img} alt={profile_username} className="w-40 h-40 bg-grey rounded-full md:w-32 md:h-32" />
                        <h1 className="text-2xl font-medium">@{profile_username}</h1>
                        <p className="text-xl capitalize h-6">{fullname}</p>
                        <p className="">{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
                        <div className="flex gap-4 mt-2">
                            {
                                profileId === username ?
                                    <Link to="/settings/edit-profile" className="btn-light rounded-md">Edit Profile</Link>
                                : ""
                            }
                        </div>
                        <AboutUser 
                            className ="max-md:hidden" 
                            bio={bio} 
                            socialLinks={social_links} 
                            joinedAt={joinedAt}
                        />
                    </div>

                    <div className="w-full max-md:mt-12">
                        <InpageNavigation routes={["Blogs Published", "About"]} defaultHidden ={["About"]}>
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
                                <LoadMoreDataButton state={blogs} fetchDataFun={getBlogs}/>
                            </>
                            <AboutUser bio={bio}  socialLinks={social_links}  joinedAt={joinedAt} />
                        </InpageNavigation>
                    </div>
                </section>
            : <PageNotFound/>
        } 
    </AnimationWrapper>
  )
}

export default UserProfile;
