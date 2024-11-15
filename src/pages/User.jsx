import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
const User = () => {
  const [users, setUsers] = useState([]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const UsersCollection = collection(db, 'users');
        const UserSnapshot = await getDocs(UsersCollection);
        const UsersList = UserSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredUsers = UsersList.filter(user => user.role !== 'admin');
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching Users: ", error);
      }
    };

    fetchUsers();
  }, []);




  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa người dùng này?',
      text: "Bạn có chắc chắn muốn xóa người dùng này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'users', id));
        setUsers(users.filter(user => user.id !== id));
        Swal.fire(
          'Đã xóa!',
          'Người dùng đã được xóa.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    }
  };

  return (
    <div className="mx-auto p-4">
      {/* <h2 className="text-2xl font-bold mb-4">Quản lý người dùng</h2> */}
      
      <table className="table table-bordered table-hover">
        <thead>
          <tr className="w-full bg-gray-100 border-b">
            <th className="py-2 px-4 border-r">Tên</th>
            <th className="py-2 px-4 border-r">Email</th>
            <th className="py-2 px-4 border-r">Role</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 border-r">{user.name}</td>
              <td className="py-2 px-4 border-r">{user.email}</td>
              <td className="py-2 px-4 border-r">{user.role}</td>
              <td className="py-2 px-4 flex gap-2">
              <button
        className="btn btn-danger"
        onClick={() => handleDelete(user.id)}
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
  );
};

export default User;
