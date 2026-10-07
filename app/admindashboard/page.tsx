'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useath';
import Navbar from '../components/Navbar';

interface Order {
  _id: string;
  orderId?: string;
  orderNumber?: string;
  id?: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
    email?: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    productId?: string;
    size?: string;
    color?: string;
    productNumber?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'completed';
  paymentMethod: 'cash' | 'easypasa';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [newOrderNotification, setNewOrderNotification] = useState<Order | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getOrderNumber = (order: Order): string =>
    order.orderId || order.orderNumber || order.id || `ORD-${order._id.slice(-6).toUpperCase()}`;

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      console.log('🔄 Fetching orders...', { API_URL, hasToken: !!token });
      
      const response = await fetch(`https://dabeez-backend.fly.dev/api/orders`, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
      });
      
      console.log('📡 Orders response status:', response.status);
      
      if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);
      
      const data = await response.json();
      console.log('✅ Orders fetched successfully:', data.length);
      setOrders(data);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      alert('Failed to load orders. Check console for details.');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Update order status - FIXED: Changed PATCH to PUT
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed') => {
    const confirm = window.confirm('Are you sure you want to mark this order as completed?');
    if (!confirm) return;

    setUpdatingOrder(orderId);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      console.log('🔄 Updating order status:', {
        orderId,
        newStatus,
        API_URL: `https://dabeez-backend.fly.dev/api/orders/${orderId}/status`,
        tokenExists: !!token
      });

      const response = await fetch(`https://dabeez-backend.fly.dev/api/orders/${orderId}/status`, {
        method: 'PUT', // ✅ CHANGED FROM PATCH TO PUT
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('📡 Update response status:', response.status);
      console.log('📡 Update response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Failed to update order: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Update successful:', result);

      // Update locally: move order from pending → completed
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { 
            ...order, 
            status: newStatus, 
            updatedAt: new Date().toISOString() 
          } : order
        )
      );
      
      alert('✅ Order marked as completed!');
    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      alert(`Failed to update order status: ${error.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (orders.length > 0) {
      const latestOrder = orders[0];
      const isNewOrder = Date.now() - new Date(latestOrder.createdAt).getTime() < 15000;
      if (isNewOrder && latestOrder.status === 'pending') {
        setNewOrderNotification(latestOrder);
        setTimeout(() => setNewOrderNotification(null), 5000);
      }
    }
  }, [orders]);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'completed');

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-xl">Loading admin dashboard...</div>
    </div>
  );
  
  if (!isAdmin) return (
    <div className="min-h-screen flex justify-center items-center text-red-600 text-xl">
      ⚠️ Access Denied - Admin Only
    </div>
  );

  if (loadingOrders) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-xl">Loading orders...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {newOrderNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in z-50">
          <p className="font-semibold">🎉 New Order Received!</p>
          <p className="text-sm">#{getOrderNumber(newOrderNotification)} - {newOrderNotification.customer.name}</p>
          <p className="text-xs">Rs {newOrderNotification.totalAmount.toFixed(2)}</p>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold  text-gray-900 mt-6 mb-4">Order Dashboard</h1>
   

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'pending' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            📋 Pending Orders ({pendingOrders.length})
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'completed' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            📊 Order History ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {(activeTab === 'pending' ? pendingOrders : completedOrders).map(order => (
            <div 
              key={order._id} 
              className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-lg text-gray-900">
                      #{getOrderNumber(order)} - {order.customer.name}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-1">
                    📞 {order.customer.phone} 
                    {order.customer.email && ` • 📧 ${order.customer.email}`}
                  </p>
                  
                  {order.customer.address && (
                    <p className="text-gray-600 mb-2">📍 {order.customer.address}</p>
                  )}
                  
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    💰 Rs {order.totalAmount.toFixed(2)}
                  </p>
                  
                  <p className="text-gray-500 text-sm">
                    {activeTab === 'pending' ? '🕒 Created: ' : '✅ Completed: '}
                    {new Date(activeTab === 'pending' ? order.createdAt : order.updatedAt).toLocaleString()}
                  </p>

                  {/* Order Items */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">🛍️ Order Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.quantity} × {item.name}
                            {item.size && ` (${item.size})`}
                            {item.color && ` - ${item.color}`}
                          </span>
                          <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {activeTab === 'pending' && (
                  <button
                    disabled={updatingOrder === order._id}
                    className={`ml-4 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      updatingOrder === order._id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                    onClick={() => updateOrderStatus(order._id, 'completed')}
                  >
                    {updatingOrder === order._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        ✅ Complete Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {(activeTab === 'pending' && pendingOrders.length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-gray-500">No pending orders</p>
              <p className="text-gray-400">New orders will appear here automatically</p>
            </div>
          )}
          
          {(activeTab === 'completed' && completedOrders.length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-500">No completed orders yet</p>
              <p className="text-gray-400">Completed orders will appear here</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}