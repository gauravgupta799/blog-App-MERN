import React, { useContext, createContext, useState } from "react";
import { userContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";


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

	let {userAuth: { access_token },} = useContext(userContext);

	return (
    <EditorContext.Provider value={{
      blog, setBlog, editorState, setEditorState, textEditor, setTextEditor
    }}
    >
      {
        !access_token ? <Navigate to='/signin' /> : editorState === "editor" ? <BlogEditor /> : <PublishForm />   
      }
    </EditorContext.Provider>
  )
}

export default Editor;
