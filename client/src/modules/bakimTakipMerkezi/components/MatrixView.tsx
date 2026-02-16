import React from 'react';
import { AppData, ModuleType, HealthStatus } from '../types';
import { calculateMotorHealth, getStatusText, getMotorDetailedReasons } from '../utils';
import { ArrowLeft } from 'lucide-react';

interface MatrixViewProps {
  moduleType: ModuleType;
  data: AppData;
  machineIds: number[];
  onSelectMachine: (id: number) => void;
  onBack: () => void;
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

const getDetailText = (detail: ReturnType<typeof getMotorDetailedReasons>) => {
  const reasons = detail.reasons.map((r) => `${r.label}: ${r.value}`).join(' | ');
  const comments = detail.comments.map((c) => `${c.label}: ${c.text}`).join(' | ');
  return [reasons, comments].filter(Boolean).join(' | ');
};

const MatrixView: React.FC<MatrixViewProps> = ({ moduleType, data, machineIds, onSelectMachine, onBack }) => {
  const maxMotors = machineIds.reduce((max, mId) => {
    return Math.max(max, data[mId][moduleType].length);
  }, 0);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="btn btn-secondary inline-flex items-center whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Anasayfa</span>
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{moduleType}</h2>
            <p className="text-xs text-gray-500">Sistem matris görünümü</p>
          </div>
        </div>

        <div className="flex gap-2 text-xs font-semibold items-center">
          <div className="badge badge-success">Sağlıklı</div>
          <div className="badge badge-warning">Dikkat</div>
          <div className="badge badge-danger">Kritik</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Boru Makineleri</th>
              {Array.from({ length: maxMotors }, (_, i) => (
                <th key={i} className="px-4 py-3 text-center font-semibold">
                  Ünite {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {machineIds.map((mId) => (
              <tr
                key={mId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectMachine(mId)}
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {mId}. Makine
                </td>
                {Array.from({ length: maxMotors }).map((_, idx) => {
                  const motor = data[mId][moduleType][idx];
                  if (!motor) {
                    return (
                      <td key={idx} className="px-4 py-3 text-center text-gray-300">
                        -
                      </td>
                    );
                  }

                  const health = calculateMotorHealth(motor);
                  const detail = getMotorDetailedReasons(motor);
                  const detailText = getDetailText(detail);

                  return (
                    <td key={idx} className="px-4 py-3 text-center" title={detailText || undefined}>
                      <div className="inline-flex items-center gap-2">
                        <span className={`badge ${getBadgeClass(health.status)}`}>
                          {getStatusText(health.status)}
                        </span>
                        {health.hasE && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            E
                          </span>
                        )}
                        {health.hasM && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                            M
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixView;
