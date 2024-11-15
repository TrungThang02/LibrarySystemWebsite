import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
const Author = () => {
    const [authors, setAuthors] = useState([]);
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
        // Validate input fields using Tabler's form validation
        const form = document.getElementById('authorForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
           
            return;
        }

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
                setAuthors([...authors, { id: docRef.id, ...newAuthor }]);
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
                setAuthors(authors.filter(author => author.id !== id));
                Swal.fire('Đã xóa!', 'Tác giả đã được xóa.', 'success');
            } catch (error) {
                console.error("Error deleting author: ", error);
            }
        }
    };

    return (
        <div className="mx-auto p-4">
            {/* <h2 className="text-2xl font-bold mb-4">Quản lý tác giả</h2> */}
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
                        {authors.map(author => (
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
        className="btn btn-warning me-2"
        onClick={() => handleEdit(author)}
        title="Sửa"
      >
        <FaEdit size={16} />
      </button>
      <button
        className="btn btn-danger"
        onClick={() => handleDelete(author.id)}
        title="Xóa"
      >
        <FaTrash size={16} />
      </button>
    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? "Chỉnh sửa tác giả" : "Thêm tác giả"}</h5>
                                <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <form id="authorForm" noValidate>
                                    <div className="form-group">
                                        <label htmlFor="authorName">Tên tác giả</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="authorName"
                                            value={newAuthor.authorName}
                                            onChange={handleChange}
                                            placeholder="Nhập tên tác giả"
                                            required
                                        />
                                        <div className="invalid-feedback">Tên tác giả là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phoneNumber"
                                            value={newAuthor.phoneNumber}
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
                                            value={newAuthor.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email"
                                            required
                                        />
                                        <div className="invalid-feedback">Email là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="degree">Bằng cấp</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="degree"
                                            value={newAuthor.degree}
                                            onChange={handleChange}
                                            placeholder="Nhập bằng cấp"
                                            required
                                        />
                                        <div className="invalid-feedback">Bằng cấp là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="basicInfo">Thông tin cơ bản</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="basicInfo"
                                            value={newAuthor.basicInfo}
                                            onChange={handleChange}
                                            placeholder="Nhập thông tin cơ bản"
                                            required
                                        />
                                        <div className="invalid-feedback">Thông tin cơ bản là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="publisherId">Nhà xuất bản</label>
                                        <select
                                            className="form-control"
                                            name="publisherId"
                                            value={newAuthor.publisherId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Chọn nhà xuất bản</option>
                                            {publishers.map(publisher => (
                                                <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                                            ))}
                                        </select>
                                        <div className="invalid-feedback">Nhà xuất bản là bắt buộc.</div>
                                    </div>
                                </form>
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
