import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { BarChart3, CreditCard, Bell, User, LogOut, Settings, ChevronDown, Users } from 'lucide-react';
import ReceptionPaymentManagement from '../../components/reception/ReceptionPaymentManagement';
import ReceptionPreinscriptionList from '@/components/reception/ReceptionPreinscriptionList';
import ReceptionUserManagement from '@/components/reception/ReceptionUserManagement';
import ProfileEditModal from '@/components/shared/ProfileEditModal';

const ReceptionDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('PreInscription');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  const sidebarItems = [
    { id: 'PreInscription', label: 'Pre Inscription', icon: Users },
    { id: 'payments', label: 'Gestion des paiements', icon: CreditCard },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.href = '/login'
  };

  const handleProfile = () => {
    setShowProfileModal(true);
    setShowProfileDropdown(false);
  };

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'payments':
        return <ReceptionPaymentManagement />;
      case 'utilisateurs':
        return <ReceptionUserManagement />;
      case 'PreInscription':
        return <ReceptionPreinscriptionList />;
      default:
        return <ReceptionPaymentManagement />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50" style={{ width: "100%" }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r" >
     <div style={{display:"flex",justifyContent:"center"}}>
      <img
              src="./logo.png"
              alt="Cobra Logo"
              className="w-50  object-contain"
              onClick={handleLogoClick}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
     </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === selectedSection)?.label}
              </h1>
              <p className="text-gray-600">Tableau de bord réception</p>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Actualiser
              </Button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser ? `${currentUser.name} ${currentUser.lastname}` : 'Réception'}
                    </p>
                    <p className="text-xs text-gray-500">Agent d'accueil</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Mon profil
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default ReceptionDashboard;

