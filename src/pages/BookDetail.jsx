import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching book detail: ", error);
      }
    };

    fetchBookDetail();
  }, [id]);

  if (!book) return <div className="flex justify-center items-center h-screen text-lg font-medium">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-lg shadow-md my-10">
      <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Thông tin chi tiết sách</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-shrink-0 w-full lg:w-1/3">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-auto rounded-lg shadow-md transform hover:scale-105 transition duration-300"
          />
        </div>

        <div className="flex-grow">
          <div className="grid grid-cols-1 gap-4 text-gray-700 mb-4">
            <p><strong className="text-gray-900">Tên sách:</strong> {book.title}</p>
            <p><strong className="text-gray-900">Tác giả:</strong> {book.author}</p>
            <p><strong className="text-gray-900">Nhà xuất bản:</strong> {book.publisher}</p>
            <p><strong className="text-gray-900">Năm xuất bản:</strong> {book.publicationYear}</p>
            <p><strong className="text-gray-900">ISBN:</strong> {book.isbn}</p>
            <p><strong className="text-gray-900">Ngôn ngữ:</strong> {book.language}</p>
            <p><strong className="text-gray-900">Thể loại:</strong> {book.genre}</p>
            <p><strong className="text-gray-900">Số trang:</strong> {book.pageCount}</p>
            <p><strong className="text-gray-900">Tình trạng:</strong> {book.condition}</p>
            <p><strong className="text-gray-900">Số lượng:</strong> {book.quantity}</p>
            <p><strong className="text-gray-900">Vị trí:</strong> {book.location}</p>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Mô tả:</h3>
            <p className="text-gray-600 leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>

      {book.pdfUrl && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Xem sách PDF:</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <iframe 
              src={book.pdfUrl} 
              width="100%" 
              height="500" 
              className="border-none"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
