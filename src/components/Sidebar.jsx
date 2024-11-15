import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaHome,
    FaListAlt,
    FaBook,
    FaFolder,
    FaExchangeAlt,
    FaUserAlt
} from 'react-icons/fa';
import logo from '../assets/tdmulogo.jpg';

const Sidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    // Mapping pathnames to header titles
    const pageTitles = {
        '/': 'HỆ THỐNG THƯ VIỆN ĐẠI HỌC THỦ DẦU MỘT',
        '/category': 'QUẢN LÝ DANH MỤC SÁCH',
        '/publisher': 'QUẢN LÝ NHÀ XUẤT BẢN',
        '/author': 'QUẢN LÝ TÁC GIẢ',
        '/books': 'QUẢN LÝ SÁCH',
        '/shelf': 'QUẢN LÝ KỆ SÁCH',
        '/return': 'QUẢN LÝ MƯỢN/TRẢ SÁCH',
        '/user': 'QUẢN LÝ NGƯỜI DÙNG',
    };

    const currentPageTitle = pageTitles[location.pathname] || '';

    const menuItem = [
        { path: '/', name: 'Trang tổng quan', icon: <FaHome /> },
        { path: '/category', name: 'Quản lý danh mục sách', icon: <FaListAlt /> },
        { path: '/publisher', name: 'Quản lý nhà xuất bản', icon: <FaBook /> },
        { path: '/author', name: 'Quản lý tác giả', icon: <FaBook /> },
        { path: '/books', name: 'Quản lý sách', icon: <FaBook /> },
        { path: '/shelf', name: 'Kệ sách', icon: <FaFolder /> },
        { path: '/return', name: 'Mượn/Trả sách', icon: <FaExchangeAlt /> },
        { path: '/user', name: 'Quản lý người dùng', icon: <FaUserAlt /> },
    ];

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                style={{ width: '300px' }}
                className="sidebar bg-white text-black p-3 transition-all duration-300 ease-in-out shadow-md"
            >
                <div className="top_section mb-5">
                    <div className="logo flex justify-center items-center">
                        <img
                            style={{ width: '190px', marginTop: '10px' }}
                            src={logo}
                            alt="Logo"
                        />
                    </div>
                </div>

                <div className="menu">
                    {menuItem.map((item, index) => (
                        <NavLink
                            to={item.path}
                            key={index}
                            className={({ isActive }) =>
                                isActive
                                    ? 'flex items-center py-3 px-4 bg-blue-500 text-white rounded-md mb-3 text-decoration-none'
                                    : 'flex items-center py-3 px-4 hover:bg-blue-500 hover:text-white rounded-md mb-3 text-decoration-none'
                            }
                            exact
                        >
                            <div className="icon mr-3">{item.icon}</div>
                            <div className={`text-sm`}>
                                {item.name}
                            </div>
                        </NavLink>

                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-blue-500 text-white p-3 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h1 className="m-0">{currentPageTitle}</h1>
                        {/* <div className="flex items-center">
                            <button className="btn btn-primary me-2">Notifications</button>
                            <button className="btn btn-danger">Log out</button>
                        </div> */}
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 p-4 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Sidebar;
