"use client";
import React, { useState } from "react";
import { getToken } from "../lib/auth";

interface AddProductModalProps {
  onClose: () => void;
  onAdded: (product: any) => void;
}

interface SizeOption {
  size: string;
  available: boolean;
}

interface ColorOption {
  color: string;
  available: boolean;
}

export default function AddProductModal({ onClose, onAdded }: AddProductModalProps) {
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    category: "", 
    description: ""
  });
  const [sizes, setSizes] = useState<SizeOption[]>([
    { size: "S", available: true },
    { size: "M", available: true },
    { size: "L", available: true }
  ]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [newColor, setNewColor] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const toggleSizeAvailability = (size: string) => {
    setSizes(prev => prev.map(s => s.size === size ? { ...s, available: !s.available } : s));
  };

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
    setColors(prev => prev.map(c => c.color === color ? { ...c, available: !c.available } : c));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addColor();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return alert("Name & Price required!");
    const token = getToken();
    if (!token) return alert("Please login");

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k,v]) => data.append(k, v));
      data.append("sizes", JSON.stringify(sizes));
      data.append("colors", JSON.stringify(colors));
      files.forEach(file => data.append("images", file));

      setDebugInfo(JSON.stringify({ formData, sizes, colors, filesCount: files.length }, null, 2));

      const res = await fetch(`https://dabeez-backend.fly.dev/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Failed: ${res.status}`);
      }

      const result = await res.json();
      onAdded(result.product);
      alert("Product added successfully!");
      onClose();
    } catch (err: any) {
      console.error("Add product error:", err);
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

        {debugInfo && (
          <details className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-mono">🔍 Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </details>
        )}

        <input type="text" name="name" placeholder="Product Name *" value={formData.name} onChange={handleChange} className="w-full border rounded p-2 mb-3" />
        <input type="number" name="price" placeholder="Price *" value={formData.price} onChange={handleChange} className="w-full border rounded p-2 mb-3" />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2 mb-3" />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2 mb-3" />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Size Availability *</label>
          <div className="flex gap-2">
            {sizes.map(s => (
              <button key={s.size} type="button" onClick={() => toggleSizeAvailability(s.size)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 font-medium transition-all ${s.available ? "bg-green-500 text-white border-green-600" : "bg-gray-300 text-gray-600 border-gray-400 line-through"}`}>
                {s.size}{!s.available && " ✗"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Color Options</label>
          <div className="flex gap-2 mb-3">
            <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} onKeyPress={handleKeyPress} placeholder="Add color" className="flex-1 border rounded p-2 text-sm" />
            <button type="button" onClick={addColor} disabled={!newColor.trim()} className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {colors.map(c => (
              <div key={c.color} className="relative">
                <button type="button" onClick={() => toggleColorAvailability(c.color)}
                  className={`px-3 py-1 rounded-lg border-2 font-medium text-sm ${c.available ? "bg-purple-500 text-white border-purple-600" : "bg-red-500 text-white border-red-600 line-through"}`}>
                  {c.color}{!c.available && " ✗"}
                </button>
                <button type="button" onClick={() => removeColor(c.color)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        </div>

        <input type="file" multiple onChange={handleFileChange} className="mb-3" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">{loading ? "Adding..." : "Add"}</button>
        </div>
      </div>
    </div>
  );
}
