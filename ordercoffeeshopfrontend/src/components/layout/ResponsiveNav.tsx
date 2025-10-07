import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Coffee, User, LogOut, UserCog, Home, Coffee as CoffeeIcon, Users, BarChart2, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ResponsiveNavProps {
  cartCount?: number;
}

const ResponsiveNav = ({ cartCount = 0 }: ResponsiveNavProps) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} className="mr-2" /> },
    { name: 'Menu', path: '/menu', icon: <CoffeeIcon size={18} className="mr-2" /> },
  ];

  const userNavItems = [
    { name: 'My Orders', path: '/orders', icon: <ShoppingCart size={18} className="mr-2" /> },
  ];

  const staffNavItems = [
    { name: 'Staff Dashboard', path: '/staff', icon: <UserCog size={18} className="mr-2" /> },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: <Settings size={18} className="mr-2" /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} className="mr-2" /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart2 size={18} className="mr-2" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  // Get user's first name for display
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-amber-900/95 shadow-lg' : 'bg-amber-900'
      }`}
    >
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-amber-100" />
              <span className="text-xl font-bold text-amber-50">COFFEE SHOP</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-amber-50 bg-amber-800'
                      : 'text-amber-200 hover:text-amber-50 hover:bg-amber-800/50'
                  } transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 text-amber-200 hover:text-amber-50 transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-amber-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-4 ml-4">
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-amber-50 bg-amber-800/50 hover:bg-slate-800  px-3 py-2 rounded-full transition-colors duration-200"
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span className="hidden md:inline">{getUserDisplayName()}</span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    
                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                          </div>
                          
                          {/* Common user links */}
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User size={16} className="inline mr-2" />
                            Profile
                          </Link>
                          
                          {/* Role-specific links */}
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Settings size={16} className="inline mr-2" />
                              Admin Dashboard
                            </Link>
                          )}
                          
                          {(user.role === 'barista' || user.role === 'admin') && (
                            <Link
                              to="/staff"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <UserCog size={16} className="inline mr-2" />
                              Staff Dashboard
                            </Link>
                          )}
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                          >
                            <LogOut size={16} className="inline mr-2" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      state={{ from: location.pathname }}
                      className="px-4 py-2 text-sm font-medium text-amber-900 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 text-sm font-medium text-amber-50 border border-amber-200 rounded-full hover:bg-amber-800/50 transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden
          ">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-200 hover:text-amber-50 hover:bg-amber-800/50 focus:outline-none transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? 'text-amber-50 bg-amber-800'
                  : 'text-amber-200 hover:text-amber-50 hover:bg-amber-800/50'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-amber-800">
            <div className="flex items-center justify-between px-3 py-2">
              <Link 
                to="/cart" 
                className="flex items-center text-amber-200 hover:text-amber-50 transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6 mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 bg-amber-500 text-amber-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              
              <div className="flex flex-col space-y-2 w-full">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-amber-800 mb-2">
                      <p className="text-sm font-medium text-amber-50">{user.name || user.email}</p>
                      <p className="text-xs text-amber-200">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="px-3 py-2 text-sm text-amber-200 hover:bg-amber-800/50 rounded-md flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    
                    {(user.role === 'admin' || user.role === 'barista') && (
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/staff'}
                        className="px-3 py-2 text-sm text-amber-200 hover:bg-amber-800/50 rounded-md flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        {user.role === 'admin' ? (
                          <Settings size={16} className="mr-2" />
                        ) : (
                          <UserCog size={16} className="mr-2" />
                        )}
                        {user.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-amber-800/50 rounded-md flex items-center mt-2"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      state={{ from: location.pathname }}
                      className="px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors duration-200 text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-3 py-2 text-sm font-medium text-amber-50 border border-amber-200 rounded-full hover:bg-amber-800/50 transition-colors duration-200 text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveNav;
