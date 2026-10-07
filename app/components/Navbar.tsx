'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useath";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAdmin, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('nav') && !target.closest('button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/assets/logo.png" 
                alt="Dabeezo Atlas Logo" 
                className="h-10 w-10 rounded-lg object-cover transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dabeez O Atlas
              </span>
              <span className="text-xs text-gray-500 -mt-1">Premium Fashion</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/product" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/About" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/Contact" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/blogpage" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
            >
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/size" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
            >
              Size Chart
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </div>
       
          {/* Desktop Right Side - Cart & Admin */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Cart Button */}
            <Link 
              href="/CartPage" 
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {/* Admin Section */}
            {isAdmin ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 ml-2">
                <Link 
                  href="/admindashboard" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // Login temporarily hidden
              <div className="hidden">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Buttons - Cart and Menu SEPARATE */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Cart Button - Mobile */}
            <Link 
              href="/CartPage" 
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {/* Menu Toggle Button - SEPARATE from Cart */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }} 
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div 
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-1">
              <Link 
                href="/product" 
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={handleLinkClick}
              >
                <span>🛍️</span>
                <span>Products</span>
              </Link>
                  <Link 
                href="/size" 
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={handleLinkClick}
              >
                <span>🥼</span>
                <span>size chart</span>
              </Link>
              <Link 
                href="/About" 
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={handleLinkClick}
              >
                <span>ℹ️</span>
                <span>About</span>
              </Link>
              <Link 
                href="/Contact" 
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={handleLinkClick}
              >
                <span>📞</span>
                <span>Contact</span>
              </Link>
              <Link 
                href="/blogpage" 
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={handleLinkClick}
              >
                <span>📝</span>
                <span>Blog</span>
              </Link>
              
              {/* Admin Section - Mobile */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <Link 
                      href="/admindashboard" 
                      className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
                      onClick={handleLinkClick}
                    >
                      <User className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 text-red-600 hover:text-red-700 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout Admin</span>
                    </button>
                  </div>
                </>
              )}

              {/* Login - Mobile - Temporarily hidden */}
              {!isAdmin && (
                <div className="hidden">
                  <Link 
                    href="/login" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium border-t border-gray-200 mt-2 pt-3"
                    onClick={handleLinkClick}
                  >
                    <span>🔐</span>
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;