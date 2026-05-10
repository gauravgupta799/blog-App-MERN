import React,{useRef} from 'react'
import { Link } from 'react-router-dom';
import {Toaster, toast} from "react-hot-toast";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/pageAnimation";
import defaultBanner from "../imgs/blog-banner.png";
import {uploadImage} from "../common/aws";


function BlogEditor() {
  let blogBannerRef = useRef();

  // Handle Upload Banner Image
  const handleBannerUpload = async(e)=>{
    let loadingToast;
    try {
      const img = e.target.files[0];
      if(img){
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if(!allowedTypes.includes(img.type)){
          toast.error("Only JPG, PNG and WEBP images are allowed");
        }else{
          loadingToast = toast.loading("Image Uploading....");
          const url = await uploadImage(img);
          if(url){
            toast.dismiss(loadingToast);
            toast.success("Image Uploaded");
            blogBannerRef.current.src = url;
          }
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  }


  return (
    <>
    <nav className='navbar'>
      <Link to="/" className='flex-none w-10'>
        <img src={logo} alt="logo" className="img-fluid" loading="lazy"/>
      </Link>
      <p className="max-md:hidden text-black line-clamp-1 w-full">
        New Blog
      </p>
      <div className="flex gap-4 ml-auto">
        <button className="btn-dark py-2">Publish</button>
        <button className="btn-light py-2">Save Draft</button>
      </div>
    </nav>
     <Toaster/>
    <AnimationWrapper>
      <section className='blog-editor'>
        <div className="mx-auto max-w-[900px] w-full">
          <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
            <label htmlFor="uploadBanner">
              <img 
                ref={blogBannerRef}
                src={defaultBanner} 
                alt="banner-preview" 
                className='banner-preview z-20'
              />

              <input 
                type="file" 
                id="uploadBanner" 
                accept='image/*'
                hidden
                onChange={handleBannerUpload}
              />
            </label>
          </div>
        </div>
        
      </section>
    </AnimationWrapper>
    </>
  )
}

export default BlogEditor;