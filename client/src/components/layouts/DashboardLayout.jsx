import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  BookOpen, 
  Home, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getSidebarItems = () => {
    const baseItems = [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          { name: 'Mes Formations', href: '/dashboard/formations', icon: GraduationCap },
          { name: 'Emploi du temps', href: '/dashboard/schedule', icon: Calendar },
          { name: 'Tests & QCM', href: '/dashboard/tests', icon: FileText },
          { name: 'Paiements', href: '/dashboard/payments', icon: CreditCard },
          { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
          { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { name: 'Mes Formations', href: '/dashboard/formations', icon: GraduationCap },
          { name: 'Emploi du temps', href: '/dashboard/schedule', icon: Calendar },
          { name: 'Espaces de cours', href: '/dashboard/spaces', icon: FileText },
          { name: 'Tests & QCM', href: '/dashboard/tests', icon: FileText },
          { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
          { name: 'Formations', href: '/dashboard/formations', icon: GraduationCap },
          { name: 'Paiements', href: '/dashboard/payments', icon: CreditCard },
          { name: 'Statistiques', href: '/dashboard/statistics', icon: FileText },
          { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
        ];
      case 'reception':
        return [
          ...baseItems,
          { name: 'Paiements', href: '/dashboard/payments', icon: CreditCard },
          { name: 'Statistiques', href: '/dashboard/statistics', icon: FileText },
          { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const sidebarItems = getSidebarItems();
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{width:"100vw"}} className="flex h-screen bg-gray-100">
    

        {/* Main Content */}
    
       
            {children}
    
  
     
    </div>
  );
};

export default DashboardLayout;

