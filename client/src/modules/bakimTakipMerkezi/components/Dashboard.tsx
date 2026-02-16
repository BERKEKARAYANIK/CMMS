import React from 'react';
import { ModuleType, HealthStatus, AppData } from '../types';
import { MODULES, INITIAL_DATA, STORAGE_KEYS } from '../constants';
import { Factory, Route, LayoutGrid, ArrowRight } from 'lucide-react';
import { calculateMotorHealth } from '../utils';

interface DashboardProps {
  onSelectModule: (module: ModuleType) => void;
  machineIds: number[];
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectModule, machineIds }) => {
  const savedData = localStorage.getItem(STORAGE_KEYS.data);
  const data: AppData = savedData ? JSON.parse(savedData) : INITIAL_DATA;

  const getModuleStats = (type: ModuleType) => {
    let critical = 0;
    let caution = 0;
    let healthy = 0;
    machineIds.forEach((machineId) => {
      const machineModules = data[machineId];
      if (!machineModules) return;
      const motors = machineModules[type] || [];
      motors.forEach((motor) => {
        const { status } = calculateMotorHealth(motor);
        if (status === HealthStatus.CRITICAL) critical += 1;
        else if (status === HealthStatus.CAUTION) caution += 1;
        else healthy += 1;
      });
    });
    return { critical, caution, healthy };
  };

  const getIcon = (type: ModuleType) => {
    switch (type) {
      case ModuleType.ACCUMULATION:
        return <Factory className="w-6 h-6 text-slate-600" />;
      case ModuleType.RELAY_WAY:
        return <Route className="w-6 h-6 text-slate-600" />;
      case ModuleType.ALIGNMENT:
        return <LayoutGrid className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {MODULES.map((module) => {
        const stats = getModuleStats(module.type);

        return (
          <button
            key={module.type}
            className="card p-6 text-left hover:shadow-md transition-shadow"
            onClick={() => onSelectModule(module.type)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                  {getIcon(module.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{module.type}</h3>
                  <p className="text-xs text-gray-500">Aktif operasyon izleme modülü</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center">
                <div className="text-xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-[10px] uppercase text-red-500">Kritik</div>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
                <div className="text-xl font-bold text-amber-600">{stats.caution}</div>
                <div className="text-[10px] uppercase text-amber-500">Dikkat</div>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
                <div className="text-xl font-bold text-emerald-600">{stats.healthy}</div>
                <div className="text-[10px] uppercase text-emerald-600">Sağlıklı</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default Dashboard;
