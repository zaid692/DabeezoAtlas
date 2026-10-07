"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../components/CartContext";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ProductImage from "../components/ProductImage";
import { useAuth } from "../hooks/useath";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Settings,
  Truck,
  CheckCircle,
} from "lucide-react";

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { isAdmin } = useAuth();

  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  const [showDeliverySettings, setShowDeliverySettings] = useState(false);
  const [deliveryChargesInput, setDeliveryChargesInput] = useState(0);
  const [loading, setLoading] = useState(false);
const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const total = subtotal + deliveryCharges;

  // ✅ Fetch delivery charges from backend
  const fetchDeliveryCharges = async () => {
    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/api/delivery-charges`);
      if (!res.ok) throw new Error("Failed to fetch delivery charges");
      const data = await res.json();
      setDeliveryCharges(data.amount);
      setDeliveryChargesInput(data.amount);
    } catch (err) {
      console.error("Error fetching delivery charges:", err);
    }
  };

  // ✅ Update delivery charges (Admin)
  const updateDeliveryCharges = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://dabeez-backend.fly.dev/api/delivery-charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: deliveryChargesInput }),
      });

      if (!res.ok) throw new Error("Failed to update delivery charges");
      alert("✅ Delivery charges updated successfully!");
      setDeliveryCharges(deliveryChargesInput);
      setShowDeliverySettings(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update delivery charges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-2">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowDeliverySettings(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Settings className="w-5 h-5" />
              <span>Delivery Settings</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Link href="/product">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.size || "no-size"}-${item.color || "no-color"}`}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        size="thumbnail"
                        containerClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shadow-xs"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          Rs {item.price} × {item.quantity} =
                          <span className="text-green-600">
                            {" "}
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, -1, item.size, item.color)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, 1, item.size, item.color)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item._id, item.size, item.color)
                          }
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      Rs {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Delivery Charges</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      Rs {deliveryCharges.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rs {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Link href="/checkout" className="block">
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>

                  <Link href="/product">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span>Continue Shopping</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Modal */}
      {showDeliverySettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Settings</h2>
              <button
                onClick={() => setShowDeliverySettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Delivery Charges (Rs)
            </label>
            <input
              type="number"
              value={deliveryChargesInput}
              onChange={(e) => setDeliveryChargesInput(Number(e.target.value))}
              min="0"
              step="1"
              className="w-full border border-gray-300 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeliverySettings(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={updateDeliveryCharges}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
