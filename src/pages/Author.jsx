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
        publisherId: '',
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
            publisherId: author.publisherId || '',
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
                Swal.fire('Đã xóa!', 'Tác giả đã được xóa.', 'success');
            } catch (error) {
                console.error("Error deleting author: ", error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="h2">Quản lý tác giả</h2>
            <button
                className="btn btn-primary mb-3"
                onClick={handleOpenModal}
            >
                Thêm tác giả
            </button>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>Tên tác giả</th>
                            <th>Số điện thoại</th>
                            <th>Email</th>
                            <th>Bằng cấp</th>
                            <th>Thông tin cơ bản</th>
                            <th>Nhà xuất bản</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Authors.map(author => (
                            <tr key={author.id}>
                                <td>{author.authorName}</td>
                                <td>{author.phoneNumber}</td>
                                <td>{author.email}</td>
                                <td>{author.degree}</td>
                                <td>{author.basicInfo}</td>
                                <td>
                                    {
                                        publishers.find(publisher => publisher.id === author.publisherId)?.name || 'Không có nhà xuất bản'
                                    }
                                </td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEdit(author)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(author.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">{isEditing ? "Chỉnh sửa tác giả" : "Thêm tác giả"}</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={handleCloseModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="authorName" className="form-label">Tên tác giả</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="authorName"
                                        name="authorName"
                                        value={newAuthor.authorName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={newAuthor.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={newAuthor.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="degree" className="form-label">Bằng cấp</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="degree"
                                        name="degree"
                                        value={newAuthor.degree}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="basicInfo" className="form-label">Thông tin cơ bản</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="basicInfo"
                                        name="basicInfo"
                                        value={newAuthor.basicInfo}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="publisherId" className="form-label">Nhà xuất bản</label>
                                    <select
                                        className="form-select"
                                        id="publisherId"
                                        name="publisherId"
                                        value={newAuthor.publisherId || ''}
                                        onChange={handleChange}
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
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>{isEditing ? 'Cập nhật' : 'Lưu'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Author;
