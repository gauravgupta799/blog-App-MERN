import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
)

const loader = document.getElementById("initial-loader");

requestAnimationFrame(()=>{
  loader.classList.add("hide-loader");

  setTimeout(()=>{
    loader.remove();
  }, 400)
})