import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  ClipboardList,
  Wrench,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronDown,
  FilePlus,
  CheckSquare,
  Cog,
  ListChecks,
  Package
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { isBerkeUser, isSystemAdminUser } from '../utils/access';
import { queryClient } from '../queryClient';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, enabled: false },
  { name: 'Is Girisi', href: '/is-emri-girisi', icon: FilePlus, enabled: true },
  { name: 'Dc Motor Bakım İş Girişi', href: '/dc-motor-bakim', icon: ClipboardList, enabled: true },
  { name: 'Tamamlanan Isler', href: '/tamamlanan-isler', icon: CheckSquare, enabled: true },
  { name: 'Planlanan Isler', href: '/planlanan-isler', icon: ListChecks, enabled: true },
  { name: 'Bakim Takip Merkezi', href: '/bakim-takip-merkezi', icon: LayoutDashboard, enabled: true },
  { name: 'Personel', href: '/personnel', icon: Users, enabled: true },
  { name: 'Gunluk Performans Genel Bakis', href: '/gunluk-performans-genel-bakis', icon: BarChart3, enabled: true },
  { name: 'Tekrarlayan Ariza Analizi', href: '/tekrarlayan-ariza-analizi', icon: BarChart3, enabled: true },
  { name: 'Vardiyalar', href: '/shifts', icon: Calendar, enabled: false },
  { name: 'Demirbas', href: '/demirbas', icon: Package, enabled: false },
  { name: 'Ekipmanlar', href: '/equipment', icon: Settings, enabled: false },
  { name: 'Is Emri Takibi', href: '/work-orders', icon: ClipboardList, enabled: true },
  { name: 'Periyodik Bakim', href: '/preventive-maintenance', icon: Wrench, enabled: true },
  { name: 'Raporlar', href: '/reports', icon: BarChart3, enabled: false }
];

const settingsNav = { name: 'Ayarlar', href: '/ayarlar', icon: Cog };

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isSystemAdmin = isSystemAdminUser(user);
  const isBerke = isBerkeUser(user);
  const berkeOnlyPaths = new Set([
    '/personnel',
    '/gunluk-performans-genel-bakis'
  ]);
  const visibleNavigation = navigation.filter((item) => !berkeOnlyPaths.has(item.href) || isBerke);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors and continue with local logout.
    } finally {
      queryClient.clear();
      logout();
      navigate('/login');
    }
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
    navigate('/sifre-degistir');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="leading-tight">
            <span className="block text-base font-semibold text-white">ProMaint</span>
            <span className="block text-xs text-gray-300">ERW Bakim Merkezi</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {visibleNavigation.map((item) => (
            item.enabled ? (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ) : (
              <div
                key={item.name}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 opacity-60 cursor-not-allowed"
                title="Deaktif"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            )
          ))}
          {isSystemAdmin ? (
            <NavLink
              to={settingsNav.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <settingsNav.icon className="w-5 h-5 mr-3" />
              {settingsNav.name}
            </NavLink>
          ) : (
            <div
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 opacity-60 cursor-not-allowed"
              title="Sadece sistem yoneticisi"
            >
              <settingsNav.icon className="w-5 h-5 mr-3" />
              {settingsNav.name}
            </div>
          )}
        </nav>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-900">
          <div className="flex items-center h-16 px-4 bg-gray-800">
            <Wrench className="w-8 h-8 text-primary-500" />
            <div className="ml-2 leading-tight">
              <span className="block text-lg font-semibold text-white">ProMaint</span>
              <span className="block text-xs text-gray-300">ERW Bakim Merkezi</span>
            </div>
          </div>
          <nav className="mt-4 flex-1 px-2 space-y-1">
            {visibleNavigation.map((item) => (
              item.enabled ? (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ) : (
                <div
                  key={item.name}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 opacity-60 cursor-not-allowed"
                  title="Deaktif"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              )
            ))}
          </nav>
          <div className="px-2 pb-2">
            {isSystemAdmin ? (
              <NavLink
                to={settingsNav.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <settingsNav.icon className="w-5 h-5 mr-3" />
                {settingsNav.name}
              </NavLink>
            ) : (
              <div
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 opacity-60 cursor-not-allowed"
                title="Sadece sistem yoneticisi"
              >
                <settingsNav.icon className="w-5 h-5 mr-3" />
                {settingsNav.name}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">Bakim Yonetim Sistemi</p>
            <p className="text-xs text-gray-600">v1.0.0</p>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Bakim Yonetim Sistemi
              </h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {user?.ad?.charAt(0)}
                  {user?.soyad?.charAt(0)}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.ad} {user?.soyad}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.ad} {user?.soyad}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    {isSystemAdmin && (
                      <button
                        onClick={handleChangePassword}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Cog className="w-4 h-4 mr-2" />
                        Sifre Degistir
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cikis Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
