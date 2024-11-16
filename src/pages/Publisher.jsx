import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
        // Validate input fields using Tabler's form validation
        const form = document.getElementById('publisherForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');

            return;
        }

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
            {/* <h2 className="text-2xl font-bold mb-4">Quản lý nhà xuất bản</h2> */}
            <button
                className="btn btn-primary mb-3"
                onClick={handleOpenModal} // Open modal
            >
                Thêm nhà xuất bản
            </button>
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Tên nhà xuất bản</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Website</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {Publishers.map(Publisher => (
                        <tr key={Publisher.id}>
                            <td>{Publisher.PublisherName}</td>
                            <td>{Publisher.phoneNumber}</td>
                            <td>{Publisher.email}</td>
                            <td>{Publisher.address}</td>
                            <td>{Publisher.website}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleEdit(Publisher)}
                                    title="Sửa"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    className="btn btn-danger ml-2"
                                    onClick={() => handleDelete(Publisher.id)}
                                    title="Xóa"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản"}</h5>
                                <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <form id="publisherForm" noValidate>
                                    <div className="form-group">
                                        <label htmlFor="PublisherName">Tên nhà xuất bản</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="PublisherName"
                                            value={newPublisher.PublisherName}
                                            onChange={handleChange}
                                            placeholder="Nhập tên nhà xuất bản"
                                            required
                                        />
                                        <div className="invalid-feedback">Tên nhà xuất bản là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phoneNumber"
                                            value={newPublisher.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại"
                                            required
                                        />
                                        <div className="invalid-feedback">Số điện thoại là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={newPublisher.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email"
                                            required
                                        />
                                        <div className="invalid-feedback">Email là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="address">Địa chỉ</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={newPublisher.address}
                                            onChange={handleChange}
                                            placeholder="Nhập địa chỉ"
                                            required
                                        />
                                        <div className="invalid-feedback">Địa chỉ là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="website">Website</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="website"
                                            value={newPublisher.website}
                                            onChange={handleChange}
                                            placeholder="Nhập website"
                                            required
                                        />
                                        <div className="invalid-feedback">Website là bắt buộc.</div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>
                                    {isEditing ? "Cập nhật nhà xuất bản" : "Lưu"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publisher;
