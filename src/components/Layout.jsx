import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FileText, Home, LogOut, Share2, FilePlus, Menu, X, User, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function Layout() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileQR, setShowProfileQR] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const ProfileQRModal = () => {
    if (!user) return null;

    const profileData = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      type: 'medical_profile'
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Profile QR Code</h3>
            <button
              onClick={() => setShowProfileQR(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <QRCodeSVG 
              value={JSON.stringify(profileData)}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="text-center">
              <p className="font-medium text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">MedVault</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform ease-in-out duration-300 pt-16`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 px-2 space-y-1">
              <NavLink to="/" icon={Home}>Dashboard</NavLink>
              <NavLink to="/documents" icon={FileText}>Documents</NavLink>
              <NavLink to="/create-prescription" icon={FilePlus}>Create Prescription</NavLink>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <User className="h-8 w-8 rounded-full text-gray-400" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => setShowProfileQR(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Show QR
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MedVault</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`${
                    location.pathname === '/'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/documents"
                  className={`${
                    location.pathname === '/documents'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </Link>
                <Link
                  to="/create-prescription"
                  className={`${
                    location.pathname === '/create-prescription'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowProfileQR(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Profile QR
              </button>
              <span className="text-sm text-gray-700 mr-4">{user?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0">
        <Outlet />
      </main>

      {showProfileQR && <ProfileQRModal />}
    </div>
  );
}

export default Layout;