import Navbar from "./components/navbar";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor";
import SearchPage from "./pages/SearchPage";
import PageNotFound from "./pages/PageNotFound";
import UserProfile from "./pages/UserProfile";
import BlogPage from "./pages/BlogPage";


export const userContext = createContext({});

function App(){

    const [userAuth, setUserAuth] = useState({});

    useEffect(()=>{
        const isUserInSession = JSON.parse(lookInSession("user"));
        const result = isUserInSession ? setUserAuth(isUserInSession) : setUserAuth({access_token:null});
    },[]);

    return (
        <userContext.Provider value={{userAuth, setUserAuth}}>
            <BrowserRouter>
                <Routes>
                    <Route path='/editor' element={<Editor/>}/>
                    <Route path="/" element={<Navbar/>}>
                        <Route index ="/" element={<Home/>} />
                        <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                        <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                        <Route path="search/:query" element={<SearchPage/>}/>
                        <Route path="user/:id" element={<UserProfile/>}/>
                        <Route path="/blog/:id" element={<BlogPage/>}/>
                        <Route path="*" element={<PageNotFound/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>   
        </userContext.Provider>
    )
}

export default App;