import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    description: '',
    date: '',
    type: '',
    format: '',
    identifier: '',
    source: '',
    language: '',
    relation: '',
    coverage: '',
    rights: '',
    pageCount: '',
    quantity: '',
    condition: '',
    location: '',
    coverImage: '',
    pdfUrl: '',
    status: 'available',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookDoc = doc(db, 'books', id);
        const bookSnapshot = await getDoc(bookDoc);

        if (bookSnapshot.exists()) {
          setBook({ id: bookSnapshot.id, ...bookSnapshot.data() });
        } else {
          Swal.fire('Không tìm thấy sách', 'Sách không tồn tại trong hệ thống.', 'error');
          navigate('/books');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin sách: ', error);
        Swal.fire('Có lỗi xảy ra', 'Vui lòng thử lại sau.', 'error');
      }
    };

    fetchBookDetails();
  }, [id, navigate]);

  if (!book) {
    return <div className="text-center">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-6">

      <div className="bg-white p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Thông tin chi tiết về sách: {book.title || 'Chưa có tiêu đề'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={book.coverImage || 'default_cover_image.jpg'}
              alt={book.title || 'Chưa có tiêu đề'}
              className="w-full h-auto rounded-md shadow-md"
            />
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Tên sách: {book.title || 'Chưa có tiêu đề'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg mb-1"><strong>Tác giả:</strong> {book.author || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Nhà xuất bản:</strong> {book.publisher || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Thể loại:</strong> {book.category || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Ngôn ngữ:</strong> {book.language || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Số trang:</strong> {book.pageCount || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Tình trạng:</strong> {book.status === 'available' ? 'Chưa mượn' : 'Đã mượn'}</p>
                <p className="text-lg mb-1"><strong>Số lượng:</strong> {book.quantity || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Vị trí:</strong> {book.location || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Loại:</strong> {book.type || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Định dạng:</strong> {book.format || 'Chưa có thông tin'}</p>
              </div>
              <div>
                <p className="text-lg mb-1"><strong>Ngày phát hành:</strong> {book.date || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Mã định danh(ISBN):</strong> {book.identifier || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Nguồn:</strong> {book.source || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Mối liên hệ:</strong> {book.relation || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Phạm vi:</strong> {book.coverage || 'Chưa có thông tin'}</p>
                <p className="text-lg mb-1"><strong>Quyền:</strong> {book.rights || 'Chưa có thông tin'}</p>

                <p className="text-lg mb-1"><strong>Tình trạng sách:</strong> {book.condition || 'Chưa có thông tin'}</p>
              </div>
            </div>
            <p className="text-lg mt-4"><strong>Mô tả:</strong> {book.description || 'Chưa có mô tả'}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-2">Xem PDF</h3>
          {book.pdfUrl ? (
            <iframe
              src={book.pdfUrl}
              title="PDF Viewer"
              className="w-full h-screen border border-gray-300 rounded-lg shadow-md"
            ></iframe>
          ) : (
            <p>Không có PDF để xem.</p>
          )}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/books')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Quay lại danh sách sách
          </button>
        </div>
      </div>



    </div>
  );
};

export default BookDetails;