"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "../lib/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SizeOption {
  size: string;
  available: boolean;
}

interface Product {
  _id: string;
  name: string;
  sizes?: SizeOption[];
}

interface SizeManagementModalProps {
  product: Product;
  onClose: () => void;
  onSizeUpdate: (productId: string, updatedSizes: SizeOption[]) => void;
}

export default function SizeManagementModal({ product, onClose, onSizeUpdate }: SizeManagementModalProps) {
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with product sizes or default sizes
    if (product.sizes && product.sizes.length > 0) {
      setSizes(product.sizes);
    } else {
      setSizes([
        { size: "S", available: true },
        { size: "M", available: true },
        { size: "L", available: true }
      ]);
    }
  }, [product]);

  const toggleSizeAvailability = (size: string) => {
    setSizes(prev => prev.map(s => 
      s.size === size ? { ...s, available: !s.available } : s
    ));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      alert("❌ Please login to update sizes");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${product._id}/sizes`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sizes })
      });

      if (!res.ok) {
        throw new Error(`Failed to update sizes: ${res.status}`);
      }

      const updatedProduct = await res.json();
      onSizeUpdate(product._id, updatedProduct.sizes);
      alert("✅ Sizes updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update sizes error:", err);
      alert("❌ Failed to update sizes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Manage Sizes - {product.name}</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Click sizes to mark as available/unavailable:
          </label>
          <div className="flex gap-3">
            {sizes.map((sizeOption) => (
              <button
                key={sizeOption.size}
                type="button"
                onClick={() => toggleSizeAvailability(sizeOption.size)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  sizeOption.available
                    ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                    : "bg-red-500 text-white border-red-600 hover:bg-red-600 line-through"
                }`}
              >
                {sizeOption.size}
                {!sizeOption.available && " ✗"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Green = Available, Red = Out of Stock
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}