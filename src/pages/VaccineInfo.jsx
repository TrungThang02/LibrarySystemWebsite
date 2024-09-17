import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Swal from 'sweetalert2';

const VaccineInfo = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newInfo, setNewInfo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editVaccineId, setEditVaccineId] = useState(null);
  const [editVaccineName, setEditVaccineName] = useState('');
  const [editInfo, setEditInfo] = useState('');

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vaccinelist'));
        const vaccineList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVaccines(vaccineList);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vaccine: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccines();
  }, []);

  const handleAddVaccine = async () => {
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'vaccinelist'), {
        VaccineName: newVaccineName,
        Info: newInfo
      });
      await refreshVaccines();
      setNewVaccineName('');
      setNewInfo('');
      setShowAddModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm vaccine: ", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditVaccine = async () => {
    if (editVaccineId) {
      try {
        await updateDoc(doc(db, 'vaccinelist', editVaccineId), {
          VaccineName: editVaccineName,
          Info: editInfo
        });
        await refreshVaccines();
        setEditVaccineName('');
        setEditInfo('');
        setEditVaccineId(null);
        setShowEditModal(false);
      } catch (error) {
        console.error("Lỗi khi cập nhật vaccine: ", error);
      }
    }
  };

  const handleDeleteVaccine = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc không?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Không, giữ lại'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'vaccinelist', id));
        await refreshVaccines();
        Swal.fire('Đã xóa!', 'Vaccine đã được xóa.', 'success');
      } catch (error) {
        console.error("Lỗi khi xóa vaccine: ", error);
      }
    }
  };

  const refreshVaccines = async () => {
    const querySnapshot = await getDocs(collection(db, 'vaccinelist'));
    const vaccineList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setVaccines(vaccineList);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danh Sách Vaccine</h1>
      <button
        onClick={() => setShowAddModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600 mb-4 "
      >
        Thêm Vaccine
      </button>
      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Tên Vaccine</th>
            <th className="py-2 px-4 border-b text-left">Thông Tin</th>
            <th className="py-2 px-4 border-b text-left">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {vaccines.map(vaccine => (
            <tr key={vaccine.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{vaccine.VaccineName}</td>
              <td className="py-2 px-4 border-b">{vaccine.Info}</td>
              <td className="py-1 px-2 border-b">
                <button
                  onClick={() => {
                    setEditVaccineId(vaccine.id);
                    setEditVaccineName(vaccine.VaccineName);
                    setEditInfo(vaccine.Info);
                    setShowEditModal(true);
                  }}
                  className="px-1 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-1"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteVaccine(vaccine.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding vaccine */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Thêm Vaccine Mới</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="vaccineName">
                Tên Vaccine
              </label>
              <input
                type="text"
                id="vaccineName"
                value={newVaccineName}
                onChange={(e) => setNewVaccineName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập Tên Vaccine"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="info">
                Thông Tin
              </label>
              <textarea
                id="info"
                value={newInfo}
                onChange={(e) => setNewInfo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập Thông Tin"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleAddVaccine}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isAdding}
              >
                {isAdding ? 'Đang Thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing vaccine */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Sửa Vaccine</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="editVaccineName">
                Tên Vaccine
              </label>
              <input
                type="text"
                id="editVaccineName"
                value={editVaccineName}
                onChange={(e) => setEditVaccineName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập Tên Vaccine"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="editInfo">
                Thông Tin
              </label>
              <textarea
                id="editInfo"
                value={editInfo}
                onChange={(e) => setEditInfo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập Thông Tin"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleEditVaccine}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineInfo;
