import React, { useState } from 'react';
import { Factory, Cog, ArrowRight, ClipboardList, History } from 'lucide-react';
import { Machine, MotorSpecs } from '../types';

interface AssetSelectorProps {
  inventory: Machine[];
  onSelect: (machine: Machine, motor: MotorSpecs) => void;
  onViewHistory: () => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ inventory, onSelect, onViewHistory }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedMotorId, setSelectedMotorId] = useState<string>('');

  const selectedMachine = inventory.find((m) => m.id === selectedMachineId);
  const selectedMotor = selectedMachine?.motors.find((m) => m.id === selectedMotorId);

  const handleStart = () => {
    if (selectedMachine && selectedMotor) {
      onSelect(selectedMachine, selectedMotor);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={onViewHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
        >
          <History className="w-4 h-4" />
          Geçmiş Raporlar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-blue-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Yeni Bakım Kaydı</h1>
          </div>
          <p className="text-blue-100">
            DC motor bakım modülünde kayıt oluşturmak için ekipman seçiniz.
          </p>
        </div>

        <div className="p-8 grid gap-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <Factory className="w-4 h-4 text-gray-400" />
              Makine / Hat Seçimi
            </label>
            <select
              value={selectedMachineId}
              onChange={(e) => {
                setSelectedMachineId(e.target.value);
                setSelectedMotorId('');
              }}
              className="block w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all hover:bg-white border"
            >
              <option value="">-- Makine Seçiniz --</option>
              {inventory.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name} ({machine.location})
                </option>
              ))}
            </select>
          </div>

          <div
            className={`space-y-3 transition-all duration-300 ${
              selectedMachineId ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <Cog className="w-4 h-4 text-gray-400" />
              DC Motor Seçimi
            </label>
            <select
              value={selectedMotorId}
              onChange={(e) => setSelectedMotorId(e.target.value)}
              disabled={!selectedMachineId}
              className="block w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all hover:bg-white border"
            >
              <option value="">-- Motor Seçiniz --</option>
              {selectedMachine?.motors.map((motor) => (
                <option key={motor.id} value={motor.id}>
                  {motor.brandModel} - {motor.location} ({motor.powerKW}kW)
                </option>
              ))}
            </select>
          </div>

          {selectedMotor && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-blue-900 font-semibold mb-3">Seçilen Ekipman Özeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-400 text-xs uppercase block">Tag No</span>
                  <span className="font-medium text-blue-900">{selectedMotor.tagNo}</span>
                </div>
                <div>
                  <span className="text-blue-400 text-xs uppercase block">Lokasyon</span>
                  <span className="font-medium text-blue-900">
                    {selectedMachine?.name} - {selectedMotor.location}
                  </span>
                </div>
                <div>
                  <span className="text-blue-400 text-xs uppercase block">Güç / Devir</span>
                  <span className="font-medium text-blue-900">
                    {selectedMotor.powerKW}kW / {selectedMotor.rpm}RPM
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStart}
              disabled={!selectedMachineId || !selectedMotorId}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg
                ${
                  selectedMachineId && selectedMotorId
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Rapor Oluştur
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
