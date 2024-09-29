import React, { useState } from 'react';
import {
    FaTh,
    FaOutdent ,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList,
    FaRegCalendarAlt ,
    FaRegCalendarCheck ,
    FaExclamationCircle ,
    FaRegNewspaper,
    FaFolder,
    FaExchangeAlt,
    FaBook,
    FaListAlt
    
}from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import logo from "../assets/tdmulogo.jpg";



const Sidebar = ({children}) => {
    const[isOpen ,setIsOpen] = useState(true);

   
    const menuItem=[
        {
            path:"/",
            name:"Quản lý danh mục sách",
            icon:<FaListAlt />
        },
        {
            path:"/publisher",
            name:"Quản lý nhà xuất bản",
            icon:<FaBook />
        },
        {
            path:"/author",
            name:"Quản lý tác giả",
            icon:<FaBook />
        },
        
        {
            path:"/books",
            name:"Quản lý sách",
            icon:<FaBook />
        },
        {
            path:"/shelf",
            name:"Kệ sách",
            icon:<FaFolder />
        },
        {
            path:"/return",
            name:"Mượn/Trả sách",
            icon:<FaExchangeAlt/>
        },
        {
            path:"/user",
            name:"Quản lý người dùng",
            icon:<FaUserAlt/>
        },
        
       
    ]
    return (
  
        <div className="container">
           <div style={{width: "300px"}} className="sidebar">
               <div className="top_section">
                   <div className="logo">
                   <img className='logo-img' src={logo} alt="Logo"/>                  
                   </div>
                 
               </div>
               {
                   menuItem.map((item, index)=>(
                       <NavLink to={item.path} key={index} className="link" activeclassName="active">
                           <div className="icon">{item.icon}</div>
                           <div style={{display: isOpen ? "block" : "none"}} className="link_text">{item.name}</div>
                       </NavLink>
                   ))
               }
           </div>
           <main>{children}</main>
        </div>
  
    );
};

export default Sidebar;