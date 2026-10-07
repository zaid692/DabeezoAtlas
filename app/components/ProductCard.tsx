"use client";
import React, { useState } from "react";
import ProductModal from "./ProductModal";
import SizeManagementModal from "./SIzeMangementModel";
import ColorManagementModal from "./ColorManagementModal";
import { useCart } from "./CartContext";
import { getToken } from "../lib/auth";
import { Eye } from "lucide-react";

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

interface Props {
  product: Product;
  isAdmin: boolean;
  onUpload: (productId: string, files: File[]) => void;
  onClick?: () => void;
  onToggleSoldOut?: (productId: string, soldOut: boolean) => void;
  onSizeUpdate?: (productId: string, updatedSizes: SizeOption[]) => void;
  onColorUpdate?: (productId: string, updatedColors: ColorOption[]) => void;
}

const ProductCard: React.FC<Props> = ({
  product,
  isAdmin,
  onUpload,
  onClick,
  onToggleSoldOut,
  onSizeUpdate,
  onColorUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { addToCart } = useCart();

  const firstImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder.png";

  const availableSizes = product.sizes?.filter((s) => s.available) || [];
  const availableColors = product.colors?.filter((c) => c.available) || [];

  const handleConfirmAdd = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      alert("Please select a color");
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: firstImage,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: 1,
    });

    alert(`⚡ ${product.name} added to cart!`);
    setShowAddModal(false);
    setSelectedSize(null);
    setSelectedColor(null);
  };

  return (
    <>
      <div
        className={`relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
          product.soldOut ? "opacity-70" : ""
        }`}
      >
        {/* SOLD OUT Badge */}
        {product.soldOut && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-md">
            SOLD OUT
          </div>
        )}

        {/* Image Section */}
        <div
          className="relative w-full aspect-[4/5] bg-gray-50 rounded-b-none overflow-hidden shadow-sm cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={firstImage}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />

          {/* Eye Icon */}
          <div
            className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
            title="Click to see images"
          >
            <div className="bg-opacity-60 text-white rounded-full p-3">
              <Eye size={36} />
            </div>
          </div>

          {/* Quick Shop Button */}
          {!isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!product.soldOut) setShowAddModal(true);
              }}
              disabled={product.soldOut}
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-2 rounded-full font-medium text-white text-xs sm:text-sm shadow-lg backdrop-blur-sm transition-all duration-300 transform ${
                product.soldOut
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              } ${
                // Always visible on mobile, hover on desktop
                "sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
              }`}
            >
              {product.soldOut ? "Sold Out" : "⚡ Quick Shop"}
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-black mb-1">
            PKR {product.price}
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-center items-center gap-2 py-3 bg-gray-50 border-t">
            <button
              title="Manage Colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsColorModalOpen(true);
              }}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-200 to-blue-500 text-white text-sm hover:scale-105 transition"
            >
              🎨
            </button>
            <button
              title="Manage Sizes"
              onClick={(e) => {
                e.stopPropagation();
                setIsSizeModalOpen(true);
              }}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-200 to-blue-500 text-white text-sm hover:scale-105 transition"
            >
              📏
            </button>
            <button
              title={product.soldOut ? "Mark as Available" : "Mark as Sold Out"}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSoldOut)
                  onToggleSoldOut(product._id, !product.soldOut);
              }}
              className={`p-2 rounded-lg text-white text-sm hover:scale-105 transition ${
                product.soldOut
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
            >
              {product.soldOut ? "🔄" : "🏷️"}
            </button>
            <button
              title="Delete Product"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this product?"))
                  fetch(`https://dabeez-backend.fly.dev/products/${product._id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${getToken()}` },
                  }).then(() => window.location.reload());
              }}
              className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm hover:scale-105 transition"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {isModalOpen && (
        <ProductModal
          product={product}
          isAdmin={isAdmin}
          onUpload={onUpload}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Size Management Modal */}
      {isSizeModalOpen && (
        <SizeManagementModal
          product={product}
          onClose={() => setIsSizeModalOpen(false)}
          onSizeUpdate={(id, s) => {
            if (onSizeUpdate) onSizeUpdate(id, s);
            setIsSizeModalOpen(false);
          }}
        />
      )}

      {/* Color Management Modal */}
      {isColorModalOpen && (
        <ColorManagementModal
          product={product}
          onClose={() => setIsColorModalOpen(false)}
          onColorUpdate={(id, c) => {
            if (onColorUpdate) onColorUpdate(id, c);
            setIsColorModalOpen(false);
          }}
        />
      )}

      {/* Quick Shop (Add to Cart) Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Select Options
            </h2>

            {availableSizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Size:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-3 py-1 text-sm rounded-md border transition-all ${
                        selectedSize === s.size
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Color:</p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      className={`px-3 py-1 text-sm rounded-md border transition-all ${
                        selectedColor === c.color
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {c.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
