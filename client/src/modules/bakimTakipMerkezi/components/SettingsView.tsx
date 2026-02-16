import React from 'react';
import { MachineConfigs, ModuleType, AppData } from '../types';
import { MACHINE_COUNT } from '../constants';
import { ArrowLeft, Info } from 'lucide-react';

interface SettingsViewProps {
  configs: MachineConfigs;
  data: AppData;
  hiddenMachines: number[];
  onUpdateConfig: (machineId: number, module: ModuleType, count: number) => void;
  onUpdateMotorName: (machineId: number, module: ModuleType, index: number, name: string) => void;
  onToggleMachineHidden: (machineId: number) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  configs,
  data,
  hiddenMachines,
  onUpdateConfig,
  onUpdateMotorName,
  onToggleMachineHidden,
  onBack
}) => {
  const machines = Array.from({ length: MACHINE_COUNT }, (_, i) => i + 1);
  const [selectedMachine, setSelectedMachine] = React.useState<number>(1);
  const [selectedModule, setSelectedModule] = React.useState<ModuleType>(ModuleType.ACCUMULATION);
  const motorCount = configs[selectedMachine]?.[selectedModule] ?? 0;
  const motorList = data[selectedMachine]?.[selectedModule] ?? [];

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Bakım Takip Merkezi
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h2>
            <p className="text-xs text-gray-500">Motor sayısı yapılandırması</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4" />
          Değişiklikler otomatik kaydedilir.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Makine</th>
              <th className="py-3 px-4 text-center font-semibold">Akümülasyon Motoru</th>
              <th className="py-3 px-4 text-center font-semibold">Röle Yolu Motoru</th>
              <th className="py-3 px-4 text-center font-semibold">Hizalama Motoru</th>
              <th className="py-3 px-4 text-center font-semibold">DC Motor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {machines.map((mId) => (
              <tr key={mId} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                  {mId}. Makine
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={configs[mId][ModuleType.ACCUMULATION]}
                    onChange={(e) => onUpdateConfig(mId, ModuleType.ACCUMULATION, parseInt(e.target.value, 10) || 0)}
                    className="input w-20 text-center"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={configs[mId][ModuleType.RELAY_WAY]}
                    onChange={(e) => onUpdateConfig(mId, ModuleType.RELAY_WAY, parseInt(e.target.value, 10) || 0)}
                    className="input w-20 text-center"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={configs[mId][ModuleType.ALIGNMENT]}
                    onChange={(e) => onUpdateConfig(mId, ModuleType.ALIGNMENT, parseInt(e.target.value, 10) || 0)}
                    className="input w-20 text-center"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={configs[mId][ModuleType.DC_MOTOR]}
                    onChange={(e) => onUpdateConfig(mId, ModuleType.DC_MOTOR, parseInt(e.target.value, 10) || 0)}
                    className="input w-20 text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Motor Ünitesi İsimleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Makine</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(parseInt(e.target.value, 10))}
              className="input"
            >
              {machines.map((mId) => (
                <option key={mId} value={mId}>{mId}. Makine</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Modül</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as ModuleType)}
              className="input"
            >
              <option value={ModuleType.ACCUMULATION}>Akümülasyon</option>
              <option value={ModuleType.RELAY_WAY}>Röle Yolu</option>
              <option value={ModuleType.ALIGNMENT}>Hizalama</option>
              <option value={ModuleType.DC_MOTOR}>DC Motor</option>
            </select>
          </div>
          <div>
            <label className="label">Toplam Ünite</label>
            <input
              type="text"
              value={motorCount}
              className="input bg-gray-100"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: motorCount }).map((_, idx) => {
            const currentName = motorList[idx]?.name || `Motor Ünitesi ${idx + 1}`;
            return (
              <div key={`${selectedMachine}-${selectedModule}-${idx}`}>
                <label className="label">Ünite {idx + 1}</label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => onUpdateMotorName(selectedMachine, selectedModule, idx, e.target.value)}
                  className="input"
                  placeholder={`Motor Ünitesi ${idx + 1}`}
                />
              </div>
            );
          })}
          {motorCount === 0 && (
            <div className="text-sm text-gray-500">Bu modülde ünite bulunmuyor.</div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Makine Görünürlüğü</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {machines.map((mId) => {
            const isHidden = hiddenMachines.includes(mId);
            return (
              <label key={mId} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!isHidden}
                  onChange={() => onToggleMachineHidden(mId)}
                />
                {mId}. Makine
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">İşaretli olan makineler Bakım Takip Merkezi görünümünde listelenir.</p>
      </div>
    </div>
  );
};

export default SettingsView;
