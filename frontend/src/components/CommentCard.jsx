import React from 'react'
import { getDay } from '../common/date';

function CommentCard({commentData, index, leftVal}) {
    // console.log(commentData);
    const {
        commented_by: { personal_info: { fullname, username, profile_img } },
        commentedAt, comment
    } = commentData;

  return (
    <div className= "w-full" style={{paddingLeft:`${leftVal * 10}px`}}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
            <img src={profile_img} alt={username} className="w-6 h-6 rounded-full" />
            <p className="line-clam-1">{fullname} @{username}</p>
            <p>{getDay(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">
            {comment}
        </p>

      </div>
    </div>
  )
}

export default CommentCard
