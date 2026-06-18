import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  LayoutDashboard, 
  Wallet,
  LogOut 
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Mock authentication state - Replace with zustand store later
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State management
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Refs for click outside detection
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Navigation structure
  const navItems = [
    {
      id: 'company',
      label: 'Company',
      hasDropdown: true,
      items: [
        { label: 'About Us', path: '/about' },
        { label: 'What We Do', path: '/what-we-do' },
        { label: 'Our Approach', path: '/our-approach' },
      ]
    },
    {
      id: 'strategy',
      label: 'Strategy',
      hasDropdown: true,
      items: [
        { label: 'How It Works', path: '/how-it-works' },
      ]
    },
    {
      id: 'pricing',
      label: 'Pricing',
      path: '/pricing',
      hasDropdown: false,
    },
    {
      id: 'learn',
      label: 'Learn',
      path: '/learn',
      hasDropdown: false,
    },
    {
      id: 'faq',
      label: 'FAQ',
      path: '/faq',
      hasDropdown: false,
    },
  ];

  // User dropdown items
  const userMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deposit', path: '/deposit', icon: Wallet },
  ];

  // Handlers
  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Placeholder - will call backend API later
    setIsAuthenticated(false);
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.15 }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      x: '100%',
      transition: { type: 'tween', duration: 0.3 }
    },
    visible: { 
      x: 0,
      transition: { type: 'tween', duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* LEFT: Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                TradeX
              </Link>
            </div>

            {/* CENTER: Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors rounded-md hover:bg-gray-50"
                      >
                        {item.label}
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.id ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.id && (
                          <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                          >
                            {item.items.map((subItem, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleNavigation(subItem.path)}
                                className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium"
                              >
                                {subItem.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors rounded-md hover:bg-gray-50"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT: Auth Buttons / User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/invest"
                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Invest
                  </Link>
                  
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      <User className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                        >
                          {userMenuItems.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavigation(item.path)}
                              className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium"
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </button>
                          ))}
                          <hr className="my-2 border-gray-200" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* MOBILE: Hamburger + Invest Button */}
            <div className="flex lg:hidden items-center space-x-3">
              {isAuthenticated && (
                <Link
                  to="/invest"
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors text-sm shadow-sm"
                >
                  Invest
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE: Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MOBILE: Slide-in Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold text-blue-600"
                >
                  TradeX
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.id}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
                        >
                          {item.label}
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              activeDropdown === item.id ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-1 space-y-1">
                                {item.items.map((subItem, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleNavigation(subItem.path)}
                                    className="w-full text-left px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium"
                                  >
                                    {subItem.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Auth Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-5 py-3 text-center text-blue-600 font-semibold border-2 border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-5 py-3 text-center bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {userMenuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors font-medium"
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium mt-2"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;