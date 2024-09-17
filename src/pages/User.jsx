import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Modal from 'react-modal';
import Swal from 'sweetalert2';


Modal.setAppElement('#root');

const User = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        fetchUsers();
    }, []);

    const handleViewProfile = async (userEmail) => {
        try {
            const vaccinerecordQuery = query(
                collection(db, 'Vaccinerecord'),
                where('userEmail', '==', userEmail)
            );
            const vaccinerecordSnapshot = await getDocs(vaccinerecordQuery);

            if (vaccinerecordSnapshot.empty) {
                Swal.fire('Không có hồ sơ nào', '', 'info');
                return;
            }

            const records = vaccinerecordSnapshot.docs.map(doc => doc.data());
            setSelectedUser(records);
            setModalIsOpen(true);
        } catch (error) {
            console.error("Error fetching vaccine records: ", error);
            Swal.fire('Error', 'Failed to fetch vaccine records.', 'error');
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="mx-auto p-4">
            <h2 className=" text-2xl font-bold mb-6">Danh sách người dùng</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100 text-black">
                        <tr>
                            <th className="px-4 py-2 border-b text-left">Email</th>
                            <th className="px-4 py-2 border-b text-left"></th>

                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className=" border-b hover:bg-gray-100">

                                <td className="px-4 py-2">{user.email}</td>

                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleViewProfile(user.email)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Xem hồ sơ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {selectedUser && (
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="fixed inset-0 bg-white p-6 mx-auto max-w-7xl h-[600px] rounded shadow-lg overflow-y-auto mt-5"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                    <h2 className="text-2xl font-bold mb-4">Thông Tin Hồ Sơ</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead className="bg-gray-600 text-white">
                                <tr>
                                    <td className="px-4 py-2 font-bold border-b">Họ và tên</td>
                                    <td className="px-4 py-2 font-bold border-b">Số điện thoại</td>
                                    <td className="px-4 py-2 font-bold border-b">Mối quan hệ</td>
                                    <td className="px-4 py-2 font-bold border-b">Quốc tịch</td>
                                    <td className="px-4 py-2 font-bold border-b">Tỉnh</td>
                                    <td className="px-4 py-2 font-bold border-b">Quận/Huyện</td>
                                    <td className="px-4 py-2 font-bold border-b">Xã</td>
                                    <td className="px-4 py-2 font-bold border-b">Ngày sinh</td>

                                </tr>
                            </thead>
                            <tbody>
                                {selectedUser.map((record, index) => (

                                    <React.Fragment key={index}>

                                        <tr>
                                            <td className="px-4 py-2 border-b">{record.fullName}</td>
                                            <td className="px-4 py-2 border-b">{record.phoneNumber}</td>
                                            <td className="px-4 py-2 border-b">{record.relationship}</td>
                                            <td className="px-4 py-2 border-b">{record.selectedCountry?.name || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{record.selectedProvince?.name || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{record.selectedDistrict?.name || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{record.selectedCommune?.name || 'N/A'}</td>

                                            <td className="px-4 py-2 border-b">{new Date(record.selectedDate).toLocaleDateString()}</td>
                                        </tr>

                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={closeModal}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default User;
