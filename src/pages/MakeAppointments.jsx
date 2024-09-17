import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import axios from 'axios';
import Swal from 'sweetalert2';

const MakeAppointments = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const appointmentsCollection = collection(db, 'MakeAppointments');
                const appointmentSnapshot = await getDocs(appointmentsCollection);
                const appointmentsList = appointmentSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAppointments(appointmentsList);
            } catch (error) {
                console.error("Error fetching appointments: ", error);
            }
        };

        fetchAppointments();
    }, []);

    const handleApprove = async (id, userEmail, patientName) => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: "Bạn có chắc chắn muốn duyệt lịch tiêm này?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const appointmentDoc = doc(db, 'MakeAppointments', id);
                await updateDoc(appointmentDoc, { status: 'done' });

                const updatedAppointments = appointments.map(appointment =>
                    appointment.id === id ? { ...appointment, status: 'done' } : appointment
                );
                setAppointments(updatedAppointments);

                const htmlContent = `
                    <p>Kính gửi,</p>
                    <p>Đã xác nhận tiêm thành công cho hồ sơ ${patientName}</p>
                    <p>Trân trọng,</p>
                `;

                try {
                    const response = await axios.post('http://192.168.1.3:3002/send-email', {
                        recipient: userEmail,
                        subject: 'Xác nhận đặt lịch tiêm chủng',
                        html: htmlContent,
                    });

                    if (response.status === 200) {
                        Swal.fire({
                            title: 'Thành công',
                            text: "Lịch tiêm đã được duyệt và email thông báo đã được gửi.",
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        Swal.fire({
                            title: 'Cảnh báo',
                            text: "Lịch tiêm đã được duyệt, nhưng không thể gửi email thông báo.",
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (emailError) {
                    console.error("Error sending email: ", emailError);
                    Swal.fire({
                        title: 'Lỗi',
                        text: "Đã có lỗi xảy ra khi gửi email thông báo.",
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error("Error updating appointment: ", error);
            }
        }
    };

    const handleNotify = async (appointmentData) => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: "Bạn có chắc chắn muốn gửi thông báo về lịch tiêm này?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Gửi',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            const formattedDOB = new Date(appointmentData.patientDOB).toLocaleDateString();
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f0f0f0;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            padding: 20px;
                        }
                        .highlight {
                            font-weight: bold;
                            color: black;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h3>THÔNG BÁO LỊCH TIÊM</h3>
                        <p><span class="highlight">Tên Vaccine:</span> ${appointmentData.vaccineName}</p>
                        <p><span class="highlight">Thời gian Tiêm:</span> ${appointmentData.vaccinationTime}</p>
                        <p><span class="highlight">Họ và tên:</span> ${appointmentData.patientName}</p>
                        <p><span class="highlight">Ngày Sinh:</span> ${formattedDOB}</p>
                        <p><span class="highlight">Ngày Tiêm:</span> ${new Date(appointmentData.vaccinationDate.toDate()).toLocaleDateString()}</p>
                    </div>
                </body>
                </html>
            `;

            try {
                const response = await axios.post('http://192.168.1.3:3002/send-email', {
                    recipient: appointmentData.email,
                    subject: 'Email thông báo lịch tiêm',
                    html: htmlContent,
                });

                if (response.status === 200) {
                    Swal.fire({
                        title: 'Thành công',
                        text: "Email thông báo đã được gửi.",
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        title: 'Cảnh báo',
                        text: "Không thể gửi email thông báo.",
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (emailError) {
                console.error("Error sending email: ", emailError);
                Swal.fire({
                    title: 'Lỗi',
                    text: "Đã có lỗi xảy ra khi gửi email thông báo.",
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return (
        <div className="mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Lịch tiêm đã đặt</h2>
            {appointments.length === 0 ? (
                <p className="text-gray-500">Chưa có lịch tiêm nào được đặt.</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="w-full bg-gray-100 border-b">
                            <th className="py-2 px-4 border-r">Email</th>
                            <th className="py-2 px-4 border-r">Tên Bệnh Nhân</th>
                            <th className="py-2 px-4 border-r">Ngày Sinh</th>
                            <th className="py-2 px-4 border-r">Ngày Tiêm</th>
                            <th className="py-2 px-4 border-r">Giờ Tiêm</th>
                            <th className="py-2 px-4 border-r">Tên Vắc Xin</th>
                            <th className="py-2 px-4 border-r">Trạng thái</th>
                         
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(appointment => (
                            <tr key={appointment.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4 border-r">{appointment.email}</td>
                                <td className="py-2 px-4 border-r">{appointment.patientName}</td>
                                <td className="py-2 px-4 border-r">
                                    {new Date(appointment.patientDOB).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 border-r">
                                {new Date(appointment.vaccinationDate.seconds * 1000).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 border-r">{appointment.vaccinationTime}</td>
                                <td className="py-2 px-4 border-r">{appointment.vaccineName}</td>
                                <td className="py-2 px-4 border-r flex flex-row">
                                    {appointment.status === 'pending' ? (
                                        <button
                                            onClick={() => handleApprove(appointment.id, appointment.email, appointment.patientName)}
                                            className="bg-blue-500 text-white px-1 py-1 rounded hover:bg-blue-600 mx-px"
                                        >
                                            Duyệt
                                        </button>
                                    ) : (
                                        <span className="text-green-500 font-semibold">Hoàn thành</span>
                                    )}
                                    {appointment.status === 'pending' && (
                                        <button
                                            onClick={() => handleNotify(appointment)}
                                            className="bg-yellow-500 text-white px-1 py-2 rounded hover:bg-yellow-600 mx-px	"
                                        >
                                            Gửi thông báo
                                        </button>
                                    )}
                                </td>
                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MakeAppointments;
