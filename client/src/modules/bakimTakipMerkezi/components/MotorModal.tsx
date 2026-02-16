import React, { useState } from 'react';
import { MotorState, HealthStatus } from '../types';
import { COMPONENT_OPTIONS, OTHER_OPTIONS } from '../constants';
import { calculateMotorHealth, getStatusText } from '../utils';
import { X, Save, MessageSquare, History, Clock } from 'lucide-react';

interface MotorModalProps {
  motor: MotorState;
  onClose: () => void;
  onUpdate: (updatedState: MotorState) => void;
}

const getBadgeClass = (status: HealthStatus) => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'badge-success';
    case HealthStatus.CAUTION:
      return 'badge-warning';
    case HealthStatus.CRITICAL:
      return 'badge-danger';
    default:
      return 'badge-gray';
  }
};

const MotorModal: React.FC<MotorModalProps> = ({ motor, onClose, onUpdate }) => {
  const [localState, setLocalState] = useState<MotorState>(motor);

  const health = calculateMotorHealth(localState);

  const handleUpdate = (field: keyof MotorState, value: string) => {
    const newState = { ...localState, [field]: value };
    setLocalState(newState);
    onUpdate(newState);
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  const monthLabels = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
  ];

  const toggleMonth = (label: string) => {
    const exists = localState.maintenanceMonths.includes(label);
    const next = exists
      ? localState.maintenanceMonths.filter((m) => m !== label)
      : [...localState.maintenanceMonths, label];
    const newState = { ...localState, maintenanceMonths: next };
    setLocalState(newState);
    onUpdate(newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-4 bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {localState.name || `Motor Ünitesi ${localState.id.replace('M', '')}`} Durum Detayı
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className={`badge ${getBadgeClass(health.status)}`}>
                {getStatusText(health.status)}
              </span>
              {health.hasE && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold" title="Elektriksel arıza">
                  E
                </span>
              )}
              {health.hasM && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold" title="Mekaniksel arıza">
                  M
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Değişiklikler otomatik kaydedilir.</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary inline-flex items-center">
            <X className="w-4 h-4 mr-2" />
            Kapat
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <p className="text-xs font-semibold text-gray-600 mb-2">Aylık Bakım Etiketleri</p>
          <div className="flex flex-wrap gap-2">
            {monthLabels.map((label) => {
              const active = localState.maintenanceMonths.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleMonth(label)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Ana Bileşenler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Motor Durumu</label>
                      <span className="badge badge-info">Elektrik</span>
                    </div>
                    <select
                      value={localState.motorStatus}
                      onChange={(e) => handleUpdate('motorStatus', e.target.value)}
                      className="input"
                    >
                      {COMPONENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Redüktör Durumu</label>
                      <span className="badge badge-gray">Mekanik</span>
                    </div>
                    <select
                      value={localState.reducerStatus}
                      onChange={(e) => handleUpdate('reducerStatus', e.target.value)}
                      className="input"
                    >
                      {COMPONENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Makara Durumu</label>
                      <span className="badge badge-gray">Mekanik</span>
                    </div>
                    <select
                      value={localState.rollerStatus}
                      onChange={(e) => handleUpdate('rollerStatus', e.target.value)}
                      className="input"
                    >
                      {COMPONENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Diğer Sebepler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Elektriksel Sebepler</label>
                    <select
                      value={localState.otherElectrical}
                      onChange={(e) => handleUpdate('otherElectrical', e.target.value)}
                      className="input"
                    >
                      {OTHER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mekaniksel Sebepler</label>
                    <select
                      value={localState.otherMechanical}
                      onChange={(e) => handleUpdate('otherMechanical', e.target.value)}
                      className="input"
                    >
                      {OTHER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Elektrik Yorumu
                  </label>
                  <textarea
                    value={localState.electricalComment}
                    onChange={(e) => handleUpdate('electricalComment', e.target.value)}
                    placeholder="Elektriksel durumu detaylandırın..."
                    className="input min-h-[96px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Mekanik Yorumu
                  </label>
                  <textarea
                    value={localState.mechanicalComment}
                    onChange={(e) => handleUpdate('mechanicalComment', e.target.value)}
                    placeholder="Mekaniksel durumu detaylandırın..."
                    className="input min-h-[96px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Geçmiş Kayıtlar
              </h4>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {localState.history && localState.history.length > 0 ? (
                  localState.history.map((entry, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                        <span className={`badge ${getBadgeClass(entry.status)}`}>
                          {getStatusText(entry.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{entry.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-400 py-6">
                    Kayıt bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Kapat
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotorModal;
