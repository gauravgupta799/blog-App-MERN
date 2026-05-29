import React, {useState, useEffect, useContext} from 'react';
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import Loader from '../components/Loader';
import AnimationWrapper from '../common/pageAnimation';
import { userContext } from '../App';
import AboutUser from '../components/AboutUser';


const profileDataStructure ={
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
            setProfile(userProfileData);
            setIsLoading(false);
            // console.log(userProfileData);
     
        } catch (error) {
            console.log(error.message);
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        resetState();
        fetchUserProfile();
    },[profileId]);

    const resetState=()=>{
        setProfile(profileDataStructure);
        setIsLoading(true);
    }


    console.log( profileId, profile_username)
  return (
    <AnimationWrapper>
        {
            isLoading ? <Loader/> : 
            <section className="h-cover md:flex flex-row-reverse items-center gap-5 min-[1100px]:gap-12">
                <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">
                    <img src={profile_img} alt={profile_username} className="w-40 h-40 bg-grey rounded-full md:w-32 md:h-32" />
                    <h1 className="text-2xl font-medium">@{profile_username}</h1>
                    <p className="text-xl capitalize h-6">{fullname}</p>
                    <p className="">{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>

                    <div className="flex gap-4 mt-2">
                        {
                            profileId === username ?
                                <Link to="/setting/edit-profile" className="btn-light rounded-md">Edit Profile</Link>
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
            </section>
        }
    </AnimationWrapper>
  )
}

export default UserProfile;
