import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { shiftsApi, shiftSchedulesApi, usersApi } from '../services/api';
import type { Shift, User, ShiftSchedule } from '../types';

export default function Shifts() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, { userId: number; shiftId: number; tarih: string }>>(new Map());
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: shifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await shiftsApi.getAll();
      return response.data.data as Shift[];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users-active'],
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    }
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['shift-schedules', format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await shiftSchedulesApi.getAll({
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd')
      });
      return response.data.data as ShiftSchedule[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const schedulesToSave = Array.from(pendingChanges.values());
      return shiftSchedulesApi.saveBulk(schedulesToSave);
    },
    onSuccess: () => {
      toast.success('Vardiya programı kaydedildi');
      setPendingChanges(new Map());
      queryClient.invalidateQueries({ queryKey: ['shift-schedules'] });
    },
    onError: () => {
      toast.error('Kaydetme başarısız');
    }
  });

  const getScheduleForUserAndDay = (userId: number, day: Date): ShiftSchedule | undefined => {
    return schedules?.find(
      (s) => s.userId === userId && isSameDay(new Date(s.tarih), day)
    );
  };

  const getPendingChange = (userId: number, day: Date) => {
    const key = `${userId}-${format(day, 'yyyy-MM-dd')}`;
    return pendingChanges.get(key);
  };

  const handleCellClick = (userId: number, day: Date) => {
    if (!selectedShift) {
      toast.error('Önce bir vardiya seçin');
      return;
    }

    const key = `${userId}-${format(day, 'yyyy-MM-dd')}`;
    const newChanges = new Map(pendingChanges);

    if (pendingChanges.has(key) && pendingChanges.get(key)?.shiftId === selectedShift) {
      newChanges.delete(key);
    } else {
      newChanges.set(key, {
        userId,
        shiftId: selectedShift,
        tarih: format(day, 'yyyy-MM-dd')
      });
    }

    setPendingChanges(newChanges);
  };

  const getCellColor = (userId: number, day: Date): string => {
    const pending = getPendingChange(userId, day);
    if (pending) {
      const shift = shifts?.find((s) => s.id === pending.shiftId);
      return shift?.renk || '#gray';
    }

    const schedule = getScheduleForUserAndDay(userId, day);
    if (schedule) {
      return schedule.shift?.renk || '#gray';
    }

    return 'transparent';
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Vardiya Yönetimi</h1>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={pendingChanges.size === 0 || saveMutation.isPending}
          className="btn btn-primary inline-flex items-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {saveMutation.isPending ? 'Kaydediliyor...' : `Kaydet (${pendingChanges.size})`}
        </button>
      </div>

      {/* Shift selector */}
      <div className="card p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Vardiya Seçin:</p>
        <div className="flex flex-wrap gap-3">
          {shifts?.map((shift) => (
            <button
              key={shift.id}
              onClick={() => setSelectedShift(shift.id)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedShift === shift.id
                  ? 'border-gray-900 shadow-md'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ backgroundColor: shift.renk + '20' }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: shift.renk }}
                />
                <span className="font-medium">{shift.vardiyaAdi}</span>
                <span className="text-sm text-gray-500">
                  ({shift.baslangicSaati} - {shift.bitisSaati})
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="card overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[150px]">
                  Personel
                </th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-1 py-2 text-center text-xs font-medium min-w-[40px] ${
                      [0, 6].includes(day.getDay()) ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div>{format(day, 'EEE', { locale: tr })}</div>
                    <div className="font-bold">{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedulesLoading ? (
                <tr>
                  <td colSpan={days.length + 1} className="px-4 py-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 sticky left-0 bg-white">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.ad} {user.soyad}
                        </p>
                        <p className="text-xs text-gray-500">{user.sicilNo}</p>
                      </div>
                    </td>
                    {days.map((day) => {
                      const bgColor = getCellColor(user.id, day);
                      const hasPending = getPendingChange(user.id, day);
                      return (
                        <td
                          key={day.toISOString()}
                          onClick={() => handleCellClick(user.id, day)}
                          className={`px-1 py-2 text-center cursor-pointer hover:opacity-80 transition-opacity ${
                            [0, 6].includes(day.getDay()) ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 mx-auto rounded-md ${
                              hasPending ? 'ring-2 ring-offset-1 ring-gray-900' : ''
                            }`}
                            style={{
                              backgroundColor: bgColor !== 'transparent' ? bgColor : undefined
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Açıklama:</p>
        <div className="flex flex-wrap gap-4">
          {shifts?.map((shift) => (
            <div key={shift.id} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: shift.renk }}
              />
              <span className="text-sm text-gray-600">{shift.vardiyaAdi}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded ring-2 ring-gray-900 ring-offset-1" />
            <span className="text-sm text-gray-600">Değişiklik (kaydedilmedi)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
