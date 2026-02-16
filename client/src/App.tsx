import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Personnel from './pages/Personnel';
import IsEmriGirisi from './pages/IsEmriGirisi';
import TamamlananIsler from './pages/TamamlananIsler';
import Ayarlar from './pages/Ayarlar';
import PlanlananIsler from './pages/PlanlananIsler';
import BakimTakipMerkezi from './pages/BakimTakipMerkezi';
import DisabledPage from './pages/DisabledPage';
import SifreDegistir from './pages/SifreDegistir';
import PreventiveMaintenancePage from './pages/PreventiveMaintenance';
import DcMotorBakim from './pages/DcMotorBakim';
import GunlukPerformansGenelBakis from './pages/GunlukPerformansGenelBakis';
import TekrarlayanArizaAnalizi from './pages/TekrarlayanArizaAnalizi';
import WorkOrders from './pages/WorkOrders';
import { isBerkeUser, isSystemAdminUser } from './utils/access';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function SettingsRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const warnedRef = useRef(false);
  const allowed = isSystemAdminUser(user);

  useEffect(() => {
    if (!allowed && !warnedRef.current) {
      toast.error('Ayarlar sadece sistem yoneticisi tarafindan kullanilabilir.');
      warnedRef.current = true;
    }
  }, [allowed]);

  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function BerkeOnlyRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const warnedRef = useRef(false);
  const allowed = isBerkeUser(user);

  useEffect(() => {
    if (!allowed && !warnedRef.current) {
      toast.error('Bu sayfa sadece Berke Karayanik tarafindan kullanilabilir.');
      warnedRef.current = true;
    }
  }, [allowed]);

  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DisabledPage title="Dashboard" />} />
        <Route path="is-emri-girisi" element={<IsEmriGirisi />} />
        <Route path="tamamlanan-isler" element={<TamamlananIsler />} />
        <Route path="planlanan-isler" element={<PlanlananIsler />} />
        <Route path="bakim-takip-merkezi" element={<BakimTakipMerkezi />} />
        <Route path="dc-motor-bakim" element={<DcMotorBakim />} />
        <Route
          path="ayarlar"
          element={(
            <SettingsRoute>
              <Ayarlar />
            </SettingsRoute>
          )}
        />
        <Route
          path="sifre-degistir"
          element={(
            <SettingsRoute>
              <SifreDegistir />
            </SettingsRoute>
          )}
        />
        <Route
          path="personnel"
          element={(
            <BerkeOnlyRoute>
              <Personnel />
            </BerkeOnlyRoute>
          )}
        />
        <Route
          path="gunluk-performans-genel-bakis"
          element={(
            <BerkeOnlyRoute>
              <GunlukPerformansGenelBakis />
            </BerkeOnlyRoute>
          )}
        />
        <Route path="tekrarlayan-ariza-analizi" element={<TekrarlayanArizaAnalizi />} />
        <Route path="shifts" element={<DisabledPage title="Vardiyalar" />} />
        <Route path="demirbas" element={<DisabledPage title="Demirbas" />} />
        <Route path="equipment" element={<DisabledPage title="Ekipmanlar" />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="preventive-maintenance" element={<PreventiveMaintenancePage />} />
        <Route path="reports" element={<DisabledPage title="Raporlar" />} />
      </Route>
    </Routes>
  );
}

export default App;
