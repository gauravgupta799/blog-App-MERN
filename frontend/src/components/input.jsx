import React, {useState} from 'react'

function Input({type, id, name, placeholder, value, icon}) {
    const [togglePassword, setTogglePassword] = useState(false);

  return (
    <div className='relative w-[100] mb-4'>
        <input
            type={type === "password" ? `${togglePassword ? "text" : "password"}` : type}
            name={name}
            id={id}
            placeholder={placeholder}
            defaultValue={value}
            className='input-box'
        />
        <i className={`fi fi-rr-${icon} input-icon`}></i>
        {
            type=== "password" ?  
            <i className={`fi fi-rr-${togglePassword ? "eye" : "eye-crossed"} 
            input-icon left-[auto] right-4 cursor-pointer text-dark-grey text-xl hover:text-black`} onClick={()=> setTogglePassword(currPass => !currPass)}></i> 
            : ""
        }
    </div>
  )
}

export default Input;
