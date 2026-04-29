import React, {useContext} from 'react';
import AnimationWrapper from '../common/pageAnimation';
import { Link, useNavigate} from 'react-router-dom';
import { userContext } from '../App';
import { removeFromSession } from '../common/session';



function UserNavigation() {
    const {userAuth:{username}, setUserAuth} = useContext(userContext);
    const navigate = useNavigate();

    const handleSignOut =()=>{
        removeFromSession("user");
        setUserAuth({access_token:null});
        navigate("/signin");
    }
    
  return (
    <AnimationWrapper>
        <div className="bg-white absolute top-3 mt-16 right-0 border border-grey w-60  duration-200">

            <Link to="/editor" className='flex gap-2 link md:hidden pl-8 py-4'>
                <i className='fi fi-rr-file-edit'></i>
                <p>Write</p>
            </Link>
            <Link to={`/user/${username}`} className='link pl-8 py-4'>
                Profile
            </Link>
            <Link to="/dashboard/blogs" className='link pl-8 py-4'>
                Dashboard
            </Link>
            <Link to="/settings/profile" className='link pl-8 py-4'>
                Settings
            </Link>

            <span className="absolute border-t border-grey w-[100%]"></span>

            <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4" onClick={handleSignOut}>
                <p className="font-bold text-xl mg-1">Sign Out</p>
                <p className="text-dark-grey mt-1">@{username}</p>
            </button>
        </div>
    </AnimationWrapper>
  )
}

export default UserNavigation;
