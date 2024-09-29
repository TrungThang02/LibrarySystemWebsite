import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

const Publisher = () => {
    const [Publishers, setPublishers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPublisherId, setCurrentPublisherId] = useState(null);
    const [newPublisher, setNewPublisher] = useState({
        PublisherName: '',
        phoneNumber: '',
        email: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        const fetchPublishers = async () => {
            try {
                const PublishersCollection = collection(db, 'publisher');
                const PublisherSnapshot = await getDocs(PublishersCollection);
                const PublishersList = PublisherSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPublishers(PublishersList);
            } catch (error) {
                console.error("Error fetching Publishers: ", error);
            }
        };

        fetchPublishers();
    }, []);

    const handleOpenModal = () => setShowModal(true); // Open modal
    const handleCloseModal = () => {
        setShowModal(false); // Close modal
        setIsEditing(false);
        setNewPublisher({
            PublisherName: '',
            phoneNumber: '',
            email: '',
            address: '',
            website: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPublisher(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            if (isEditing && currentPublisherId) {
                // Update document in Firestore
                const PublisherRef = doc(db, 'publisher', currentPublisherId);
                await updateDoc(PublisherRef, newPublisher);
                setPublishers(prev => prev.map(Publisher =>
                    Publisher.id === currentPublisherId ? { ...Publisher, ...newPublisher } : Publisher
                ));
            } else {
                // Add new document to Firestore
                const PublishersCollection = collection(db, 'publisher');
                const docRef = await addDoc(PublishersCollection, newPublisher);
                setPublishers([...Publishers, { id: docRef.id, ...newPublisher }]);
            }

            handleCloseModal();
        } catch (error) {
            console.error("Error saving Publisher: ", error);
        }
    };

    const handleEdit = (Publisher) => {
        setNewPublisher({
            PublisherName: Publisher.PublisherName,
            phoneNumber: Publisher.phoneNumber,
            email: Publisher.email,
            address: Publisher.address,
            website: Publisher.website
        });
        setCurrentPublisherId(Publisher.id);
        setIsEditing(true);
        handleOpenModal();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa nhà xuất bản này?',
            text: "Bạn có chắc chắn muốn xóa nhà xuất bản này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'publisher', id));
                setPublishers(Publishers.filter(Publisher => Publisher.id !== id));
                Swal.fire(
                    'Đã xóa!',
                    'Nhà xuất bản đã được xóa.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting Publisher: ", error);
            }
        }
    };

    return (
        <div className="mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý nhà xuất bản</h2>
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
                onClick={handleOpenModal} // Open modal
            >
                Thêm nhà xuất bản
            </button>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="w-full bg-gray-100 border-b">
                        <th className="py-2 px-4 border-r">Tên nhà xuất bản</th>
                        <th className="py-2 px-4 border-r">Số điện thoại</th>
                        <th className="py-2 px-4 border-r">Email</th>
                        <th className="py-2 px-4 border-r">Địa chỉ</th>
                        <th className="py-2 px-4 border-r">Website</th>
                        <th className="py-2 px-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {Publishers.map(Publisher => (
                        <tr key={Publisher.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 border-r">{Publisher.PublisherName}</td>
                            <td className="py-2 px-4 border-r">{Publisher.phoneNumber}</td>
                            <td className="py-2 px-4 border-r">{Publisher.email}</td>
                            <td className="py-2 px-4 border-r">{Publisher.address}</td>
                            <td className="py-2 px-4 border-r">{Publisher.website}</td>
                            <td className="py-2 px-4 flex gap-2">
                                <button
                                    className="bg-yellow-500 text-white py-1 px-2 rounded"
                                    onClick={() => handleEdit(Publisher)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="bg-red-500 text-white py-1 px-2 rounded"
                                    onClick={() => handleDelete(Publisher.id)}
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
                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-xl md:max-w-xs lg:max-w-xs">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản"}</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="PublisherName"
                                placeholder="Nhập tên nhà xuất bản"
                                value={newPublisher.PublisherName}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="Nhập số điện thoại"
                                value={newPublisher.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="email"
                                name="email"
                                placeholder="Nhập email"
                                value={newPublisher.email}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="address"
                                placeholder="Nhập địa chỉ"
                                value={newPublisher.address}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="website"
                                placeholder="Nhập website"
                                value={newPublisher.website}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white py-2 px-4 rounded"
                            >
                                {isEditing ? "Cập nhật nhà xuất bản" : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publisher;
