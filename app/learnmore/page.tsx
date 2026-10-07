"use client";

import { motion } from "framer-motion";
import { ArrowRight, Info, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.h1
          className="text-5xl font-extrabold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Learn More About <span className="text-blue-600">Dabeez O Atlas</span>
        </motion.h1>
        <motion.p
          className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Discover how our platform brings you the best shopping experience with
          fast delivery, secure payments, and trusted sellers.
        </motion.p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-500 text-sm">
              We partner with trusted vendors to ensure you get genuine and
              high-quality items every time.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-500 text-sm">
              Enjoy quick, reliable, and affordable delivery with real-time
              tracking updates.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4">
              <Info className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-500 text-sm">
              Our team is available around the clock to help you with your
              orders or any queries.
            </p>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
