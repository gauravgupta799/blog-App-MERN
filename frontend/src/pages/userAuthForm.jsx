import React, {useState, useRef, useContext} from 'react'
import Input from '../components/input';
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from 'react-router-dom';
import AnimationWrapper from '../common/pageAnimation';
import {Toaster, toast} from "react-hot-toast";
import axios from "axios";
import { storeSession } from '../common/session';
import { userContext } from '../App';
import { authWithGoogle } from '../common/firebase';


function UserAuthForm({type}) {
    const {userAuth :{ access_token }, setUserAuth} = useContext(userContext);
    // console.log(access_token);

    const userAuthServer = async (serverRoute, formData)=>{
        try {
            const res = await axios.post(`http://localhost:3000${serverRoute}`, formData);
            const data = res.data;

            storeSession("user", JSON.stringify(data));
            setUserAuth(data);

            // console.log(sessionStorage, userAuth);
            // toast.success("User created successfully!")
        } catch (error) {
            console.log(error);
            toast.error(error)
        }
    }

    // Form Handle
    const handleSubmit =(e)=>{
        e.preventDefault();

        let serverRoute = type === "sign-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        const form = new FormData(formElement)
        let formData = {};

        for(const [key, value] of form.entries()){
            formData[key]= value;
        }

        let {fullname, email, password} = formData;

        // if(!fullname || !email || !password){
        //     return toast.error("All field are required")
        // }

        if(fullname){
            if(fullname.trim().length < 3){
                return toast.error("Fullname must be atleast 3 letters long")
            }
        }
        if(!emailRegex.test(email)){
            return toast.error("Email in invalid")
        }
        if(!passwordRegex.test(password)){
            return toast.error("Password should be 6–20 characters long with at least 1 numeric, 1 lowercase, and 1 uppercase letter")
        }

        userAuthServer(serverRoute, formData);
    }

    // Handle Google Auth Function
    const handleGoogleAuth = async (e) => {
        e.preventDefault();
        try {
            const authResult = await authWithGoogle();
            console.log(authResult);
            
        } catch (error) {
            console.log(error);
            toast("Trouble Login Through Google");
        }
    }



  return (
    access_token ? <Navigate to="/" /> :
    <AnimationWrapper keyValue={type}>
        <section className='form-section h-cover flex flex-col items-center justify-center'>
            <form className='form w-[96%] max-w-[420px] text-center mx-auto' id="formElement">
                <h1 className="form-title text-4xl font-gelasio capitalize mb-4">
                {type == "sign-in" ? "Welcome Back!" : "Join us today!"}
                </h1>

                {type === "sign-up" && (
                    <Input 
                        type="text" 
                        name="fullname" 
                        id="fullname" 
                        placeholder="Fullname" 
                        icon={"user"}
                    />
                )
                }
                <Input 
                    type="email" 
                    name="email" 
                    id="email" 
                    placeholder="Email" 
                    icon={"envelope"}
                />
                <Input 
                    type="password" 
                    name="password" 
                    id="password" 
                    placeholder="Password" 
                    icon={"key"}
                />

                <button type="submit" className="btn btn-dark center mt-14 capitalize" onClick={handleSubmit}>
                    {type.replace("-", " ")}
                </button>
            </form>

            <div className="">
                <div className="relative w-full flex items-center gap-3 my-10 opacity-10 uppercase text-black font-bold">
                    <hr className="w-1/2 border-black" />
                    <p className="orText">Or</p>
                    <hr className="w-1/2 border-black" />
                </div>

                <button className="btn-dark mb-8 flex items-center justify-center gap-4 w-[90%] center" onClick={handleGoogleAuth}>
                    <img src={googleIcon} alt="" className="img-fluid w-5"/>
                    Contiue with google
                </button>

                <div className="flex items-center">
                    { type === "sign-in" ?
                        <p className='text-dark-grey text-xl text-center flex items-center justify-center gap-4'>
                            Don't have an account?
                            <Link to="/signup" className="underline text-black text-xl ml-1">Join us today</Link>
                        </p>
                        : 
                        <p className='text-dark-grey text-xl text-center flex items-center justify-center gap-4'>
                            Already have an account?
                            <Link to="/signin" className="underline text-black text-xl ml-1">Sign-In here</Link>
                        </p>
                    }
                </div>
            </div>

             <Toaster/>
        </section>
    </AnimationWrapper>
  )
}

export default UserAuthForm;
