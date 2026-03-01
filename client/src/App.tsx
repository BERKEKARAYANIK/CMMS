import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import IsEmriGirisi from './pages/IsEmriGirisi';
import TamamlananIsler from './pages/TamamlananIsler';
import Ayarlar from './pages/Ayarlar';
import PlanlananIsler from './pages/PlanlananIsler';
import BakimTakipMerkezi from './pages/BakimTakipMerkezi';
import DisabledPage from './pages/DisabledPage';
import SifreDegistir from './pages/SifreDegistir';
import DcMotorBakim from './pages/DcMotorBakim';
import Equipment from './pages/Equipment';
import IsSagligiGuvenligi from './pages/IsSagligiGuvenligi';
import DurusAnalizi from './pages/DurusAnalizi';
import GunlukPerformansGenelBakis from './pages/GunlukPerformansGenelBakis';
import WorkOrders from './pages/WorkOrders';
import AccessLogs from './pages/AccessLogs';
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
      toast.error('Ayarlar sadece sistem yöneticisi tarafından kullanılabilir.');
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
      toast.error('Bu sayfa sadece Berke Karayanik tarafından kullanılabilir.');
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
        <Route index element={<Dashboard />} />
        <Route path="is-emri-girisi" element={<IsEmriGirisi />} />
        <Route path="tamamlanan-isler" element={<TamamlananIsler />} />
        <Route path="planlanan-isler" element={<PlanlananIsler />} />
        <Route path="bakim-takip-merkezi" element={<BakimTakipMerkezi />} />
        <Route
          path="dc-motor-bakim"
          element={(
            <BerkeOnlyRoute>
              <DcMotorBakim />
            </BerkeOnlyRoute>
          )}
        />
        <Route
          path="ayarlar"
          element={(
            <SettingsRoute>
              <Ayarlar />
            </SettingsRoute>
          )}
        />
        <Route
          path="access-logs"
          element={(
            <SettingsRoute>
              <AccessLogs />
            </SettingsRoute>
          )}
        />
        <Route
          path="sifre-degistir"
          element={<SifreDegistir />}
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
        <Route
          path="tekrarlayan-ariza-analizi"
          element={(
            <BerkeOnlyRoute>
              <DisabledPage title="Tekrarlayan Arıza Analizi" />
            </BerkeOnlyRoute>
          )}
        />
        <Route
          path="shifts"
          element={(
            <BerkeOnlyRoute>
              <DisabledPage title="Vardiyalar" />
            </BerkeOnlyRoute>
          )}
        />
        <Route path="demirbas" element={<Equipment />} />
        <Route path="isg" element={<IsSagligiGuvenligi />} />
        <Route path="durus-analizi" element={<DurusAnalizi />} />
        <Route path="pareto-analizi" element={<DurusAnalizi />} />
        <Route
          path="equipment"
          element={(
            <BerkeOnlyRoute>
              <DisabledPage title="Ekipmanlar" />
            </BerkeOnlyRoute>
          )}
        />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route
          path="preventive-maintenance"
          element={(
            <BerkeOnlyRoute>
              <DisabledPage title="Periyodik Bakım" />
            </BerkeOnlyRoute>
          )}
        />
        <Route
          path="reports"
          element={(
            <BerkeOnlyRoute>
              <DisabledPage title="Raporlar" />
            </BerkeOnlyRoute>
          )}
        />
      </Route>
    </Routes>
  );
}

export default App;
