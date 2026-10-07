'use client';
import React, { useState, useEffect } from "react";
import { getToken } from "../lib/auth";
import { 
  X, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Info,
  ZoomIn,
  Loader2,
  Edit3,
  Save
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price?: number;
  category?: string;
  description?: string;
  color?: string;
  images?: string[];
}

interface ProductModalProps {
  product: Product;
  isAdmin: boolean;
  onUpload: (productId: string, files: File[]) => void;
  onClose: () => void;
  onImageDelete?: (productId: string, imageUrl: string) => void;
  onDescriptionUpdate?: (productId: string, newDescription: string) => void;
}

export default function ProductModal({ 
  product, 
  isAdmin, 
  onUpload, 
  onClose, 
  onImageDelete,
  onDescriptionUpdate 
}: ProductModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(
    product.images && product.images.length > 0 ? product.images[0] : null
  );
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<string[]>(product.images || []);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState(product.description || "");
  const [updatingDescription, setUpdatingDescription] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      alert("❌ Please select at least one file!");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("❌ Please login to upload images");
      return;
    }

    setUploading(true);
    try {
      console.log("🔄 Uploading images for product:", product._id);
      await onUpload(product._id, selectedFiles);
      setSelectedFiles([]);
      alert("✅ Images uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      alert("❌ Please login to delete images");
      return;
    }

    setDeletingImage(imageUrl);
    try {
      console.log("🗑️ Deleting image:", imageUrl);
      
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${product._id}/images`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: imageUrl })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to delete image: ${res.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await res.json();
      console.log("✅ Image deleted successfully:", result);
      
      const updatedImages = localImages.filter(img => img !== imageUrl);
      setLocalImages(updatedImages);
      
      if (mainImage === imageUrl) {
        setMainImage(updatedImages.length > 0 ? updatedImages[0] : null);
      }
      
      if (onImageDelete) {
        onImageDelete(product._id, imageUrl);
      }
      
      alert("✅ Image deleted successfully!");
      
    } catch (err: any) {
      console.error("❌ Delete image failed:", err);
      alert(`❌ Failed to delete image: ${err.message}`);
    } finally {
      setDeletingImage(null);
    }
  };

  const handleUpdateDescription = async () => {
    if (!isAdmin) return;

    const token = getToken();
    if (!token) {
      alert("❌ Please login to update description");
      return;
    }

    setUpdatingDescription(true);
    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/products/${product._id}/description`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: localDescription })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to update description: ${res.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await res.json();
      console.log("✅ Description updated successfully:", result);
      
      // Call parent callback if provided
      if (onDescriptionUpdate) {
        onDescriptionUpdate(product._id, localDescription);
      }
      
      setIsEditingDescription(false);
      alert("✅ Description updated successfully!");
      
    } catch (err: any) {
      console.error("❌ Update description failed:", err);
      alert(`❌ Failed to update description: ${err.message}`);
    } finally {
      setUpdatingDescription(false);
    }
  };

  const handleThumbnailClick = (img: string) => {
    setMainImage(img);
  };

  const handleImageClick = (img: string) => {
    setSelectedImage(img);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handleCancelEdit = () => {
    setLocalDescription(product.description || "");
    setIsEditingDescription(false);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              {product.price && (
                <p className="text-lg text-gray-600 mt-1">Rs {product.price}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col lg:flex-row gap-6 p-6">
              {/* Left Side - Image Gallery */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
                  <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible">
                    {localImages.map((img, idx) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <div
                          className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                            mainImage === img 
                              ? "border-blue-500 ring-2 ring-blue-200" 
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => handleThumbnailClick(img)}
                        >
                          <img
                            src={img}
                            alt={`thumbnail-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDeleteImage(img, e)}
                            disabled={deletingImage === img}
                            className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center transition-all ${
                              deletingImage === img 
                                ? 'opacity-100 bg-red-600' 
                                : 'opacity-0 group-hover:opacity-100 hover:bg-red-600'
                            }`}
                          >
                            {deletingImage === img ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              '×'
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                    {localImages.length === 0 && (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1 order-1 lg:order-2">
                    <div className="bg-gray-50 rounded-xl p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
                      {mainImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={mainImage}
                            alt="main-product"
                            className="max-h-[350px] max-w-full object-contain cursor-pointer transition-transform hover:scale-105"
                            onClick={() => handleImageClick(mainImage)}
                          />
                          
                          <button
                            onClick={() => handleImageClick(mainImage)}
                            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                          
                          {isAdmin && (
                            <button
                              onClick={(e) => handleDeleteImage(mainImage, e)}
                              disabled={deletingImage === mainImage}
                              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                            >
                              {deletingImage === mainImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>No image selected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Description & Admin Tools */}
              <div className="lg:w-96 flex-shrink-0">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                    </div>
                    {isAdmin && product.description && (
                      <button
                        onClick={() => setIsEditingDescription(!isEditingDescription)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isEditingDescription ? "Cancel editing" : "Edit description"}
                      >
                        {isEditingDescription ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Description - EDITABLE WITH BACKEND SAVE */}
                  {product.description && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Description</p>
                      <div className="relative">
                        {isEditingDescription ? (
                          <div className="space-y-3">
                            <textarea
                              value={localDescription}
                              onChange={(e) => setLocalDescription(e.target.value)}
                              className="w-full h-32 p-3 text-gray-600 leading-relaxed bg-white rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                              placeholder="Enter product description..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateDescription}
                                disabled={updatingDescription}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                              >
                                {updatingDescription ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                {updatingDescription ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updatingDescription}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-line">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin Upload Section */}
                  {isAdmin && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Admin Tools</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images
                          </label>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={handleFileChange} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={uploading}
                          />
                        </div>
                        
                        <button
                          onClick={handleUploadClick}
                          disabled={uploading || selectedFiles.length === 0}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            uploading || selectedFiles.length === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span>Upload {selectedFiles.length} Image(s)</span>
                            </>
                          )}
                        </button>
                        
                        {selectedFiles.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800 mb-2">
                              Selected Files:
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {selectedFiles.map((file, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                  {file.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseImageModal}
        >
          <div className="relative w-full h-full flex items-center justify-center max-w-7xl max-h-full">
            <img
              src={selectedImage}
              alt="zoomed-product"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(selectedImage, e);
                    handleCloseImageModal();
                  }}
                  disabled={deletingImage === selectedImage}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingImage === selectedImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              )}
              
              <button
                onClick={handleCloseImageModal}
                className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}