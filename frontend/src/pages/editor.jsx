import React,{useContext, useState} from 'react';
import {userContext} from "../App";
import { Navigate } from 'react-router-dom';
import BlogEditor from '../components/BlogEditor';
import PublishForm from '../components/PublishForm';

function Editor() {
    const [editorState, setEditorState] = useState("editor");

    let {userAuth: {access_token}} = useContext(userContext);

  return (
    !access_token ? <Navigate to="/signin"/> : editorState === "editor" ? <BlogEditor/> : <PublishForm/> 
  )
}

export default Editor;
