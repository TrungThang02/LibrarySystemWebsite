import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

const Author = () => {
    const [Authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAuthorId, setCurrentAuthorId] = useState(null);
    const [newAuthor, setNewAuthor] = useState({
        authorName: '',
        phoneNumber: '',
        email: '',
        degree: '',
        basicInfo: '',
        publisherId: '', // New field to store selected publisher ID
    });

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const authorsCollection = collection(db, 'author');
                const authorSnapshot = await getDocs(authorsCollection);
                const authorsList = authorSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAuthors(authorsList);
            } catch (error) {
                console.error("Error fetching authors: ", error);
            }
        };

        const fetchPublishers = async () => {
            try {
                const publishersCollection = collection(db, 'publisher');
                const publisherSnapshot = await getDocs(publishersCollection);
                const publisherList = publisherSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().PublisherName,
                }));
                setPublishers(publisherList);
            } catch (error) {
                console.error("Error fetching publishers: ", error);
            }
        };

        fetchAuthors();
        fetchPublishers();
    }, []);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setNewAuthor({
            authorName: '',
            phoneNumber: '',
            email: '',
            degree: '',
            basicInfo: '',
            publisherId: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewAuthor(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            if (isEditing && currentAuthorId) {
                const authorRef = doc(db, 'author', currentAuthorId);
                await updateDoc(authorRef, newAuthor);
                setAuthors(prev => prev.map(author =>
                    author.id === currentAuthorId ? { ...author, ...newAuthor } : author
                ));
            } else {
                const authorsCollection = collection(db, 'author');
                const docRef = await addDoc(authorsCollection, newAuthor);
                setAuthors([...Authors, { id: docRef.id, ...newAuthor }]);
            }

            handleCloseModal();
        } catch (error) {
            console.error("Error saving author: ", error);
        }
    };

    const handleEdit = (author) => {
        setNewAuthor({
            authorName: author.authorName,
            phoneNumber: author.phoneNumber,
            email: author.email,
            degree: author.degree,
            basicInfo: author.basicInfo,
            publisherId: author.publisherId || '', // Ensure to pass publisherId
        });
        setCurrentAuthorId(author.id);
        setIsEditing(true);
        handleOpenModal();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa tác giả này?',
            text: "Bạn có chắc chắn muốn xóa tác giả này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'author', id));
                setAuthors(Authors.filter(author => author.id !== id));
                Swal.fire(
                    'Đã xóa!',
                    'Tác giả đã được xóa.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting author: ", error);
            }
        }
    };

    return (
        <div className="mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý tác giả</h2>
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
                onClick={handleOpenModal}
            >
                Thêm tác giả
            </button>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="w-full bg-gray-100 border-b">
                        <th className="py-2 px-4 border-r">Tên tác giả</th>
                        <th className="py-2 px-4 border-r">Số điện thoại</th>
                        <th className="py-2 px-4 border-r">Email</th>
                        <th className="py-2 px-4 border-r">Bằng cấp</th>
                        <th className="py-2 px-4 border-r">Thông tin cơ bản</th>
                        <th className="py-2 px-4 border-r">Nhà xuất bản</th>
                        <th className="py-2 px-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {Authors.map(author => (
                        <tr key={author.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 border-r">{author.authorName}</td>
                            <td className="py-2 px-4 border-r">{author.phoneNumber}</td>
                            <td className="py-2 px-4 border-r">{author.email}</td>
                            <td className="py-2 px-4 border-r">{author.degree}</td>
                            <td className="py-2 px-4 border-r">{author.basicInfo}</td>
                            <td className="py-2 px-4 border-r">
                                {
                                    publishers.find(publisher => publisher.id === author.publisherId)?.name || 'Không có nhà xuất bản'
                                }
                            </td>
                            <td className="py-2 px-4 flex gap-2">
                                <button
                                    className="bg-yellow-500 text-white py-1 px-2 rounded"
                                    onClick={() => handleEdit(author)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="bg-red-500 text-white py-1 px-2 rounded"
                                    onClick={() => handleDelete(author.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-xl md:max-w-xl lg:max-w-xl">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa tác giả" : "Thêm tác giả"}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="authorName" className="block mb-2">Tên tác giả</label>
                                <input
                                    type="text"
                                    id="authorName"
                                    name="authorName"
                                    placeholder="Nhập tên tác giả"
                                    value={newAuthor.authorName}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phoneNumber" className="block mb-2">Số điện thoại</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="Nhập số điện thoại"
                                    value={newAuthor.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Nhập email"
                                    value={newAuthor.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="degree" className="block mb-2">Bằng cấp</label>
                                <input
                                    type="text"
                                    id="degree"
                                    name="degree"
                                    placeholder="Nhập bằng cấp"
                                    value={newAuthor.degree}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="basicInfo" className="block mb-2">Thông tin cơ bản</label>
                                <input
                                    id="basicInfo"
                                    name="basicInfo"
                                    placeholder="Nhập thông tin cơ bản"
                                    value={newAuthor.basicInfo}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="publisherId" className="block mb-2">Nhà xuất bản</label>
                                <select
                                    id="publisherId"
                                    name="publisherId"
                                    value={newAuthor.publisherId || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option value="">Chọn nhà xuất bản</option>
                                    {publishers.map(publisher => (
                                        <option key={publisher.id} value={publisher.id}>
                                            {publisher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="bg-gray-300 text-black py-2 px-4 rounded"
                                onClick={handleCloseModal}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded"
                                onClick={handleSave}
                            >
                                {isEditing ? 'Cập nhật' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Author;
