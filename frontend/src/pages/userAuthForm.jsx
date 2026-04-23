import React from 'react'
import Input from '../components/input';
import googleIcon from "../imgs/google.png";
import { Link } from 'react-router-dom';
import AnimationWrapper from '../common/pageAnimation';

function UserAuthForm({type}) {
  return (
    <AnimationWrapper keyValue={type}>
        <section className='form-section h-cover flex flex-col items-center justify-center'>
            <form className='form w-[96%] max-w-[420px] text-center mx-auto'>
                <h1 className="form-title text-4xl font-gelasio capitalize mb-4">
                {type == "sign-in" ? "Welcome Back!" : "Join us today!"}
                </h1>

                {type === "sign-up" && (
                    <Input 
                        type="text" 
                        name="name" 
                        id="name" 
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

                <button className="btn btn-dark center mt-14 capitalize">
                    {type.replace("-", " ")}
                </button>
            </form>

            <div className="">
                <div className="relative w-full flex items-center gap-3 my-10 opacity-10 uppercase text-black font-bold">
                    <hr className="w-1/2 border-black" />
                    <p className="orText">Or</p>
                    <hr className="w-1/2 border-black" />
                </div>

                <button className="btn-dark mb-8 flex items-center justify-center gap-4 w-[90%] center">
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

        </section>
    </AnimationWrapper>
  )
}

export default UserAuthForm;
