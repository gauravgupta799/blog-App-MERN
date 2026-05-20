import React from 'react';
import {Link} from "react-router-dom";

const BlogPostCard = ({blogContent, authorInfo}) => {
  let months = ["Jan", "Feb", "March", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let days= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
  const {
      blog_id:id, 
      title, author, desc, banner, publishedAt, tags,
      activity:{total_likes}
  } = blogContent;

  const {fullname, username, profile_img} = author.personal_info;
  // console.log(author);

  const getDay =(timeFrame)=>{
    const date = new Date(timeFrame);
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const publishedTimeFrame = `${day.charAt(0).toUpperCase() + day.split("").slice(1).join("")}, ${date.getDate()} ${month} ${year}`
    // console.log(date, day, month, date.getFullYear(), date.getDate())

    return publishedTimeFrame;
  }

  return (
    <Link to={`/blog/${id}`} className='flex items-center gap-8 border-b  pb-6 mb-8'>
      <div className='w-full'>
        <div className="flex gap-2 items-center mb-7">
          <img src={profile_img} alt={fullname} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">{fullname} @{username}</p>
          <p className="min-w-fit">{getDay(publishedAt)}</p>
        </div>

        <h1 className="blog-title">{title}</h1>

        <p className="mt-3 text-xl font-gelasio leading-7 line-clamp-2 max-sm:hidden md:max-[1100px]:hidden">{desc}</p>

        <div className="flex gap-4 mt-7">
          <span className="btn-light py-1 px-4 text-sm">{tags[0]}</span>
          <span className="ml-3 flex items-center gap-2 text-dark-grey">
            <i className="fi fi-rr-heart text-xl"></i>
            {total_likes}
          </span>
        </div>

      </div>
      <div className="w-28 h-28 apsect-sqaure bg-grey">
          <img src={banner} alt="bannerImage" className="w-full h-full aspect-square object-cover" />
      </div>
    </Link>
  )
}

export default BlogPostCard
