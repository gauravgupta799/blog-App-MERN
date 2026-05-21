import React from 'react';

export const getDay = (timeFrame) => {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let days= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
    const date = new Date(timeFrame);
    
    const day = days[date.getDay()];
    if (isNaN(date)) {
        return "Invalid Date";
    }
    const month = months[date.getMonth()];
    const year = date.getFullYear(); 
    
    return `${date.getDate()} ${month} ${year}`
}

// export default date;