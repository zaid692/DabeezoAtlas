'use client';
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Categories from "../components/categories";
import { useAuth } from "../hooks/useath";
import FeaturedProducts from "../components/FeaturedProducts";

export default function LandingPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />
      <Hero />

      {/* Categories Section */}
      <Categories isAdmin={isAdmin} />

      
             <FeaturedProducts/>
      {/* Other sections can go here */}
      <Footer />

      {/* 🌿 Floating WhatsApp Icon */}
      <a
        href="https://wa.me/3150186980" // 🔹 Replace with your own number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50"
      >
        <img
          src="https://dabeez.b-cdn.net/whatsapp.png" // 🔹 Your Bunny.net image URL
          alt="Chat on WhatsApp"
          className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        />
      </a>
    </div>
  );
}
