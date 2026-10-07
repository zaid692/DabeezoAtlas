"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "../lib/auth";

interface ColorOption {
  color: string;
  available: boolean;
}

interface Product {
  _id: string;
  name: string;
  colors?: ColorOption[];
}

interface ColorManagementModalProps {
  product: Product;
  onClose: () => void;
  onColorUpdate: (productId: string, updatedColors: ColorOption[]) => void;
}

export default function ColorManagementModal({ product, onClose, onColorUpdate }: ColorManagementModalProps) {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [newColor, setNewColor] = useState("");
  const [loading, setLoading] = useState(false);
const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    // Initialize with product colors or empty array
    if (product.colors && product.colors.length > 0) {
      setColors(product.colors);
    } else {
      setColors([]);
    }
  }, [product]);

  const addColor = () => {
    const trimmedColor = newColor.trim();
    if (trimmedColor && !colors.find(c => c.color.toLowerCase() === trimmedColor.toLowerCase())) {
      setColors(prev => [...prev, { color: trimmedColor, available: true }]);
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(prev => prev.filter(c => c.color !== colorToRemove));
  };

  const toggleColorAvailability = (color: string) => {
    setColors(prev => prev.map(c => 
      c.color === color ? { ...c, available: !c.available } : c
    ));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      alert("❌ Please login to update colors");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${product._id}/colors`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ colors })
      });

      if (!res.ok) {
        throw new Error(`Failed to update colors: ${res.status}`);
      }

      const updatedProduct = await res.json();
      onColorUpdate(product._id, updatedProduct.colors);
      alert("✅ Colors updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update colors error:", err);
      alert("❌ Failed to update colors");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addColor();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Manage Colors - {product.name}</h2>
        
        {/* Add Color Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Add color (e.g., Magenta, Black)"
            className="flex-1 border rounded p-2 text-sm"
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={addColor}
            disabled={!newColor.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Colors Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Click colors to mark as available/unavailable:
          </label>
          
          {colors.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No colors added yet. Add colors above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
              {colors.map((colorOption) => (
                <div key={colorOption.color} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleColorAvailability(colorOption.color)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                      colorOption.available
                        ? "bg-purple-500 text-white border-purple-600 hover:bg-purple-600"
                        : "bg-red-500 text-white border-red-600 hover:bg-red-600 line-through"
                    }`}
                  >
                    {colorOption.color}
                    {!colorOption.available && " ✗"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeColor(colorOption.color)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 transition"
                    title="Remove color"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-purple-600">● Purple</span> = Available, 
            <span className="text-red-600"> ● Red</span> = Out of Stock
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading || colors.length === 0}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}