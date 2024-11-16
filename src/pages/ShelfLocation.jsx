import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
const ShelfLocation = () => {
    const [BookShelfs, setBookShelfs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookShelfId, setCurrentBookShelfId] = useState(null);
    const [newBookShelf, setNewBookShelf] = useState({ BookShelfName: '', Quantity: '' });

    useEffect(() => {
        const fetchBookShelfs = async () => {
            try {
                const BookShelfsCollection = collection(db, 'shelf');
                const BookShelfSnapshot = await getDocs(BookShelfsCollection);
                const BookShelfsList = BookShelfSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBookShelfs(BookShelfsList);
            } catch (error) {
                console.error("Error fetching BookShelfs: ", error);
            }
        };

        fetchBookShelfs();
    }, []);

    const handleOpenModal = () => setShowModal(true); // Open modal
    const handleCloseModal = () => {
        setShowModal(false); // Close modal
        setIsEditing(false);
        setNewBookShelf({ BookShelfName: '', Quantity: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewBookShelf(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // Step 1: Validate input fields using Tabler's form validation
        const form = document.getElementById('shelfForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
    
        try {
            // Step 2: Check if bookshelf already has books (to prevent renaming)
            if (isEditing && newBookShelf.BookShelfName !== BookShelfs.find(shelf => shelf.id === currentBookShelfId)?.BookShelfName) {
                // Query the books collection to see if any book is associated with this bookshelf
                const booksCollection = collection(db, 'books');
                const booksSnapshot = await getDocs(booksCollection);
                const booksInShelf = booksSnapshot.docs.filter(bookDoc => bookDoc.data().BookShelfName === newBookShelf.BookShelfName);
    
                // Step 3: If books are found, prevent renaming
                if (booksInShelf.length > 0) {
                    Swal.fire(
                        'Không thể đổi tên!',
                        'Kệ sách này đã có sách, không thể đổi tên.',
                        'error'
                    );
                    return; // Stop the process if there are books
                }
            }
    
            // Step 4: Handle saving or updating the bookshelf
            if (isEditing && currentBookShelfId) {
                // Update document in Firestore
                const BookShelfRef = doc(db, 'shelf', currentBookShelfId);
                await updateDoc(BookShelfRef, newBookShelf);
                setBookShelfs(prev => prev.map(BookShelf =>
                    BookShelf.id === currentBookShelfId ? { ...BookShelf, ...newBookShelf } : BookShelf
                ));
            } else {
                // Add new bookshelf to Firestore
                const BookShelfsCollection = collection(db, 'shelf');
                const docRef = await addDoc(BookShelfsCollection, newBookShelf);
                setBookShelfs([...BookShelfs, { id: docRef.id, ...newBookShelf }]);
            }
    
            handleCloseModal();
        } catch (error) {
            console.error("Error saving BookShelf: ", error);
        }
    };
    

    const handleEdit = (BookShelf) => {
        setNewBookShelf({ BookShelfName: BookShelf.BookShelfName, Quantity: BookShelf.Quantity });
        setCurrentBookShelfId(BookShelf.id);
        setIsEditing(true);
        handleOpenModal();
    };

    const handleDelete = async (id, BookShelfName) => {
        // Step 1: Query the books collection to check if any book is associated with this BookShelfName
        const booksCollection = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksInShelf = booksSnapshot.docs.filter(bookDoc => bookDoc.data().BookShelfName === BookShelfName); // Check if any book has the same BookShelfName
    
        // Step 2: If there are books in this shelf, show an alert and prevent deletion
        if (booksInShelf.length > 0) {
            Swal.fire(
                'Không thể xóa!',
                'Kệ sách này có sách, không thể xóa.',
                'error'
            );
            return; // Exit early if books are found
        }
    
        // Step 3: If no books found, proceed with deletion
        const result = await Swal.fire({
            title: 'Xóa kệ này?',
            text: "Bạn có chắc chắn muốn xóa kệ này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });
    
        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'shelf', id)); // Delete the bookshelf
                setBookShelfs(BookShelfs.filter(BookShelf => BookShelf.id !== id)); // Update local state
                Swal.fire(
                    'Đã xóa!',
                    'Danh mục đã được xóa.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting BookShelf: ", error);
            }
        }
    };
    

    return (
      <div className="mx-auto p-4">
               {/* <h2 className="text-2xl font-bold mb-4">Quản lý kệ sách</h2> */}
            <button
                className="btn btn-primary mb-3"
                onClick={handleOpenModal} // Open modal
            >
                Thêm kệ sách
            </button>

            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>Tên kệ sách</th>
                            <th>Số lượng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {BookShelfs.map(BookShelf => (
                            <tr key={BookShelf.id}>
                                <td>{BookShelf.BookShelfName}</td>
                                <td>{BookShelf.Quantity}</td>
                                <td>
      <button
        className="btn btn-warning  me-2"
        onClick={() => handleEdit(BookShelf)}
        title="Sửa"
      >
        <FaEdit size={16} />
      </button>
      <button
        className="btn btn-danger "
        onClick={() => handleDelete(BookShelf.id)}
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
                                <h5 className="modal-title">{isEditing ? "Chỉnh sửa kệ sách" : "Thêm kệ sách"}</h5>
                                <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <form id="shelfForm" noValidate>
                                    <div className="form-group">
                                        <label htmlFor="BookShelfName">Tên kệ sách</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="BookShelfName"
                                            value={newBookShelf.BookShelfName}
                                            onChange={handleChange}
                                            placeholder="Nhập tên kệ sách"
                                            required
                                        />
                                        <div className="invalid-feedback">Tên kệ sách là bắt buộc.</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Quantity">Số lượng</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="Quantity"
                                            value={newBookShelf.Quantity}
                                            onChange={handleChange}
                                            placeholder="Nhập số lượng"
                                            required
                                        />
                                        <div className="invalid-feedback">Số lượng là bắt buộc.</div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>{isEditing ? "Cập nhật kệ" : "Lưu"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShelfLocation;
