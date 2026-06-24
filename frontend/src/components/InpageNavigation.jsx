import React, {useState, useRef, useEffect} from 'react';

export let activeTabLineRef;
export let activeTabRef;

function InpageNavigation({children,routes, defaultHidden = [], defaultActiveIndex = 0}) {
    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isResizeEventAdded, setIsResizeEventAdded] = useState(false);

    activeTabLineRef = useRef();
    activeTabRef = useRef();

    const changePageState = (btn, index)=>{
        let {offsetWidth, offsetLeft} = btn;

        activeTabLineRef.current.style.width = `${offsetWidth}px`;
        activeTabLineRef.current.style.left = `${offsetLeft}px`;

        setInPageNavIndex(index);
    }

    useEffect(()=>{

        if(windowWidth > 767 && inPageNavIndex !== defaultActiveIndex){
            changePageState(activeTabRef.current, defaultActiveIndex);
        }

        if(!isResizeEventAdded){
            window.addEventListener("resize",()=>{
                if(!isResizeEventAdded){
                    setIsResizeEventAdded(true);
                }

                setWindowWidth(window.innerWidth);
            })
        }
    },[windowWidth])

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

        {
            Array.isArray(children) ? children[inPageNavIndex] : children
        }
        
    </>
    )
}

export default InpageNavigation
