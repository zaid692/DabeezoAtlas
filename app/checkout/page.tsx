"use client";

import { useCart } from "../components/CartContext";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  size?: string;
  color?: string;
  productNumber?: string;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch delivery charges
  useEffect(() => {
    const fetchDeliveryCharges = async () => {
      try {
        const res = await fetch(`https://dabeez-backend.fly.dev/api/delivery-charges`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch delivery charges");
        const data = await res.json();
        setDeliveryCharges(data.amount || 0);
      } catch (err) {
        console.error("Error fetching delivery charges:", err);
        setDeliveryCharges(0);
      }
    };

    fetchDeliveryCharges();
  }, [API_URL]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = subtotal + deliveryCharges;

  // ✅ Save order to backend (with email)
  const saveOrderToDatabase = async () => {
    try {
      const orderData = {
        customer: formData,
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId: item._id,
          size: item.size,
          color: item.color,
          productNumber: item.productNumber,
        })),
        totalAmount: total,
        subtotal,
        deliveryCharges,
        paymentMethod: "cash",
      };

      const response = await fetch(`https://dabeez-backend.fly.dev/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Order placed successfully!\n\nOrder ID: ${result.order.orderId}\nSubtotal: PKR ${subtotal.toFixed(
            2
          )}\nDelivery: PKR ${deliveryCharges.toFixed(
            2
          )}\nTotal: PKR ${total.toFixed(
            2
          )}\n\nAn email confirmation has been sent.`
        );
        clearCart();
        setFormData({ name: "", phone: "", address: "", email: "" });
        setPaymentStatus("idle");
      } else {
        throw new Error(result.message || "Failed to save order");
      }
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert("❌ Failed to place order. Please try again.");
      setPaymentStatus("failed");
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert("❌ Please fill in all required fields: Name, Phone, and Address");
      return;
    }

    if (cartItems.length === 0) {
      alert("❌ Your cart is empty");
      return;
    }

    setPaymentStatus("processing");
    await saveOrderToDatabase();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 mt-4">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🧾 Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Order Summary
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-center text-gray-600 py-6">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={`${item._id}-${item.size || "no-size"}-${
                        item.color || "no-color"
                      }`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} × PKR {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800">
                        PKR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 💰 Price Breakdown */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      PKR {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Delivery Charges:</span>
                    <span className="font-semibold text-orange-600">
                      PKR {deliveryCharges.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span className="text-gray-800">Total Amount:</span>
                    <span className="text-green-600">
                      PKR {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 📦 Delivery Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Delivery Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={paymentStatus === "processing"}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  disabled={paymentStatus === "processing"}
                />
              </div>

              {/* Email */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email *
  </label>
  <input
    type="email"
    placeholder="Enter your email"
    className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    value={formData.email}
    onChange={(e) =>
      setFormData({ ...formData, email: e.target.value })
    }
    required
    disabled={paymentStatus === "processing"}
  />
</div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  placeholder="Enter your delivery address"
                  className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  disabled={paymentStatus === "processing"}
                />
              </div>

              {/* Payment */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-transparent hover:border-blue-300 transition">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked
                    readOnly
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">
                      Cash on Delivery
                    </span>
                    <p className="text-sm text-gray-600">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={paymentStatus === "processing" || cartItems.length === 0}
                className={`w-full text-white font-bold py-4 rounded-lg transition-all duration-200 ${
                  paymentStatus === "processing" || cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-lg"
                }`}
              >
                {paymentStatus === "processing"
                  ? "Processing..."
                  : `Place Order - PKR ${total.toFixed(2)} (Cash on Delivery)`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
