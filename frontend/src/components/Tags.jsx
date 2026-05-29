import React, { useContext } from "react";
import { EditorContext } from "../pages/editor";

function Tags({ tag, targetIndex}) {
    let {blog, blog: { tags }, setBlog} = useContext(EditorContext);

    const handleTagDelete =()=>{
        tags = tags.filter(t => t !== tag);
        setBlog({...blog, tags});
    }

    const handleEditable =(e)=>{
        e.preventDefault();
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }

    const handleEditTag =(e)=>{
        if(e.keyCode === 13  || e.keyCode ===188){
            e.preventDefault();

            let currentTag = e.target.innerText;

            tags[targetIndex] =  currentTag;
            setBlog({...blog, tags});
            e.target.setAttribute("contentEditable", false);
        }
    }

	return (
		<div 
            className='tag-box relative p-2 px-5 pr-8 mt-2 mr-2
        bg-white rounded-full inline-block hover:bg-opacity-50'
        >
		    <p className='outline-none' onKeyDown={handleEditTag} onClick={handleEditable}>{tag}</p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2" onClick={handleTagDelete}>
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
		</div>
	);
}

export default Tags;
