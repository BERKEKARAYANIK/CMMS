import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { authApi } from '../services/api';

export default function SifreDegistir() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Şifre güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Şifre güncellenemedi');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm alanları doldurun');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Şifre Değiştir</h1>

      <div className="card p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="current-password">
              Mevcut Şifre
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="new-password">
              Yeni Şifre
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="confirm-password">
              Yeni Şifre (Tekrar)
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={mutation.isPending}
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
