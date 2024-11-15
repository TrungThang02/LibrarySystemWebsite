import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase/firebase'; // Assuming firebase is initialized here

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Home = () => {
  const [bookCount, setBookCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);

    const fetchData = async () => {
      // Get number of books
      const booksCollection = collection(db, 'books');
      const booksSnapshot = await getDocs(booksCollection);
      setBookCount(booksSnapshot.size);

      // Get number of users
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      setUserCount(usersSnapshot.size);
    };

    fetchData();
  }, []);

  // Chart data
  const chartData = {
    labels: ['Books', 'Users'],
    datasets: [
      {
        label: 'Count',
        data: [bookCount, userCount],
        backgroundColor: ['#4e73df', '#1cc88a'],
        borderColor: ['#4e73df', '#1cc88a'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Book and User Statistics',
      },
    },
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
     
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
      

        {/* Dashboard Content */}
        <main className="p-4">
          <h2 className="mb-4">Welcome to the Dashboard</h2>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <p className="card-text">{userCount}</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Books</h5>
                  <p className="card-text">{bookCount}</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Statistics</h5>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
