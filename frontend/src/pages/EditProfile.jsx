import React,{useContext, useEffect, useState, useRef} from 'react';
import { userContext } from '../App';
import AnimationWrapper from "../common/pageAnimation";
import axios from "axios";
import { profileDataStructure } from './UserProfile';
import Loader from '../components/Loader';
import { Toaster, toast } from 'react-hot-toast';
import Input from '../components/input';
import { uploadImage } from '../common/aws';
import { storeSession } from '../common/session';


function EditProfile() {

  const {userAuth, userAuth: { access_token }, setUserAuth } = useContext(userContext);
  const bioLimit = 150;

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading , setLoading] = useState(true);
  const [charsLeft, setCharsLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  const profileImageEl = useRef();
  const formRef = useRef();


  const { 
    personal_info: { 
      fullname, 
      username:profile_username, 
      profile_img, 
      email, 
      bio
    },
    social_links
  } = profile;


  const handleCharsLimit =(e)=>{
    setCharsLeft(bioLimit - e.target.value.length)
  }

  const handleImagePreview =(e)=>{
    const imgFile = e.target.files[0];

    profileImageEl.current.src = URL.createObjectURL(imgFile);
    setUpdatedProfileImg(imgFile);
  }

  const handleUploadProfileImg =(e)=>{
    e.preventDefault();

    if(updatedProfileImg){
      let loadingToast = toast("Image Uploading....");
      e.target.setAttribute("disabled", true);

      uploadImage(updatedProfileImg)
      .then(url=>{
        if(url){
          axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/update-profile-img`, { url }, {
            headers:{
              "Authorization": `Bearer ${access_token}`
            }
          })
          .then(({ data })=>{
            let newUserAuth = { ...userAuth, profile_img: data.profile_img }

            storeSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
            setUpdatedProfileImg(null);

            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Profile Image Updated");
          })
          .catch(({response})=>{
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
            console.log(response);
          })
        }
      })
      .catch(error=>{
        console.log(error.message);
      })
    }
  }

  // Form Submission function
  const handleSubmit =(e)=>{
    e.preventDefault();

    let form = new FormData(formRef.current);
    let formData ={};

    for(let [key, value] of form.entries()){
      formData[key] = value;
    }

    let {username, bio, youtube, instagram, facebook, twitter, github, website } = formData;

    if(username.length < 3){
      return toast.error("Username should be at least 3 letters long")
    }
    if(bio.lnegth > bioLimit){
      return toast.error(`Bio shouldn't be more than ${bioLimit}`)
    }

    let loadingToast = toast.loading("Updating....");
    e.target.setAttribute("disabled", true);

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/update-profile`, 
      { username, bio,
        social_links: { youtube, instagram, facebook, twitter, github, website }
      },
      {
        headers:{
          "Authorization": `Bearer ${access_token}`
        }
      }
    )
    .then(({data})=>{
      if(userAuth.username !== data.username){
        let newUserAuth = {...userAuth, username: data.username }

        storeSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
      }

      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      toast.success("Profile Updated");
    })
    .catch(({response})=>{
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      toast.error(response.data.error);
    })

  }


  useEffect(()=>{

    if(access_token){
      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-user-profile`, { 
          username: userAuth.username 
        }
      )
      .then(({data})=>{
        setProfile(data);
        setLoading(false);
        // console.log(data);
      })
      .catch(error=>{
        console.log(error);
      })
    }

  },[access_token]);

  // console.log(profile_img)

  return (
      <AnimationWrapper>
          {
            loading ? <Loader/> : 
            <form ref={formRef}>
              <Toaster/>

              <h1 className="max-md:hidden"> Edit Profile</h1>
              <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                <div className="max-lg:center">
                    <label htmlFor="uploadImage" className="relative block w-40 h-40 bg-grey rounded-full overflow-hidden">
                      <img src={profile_img} alt={profile_username} ref={profileImageEl}/>
                      <div className="w-full h-full absolute top-0 l-eft-0 flex items-center justify-center text-white bg-black/50 cursor-pointer opacity-0 hover:opacity-100">
                        Upload Image
                      </div>
                    </label>
                    <input type="file" name="file" id="uploadImage" accept="image/*" hidden onChange={handleImagePreview} />

                    <button 
                      className="btn-light mt-5 max-lg:center lg-w:full px-10 hover:bg-black hover:text-white"
                      onClick={handleUploadProfileImg}
                    >
                      Upload
                    </button>
                </div>

                <div className="w-full px-4 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                      <div>
                        <Input
                          name="fullname"
                          type="text"
                          value={fullname}
                          placeholder="Fullname"
                          disable={true}
                          icon="fi fi-rr-user"
                        />
                      </div>
                      <div>
                        <Input
                          name="email"
                          type="email"
                          value={email}
                          placeholder="Email"
                          disable={true}
                          icon="fi fi-rr-envelope"
                        />
                      </div>
                  </div>

                  <Input
                    type="text"
                    name="username"
                    value={profile_username}
                    placeholder="Username"
                    icon="fi fi-rr-at"
                  />
                  <p className="text-dark-grey -mt-3" style={{fontSize:"12px"}}>
                    Username will use to search user and will be visible to all user
                  </p>


                  <textarea 
                    name="bio" 
                    id="bio" 
                    maxLength={bioLimit}
                    defaultValue={bio}
                    placeholder='Bio'
                    className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                    onChange={handleCharsLimit}
                  >
                  </textarea>
                  <p className="mt-1 text-dark-grey" style={{fontSize:"12px"}}>
                    {charsLeft} characters left
                  </p>

                  <p className="my-6 text-dark-grey">
                    Add your socials handles below
                  </p>

                  <div className="md:grid md:grid-cols-2 gap-x-6">
                    {
                      Object.keys(social_links).map((key, i)=>{
                       let link = social_links[key];

                       return <Input 
                            key={i} 
                            name ={key} 
                            type="text" 
                            value={link} 
                            placeholder="https://"
                            icon={`fi ${key !== "website" ? "fi-brands-" + key : "fi-rr-globe"} text-2xl hover:text-black`}
                          />
                      })
                    }
                  </div>

                  <button className="btn-dark w-auto mx-auto px-12 mt-8 flex" type="submit" onClick={handleSubmit}>
                    Update 
                  </button>

                </div>

              </div>
            </form>
          }

      </AnimationWrapper>
  )
}

export default EditProfile;
