import React, { useContext } from 'react';
import AnimationWrapper from "../common/pageAnimation";
import {Toaster, toast} from "react-hot-toast";
import { EditorContext } from '../pages/editor';

function PublishForm() {
  let {blog, blog:{title, banner, desc, tags}, setEditorState, setBlog} = useContext(EditorContext);

  let characterLimit = 200;

  return (
    <AnimationWrapper>
      <section className='publishForm-container w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        <Toaster/>
          <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg-top-[10%]" onClick={()=>setEditorState("editor")}>
            <i className='fi fi-br-cross'></i>
          </button>

          <div className="preview-container max-w-[550] center">
            <p className="text-dark-grey mb-1">Preview</p>
            <figure className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
              <img src={banner} alt="banner-preview-image" className="img-fluid" />
            </figure>
            <h1 className="text-4xl font-medium mt-4 leading-tight line-clamp-2">{title}</h1>
            <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{desc}</p>
          </div>

          <div className="border-grey lg:border-1">
            <p className="tex-dark-grey mb2 mt-9 mb-2">Blog Title</p>
            <input 
              type="text" 
              placeholder='Blog Title' 
              defaultValue={title}
              className='input-box pl-4'
              onChange={(e)=> setBlog({...blog, title:e.target.value})}
            />

            <p className="tex-dark-grey mb2 mt-9">Short description about your blog</p>
            <textarea 
              name="short-desc" 
              id="short-desc"
              placeholder='Write a short description here..'
              maxLength={characterLimit}
              defaultValue={desc}
              className='h-40 resize-none leading-7 input-box pl-4 mt-2'
              onChange={(e)=>setBlog({...blog, desc:e.target.value})}
              onKeyDown={(e)=> e.keyCode === 13 && e.preventDefault()}
            ></textarea>

            <p className="mt-1 text-dark-grey text-sm text-right">
              {characterLimit - desc.length} characters left
            </p>

            <p className="mb-2 text-dark-grey text-sm">Topics - (Helps in searching and ranking the blog post)</p>
            <div className="relative input-box pl-2 pb-4">
                <input 
                  type="text" 
                  placeholder='Topic'
                  className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white" 
                />
            </div>

          </div>
      </section>
    </AnimationWrapper>
  )
}

export default PublishForm
