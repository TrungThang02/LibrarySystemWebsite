// src/News.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';
import Swal from 'sweetalert2';

const News = () => {
    const [news, setNews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentNewsId, setCurrentNewsId] = useState(null);
    const [newNews, setNewNews] = useState({ title: '', description: '', image: null });

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const newsCollection = collection(db, 'news');
                const newsSnapshot = await getDocs(newsCollection);
                const newsList = newsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNews(newsList);
            } catch (error) {
                console.error("Error fetching news: ", error);
            }
        };

        fetchNews();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this news item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'news', id));
                setNews(news.filter(item => item.id !== id));
                Swal.fire('Deleted!', 'The news item has been deleted.', 'success');
            } catch (error) {
                console.error("Error deleting news: ", error);
                Swal.fire('Error!', 'There was an error deleting the news item.', 'error');
            }
        }
    };

    const handleViewDetails = (item) => {
        Swal.fire({
            title: item.title,
            html: `
                <img src="${item.image}" alt="${item.title}" class="w-full h-48 object-cover mb-4"/>
                <p>${item.description}</p>
            `,
            width: '600px'
        });
    };

    const handleEdit = (item) => {
        setCurrentNewsId(item.id);
        setNewNews({ title: item.title, description: item.description, image: null });
        setIsEdit(true);
        setShowModal(true);
    };

    const handleAddOrEditNews = async () => {
        try {
            let imageUrl = null;
    
            if (newNews.image) {
                // Upload new image and get the URL
                const imageRef = ref(storage, `images/${newNews.image.name}`);
                await uploadBytes(imageRef, newNews.image);
                imageUrl = await getDownloadURL(imageRef);
            }
    
            if (isEdit) {
                // Update existing news item
                const newsDoc = doc(db, 'news', currentNewsId);
                await updateDoc(newsDoc, {
                    title: newNews.title,
                    description: newNews.description,
                    ...(imageUrl ? { image: imageUrl } : {}), // Only update image if new image URL is available
                });
    
                // Update local state
                setNews(news.map(item => item.id === currentNewsId ? { ...item, title: newNews.title, description: newNews.description, ...(imageUrl ? { image: imageUrl } : { image: item.image }) } : item));
                Swal.fire('Success!', 'News item has been updated.', 'success');
            } else {
                // Add new news item
                const newImageUrl = imageUrl || ''; // Use new image URL or empty string if no new image
                await addDoc(collection(db, 'news'), {
                    title: newNews.title,
                    description: newNews.description,
                    image: newImageUrl,
                });
    
                // Update local state
                setNews([...news, { title: newNews.title, description: newNews.description, image: newImageUrl }]);
                Swal.fire('Success!', 'News item has been added.', 'success');
            }
    
            // Close the modal and reset states
            setShowModal(false);
            setIsEdit(false);
            setCurrentNewsId(null);
            setNewNews({ title: '', description: '', image: null });
        } catch (error) {
            console.error("Error adding or updating news: ", error);
            Swal.fire('Error!', 'There was an error adding or updating the news item.', 'error');
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewNews({ ...newNews, [name]: value });
    };

    const handleImageChange = (e) => {
        setNewNews({ ...newNews, image: e.target.files[0] });
    };

    return (
        <div className="mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý tin tức</h1>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
            >
                Thêm Tin Tức
            </button>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="min-w-full bg-gray-100 border ">
                        <tr>
                            <th className="w-1/4 px-4 py-2">Tiêu đề</th>
                            <th className="w-1/4 px-4 py-2">Mô tả</th>
                            <th className="w-1/4 px-4 py-2">Hình ảnh</th>
                            <th className="w-1/4 px-2 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="px-4 py-2">{item.title}</td>
                                <td className="px-4 py-2">{item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}</td>
                                <td className="px-4 py-2">
                                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover mx-auto"/>
                                </td>
                                <td className="px-1 py-1">
                                    <button 
                                        onClick={() => handleViewDetails(item)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 mr-2"
                                    >
                                        Sửa
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
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
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{isEdit ? 'Sửa Tin Tức' : 'Thêm Tin Tức'}</h3>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="title"
                                                value={newNews.title}
                                                onChange={handleChange}
                                                placeholder="Title"
                                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                            />
                                            <textarea
                                                name="description"
                                                value={newNews.description}
                                                onChange={handleChange}
                                                placeholder="Description"
                                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                            />
                                            <input
                                                type="file"
                                                onChange={handleImageChange}
                                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleAddOrEditNews}
                                >
                                    {isEdit ? 'Cập nhật' : 'Thêm'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEdit(false);
                                        setCurrentNewsId(null);
                                        setNewNews({ title: '', description: '', image: null });
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
