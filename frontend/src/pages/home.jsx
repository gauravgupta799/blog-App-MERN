import React from 'react'
import AnimationWrapper from '../common/pageAnimation';
import InpageNavigation from '../components/InpageNavigation';

function Home() {
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="latest-blog w-full">
          <InpageNavigation routes={['home', "trending blogs"]} defaultHidden ={["trending blogs"]}>

          </InpageNavigation>
        </div>
        {/* Filter & Tranding Blogs */}

        
      </section>
    </AnimationWrapper>
  )
}

export default Home;
