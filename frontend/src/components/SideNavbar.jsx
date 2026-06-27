import React, {useContext, useState , useRef, useEffect} from 'react';
import {Outlet, Navigate, NavLink} from "react-router-dom";
import { userContext } from "../App";
import axios from "axios";

function SideNavbar() {
    
    const {userAuth, setUserAuth, userAuth: { access_token, new_notification_available} } = useContext(userContext);
    
    let page = location.pathname.split('/')[2].replace("-", " ");

    const [pageState, setPageState] = useState(page);
    const [showSideNav, setShowSideNav] = useState(false);

    let activeTabLine = useRef();
    let sidebarIconTab = useRef();
    let pageStateTab = useRef();

    // Toggle Side Navbar
    const changePageState =(e)=>{
        let { offsetWidth, offsetLeft }  = e.target;
        activeTabLine.current.style.width = offsetWidth + "px";
        activeTabLine.current.style.left = offsetLeft + "px";

        if(e.target === sidebarIconTab.current){
            setShowSideNav(!showSideNav);
        }
    }

    const handlePageState =(e)=>{
        setPageState(e.target.innerText);
        setShowSideNav(false);
    }

    useEffect(()=>{
        setPageState(page);
        pageStateTab.current.click();
    },[pageState]);
    

  return (
    access_token === null ? <Navigate to ="/signin" /> :
    <>
        <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
            <div className="sticky top-[80px] z-30">
                <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
                    <button className="p-5 capitalize" ref={sidebarIconTab} onClick={changePageState}>
                        <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
                    </button>
                     <button ref={pageStateTab} className="p-5 capitalize" onClick={changePageState}>
                        { pageState }
                    </button>
                    <hr className="absolute bottom-0 duration-500" ref={activeTabLine}/>
                </div>

                <div className={`max-sm:h-[100vh] min-w-[200px] h-[calc(100% - 80px - 64px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[70%] max-md:px-6 duration-500 ${!showSideNav ? " max-md:opacity-0 max-md:pointer-events-none" : " opacity-100 pointer-events-auto"}` }>
                    <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
                    <hr className="border-grey -ml-6 mb-8 mr-6" />

                    <NavLink 
                        to="/dashboard/blogs" 
                        className="sidebar-link"
                        onClick={handlePageState}
                    >
                        <i className="fi fi-rr-document"></i>
                        Blogs
                    </NavLink>
                    <NavLink 
                        to="/dashboard/notification" 
                        className="sidebar-link"
                        onClick={handlePageState}
                    >
                        <div className="relative">
                            <i className="fi fi-rr-bell"></i>
                            { new_notification_available ? 
                                <span className="absolute w-2 h-2 bg-red rounded-full top-0 right-0 z-10"></span>
                                : ""
                            }
                        </div>
                         Notification
                    </NavLink>
                    <NavLink 
                        to="/editor" 
                        className="sidebar-link"
                        onClick={handlePageState}
                    >
                        <i className="fi fi-rr-file-edit"></i>
                        Write
                    </NavLink>

                    <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
                    <hr className="border-grey -ml-6 mb-8 mr-6" />

                     <NavLink 
                        to="/settings/edit-profile" 
                        className="sidebar-link"
                        onClick={handlePageState}
                    >
                        <i className="fi fi-rr-user"></i>
                        Edit Profile
                    </NavLink>
                     <NavLink 
                        to="/settings/change-password" 
                        className="sidebar-link"
                        onClick={handlePageState}
                    >
                        <i className="fi fi-rr-lock"></i>
                        Change Password
                    </NavLink>

                </div>
            </div>


            <div className="max-md:-mt-8 mt-5 w-full">
                <Outlet/>
            </div>
        </section>
    </>
  )
}

export default SideNavbar;
