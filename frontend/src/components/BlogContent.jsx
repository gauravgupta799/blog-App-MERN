import React from 'react';

const Img = ({url, caption})=>{
  return (
    <div>
      <img src={url} alt="" className=""/>
      {
        caption.length ?
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">{caption}</p>
        :
        ""
      }
    </div>
  )
}

const Quote =({quote, caption})=>{
  return <div className="bg-purple/10 p-3 border-l-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {
        caption.length ? <p className="w-full text-purple text-base"></p> : ""
      }
    </div>
}

const List =({style, items})=>{
  return (
    <ol className={`pl-5 ${style === "ordered" ? "list-decimal" : "list-[circle]"}`}>
      {
        items.map((listItem, i) => {
          return <li className="my-3" key={i} dangerouslySetInnerHTML={{__html:listItem}}></li>
        })
      }
    </ol>
  )
}


function BlogContent({block}) {
  if(block.data){
    let { data: {text, style, items, level, file, caption}, type} = block;

    if(type==="paragraph"){ 
      return <p className="" dangerouslySetInnerHTML={{__html:text}}></p> 
    }
  
    if(type==="header"){
      if(level === 3){ 
        return <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{__html:text}}></h2> 
      }
      return <h2 className="text-4xl font-bold" dangerouslySetInnerHTML={{__html:text}}></h2>
    }
  
    if(type==="image"){ 
      return <Img url={file.url} caption={caption}/>
     }
  
    if(type==="quote"){ 
      return <Quote quote={text} caption={caption}/>
     }
  
    if(type==="list"){ 
      return <List style={style} items={items}/>
     }
  }
}

export default BlogContent;
