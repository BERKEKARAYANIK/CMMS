import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { accessLogsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { isBerkeUser, isSystemAdminUser } from '../utils/access';

type AccessLogEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT';

type AccessLogEvent = {
  id: number;
  eventType: AccessLogEventType;
  userId: number | null;
  sicilNo: string;
  fullName: string;
  role: string;
  department: string;
  identifier: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason: string;
  createdAt: string;
};

type AccessLogSummary = {
  totalLoginSuccess: number;
  totalLoginFailed: number;
  totalLogout: number;
  uniqueLoginUsers: number;
  topUsers: Array<{
    userId: number;
    fullName: string;
    sicilNo: string;
    department: string;
    loginCount: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    loginCount: number;
  }>;
  dailyDistribution: Array<{
    day: string;
    loginSuccess: number;
    loginFailed: number;
    logoutCount: number;
  }>;
};

type AccessLogResponse = {
  summary: AccessLogSummary;
  events: AccessLogEvent[];
};

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('tr-TR');
}

function eventBadgeClass(eventType: AccessLogEventType): string {
  if (eventType === 'LOGIN_SUCCESS') return 'bg-emerald-100 text-emerald-800';
  if (eventType === 'LOGIN_FAILED') return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-700';
}

function eventLabel(eventType: AccessLogEventType): string {
  if (eventType === 'LOGIN_SUCCESS') return 'GIRIS';
  if (eventType === 'LOGIN_FAILED') return 'HATALI GIRIS';
  return 'CIKIS';
}

export default function AccessLogs() {
  const currentUser = useAuthStore((state) => state.user);
  const canViewLogs = Boolean(currentUser && (isSystemAdminUser(currentUser) || isBerkeUser(currentUser)));

  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()));
  const [department, setDepartment] = useState('');
  const [eventType, setEventType] = useState('');
  const [limit, setLimit] = useState('200');
  const [events, setEvents] = useState<AccessLogEvent[]>([]);
  const [summary, setSummary] = useState<AccessLogSummary | null>(null);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => String(event.department || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }, [events]);

  const loadLogs = async () => {
    if (!canViewLogs) return;

    try {
      setIsLoading(true);
      const response = await accessLogsApi.getAll({
        from: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
        to: toDate ? `${toDate}T23:59:59.999Z` : undefined,
        department: department || undefined,
        eventType: eventType || undefined,
        limit: Number.parseInt(limit || '200', 10) || 200
      });

      const payload = response.data?.data as AccessLogResponse | undefined;
      setEvents(Array.isArray(payload?.events) ? payload!.events : []);
      setSummary(payload?.summary || null);
    } catch {
      toast.error('Erisim loglari yuklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!canViewLogs) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Bu sayfayi sadece sistem yoneticisi goruntuleyebilir.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Erisim Loglari</h1>
          <p className="text-sm text-gray-500">Kim, ne zaman sisteme giris/cikis yapti takibi</p>
        </div>
        <button
          type="button"
          onClick={() => void loadLogs()}
          className="btn btn-primary w-full md:w-auto"
          disabled={isLoading}
        >
          {isLoading ? 'Yukleniyor...' : 'Filtreyi Uygula'}
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="input"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="input"
          />
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="input"
          >
            <option value="">Tum Bolumler</option>
            {departmentOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className="input"
          >
            <option value="">Tum Olaylar</option>
            <option value="LOGIN_SUCCESS">Giris</option>
            <option value="LOGIN_FAILED">Hatali Giris</option>
            <option value="LOGOUT">Cikis</option>
          </select>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            className="input"
            placeholder="Limit"
          />
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Basarili Giris</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.totalLoginSuccess}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Hatali Giris</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{summary.totalLoginFailed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Cikis</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{summary.totalLogout}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Tekil Kullanici</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{summary.uniqueLoginUsers}</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left font-semibold">Tarih</th>
                <th className="px-3 py-2 text-left font-semibold">Olay</th>
                <th className="px-3 py-2 text-left font-semibold">Kullanici</th>
                <th className="px-3 py-2 text-left font-semibold">Sicil</th>
                <th className="px-3 py-2 text-left font-semibold">Bolum</th>
                <th className="px-3 py-2 text-left font-semibold">IP</th>
                <th className="px-3 py-2 text-left font-semibold">Aciklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500">Yukleniyor...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500">Kayit bulunamadi</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(event.createdAt)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${eventBadgeClass(event.eventType)}`}>
                        {eventLabel(event.eventType)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{event.fullName || '-'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{event.sicilNo || '-'}</td>
                    <td className="px-3 py-2 text-xs">{event.department || '-'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{event.ipAddress || '-'}</td>
                    <td className="px-3 py-2 text-xs">{event.reason || event.identifier || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
