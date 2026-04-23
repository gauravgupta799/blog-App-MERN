import React from 'react';
import {AnimatePresence, motion} from "framer-motion";

function AnimationWrapper({children, keyValue, 
    inital={opacity:0, y:20}, 
    animate={opacity:1, y:0}}, 
    transition={duration:1.5, ease: "easeOut"}, 
    className
  ) {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={inital}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimationWrapper
