'use client';
import React from "react";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
        
          <h1 className="text-5xl md:text-6xl font-bold text-gray-400 mb-6 leading-tight">
            About <span className="text-black">Dabeez o Atlas</span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed">
              Dabeez o Atlas was born from a dream — a dream supported by family, faith, and the desire to become independent. As a woman, I was encouraged by my parents to build something meaningful, something that allows me to stand on my own feet.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/abus.jpg"
                alt="About us"
                className="w-full object-contain transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-200 rounded-full opacity-50"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-100 rounded-full opacity-30"></div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-0.5 bg-amber-500"></div>
              <span className="text-amber-600 font-semibold text-lg">Our Foundation</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-snug">
              Crafting Stories Through Modest Fashion
            </h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                At Dabeez o Atlas, we believe that every piece of clothing should reflect grace, dignity, and self-assurance. Our designs are created with thoughtful craftsmanship and attention to detail, blending timeless modesty with a touch of modern elegance.
              </p>
              <p>
                Every stitch carries our values of honesty, care, and dedication — making each creation more than just fabric, but a reflection of purpose and pride.
              </p>
              <p className="font-medium text-gray-700">
                From casual wear to formal outfits, we carefully curate every collection to inspire confidence and style.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-white rounded-3xl shadow-xl p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-1 bg-amber-400"></div>
              <span className="text-amber-600 font-semibold text-lg uppercase tracking-wide">Our Purpose</span>
              <div className="w-16 h-1 bg-amber-400"></div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Beyond Fashion: Our Mission
            </h2>
            
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Our mission goes beyond fashion. We aim not only to offer modern, modest wear but also to create fair and supportive opportunities for others.
              </p>
              <p>
                While we believe in equality and welcome everyone, our heart lies especially in empowering underprivileged women by giving them a chance to earn, grow, and stand on their own feet — just as I was encouraged to do.
              </p>
              <p className="text-xl font-semibold text-gray-800 bg-amber-50 p-6 rounded-xl border-l-4 border-amber-400">
                With the resources we have, we strive to ensure fairness, respect, and dignity for every person connected to Dabeez o Atlas.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}