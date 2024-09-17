// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/'); 
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        }
    };

    return (
        <div
            className="flex items-center justify-center h-screen bg-cover bg-center bg-black"
           
        >
            <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center text-2xl font-bold mb-4">Đăng Nhập Hệ Thống</h2>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Mật Khẩu
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="*********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-around">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Đăng Nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
