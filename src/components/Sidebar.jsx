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
    FaRegNewspaper 
}from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import logo from "../assets/logo.png";



const Sidebar = ({children}) => {
    const[isOpen ,setIsOpen] = useState(true);
    const toggle = () => setIsOpen (!isOpen);
   
    const menuItem=[
        {
            path:"/",
            name:"Quản lý danh mục sách",
            icon:<FaRegCalendarAlt />
        },
        {
            path:"/makeappointments",
            name:"Quản lý sách",
            icon:<FaRegCalendarCheck />
        },
        {
            path:"/vaccineinfo",
            name:"Đổi/Trả sách",
            icon:<FaExclamationCircle />
        },
        {
            path:"/user",
            name:"Quản lý người dùng",
            icon:<FaUserAlt/>
        },
        
       
    ]
    return (
  
        <div className="container">
           <div style={{width: isOpen ? "300px" : "10px"}} className="sidebar">
               <div className="top_section">
                   <div style={{display: isOpen ? "block" : "none"}} className="logo">
                   <img className='logo' src={logo} alt="Logo"/>

                  
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