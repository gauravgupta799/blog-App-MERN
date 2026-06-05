import React, { useContext, createContext, useState, useEffect } from "react";
import { userContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import Loader from "../components/Loader";
import axios from "axios";


const blogInfo = {
  title:"",
  banner:"",
  desc:"",
  content:[],
  tags:[],
  author:{
    personal_info:{}
  }
}

export const EditorContext = createContext({});


function Editor() {
  const [blog, setBlog] = useState(blogInfo);
	const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({isReady:false});
  const  [isLoading, setIsLoading] = useState(true);

  let {blog_id}  = useParams();

	let {userAuth: { access_token },} = useContext(userContext);

  useEffect(()=>{
    if(!blog_id){
      return setIsLoading(false);
    }

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, 
      { blog_id, draft:true, mode:"edit" }
    ).then(({data: {blog}})=>{
      setBlog(blog);
      setIsLoading(false);
    }).catch((error)=>{
      setBlog(null);
      setIsLoading(false);
      console.log(error);
    })

  },[])

	return (
    <EditorContext.Provider value={{
      blog, setBlog, editorState, setEditorState, textEditor, setTextEditor
    }}
    >
      {
        !access_token ? 
        <Navigate to='/signin' /> : isLoading ? <Loader/> :
        editorState === "editor" ? <BlogEditor /> : <PublishForm />   
      }
    </EditorContext.Provider>
  )
}

export default Editor;
