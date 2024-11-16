import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
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
    <div className="mx-auto p-4">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/tabler@1.0.0-beta13/dist/css/tabler.min.css"
      />
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center">Thông tin chi tiết về sách: {book.title || 'Chưa có tiêu đề'}</h2>
          <div className="row">
            <div className="col-md-6">
              <img
                src={book.coverImage || 'default_cover_image.jpg'}
                alt={book.title || 'Chưa có tiêu đề'}
                className="img-fluid rounded mb-4"
              />
            </div>
            <div className="col-md-6">
              <h3 className="h3">Tên sách: {book.title || 'Chưa có tiêu đề'}</h3>
              <div className="row">
                <div className="col-6">
                  <p><strong>Tác giả:</strong> {book.author || 'Chưa có thông tin'}</p>
                  <p><strong>Nhà xuất bản:</strong> {book.publisher || 'Chưa có thông tin'}</p>
                  <p><strong>Thể loại:</strong> {book.category || 'Chưa có thông tin'}</p>
                  <p><strong>Ngôn ngữ:</strong> {book.language || 'Chưa có thông tin'}</p>
                  <p><strong>Số trang:</strong> {book.pageCount || 'Chưa có thông tin'}</p>
                  <p><strong>Tình trạng:</strong> {book.status === 'available' ? 'Chưa mượn' : 'Đã mượn'}</p>
                  <p><strong>Số lượng:</strong> {book.quantity || 'Chưa có thông tin'}</p>
                  <p><strong>Vị trí:</strong> {book.location || 'Chưa có thông tin'}</p>
                  <p><strong>Loại:</strong> {book.type || 'Chưa có thông tin'}</p>
                  <p><strong>Định dạng:</strong> {book.format || 'Chưa có thông tin'}</p>
                </div>
                <div className="col-6">
                  <p><strong>Ngày phát hành:</strong> {book.date || 'Chưa có thông tin'}</p>
                  <p><strong>Mã định danh (ISBN):</strong> {book.identifier || 'Chưa có thông tin'}</p>
                  <p><strong>Nguồn:</strong> {book.source || 'Chưa có thông tin'}</p>
                  <p><strong>Mối liên hệ:</strong> {book.relation || 'Chưa có thông tin'}</p>
                  <p><strong>Phạm vi:</strong> {book.coverage || 'Chưa có thông tin'}</p>
                  <p><strong>Quyền:</strong> {book.rights || 'Chưa có thông tin'}</p>
                  <p><strong>Tình trạng sách:</strong> {book.condition === 'borrowed' ? 'Đã mượn' : (book.condition || 'Chưa có thông tin')}</p>
                </div>
              </div>
              <p className="mt-4"><strong>Mô tả:</strong> {book.description || 'Chưa có mô tả'}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="card-subtitle">Xem PDF</h3>
            {book.pdfUrl ? (
              <iframe
                src={book.pdfUrl}
                title="PDF Viewer"
                className="w-100 border border-gray-300 rounded mb-4"
                style={{ height: '600px' }}
              ></iframe>
            ) : (
              <p>Không có PDF để xem.</p>
            )}
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/books')}
              className="btn btn-primary"
            >
              Quay lại danh sách sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
