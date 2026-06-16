import React,{useState, useRef, useContext} from 'react';
import AnimationWrapper from '../common/pageAnimation';
import Input from '../components/input';
import {Toaster, toast} from "react-hot-toast";
import { userContext } from '../App';
import axios from "axios";

function ChangePassword() {

    const {userAuth: { access_token }} = useContext(userContext)
    
    const changePasswordFormRef = useRef();

    const handleSubmit = (e)=>{
        e.preventDefault();
        
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
        const form = new FormData(changePasswordFormRef.current);

        const formData ={};

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let {currentPassword, newPassword} = formData;

        if(!currentPassword.length || !newPassword.length){
            return toast.error("Fill all the inputs")
        }

        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
            return toast.error("Password must be 6–20 chars, include uppercase, lowercase, and number")
        }

        e.target.setAttribute("disabled", true);

        let loadingToast = toast.loading("Updataing...")

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/change-password`, 
            { formData },
            {   headers:{
                    "Authorization":`Bearer ${access_token}`
                }
            }
        )
        .then(()=>{
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.success("Password updated")
        })
        .catch(error =>{
            console.log(error.message);
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(error.message)
        })
    }

  return (
    <AnimationWrapper>
        <Toaster/>
        <form ref={changePasswordFormRef}>
            <h1 className="max-md:hidden">Change Password</h1>

            <div className="py-10 w-full md:max-w-[400px]">
                <Input
                    type="password"
                    name="currentPassword"
                    className="profile-edit-input"
                    placeholder="Password"
                    icon="fi-rr-unlock"
                />
                <Input
                    type="password"
                    name="newPassword"
                    className="profile-edit-input"
                    placeholder="New Password"
                    icon="fi-rr-unlock"
                />
                <button className="btn-dark px-10" type="submit" onClick={handleSubmit}>
                    Change Password
                </button>

            </div>
        </form>
    </AnimationWrapper>
  )
}

export default ChangePassword;
