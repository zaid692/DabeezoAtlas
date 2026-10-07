"use client";
import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, AlertCircle } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g. "aspect-[4/5]" or "none"
  size?: "card" | "thumbnail" | "modal" | "cart";
  onClick?: () => void;
  showHoverEffect?: boolean;
}

export default function ProductImage({
  src,
  alt = "Product image",
  className = "",
  containerClassName = "",
  aspectRatio = "aspect-[4/5]",
  size = "card",
  onClick,
  showHoverEffect = true,
}: ProductImageProps) {
  // Check if Bunny CDN or invalid/placeholder source
  const isExpiredCdn = !src || src === "/placeholder.png" || src === "/placeholder.svg" || src.includes("b-cdn.net");
  const [hasError, setHasError] = useState(isExpiredCdn);

  useEffect(() => {
    setHasError(!src || src === "/placeholder.png" || src === "/placeholder.svg" || src.includes("b-cdn.net"));
  }, [src]);

  // Thumbnail / Small representation (e.g. cart, checkout, category product list)
  if (size === "thumbnail" || size === "cart") {
    if (hasError) {
      return (
        <div
          onClick={onClick}
          className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 border border-gray-200 rounded-xl p-2 select-none text-center flex-shrink-0 ${containerClassName}`}
          title="Cloud storage subscription expired"
        >
          <div className="w-6 h-6 rounded-lg bg-white/90 shadow-2xs border border-gray-200 flex items-center justify-center text-gray-400 mb-1">
            <Cloud className="w-3.5 h-3.5 stroke-[1.75]" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 leading-tight">
            Cloud Storage
          </span>
          <span className="text-[8px] text-gray-400 leading-tight mt-0.5">
            Buy required
          </span>
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden flex-shrink-0 ${containerClassName}`}>
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          onError={() => setHasError(true)}
          className={`object-cover w-full h-full ${className}`}
          onClick={onClick}
        />
      </div>
    );
  }

  // Modal / Large representation
  if (size === "modal") {
    if (hasError) {
      return (
        <div
          onClick={onClick}
          className={`w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 rounded-2xl border border-gray-200/80 select-none text-center relative overflow-hidden ${containerClassName}`}
        >
          {/* Subtle background dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Icon Box */}
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
            <CloudOff className="w-8 h-8 stroke-[1.5]" />
          </div>

          {/* Badge */}
          <span className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200/80 text-gray-600 mb-2 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Cloud Storage Expired
          </span>

          {/* Main message */}
          <h4 className="relative z-10 text-base font-semibold text-gray-700 mb-1">
            Image Temporarily Unavailable
          </h4>

          {/* Grey small text */}
          <p className="relative z-10 text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed mb-1">
            Cloud storage buy required to display product images.
          </p>
          <p className="relative z-10 text-[11px] text-gray-400 font-normal">
            CDN subscription ended • Renew or buy cloud storage to restore
          </p>
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full flex items-center justify-center ${containerClassName}`}>
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          onError={() => setHasError(true)}
          className={`max-h-[350px] max-w-full object-contain cursor-pointer transition-transform hover:scale-105 ${className}`}
          onClick={onClick}
        />
      </div>
    );
  }

  // Standard Product Card representation (fixed aspect ratio, strict no-shrink)
  return (
    <div
      onClick={onClick}
      className={`relative w-full ${aspectRatio !== "none" ? aspectRatio : "aspect-[4/5]"} bg-slate-100 rounded-b-none overflow-hidden select-none flex-shrink-0 ${containerClassName}`}
    >
      {hasError ? (
        <div className="w-full h-full min-h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200/90 text-center relative overflow-hidden transition-all duration-300">
          {/* Subtle background dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px] opacity-45 pointer-events-none" />

          {/* Modern Icon Box */}
          <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/95 shadow-sm border border-gray-200/80 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 mb-2 sm:mb-2.5">
            <Cloud className="w-5 h-5 sm:w-7 sm:h-7 stroke-[1.5]" />
          </div>

          {/* Pill Badge */}
          <span className="relative z-10 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-gray-200/80 text-gray-600 mb-1 tracking-wider uppercase">
            Cloud Storage
          </span>

          {/* Grey small text: cloud storage buy required */}
          <p className="relative z-10 text-[11px] sm:text-xs text-gray-500 font-medium leading-tight max-w-[90%] px-1 mt-0.5">
            Cloud storage buy required
          </p>

          {/* Subtext */}
          <p className="relative z-10 text-[9px] sm:text-[10px] text-gray-400 mt-1 max-w-[85%] leading-tight">
            Subscription ended • Buy cloud storage
          </p>
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          onError={() => setHasError(true)}
          className={`object-cover w-full h-full ${
            showHoverEffect ? "group-hover:scale-110 transition-transform duration-500" : ""
          } ${className}`}
        />
      )}
    </div>
  );
}
