import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { MaintenanceForm } from '../modules/dcMotorBakim/components/MaintenanceForm';
import { AssetSelector } from '../modules/dcMotorBakim/components/AssetSelector';
import { ReportHistory } from '../modules/dcMotorBakim/components/ReportHistory';
import { ReportDetail } from '../modules/dcMotorBakim/components/ReportDetail';
import { MOCK_INVENTORY, STORAGE_KEYS } from '../modules/dcMotorBakim/constants';
import { MaintenanceTask, ChecklistData, Machine, MotorSpecs, CompletedReport } from '../modules/dcMotorBakim/types';

type ViewState = 'selector' | 'form' | 'history' | 'report-detail';

const loadReports = (): CompletedReport[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.reports);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CompletedReport[]) : [];
  } catch {
    return [];
  }
};

const loadInventory = (): Machine[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.inventory);
  if (!raw) return MOCK_INVENTORY;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Machine[]) : MOCK_INVENTORY;
  } catch {
    return MOCK_INVENTORY;
  }
};

const DcMotorBakim: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('selector');
  const [currentTask, setCurrentTask] = useState<MaintenanceTask | null>(null);
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
  const [completedReports, setCompletedReports] = useState<CompletedReport[]>(() => loadReports());
  const [inventory, setInventory] = useState<Machine[]>(() => loadInventory());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(completedReports));
  }, [completedReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
  }, [inventory]);

  const handleAssetSelect = (machine: Machine, motor: MotorSpecs) => {
    const newTask: MaintenanceTask = {
      id: `WO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      equipmentId: motor.tagNo,
      equipmentName: `${machine.name} - ${motor.location}`,
      machineId: machine.id,
      machineName: machine.name,
      taskName: 'DC Motor Bakım Kaydı',
      status: 'Bekliyor',
      plannedDate: new Date().toISOString().split('T')[0],
      priority: 'Orta',
      progress: 0,
      specs: motor
    };

    setCurrentTask(newTask);
    setCurrentView('form');
  };

  const handleBackToSelector = () => {
    setCurrentTask(null);
    setSelectedReport(null);
    setCurrentView('selector');
  };

  const handleUpdateSpecs = (specs: MotorSpecs) => {
    setCurrentTask((prev) => {
      if (!prev) return prev;
      const machineLabel = prev.machineName ?? prev.equipmentName.split(' - ')[0];
      return {
        ...prev,
        specs,
        equipmentId: specs.tagNo,
        equipmentName: `${machineLabel} - ${specs.location}`
      };
    });

    setInventory((prev) =>
      prev.map((machine) => {
        if (machine.id !== currentTask?.machineId) return machine;
        return {
          ...machine,
          motors: machine.motors.map((motor) => (motor.id === specs.id ? { ...specs } : motor))
        };
      })
    );
  };

  const handleSaveForm = (data: ChecklistData) => {
    if (!currentTask) return;

    const newReport: CompletedReport = {
      id: `REP-${Date.now()}`,
      task: { ...currentTask, status: 'Tamamlandı', progress: 100 },
      data,
      timestamp: new Date().toISOString()
    };

    setCompletedReports((prev) => [newReport, ...prev]);
    setCurrentTask(null);
    setCurrentView('history');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-blue-600 p-2 text-white">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dc Motor Bakım İş Girişi</h1>
            <p className="text-sm text-gray-600">Dc motor bakım raporları ve kontrol formları.</p>
          </div>
        </div>
        {currentView !== 'selector' && (
          <button onClick={handleBackToSelector} className="btn btn-secondary">
            Yeni Kayıt
          </button>
        )}
      </div>

      {currentView === 'report-detail' && selectedReport ? (
        <ReportDetail
          report={selectedReport}
          onBack={() => {
            setSelectedReport(null);
            setCurrentView('history');
          }}
        />
      ) : (
        <div className="card p-4">
          {currentView === 'selector' && (
            <AssetSelector
              inventory={inventory}
              onSelect={handleAssetSelect}
              onViewHistory={() => setCurrentView('history')}
            />
          )}

          {currentView === 'form' && currentTask && (
            <MaintenanceForm
              task={currentTask}
              onBack={handleBackToSelector}
              onSave={handleSaveForm}
              onUpdateSpecs={handleUpdateSpecs}
            />
          )}

          {currentView === 'history' && (
            <ReportHistory
              reports={completedReports}
              onBack={handleBackToSelector}
              onViewReport={(report) => {
                setSelectedReport(report);
                setCurrentView('report-detail');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DcMotorBakim;
