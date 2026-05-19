import React, {useState, useRef, useEffect} from 'react'

function InpageNavigation({routes, defaultHidden = [], defaultActiveIndex = 0}) {
    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

    let activeTabLineRef = useRef();
    let activeTabRef = useRef();

    const changePageState = (btn, index)=>{
        let {offsetWidth, offsetLeft} = btn;

        activeTabLineRef.current.style.width = `${offsetWidth}px`;
        activeTabLineRef.current.style.left = `${offsetLeft}px`;

        setInPageNavIndex(index);
    }

    useEffect(()=>{
        changePageState(activeTabRef.current, defaultActiveIndex);
    },[])

    return (
    <>
        <div className="relative bg-white border-b border-grey flex flex-wrap overflow-x-auto mb-8">
            {
                routes.map((route, i)=>{
                    return (
                        <button 
                            ref={i === defaultActiveIndex ? activeTabRef : null }
                            key={i}
                            className={`${inPageNavIndex === i ?  "text-black" : "text-dark-grey"} p-4 px-5 capitalize
                                    ${defaultHidden.includes(route) ? " md:hidden" : " "}
                                `}
                            onClick={(e)=>changePageState(e.target, i)}
                        >
                            {route}
                        </button>
                    )
                })
            }

            <hr className="absolute bottom-0 duration-300"  ref={activeTabLineRef}/>
        </div>
        
    </>
    )
}

export default InpageNavigation
