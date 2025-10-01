import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import './DashboardCharts.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/reports/delivery-stats', {
          baseURL: '',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setChartData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data. Please try again later.');
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) return <div className="chart-loading">Loading tea business analytics...</div>;
  if (error) return <div className="chart-error">{error}</div>;
  if (!chartData) return null;

  // Prepare data for monthly tea deliveries chart
  const monthlyLabels = chartData.monthlyData.map(item => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[item.month - 1];
  });
  
  const monthlyQuantities = chartData.monthlyData.map(item => item.total_quantity);

  const monthlyDeliveryData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Tea Deliveries (kg)',
        data: monthlyQuantities,
        backgroundColor: 'rgba(46, 139, 87, 0.6)',
        borderColor: 'rgba(46, 139, 87, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for supplier performance chart
  const supplierLabels = chartData.supplierData.map(item => item.supplier_name);
  const supplierQuantities = chartData.supplierData.map(item => item.total_quantity);

  const supplierData = {
    labels: supplierLabels,
    datasets: [
      {
        label: 'Tea Supplier Performance (kg)',
        data: supplierQuantities,
        backgroundColor: [
          'rgba(46, 139, 87, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(46, 139, 87, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for payment status chart
  const paymentLabels = chartData.paymentStatusData.map(item => item.payment_status);
  const paymentCounts = chartData.paymentStatusData.map(item => item.count);

  const paymentStatusData = {
    labels: paymentLabels,
    datasets: [
      {
        label: 'Payment Status Distribution',
        data: paymentCounts,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for staff performance chart
  const staffLabels = chartData.staffPerformanceData.map(item => item.staff_name);
  const staffDeliveries = chartData.staffPerformanceData.map(item => item.delivery_count);

  const staffPerformanceData = {
    labels: staffLabels,
    datasets: [
      {
        label: 'Staff Performance (Deliveries Received)',
        data: staffDeliveries,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="dashboard-charts">
      <h2 className="charts-title">Tea Business Analytics</h2>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Tea Deliveries</h3>
          <div className="chart-container">
            <Bar 
              data={monthlyDeliveryData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Tea Delivery Trends by Month',
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Tea Suppliers</h3>
          <div className="chart-container">
            <Pie 
              data={supplierData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Tea Quantity by Supplier (kg)',
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Payment Status</h3>
          <div className="chart-container">
            <Pie 
              data={paymentStatusData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Tea Delivery Payment Status',
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Staff Performance</h3>
          <div className="chart-container">
            <Bar 
              data={staffPerformanceData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Tea Deliveries Received by Staff',
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      <div className="recent-deliveries">
        <h3>Recent Tea Deliveries</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Staff</th>
              <th>Quantity (kg)</th>
              <th>Date</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {chartData.recentDeliveries.map((delivery) => (
              <tr key={delivery.delivery_id}>
                <td>{delivery.delivery_id}</td>
                <td>{delivery.supplier_name}</td>
                <td>{delivery.staff_name}</td>
                <td>{delivery.quantity_kg}</td>
                <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${delivery.payment_status.toLowerCase().replace(' ', '-')}`}>
                    {delivery.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardCharts;