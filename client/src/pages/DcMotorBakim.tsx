import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { MaintenanceForm } from '../modules/dcMotorBakim/components/MaintenanceForm';
import { AssetSelector } from '../modules/dcMotorBakim/components/AssetSelector';
import { ReportHistory } from '../modules/dcMotorBakim/components/ReportHistory';
import { ReportDetail } from '../modules/dcMotorBakim/components/ReportDetail';
import { MOCK_INVENTORY } from '../modules/dcMotorBakim/constants';
import { MaintenanceTask, ChecklistData, Machine, MotorSpecs, CompletedReport } from '../modules/dcMotorBakim/types';
import { appStateApi } from '../services/api';
import { APP_STATE_KEYS } from '../constants/appState';

type ViewState = 'selector' | 'form' | 'history' | 'report-detail';

const DcMotorBakim: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('selector');
  const [currentTask, setCurrentTask] = useState<MaintenanceTask | null>(null);
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
  const [completedReports, setCompletedReports] = useState<CompletedReport[]>([]);
  const [inventory, setInventory] = useState<Machine[]>(MOCK_INVENTORY);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        setIsLoadingState(true);
        const response = await appStateApi.getMany([
          APP_STATE_KEYS.dcMotorReports,
          APP_STATE_KEYS.dcMotorInventory
        ]);
        const payload = (response.data?.data || {}) as Record<string, unknown>;
        const loadedReports = Array.isArray(payload[APP_STATE_KEYS.dcMotorReports])
          ? payload[APP_STATE_KEYS.dcMotorReports] as CompletedReport[]
          : [];
        const loadedInventory = Array.isArray(payload[APP_STATE_KEYS.dcMotorInventory])
          ? payload[APP_STATE_KEYS.dcMotorInventory] as Machine[]
          : MOCK_INVENTORY;

        setCompletedReports(loadedReports);
        setInventory(loadedInventory);
      } catch {
        setCompletedReports([]);
        setInventory(MOCK_INVENTORY);
        toast.error('Dc motor verileri yuklenemedi');
      } finally {
        setIsLoadingState(false);
        setIsHydrated(true);
      }
    };

    void loadState();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timeout = window.setTimeout(() => {
      void Promise.all([
        appStateApi.set(APP_STATE_KEYS.dcMotorReports, completedReports),
        appStateApi.set(APP_STATE_KEYS.dcMotorInventory, inventory)
      ]);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [completedReports, inventory, isHydrated]);

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

      {isLoadingState && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Dc motor verileri yukleniyor...
        </div>
      )}

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
