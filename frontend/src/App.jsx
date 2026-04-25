import Navbar from "./components/navbar";
import Home from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";


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
                    <Route path="/" element={<Navbar/>}>
                        <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                        <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                    </Route>
                </Routes>
            </BrowserRouter>   
        </userContext.Provider>
    )
}

export default App;