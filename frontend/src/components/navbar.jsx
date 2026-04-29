import React, {useState, useContext} from 'react';
import logo from "../imgs/logo.png";
import {Link, Outlet} from "react-router-dom";
import { userContext } from '../App';
import UserNavigation from './userNavigation';


function Navbar() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [isUserPanelVisible, setIsUserPanelVisible] = useState(false);

  const {userAuth, userAuth:{access_token, profile_img}, setUserAuth} = useContext(userContext);

  const handleBlur =()=>{
    setTimeout(()=>{
      setIsUserPanelVisible(false);
    }, 200)
  }

  return (
    <>
      <nav className='navbar justify-between'>
        <Link to="/" className='flex-none w-10'>
          <img src={logo} alt="logo" className="img-fluid" loading="lazy"/>
        </Link>

        <div className={`absolute bg-white w-full left-0 top-full mt-0.5 py-4 px-[5vw]
          md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${searchVisible ? "show" : "hidden"}`}>
          <input 
            type="text" 
            placeholder="Search" 
            className='w-full bg-grey p-4 pl-6 pr-[12%] 
            md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 md:w-auto'
          />
          <i className='fi fi-rr-search absolute right-[10%] top-1/2 md:left-5 -translate-y-1/2  md:pointer-events-none text-xl text-dark-grey'></i>
        </div> 

        <div className="toggle-btn flex items-center gap-3 md:gap-6 ml:auto ">
          <button className=' bg-grey w-12 h-12 rounded-full flex items-center justify-center md:hidden'
          onClick={()=> setSearchVisible(curr => !curr)}>
            <i className='fi fi-rr-search flex-none text-xl text-dark-grey p-0'></i>
          </button>
          <Link to="/editor" className=' hidden md:flex gap-2 link border border-grey rounded-full'>
            <i className='fi fi-rr-file-edit'></i>
            <p>Write...</p>
          </Link>

          {
            access_token ?
             <>
                <Link to="/dashboard/notification">
                  <button className="relative w-12 h-12 rounded-full bg-grey hover:bg-black/10">
                    <i className='fi fi-rr-bell text-xl flex-none'></i>
                  </button>
                </Link>
                <div className="relative" 
                 onClick={()=>setIsUserPanelVisible((currVal=> !currVal))}
                 onBlur={handleBlur}
                 >
                  <button className="w-12 h-12 mt-1">
                    <img src={profile_img} alt="profile-img" className="w-full h-full rounded-full object-cover" />
                  </button>
                  {
                    isUserPanelVisible && <UserNavigation/>
                  }
                </div>
             </>
             : 
             <>
              <Link to="/signin" className='btn btn-dark py-2'>
                Sign In
              </Link>
              <Link to="/signup" className='btn btn-light py-2 hidden md:block'>
                Sign Up
              </Link>
             </>
          }
        </div>
      </nav>
      <Outlet/> 
      
      {/* Outlet allows parent routes to render their child route elements. It is essential for creating nested layouts and managing complex route structures*/}
    </>
  );
}

export default Navbar;
