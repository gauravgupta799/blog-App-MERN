import React,{useContext, useEffect, useRef} from 'react'
import { Link, useNavigate, useParams} from 'react-router-dom';
import {Toaster, toast} from "react-hot-toast";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import lightBanner from "../imgs/blog-banner-light.png";
import darkBanner from "../imgs/blog-banner-dark.png";
import AnimationWrapper from "../common/pageAnimation";
import {uploadImage} from "../common/aws";
import { EditorContext } from '../pages/editor';
import EditorJs from "@editorjs/editorjs";
import {Tools} from './Tools';
import axios from "axios";
import { ThemeContext, userContext } from '../App';


function BlogEditor() {
  const textareaRef = useRef();
  const navigate = useNavigate();
  const {blog_id} = useParams();

  const { blog: { title, banner, desc, content, tags, author }, 
    setBlog, blog, textEditor, setTextEditor, editorState, setEditorState
  } = useContext(EditorContext);

  const {userAuth: {access_token}} = useContext(userContext);
  const {theme} = useContext(ThemeContext);

  useEffect(()=>{
    if(!textEditor.isReady){
      setTextEditor(new EditorJs({
        holder:"textEditor",
        data:Array.isArray(content) ? content[0] : content,
        tools:Tools,
        placeholder:"Let's write an awesome story"
      }))
    }
  },[]);

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
            setBlog({...blog, banner:url})
          }
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  }

  // Handle Blog Title
  const handleBlogTitle =(e)=>{
    let input = e.target;
    input.style.height ="auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({...blog, title:e.target.value})
  }

  const handlePublish =()=>{
    if(!banner.length){
      return toast.error("Upload a blog banner to publish it.");
    }
    if(!title.length){
      return toast.error("Write blog title to publish it.")
    }
    if(textEditor.isReady){
      textEditor.save().then(data=>{
        if(data.blocks.length){
          setBlog({...blog, content:data});
          setEditorState("publish");
        }else{
          return toast.error("Write something in your blog to publish it.")
        }
      }).catch(err => {
        console.log(err)
        return toast.error(err.message)
      })
    }
  }

  const handleSaveDraft =(e)=>{
    if(e.target.className.includes("disable")){
      return;
    }
    if(!title.length){
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("Publishing.....");
    e.target.classList.add("disable");

    if(textEditor.isReady){
      textEditor.save().then(content=>{
        let blogObj = { title, banner, desc, content, tags, draft:true }
    
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, {...blogObj, id: blog_id}, {
          headers:{
            "Authorization": `Bearer ${access_token}`
          }
        }).then(()=>{
          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);
          toast.success("Published 👍");
          setTimeout(()=>{
            navigate("/dashboard/blogs?tab=draft");
          }, 500);

        }).catch(({response})=>{
          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);
          return toast.error(response.data.error);
        })
      })
    }
  }


  return (
    <>
    <nav className='navbar'>
      <Link to="/" className='flex-none w-10'>
        <img src={theme==="light"? darkLogo : lightLogo} alt="logo" className="img-fluid" loading="lazy"/>
      </Link>
      <p className="max-md:hidden text-black line-clamp-1 w-full">
        {title? title : "New Blog"}
      </p>
      <div className="flex gap-4 ml-auto">
        <button className="btn-dark py-2" onClick={handlePublish}>
          Publish
        </button>
        <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
      </div>
    </nav>
    <Toaster/>
    <AnimationWrapper>
      <section className='blog-editor'>
        <div className="mx-auto max-w-[900px] w-full">
          <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
            <label htmlFor="uploadBanner">
              <img 
                src={banner ? banner : theme ==="light"? lightBanner : darkBanner} 
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

          <textarea 
            defaultValue={title}
            ref={textareaRef}
            placeholder='Blog Title'
            className='text-2xl md:text-3xl xl:text-4xl  font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white'
            onKeyDown={(e)=> e.keyCode === 13 && e.preventDefault()}
            onChange={handleBlogTitle}
          >
          </textarea>

          <hr className="w-full opacity-10 my-5" />

          {/* ==== Text Editor Start ==== */}
          <div className="font-gelasio" id="textEditor">

          </div>
          {/* ==== Text Editor End ==== */}
        </div>
        
      </section>
    </AnimationWrapper>
    </>
  )
}

export default BlogEditor;