import React from 'react';
import {Link} from "react-router-dom";
import {getDay} from "../common/date.jsx"

function AboutUser({className, bio, socialLinks, joinedAt}) {
  // console.log(socialLinks, Object.keys(socialLinks));

  return (
    <div className={"md:w-[90%] md:mt-7 " + className}>
        <p className="">{bio.length ? bio : "Nothing to read here"}</p>

        <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
          {
            Object.keys(socialLinks).map((key)=>{
              let link = socialLinks[key];

              return link ? 
                <Link to={link} key ={key} className="" target="_blank">
                  <i className={`fi ${key != "website" ? "fi-brands-" + key : "fi-rr-globe"} text-2xl hover:text-black`}></i>
                </Link> 
                : " "
            })
          }
        </div>

        <p className="text-xl leading-7 text-dark-grey max-md:hidden">Joined on {getDay(joinedAt)}</p>
    </div>
  )
}

export default AboutUser;
