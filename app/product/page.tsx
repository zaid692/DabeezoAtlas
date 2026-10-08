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

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const showNavbar = true;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setFetchError("");
        console.log("🔄 Fetching products for PUBLIC view...");

        const res = await fetch(`https://dabeez-backend.fly.dev/products`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorMsg = `❌ Failed to load products: ${res.status}`;
          setFetchError(errorMsg);
          setProducts([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          setFetchError("Invalid data format received from server");
          setProducts([]);
          return;
        }

        setProducts(data);
      } catch (err) {
        const errorMsg = "🔌 Network error: Failed to connect to server";
        setFetchError(errorMsg);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))
    ),
  ];

  const filteredByCategory =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const sortedProducts = [...filteredByCategory].sort((a, b) => {
    if (sortOrder === "asc") return a.price - b.price;
    if (sortOrder === "desc") return b.price - a.price;
    return 0;
  });

  const handleUpload = async (productId: string, files: File[]) => {
    if (!files || files.length === 0) return;
    if (!isAdmin) {
      alert("❌ Admin access required to upload images");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("❌ Please login to upload images");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      alert("🔄 Uploading images...");
      const res = await fetch(
        `https://dabeez-backend.fly.dev/products/${productId}/upload-images`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          alert("❌ Upload failed: Unauthorized. Please login again.");
          return;
        }
        throw new Error(`Upload failed: ${res.status}`);
      }

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

  // ✅ FIXED: THIS NOW UPDATES BACKEND + UI
  const handleToggleSoldOut = async (productId: string, soldOut: boolean) => {
    const token = getToken();
    if (!token) {
      alert("❌ Please login first");
      return;
    }

    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ soldOut })
      });

      if (!res.ok) {
        alert("❌ Failed to update Sold Out status");
        return;
      }

      const updatedProduct = await res.json();

      setProducts(prev =>
        prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p))
      );

    } catch (err) {
      console.error(err);
      alert("❌ Network error");
    }
  };

  const handleSizeUpdate = (productId: string, updatedSizes: SizeOption[]) => {
    setProducts(prev =>
      prev.map(p =>
        p._id === productId ? { ...p, sizes: updatedSizes } : p
      )
    );
  };

  const handleColorUpdate = (productId: string, updatedColors: ColorOption[]) => {
    setProducts(prev =>
      prev.map(p =>
        p._id === productId ? { ...p, colors: updatedColors } : p
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
        {showNavbar && <Navbar />}
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-gray-700">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      {showNavbar && <Navbar />}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 mt-6 sm:mt-8">
          <h1 className="text-2xl mt-2 pt-4 sm:text-4xl  md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
            Discover Our Collection
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Explore our carefully curated selection of premium products
          </p>
        </div>

        {fetchError && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mx-2 sm:mx-0">
            <div className="flex items-center justify-center space-x-2 text-red-700">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-sm sm:text-base">{fetchError}</span>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="mb-6 sm:mb-8 space-y-4 px-2 sm:px-0">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex-1"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium text-gray-700 text-sm sm:text-base">Categories</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-24"
              >
                <option value="default">Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Section */}
          <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Categories */}
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Categories</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        if (window.innerWidth < 1024) {
                          setIsFilterOpen(false);
                        }
                      }}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort - Desktop */}
              <div className="hidden lg:flex lg:items-center lg:space-x-3">
                <label className="text-sm font-semibold text-gray-900">Sort by:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {(selectedCategory !== "All" || sortOrder !== "default") && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl mx-2 sm:mx-0">
            <div className="flex items-center space-x-2 text-blue-700">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
                {selectedCategory !== "All" && ` in "${selectedCategory}"`}
                {sortOrder !== "default" &&
                  ` sorted by price ${
                    sortOrder === "asc" ? "low to high" : "high to low"
                  }`}
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0 w-full items-stretch">
          {sortedProducts && sortedProducts.length > 0 ? (
            sortedProducts.map(
              (product) =>
                product &&
                product._id && (
                  <div key={product._id} className="w-full h-full flex justify-center">
                    <ProductCard
                      product={product}
                      isAdmin={isAdmin}
                      onUpload={handleUpload}
                      onClick={() => setSelectedProduct(product)}
                      onToggleSoldOut={handleToggleSoldOut}
                      onSizeUpdate={handleSizeUpdate}
                      onColorUpdate={handleColorUpdate}
                    />
                  </div>
                )
            )
          ) : (
            <div className="col-span-full text-center py-12 sm:py-16">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {fetchError ? "Failed to load products" : "No products available"}
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  {fetchError ? "Please check your connection and try again" : "Check back later for new arrivals"}
                </p>
                {!fetchError && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Product Button */}
        {isAdmin && (
          <div className="mt-8 sm:mt-12 flex justify-center px-2 sm:px-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base">Add New Product</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newProduct) => {
            setProducts((prev) => [...prev, newProduct]);
            alert("✅ Product added successfully!");
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
