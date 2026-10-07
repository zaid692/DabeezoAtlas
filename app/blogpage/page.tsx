"use client";
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const BlogPage = () => {
  const images = [
    "/assets/a1.jpeg",
    "/assets/a2.jpeg",
    "/assets/a3.jpeg",
    "/assets/a4.jpeg",
    "/assets/a5.jpeg",
    "/assets/a6.jpeg",
    "/assets/a7.jpeg",
    "/assets/a8.jpeg",
    "/assets/a9.jpeg",
  ];

  return (
    <>
    <Navbar></Navbar>
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* 🌿 Elegant Header */}
      <header className="relative text-center py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 transform -skew-y-6"></div>

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl">
            Darbeezo Atlas
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/90 font-light">
            A visual journey through our curated gallery
          </p>
        </motion.div>
      </header>

      {/* 🌸 Intro Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-gray-700 text-lg md:text-xl leading-relaxed text-center"
        >
          <h2 className="text-4xl font-extrabold inline-block bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            Explore the Beauty Captured in Every Frame
          </h2>
          <p>
            Darbeezo Atlas brings you closer to breathtaking landscapes,
            vibrant cultures, and unforgettable moments. Every image tells a
            story — and every story is unique.
          </p>
          <p>
            Scroll down to dive into our gallery, where each photograph is
            carefully curated to inspire, inform, and amaze.
          </p>
        </motion.section>

        {/* 🖼️ Masonry Gallery */}
        <section className="mt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6"
          >
            {images.map((src, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="break-inside-avoid overflow-hidden rounded-2xl shadow-xl relative group"
              >
                <img
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                  <p className="text-white text-lg font-medium">
                    Image {index + 1}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 🌼 Closing Text */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 space-y-6 text-gray-700 text-lg md:text-xl leading-relaxed text-center"
        >
          <h2 className="text-4xl font-extrabold inline-block bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            Each Photograph Tells a Story
          </h2>
          <p className="font-medium text-gray-800 max-w-3xl mx-auto">
            Each photograph in Darbeezo Atlas is a testament to the beauty of
            the world around us. We capture not just images — but emotions,
            culture, and raw experience.
          </p>
          <p className="max-w-3xl mx-auto">
            Our goal is to inspire exploration, creativity, and appreciation for
            the wonders we often overlook. The Darbeezo Atlas gallery is a space
            where stories unfold with every scroll.
          </p>
        </motion.section>
      </main>

      {/* 🌿 Minimal Footer */}
      <footer className="bg-gray-100 text-center py-8 mt-24 border-t border-gray-200">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Darbeezo Atlas — Crafted with passion 🌍
        </p>
      </footer>
    </div>
</>  );
};

export default BlogPage;
