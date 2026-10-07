'use client';
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import AddProductModal from "../components/AddProductModal";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useath";
import { getToken } from "../lib/auth";

interface SizeOption {
  size: string;
  available: boolean;
}

interface ColorOption {
  color: string;
  available: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  color?: string;
  productNumber?: string;
  images?: string[];
  soldOut?: boolean;
  sizes?: SizeOption[];
  colors?: ColorOption[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { isAdmin, loading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const showNavbar = true;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setFetchError("");
        console.log("Fetching products...");

        const res = await fetch(`https://dabeez-backend.fly.dev/products`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          setFetchError(`Failed to load products: ${res.status}`);
          setProducts([]);
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          setFetchError("Invalid data format from server");
          setProducts([]);
          return;
        }

        // Show only the last 9 products
        setProducts(data.slice(-9));
      } catch (err) {
        setFetchError("Network error: Failed to connect to server");
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleUpload = async (productId: string, files: File[]) => {
    if (!files || files.length === 0 || !isAdmin) return;
    const token = getToken();
    if (!token) return alert("Please login to upload images");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(
        `https://dabeez-backend.fly.dev/products/${productId}/upload-images`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      alert("✅ Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("❌ Failed to upload images");
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {showNavbar && <Navbar />}

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Featured Products
          </h1>
          <p className="text-gray-600">Our top-selling items at a glance</p>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="text-center bg-red-50 text-red-700 p-4 rounded-xl mb-8 shadow-sm">
            {fetchError}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 justify-items-center">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isAdmin={isAdmin}
                onUpload={handleUpload}
                onClick={() => setSelectedProduct(product)}
                onToggleSoldOut={() => {}}
                onSizeUpdate={() => {}}
                onColorUpdate={() => {}}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No products found</p>
            </div>
          )}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-10">
          <a
            href="/product"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            View All Products
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </main>

      {/* Admin Add Product Button */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
            title="Add new product"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newProduct) => {
            setProducts((prev) => [...prev, newProduct]);
            alert("✅ Product added successfully!!");
          }}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isAdmin={isAdmin}
          onUpload={handleUpload}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}








