import React,{useContext, useEffect, useRef} from 'react'
import { Link } from 'react-router-dom';
import {Toaster, toast} from "react-hot-toast";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/pageAnimation";
import defaultBanner from "../imgs/blog-banner.png";
import {uploadImage} from "../common/aws";
import { EditorContext } from '../pages/editor';
import EditorJs from "@editorjs/editorjs";
import {Tools} from './Tools';


function BlogEditor() {
  const textareaRef = useRef();

  let {blog:{title, banner, desc, content, tags, author}, 
    setBlog, blog, textEditor, setTextEditor, editorState, setEditorState
  } = useContext(EditorContext);

  useEffect(()=>{
    setTextEditor(new EditorJs({
      holder:"textEditor",
      data:content,
      tools:Tools,
      placeholder:"Let's write an awesome story"
    }))

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
            // blogBannerRef.current.src = url;
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


  return (
    <>
    <nav className='navbar'>
      <Link to="/" className='flex-none w-10'>
        <img src={logo} alt="logo" className="img-fluid" loading="lazy"/>
      </Link>
      <p className="max-md:hidden text-black line-clamp-1 w-full">
        {title? title : "New Blog"}
      </p>
      <div className="flex gap-4 ml-auto">
        <button className="btn-dark py-2" onClick={handlePublish}>
          Publish
        </button>
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
                // ref={blogBannerRef}
                src={banner ? banner : defaultBanner} 
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
            className='text-2xl md:text-3xl xl:text-4xl  font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
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