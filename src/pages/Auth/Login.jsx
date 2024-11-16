import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import background from '../../assets/background.jpg'; // Import the background image

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
            className="d-flex align-items-center justify-content-center vh-100 bg-cover bg-center"
            style={{
                backgroundImage: `url(${background})`, // Use the imported background variable here
                position: 'relative',
            }}
        >
            {/* Overlay */}
            <div
                className="position-absolute top-0 left-0 right-0 bottom-0"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                }}
            ></div>

            <div
                className="card shadow-sm p-5 rounded w-100"
                style={{
                    maxWidth: '400px',
                    zIndex: 2,
                    backdropFilter: 'blur(2px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                }}
            >
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center text-light mb-4">ĐĂNG NHẬP HỆ THỐNG</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="mb-4">
                        <label className="form-label text-white" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-white" htmlFor="password">
                            Mật Khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
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
