




'use client';
import React, { useState, useEffect, useRef } from "react";
import { getToken } from "../lib/auth";
import ProductCard from "../components/ProductCard";

interface Category {
  _id: string;
  name: string;
  image: string;
  products: string[];
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
  category?: string;
  soldOut?: boolean;
  sizes?: any[];
  colors?: any[];
  productNumber?: string;
}

interface CategoriesProps {
  isAdmin: boolean;
}

export default function ModernCategories({ isAdmin }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [newCategory, setNewCategory] = useState({ name: "", image: null as File | null });

  // 🚀 UPDATED: Show 2 categories on mobile, more on larger screens
  const getVisibleItems = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 2;  // 🟢 CHANGED: 2 on mobile (was 1)
    if (width < 768) return 2;  // Small tablets
    if (width < 1024) return 3; // Tablets
    if (width < 1280) return 4; // Small desktop
    return 5; // Large desktop
  };

  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const updateVisibleItems = () => {
      setVisibleItems(getVisibleItems());
    };
    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  // 🚀 NEW: Touch swipe functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum swipe distance
    
    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next slide
      nextSlide();
    } else {
      // Swipe right - previous slide
      prevSlide();
    }
  };

  // Optimized data fetching with retry logic
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if (attempt === retries) throw error;
        console.log(`🔄 Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch categories and products in parallel
      const [categoriesData, productsData] = await Promise.all([
        fetchWithRetry(`https://dabeez-backend.fly.dev/api/categories`),
        fetchWithRetry(`https://dabeez-backend.fly.dev/products`)
      ]);

      console.log("✅ Data loaded successfully");
      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError("📡 Connection issue - Retrying...");
      // Auto-retry after 3 seconds
      setTimeout(() => fetchInitialData(), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update arrow visibility
  useEffect(() => {
    setShowLeftArrow(currentSlide > 0);
    setShowRightArrow(currentSlide < categories.length - visibleItems);
  }, [currentSlide, categories.length, visibleItems]);

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('products');
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
  };

  // Get category products
  const getCategoryProducts = (category: Category): Product[] => {
    return products.filter(product => category.products.includes(product._id));
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This will not delete the products.")) return;
    
    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin to delete categories");
      return;
    }

    try {
      console.log("🗑️ Deleting category:", categoryId);
      const res = await fetch(`https://dabeez-backend.fly.dev/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to delete category: ${res.status}`);

      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      if (selectedCategory && selectedCategory._id === categoryId) {
        setSelectedCategory(null);
      }
      alert("✅ Category deleted successfully!");
    } catch (error: any) {
      console.error("❌ Error deleting category:", error);
      alert(`❌ Failed to delete category: ${error.message}`);
    }
  };

  // Add product to category
  const handleAddProductToCategory = async (categoryId: string, productId: string) => {
    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin to manage categories");
      return;
    }

    try {
      console.log("🔄 Adding product to category:", { categoryId, productId });
      const res = await fetch(`https://dabeez-backend.fly.dev/api/categories/${categoryId}/products`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to add product: ${res.status}`);

      console.log("✅ Product added successfully");
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, products: [...cat.products, productId] } 
          : cat
      ));

      if (selectedCategory && selectedCategory._id === categoryId) {
        setSelectedCategory(prev => 
          prev ? { ...prev, products: [...prev.products, productId] } : null
        );
      }
    } catch (error: any) {
      console.error("❌ Error adding product to category:", error);
      alert(`❌ Failed to add product: ${error.message}`);
    }
  };

  // Remove product from category
  const handleRemoveProductFromCategory = async (categoryId: string, productId: string) => {
    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin to manage categories");
      return;
    }

    try {
      console.log("🔄 Removing product from category:", { categoryId, productId });
      const res = await fetch(`https://dabeez-backend.fly.dev/api/categories/${categoryId}/products/${productId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to remove product: ${res.status}`);

      console.log("✅ Product removed successfully");
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, products: cat.products.filter(id => id !== productId) } 
          : cat
      ));

      if (selectedCategory && selectedCategory._id === categoryId) {
        setSelectedCategory(prev => 
          prev ? { ...prev, products: prev.products.filter(id => id !== productId) } : null
        );
      }
    } catch (error: any) {
      console.error("❌ Error removing product from category:", error);
      alert(`❌ Failed to remove product: ${error.message}`);
    }
  };

  // Handle product upload
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
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${productId}/upload-images`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("❌ Upload failed: Unauthorized. Please login again.");
          return;
        }
        throw new Error(`Upload failed: ${res.status}`);
      }

      const updatedProduct = await res.json();
      setProducts((prev) => prev.map((p) => 
        p._id === updatedProduct._id ? updatedProduct : p
      ));
      alert("✅ Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("❌ Failed to upload images");
    }
  };

  // Handle toggle sold out
  const handleToggleSoldOut = (productId: string, soldOut: boolean) => {
    setProducts((prev) => prev.map((p) => 
      p._id === productId ? { ...p, soldOut } : p
    ));
  };

  // Handle size update
  const handleSizeUpdate = (productId: string, updatedSizes: any[]) => {
    setProducts(prev => prev.map(p => 
      p._id === productId ? { ...p, sizes: updatedSizes } : p
    ));
  };

  // Handle color update
  const handleColorUpdate = (productId: string, updatedColors: any[]) => {
    setProducts(prev => prev.map(p => 
      p._id === productId ? { ...p, colors: updatedColors } : p
    ));
  };

  // Slider navigation functions
  const nextSlide = () => {
    if (currentSlide < categories.length - visibleItems) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const getTransform = () => {
    const itemWidth = 100 / visibleItems;
    return `translateX(-${currentSlide * itemWidth}%)`;
  };

  // Category management function
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("❌ Category name is required!");
      return;
    }
    if (!newCategory.image) {
      alert("❌ Category image is required!");
      return;
    }

    setLoading(true);
    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin to create categories");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("image", newCategory.image);

    try {
      console.log("🔄 Creating category:", newCategory.name);
      const res = await fetch(`https://dabeez-backend.fly.dev/api/categories`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to create category: ${res.status}`);

      setCategories(prev => [...prev, result.category]);
      setShowAddModal(false);
      setNewCategory({ name: "", image: null });
      alert("✅ Category created successfully!");
    } catch (error: any) {
      console.error("❌ Error creating category:", error);
      alert(`❌ Failed to create category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 MODERN LOADING COMPONENT
  const LoadingSkeleton = () => (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse"></div>
          {isAdmin && (
            <div className="h-12 bg-gray-300 rounded w-48 mx-auto animate-pulse"></div>
          )}
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* 🟢 CHANGED: 2 columns on mobile */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 text-center"> {/* 🟢 CHANGED: Reduced padding */}
                <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Animation */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium">🔄 Loading awesome content...</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 🔥 ERROR COMPONENT
  const ErrorState = () => (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">📡</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Connection Issue</h3>
          <p className="text-gray-600 mb-8">
            We're having trouble loading categories. Don't worry, we'll keep trying!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={fetchInitialData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              🔄 Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              ↻ Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading && categories.length === 0) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (error && categories.length === 0) {
    return <ErrorState />;
  }

  // CATEGORIES VIEW
  if (viewMode === 'categories') {
    return (
      <section className="pt-8 bg-gradient-to-br from-gray-50 to-gray-100 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🛍️ Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of products organized by categories
            </p>
            
        

            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                ➕ Add New Category
              </button>
            )}
          </div>

          {/* Categories Slider Container */}
          <div className="relative">
            {/* Left Arrow - Hidden on mobile */}
            {showLeftArrow && (
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 -ml-6 hidden sm:block"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Categories Slider with Touch Support */}
            <div className="overflow-hidden">
              <div 
                ref={sliderRef} 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: getTransform() }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {categories.map((category) => (
                  <div 
                    key={category._id} 
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / visibleItems}%` }}
                  >
                    {/* 🟢 UPDATED: Consistent card height with fixed content area */}
                    <div 
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                      onClick={() => handleCategoryClick(category)} 
                    >
                      {/* Category Image - Fixed Height */}
                      <div 
                        className="h-48 bg-cover bg-center relative flex-shrink-0"
                        style={{ backgroundImage: `url(${category.image || "/placeholder.png"})` }}
                      >
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300"></div>
                        
                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(category);
                              }}
                              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                              title="Manage Products"
                            >
                              📦
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category._id);
                              }}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                              title="Delete Category"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 🟢 UPDATED: Fixed height content area for consistent sizing */}
                      <div className="p-4 text-center flex flex-col justify-between flex-grow min-h-[100px]">
                        <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 h-12 flex items-center justify-center">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-auto">
                          {category.products.length} product{category.products.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow - Hidden on mobile */}
            {showRightArrow && (
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 -mr-6 hidden sm:block"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* 🟢 UPDATED: Better dots indicator for mobile */}
          {categories.length > visibleItems && (
            <div className="flex justify-center mt-8 space-x-3">
              {Array.from({ length: Math.ceil(categories.length - visibleItems + 1) }).map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {categories.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📂</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Categories Yet</h3>
              <p className="text-gray-600 mb-6">
                {isAdmin ? "Add your first category to get started! 🚀" : "Check back later for categories"}
              </p>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">➕ Add New Category</h3>
              <input 
                type="text"
                placeholder="Category Name *"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🖼️ Category Image *
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCategory(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCategory}
                  disabled={loading || !newCategory.name.trim() || !newCategory.image}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "⏳ Creating..." : "✅ Create Category"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Products Modal */}
        {selectedCategory && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">
                Manage Products - {selectedCategory.name}
              </h3>
              
              {/* Add Products Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Add Products to Category</h4>
                {products.filter(product => !selectedCategory.products.includes(product._id)).length === 0 ? (
                  <p className="text-gray-500">No products available to add</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 border rounded-lg">
                    {products
                      .filter(product => !selectedCategory.products.includes(product._id))
                      .map(product => (
                        <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.images?.[0] || "/placeholder.png"} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-gray-600">Rs {product.price}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAddProductToCategory(selectedCategory._id, product._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Current Products Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3">
                  Products in Category ({selectedCategory.products.length})
                </h4>
                {selectedCategory.products.length === 0 ? (
                  <p className="text-gray-500">No products in this category yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-3 border rounded-lg">
                    {selectedCategory.products.map((productId: string) => {
                      const product = products.find(p => p._id === productId);
                      return product ? (
                        <div key={productId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.images?.[0] || "/placeholder.png"} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-gray-600">Rs {product.price}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveProductFromCategory(selectedCategory._id, productId)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // 🟢 UPDATED: PRODUCTS VIEW with better mobile grid
  if (viewMode === 'products' && selectedCategory) {
    const categoryProducts = getCategoryProducts(selectedCategory);
    
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Back Button and Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Categories
          </button>

          {/* Category Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              {selectedCategory.name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} available in this category
            </p>
          </div>

          {/* 🟢 UPDATED: Products Grid - Show 2+ on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  isAdmin={isAdmin}
                  onUpload={handleUpload}
                  onClick={() => {}}
                  onToggleSoldOut={handleToggleSoldOut}
                  onSizeUpdate={handleSizeUpdate}
                  onColorUpdate={handleColorUpdate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Products in This Category
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isAdmin ? "Add products to this category to get started! 🚀" : "Check back later for products in this category"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

