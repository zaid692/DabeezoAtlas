"use client"
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ModernHero() {
  const slides = [
    {
      image: "/assets/hero.jpg",
      title: "New Collection 2025",
      subtitle: "Discover the latest trends in fashion",
      cta: "Shop Now",
      color: "from-blue-600/80 to-purple-600/80"
    },
    {
      image: "/assets/hero1.jpg",
      title: "Summer Essentials",
      subtitle: "Fresh styles for warm days",
      cta: "Explore Summer",
      color: "from-orange-600/80 to-red-600/80"
    },
    {
      image: "/assets/hero5.jpg",
      title: "Premium Quality",
      subtitle: "Crafted with excellence",
      cta: "Discover Quality",
      color: "from-emerald-600/80 to-teal-600/80"
    },
    {
      image: "/assets/hero3.jpg",
      title: "Limited Edition",
      subtitle: "Exclusive pieces for you",
      cta: "View Collection",
      color: "from-purple-600/80 to-pink-600/80"
    },
    {
      image: "/assets/hero4.jpg",
      title: "Street Style",
      subtitle: "Urban fashion redefined",
      cta: "Get the Look",
      color: "from-gray-800/80 to-black/80"
    },
    {
      image: "/assets/hero6.jpg",
      title: "Elegant Dresses",
      subtitle: "Perfect for every occasion",
      cta: "Browse Dresses",
      color: "from-rose-600/80 to-pink-600/80"
    },
    {
      image: "/assets/hero7.jpg",
      title: "Women's Fashion",
      subtitle: "Contemporary styles for men",
      cta: "Shop Men",
      color: "from-blue-800/80 to-indigo-800/80"
    },
    {
      image: "/assets/hero8.jpg",
      title: "Accessories",
      subtitle: "Complete your look",
      cta: "Find Accessories",
      color: "from-amber-600/80 to-orange-600/80"
    },
    {
      image: "/assets/hero9.jpg",
      title: "Winter Collection",
      subtitle: "Stay warm in style",
      cta: "Winter Shop",
      color: "from-cyan-600/80 to-blue-600/80"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto slide with play/pause control
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // Handlers
  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] sm:min-h-[700px] max-h-[900px] overflow-hidden">
      {/* Background Images with Gradient Overlay */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover scale-110"
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.color}`}></div>
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center pt-20 sm:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Text Content - Takes more space */}
            <div className="text-white space-y-8 sm:space-y-10 lg:space-y-12 text-center lg:text-left lg:w-7/12">
              <div className="space-y-6 sm:space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 sm:mt-8 md:mt-16">
                  <span className="text-sm sm:text-base font-semibold">پہلی کرن</span>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-7xl font-bold leading-tight">
                  {slides[currentIndex].title}
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                  {slides[currentIndex].subtitle}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <Link 
                  href="/product"
                  className="inline-flex items-center justify-center px-10 py-4 sm:px-12 sm:py-5 bg-white text-gray-900 rounded-xl font-semibold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  {slides[currentIndex].cta}
                  <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
                
                <Link href="/learnmore">
                  <button className="inline-flex items-center justify-center px-10 py-4 sm:px-12 sm:py-5 border-2 border-white text-white rounded-xl font-semibold text-lg sm:text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 w-full xs:w-auto">
                    Learn More
                  </button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-white/30">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">200+</div>
                  <div className="text-white/80 text-base sm:text-lg mt-2">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">5K+</div>
                  <div className="text-white/80 text-base sm:text-lg mt-2">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">24/7</div>
                  <div className="text-white/80 text-base sm:text-lg mt-2">Support</div>
                </div>
              </div>
            </div>

            {/* Image Preview (Desktop) - Reduced size */}
            <div className="hidden lg:block lg:w-5/12">
              <div className="relative">
                <img
                  src={slides[currentIndex].image}
                  alt="Featured"
                  className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700 max-w-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:flex">
        <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/30">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Dots Indicator Only - Removed numbers */}
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-white w-6 h-2" 
                    : "bg-white/50 hover:bg-white/80 w-2 h-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-110 hidden lg:block"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-110 hidden lg:block"
      >
        <ChevronRight size={28} />
      </button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
    </div>
  );
}