import React, { useEffect, useState } from 'react';
import { ModuleType, AppData, MotorState, MachineConfigs, HistoryEntry } from '../modules/bakimTakipMerkezi/types';
import { INITIAL_DATA, INITIAL_CONFIGS, MACHINE_COUNT } from '../modules/bakimTakipMerkezi/constants';
import Dashboard from '../modules/bakimTakipMerkezi/components/Dashboard';
import MatrixView from '../modules/bakimTakipMerkezi/components/MatrixView';
import MachineDetail from '../modules/bakimTakipMerkezi/components/MachineDetail';
import MotorModal from '../modules/bakimTakipMerkezi/components/MotorModal';
import SettingsView from '../modules/bakimTakipMerkezi/components/SettingsView';
import { MaintenanceForm } from '../modules/dcMotorBakim/components/MaintenanceForm';
import { MaintenanceTask, ChecklistData } from '../modules/dcMotorBakim/types';
import { Settings } from 'lucide-react';
import { calculateMotorHealth } from '../modules/bakimTakipMerkezi/utils';
import { appStateApi } from '../services/api';
import { APP_STATE_KEYS } from '../constants/appState';

const LEGACY_MODULE_MAP: Record<string, ModuleType> = {
  'AK?M?LASYON': ModuleType.ACCUMULATION,
  'R?LE YOLU': ModuleType.RELAY_WAY,
  'H?ZALAMA': ModuleType.ALIGNMENT,
  'AK?oM?oLASYON': ModuleType.ACCUMULATION,
  'R?-LE YOLU': ModuleType.RELAY_WAY,
  'HZ?ZALAMA': ModuleType.ALIGNMENT
};

const normalizeModuleKey = (key: string): ModuleType | null => {
  if (Object.values(ModuleType).includes(key as ModuleType)) return key as ModuleType;
  return LEGACY_MODULE_MAP[key] ?? null;
};

const buildDataFromConfigs = (configs: MachineConfigs): AppData => {
  const data: AppData = {};
  for (let m = 1; m <= MACHINE_COUNT; m += 1) {
    const config = configs[m] ?? INITIAL_CONFIGS[m];
    data[m] = {
      [ModuleType.ACCUMULATION]: Array.from(
        { length: config[ModuleType.ACCUMULATION] },
        (_, i) => ({
          ...INITIAL_DATA[1][ModuleType.ACCUMULATION][0],
          id: `M${i + 1}`,
          name: `Motor Ünitesi ${i + 1}`,
          history: []
        } as MotorState)
      ),
      [ModuleType.RELAY_WAY]: Array.from(
        { length: config[ModuleType.RELAY_WAY] },
        (_, i) => ({
          ...INITIAL_DATA[1][ModuleType.RELAY_WAY][0],
          id: `M${i + 1}`,
          name: `Motor Ünitesi ${i + 1}`,
          history: []
        } as MotorState)
      ),
      [ModuleType.ALIGNMENT]: Array.from(
        { length: config[ModuleType.ALIGNMENT] },
        (_, i) => ({
          ...INITIAL_DATA[1][ModuleType.ALIGNMENT][0],
          id: `M${i + 1}`,
          name: `Motor Ünitesi ${i + 1}`,
          history: []
        } as MotorState)
      ),
      [ModuleType.DC_MOTOR]: Array.from(
        { length: config[ModuleType.DC_MOTOR] },
        (_, i) => ({
          ...INITIAL_DATA[1][ModuleType.DC_MOTOR][0],
          id: `M${i + 1}`,
          name: `Motor Ünitesi ${i + 1}`,
          history: []
        } as MotorState)
      )
    };
  }
  return data;
};

const normalizeConfigs = (raw: unknown): MachineConfigs => {
  const configs: MachineConfigs = {};
  for (let m = 1; m <= MACHINE_COUNT; m += 1) {
    configs[m] = { ...INITIAL_CONFIGS[m] };
  }

  if (!raw || typeof raw !== 'object') return configs;

  Object.keys(raw as Record<string, unknown>).forEach((machineId) => {
    const mId = Number(machineId);
    if (!Number.isFinite(mId) || !configs[mId]) return;
    const moduleConfig = (raw as Record<string, Record<string, unknown>>)[machineId];
    if (!moduleConfig || typeof moduleConfig !== 'object') return;
    Object.keys(moduleConfig).forEach((moduleKey) => {
      const normalized = normalizeModuleKey(moduleKey);
      if (!normalized) return;
      const value = Number((moduleConfig as Record<string, unknown>)[moduleKey]);
      if (!Number.isNaN(value)) {
        configs[mId][normalized] = value;
      }
    });
  });

  return configs;
};

const normalizeData = (raw: unknown, configs: MachineConfigs): AppData => {
  const data = buildDataFromConfigs(configs);
  if (!raw || typeof raw !== 'object') return data;

  Object.keys(raw as Record<string, unknown>).forEach((machineId) => {
    const mId = Number(machineId);
    if (!Number.isFinite(mId) || !data[mId]) return;
    const modules = (raw as Record<string, Record<string, unknown>>)[machineId];
    if (!modules || typeof modules !== 'object') return;

    Object.keys(modules).forEach((moduleKey) => {
      const normalized = normalizeModuleKey(moduleKey);
      if (!normalized) return;
      const list = (modules as Record<string, unknown>)[moduleKey];
      if (!Array.isArray(list)) return;

      const targetCount = configs[mId]?.[normalized] ?? list.length;
      const base = INITIAL_DATA[1][normalized][0];
      const normalizedList = Array.from({ length: targetCount }, (_, i) => {
        const item = list[i] as Partial<MotorState> | undefined;
        const fallbackName = `Motor Ünitesi ${i + 1}`;
        return {
          ...base,
          ...item,
          id: item?.id || `M${i + 1}`,
          name: item?.name || fallbackName,
          history: Array.isArray(item?.history) ? item?.history : [],
          maintenanceMonths: Array.isArray(item?.maintenanceMonths) ? item?.maintenanceMonths : [],
          monthlyReports: item?.monthlyReports && typeof item.monthlyReports === 'object'
            ? (item.monthlyReports as Record<string, string[]>)
            : {},
          dcMotorReports: item?.dcMotorReports && typeof item.dcMotorReports === 'object'
            ? (item.dcMotorReports as Record<string, {
                date: string;
                technician: string;
                assessment: string;
                data: ChecklistData;
                task: MaintenanceTask;
                timestamp: string;
              }>)
            : {}
        } as MotorState;
      });

      data[mId][normalized] = normalizedList;
    });
  });

  return data;
};

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const getMonthLabel = (value?: string) => {
  if (!value) return MONTH_LABELS[new Date().getMonth()];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return MONTH_LABELS[new Date().getMonth()];
  return MONTH_LABELS[parsed.getMonth()];
};

const buildDcMotorTask = (machineId: number, motor: MotorState, motorIndex: number): MaintenanceTask => {
  const paddedMachine = String(machineId).padStart(2, '0');
  const paddedMotor = String(motorIndex + 1).padStart(2, '0');
  return {
    id: `DC-${paddedMachine}-${paddedMotor}-${Date.now()}`,
    equipmentId: `DC-MTR-${paddedMachine}-${paddedMotor}`,
    equipmentName: `${machineId}. Boru Makinası - ${motor.name || `Motor Ünitesi ${motorIndex + 1}`}`,
    taskName: 'DC Motor Bakım Kaydı',
    status: 'Bekliyor',
    plannedDate: new Date().toISOString().split('T')[0],
    priority: 'Orta',
    progress: 0,
    specs: {
      id: `SPEC-${paddedMachine}-${paddedMotor}`,
      tagNo: `DC-MTR-${paddedMachine}-${paddedMotor}`,
      location: motor.name || `Motor Ünitesi ${motorIndex + 1}`,
      brandModel: 'DC Motor',
      powerKW: 0,
      voltageV: 0,
      currentA: 0,
      rpm: 0,
      excitationType: 'Şönt',
      commissionDate: ''
    }
  };
};

const BakimTakipMerkezi: React.FC = () => {
  const [configs, setConfigs] = useState<MachineConfigs>(() => normalizeConfigs(INITIAL_CONFIGS));
  const [data, setData] = useState<AppData>(() => buildDataFromConfigs(normalizeConfigs(INITIAL_CONFIGS)));
  const [hiddenMachines, setHiddenMachines] = useState<number[]>([]);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [isStateHydrated, setIsStateHydrated] = useState(false);

  const [view, setView] = useState<'dashboard' | 'matrix' | 'machine' | 'settings'>('dashboard');
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [activeMachineId, setActiveMachineId] = useState<number | null>(null);
  const [activeMotorIndex, setActiveMotorIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        setIsStateLoading(true);
        const response = await appStateApi.getMany([
          APP_STATE_KEYS.bakimTakipConfigs,
          APP_STATE_KEYS.bakimTakipData,
          APP_STATE_KEYS.bakimTakipHiddenMachines
        ]);
        const payload = (response.data?.data || {}) as Record<string, unknown>;
        const loadedConfigs = normalizeConfigs(payload[APP_STATE_KEYS.bakimTakipConfigs] ?? INITIAL_CONFIGS);
        const loadedData = normalizeData(payload[APP_STATE_KEYS.bakimTakipData], loadedConfigs);
        const loadedHidden = Array.isArray(payload[APP_STATE_KEYS.bakimTakipHiddenMachines])
          ? (payload[APP_STATE_KEYS.bakimTakipHiddenMachines] as unknown[])
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value))
          : [];

        setConfigs(loadedConfigs);
        setData(loadedData);
        setHiddenMachines(loadedHidden);
      } catch {
        setConfigs(normalizeConfigs(INITIAL_CONFIGS));
        setData(buildDataFromConfigs(normalizeConfigs(INITIAL_CONFIGS)));
        setHiddenMachines([]);
      } finally {
        setIsStateLoading(false);
        setIsStateHydrated(true);
      }
    };

    void loadState();
  }, []);

  useEffect(() => {
    if (!isStateHydrated) return;

    const timeout = window.setTimeout(() => {
      void Promise.all([
        appStateApi.set(APP_STATE_KEYS.bakimTakipConfigs, configs),
        appStateApi.set(APP_STATE_KEYS.bakimTakipData, data),
        appStateApi.set(APP_STATE_KEYS.bakimTakipHiddenMachines, hiddenMachines)
      ]);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [configs, data, hiddenMachines, isStateHydrated]);

  const visibleMachineIds = Array.from({ length: MACHINE_COUNT }, (_, i) => i + 1)
    .filter((id) => !hiddenMachines.includes(id));

  const visibleMachineIdsForModule = (module: ModuleType | null) => {
    if (!module) return visibleMachineIds;
    return visibleMachineIds.filter((id) => (data[id]?.[module]?.length || 0) > 0);
  };

  const handleModuleSelect = (module: ModuleType) => {
    setActiveModule(module);
    setView('matrix');
  };

  const handleMachineSelect = (machineId: number) => {
    setActiveMachineId(machineId);
    setView('machine');
  };

  const handleNavigateMachine = (direction: 'prev' | 'next') => {
    if (activeMachineId === null) return;
    if (visibleMachineIds.length === 0) return;
    const currentIndex = visibleMachineIds.indexOf(activeMachineId);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    if (direction === 'next') {
      const nextIndex = (safeIndex + 1) % visibleMachineIds.length;
      setActiveMachineId(visibleMachineIds[nextIndex]);
    } else {
      const nextIndex = (safeIndex - 1 + visibleMachineIds.length) % visibleMachineIds.length;
      setActiveMachineId(visibleMachineIds[nextIndex]);
    }
  };

  const handleUpdateConfig = (machineId: number, module: ModuleType, count: number) => {
    setConfigs((prev) => {
      const newConfigs = { ...prev };
      newConfigs[machineId] = { ...newConfigs[machineId], [module]: count };
      return newConfigs;
    });
    setData((prev) => {
      const newData = { ...prev };
      const currentMotors = [...newData[machineId][module]];
      if (count > currentMotors.length) {
        const diff = count - currentMotors.length;
        const newMotors = Array.from({ length: diff }, (_, i) => ({
          ...INITIAL_DATA[1][module][0],
          id: `M${currentMotors.length + i + 1}`
        } as MotorState));
        newData[machineId][module] = [...currentMotors, ...newMotors];
      } else if (count < currentMotors.length) {
        newData[machineId][module] = currentMotors.slice(0, count);
      }
      return newData;
    });
  };

  const updateMotorData = (updatedState: MotorState) => {
    if (activeMachineId && activeModule && activeMotorIndex !== null) {
      setData((prev) => {
        const newData = { ...prev };
        const motors = [...newData[activeMachineId][activeModule]];
        const oldState = motors[activeMotorIndex];

        const changedFields: string[] = [];
        if (oldState.motorStatus !== updatedState.motorStatus) changedFields.push(`Motor: ${updatedState.motorStatus}`);
        if (oldState.reducerStatus !== updatedState.reducerStatus) changedFields.push(`Redüktör: ${updatedState.reducerStatus}`);
        if (oldState.rollerStatus !== updatedState.rollerStatus) changedFields.push(`Makara: ${updatedState.rollerStatus}`);
        if (oldState.otherElectrical !== updatedState.otherElectrical) changedFields.push(`Elek. Diğer: ${updatedState.otherElectrical}`);
        if (oldState.otherMechanical !== updatedState.otherMechanical) changedFields.push(`Mek. Diğer: ${updatedState.otherMechanical}`);
        if (oldState.electricalComment !== updatedState.electricalComment) changedFields.push('Elek. Not güncellendi');
        if (oldState.mechanicalComment !== updatedState.mechanicalComment) changedFields.push('Mek. Not güncellendi');

        let finalState = { ...updatedState };
        if (changedFields.length > 0) {
          const health = calculateMotorHealth(updatedState);
          const historyEntry: HistoryEntry = {
            timestamp: Date.now(),
            details: changedFields.join(', '),
            status: health.status
          };
          finalState.history = [historyEntry, ...(oldState.history || [])].slice(0, 50);
        }

        motors[activeMotorIndex] = finalState;
        newData[activeMachineId] = { ...newData[activeMachineId], [activeModule]: motors };
        return newData;
      });
    }
  };

  const updateMotorName = (index: number, name: string) => {
    if (!activeMachineId || !activeModule) return;
    setData((prev) => {
      const newData = { ...prev };
      const motors = [...newData[activeMachineId][activeModule]];
      const target = motors[index];
      if (!target) return prev;
      motors[index] = { ...target, name };
      newData[activeMachineId] = { ...newData[activeMachineId], [activeModule]: motors };
      return newData;
    });
  };

  const updateMotorNameFromSettings = (machineId: number, module: ModuleType, index: number, name: string) => {
    setData((prev) => {
      const newData = { ...prev };
      const motors = [...newData[machineId][module]];
      const target = motors[index];
      if (!target) return prev;
      motors[index] = { ...target, name };
      newData[machineId] = { ...newData[machineId], [module]: motors };
      return newData;
    });
  };

  const handleDcMotorSave = (formData: ChecklistData) => {
    if (activeMachineId === null || activeMotorIndex === null || activeModule !== ModuleType.DC_MOTOR) return;
    const reportId = `RAP-${Date.now()}`;
    const monthLabel = getMonthLabel(formData.general?.maintenanceDate);

    setData((prev) => {
      const newData = { ...prev };
      const motors = [...newData[activeMachineId][activeModule]];
      const motor = motors[activeMotorIndex];
      if (!motor) return prev;

      const monthlyReports = { ...(motor.monthlyReports || {}) };
      const reportList = [...(monthlyReports[monthLabel] || [])];
      reportList.push(reportId);
      monthlyReports[monthLabel] = reportList;

      const maintenanceMonths = Array.isArray(motor.maintenanceMonths) ? [...motor.maintenanceMonths] : [];
      if (!maintenanceMonths.includes(monthLabel)) {
        maintenanceMonths.push(monthLabel);
      }

      const dcMotorReports = { ...(motor.dcMotorReports || {}) };
      const taskSnapshot = buildDcMotorTask(activeMachineId, motor, activeMotorIndex);
      dcMotorReports[reportId] = {
        date: formData.general?.maintenanceDate || new Date().toISOString().split('T')[0],
        technician: formData.general?.technician || '',
        assessment: formData.result?.overallAssessment || '',
        data: formData,
        task: taskSnapshot,
        timestamp: new Date().toISOString()
      };

      motors[activeMotorIndex] = {
        ...motor,
        monthlyReports,
        maintenanceMonths,
        dcMotorReports
      };

      newData[activeMachineId] = { ...newData[activeMachineId], [activeModule]: motors };
      return newData;
    });

    setActiveMotorIndex(null);
  };

  const handleDeleteDcMotorReport = (motorIndex: number, reportId: string, monthLabel: string) => {
    if (activeMachineId === null || activeModule !== ModuleType.DC_MOTOR) return;
    setData((prev) => {
      const newData = { ...prev };
      const motors = [...newData[activeMachineId][activeModule]];
      const motor = motors[motorIndex];
      if (!motor) return prev;

      const monthlyReports = { ...(motor.monthlyReports || {}) };
      const monthReports = (monthlyReports[monthLabel] || []).filter((id) => id !== reportId);
      if (monthReports.length > 0) {
        monthlyReports[monthLabel] = monthReports;
      } else {
        delete monthlyReports[monthLabel];
      }

      const maintenanceMonths = Array.isArray(motor.maintenanceMonths) ? [...motor.maintenanceMonths] : [];
      const updatedMonths = monthReports.length > 0
        ? maintenanceMonths
        : maintenanceMonths.filter((label) => label !== monthLabel);

      const dcMotorReports = { ...(motor.dcMotorReports || {}) };
      delete dcMotorReports[reportId];

      motors[motorIndex] = {
        ...motor,
        monthlyReports,
        maintenanceMonths: updatedMonths,
        dcMotorReports
      };

      newData[activeMachineId] = { ...newData[activeMachineId], [activeModule]: motors };
      return newData;
    });
  };

  const toggleMachineHidden = (machineId: number) => {
    setHiddenMachines((prev) => (
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bakım Takip Merkezi</h1>
          <p className="text-sm text-gray-600">Endüstriyel üretim tesis yönetim sistemi</p>
        </div>
        <button
          onClick={() => setView('settings')}
          className="btn btn-secondary inline-flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Ayarlar
        </button>
      </div>

      <div className="card p-4">
        {isStateLoading && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Bakim takip verileri yukleniyor...
          </div>
        )}
        {view === 'dashboard' && (
          <Dashboard data={data} onSelectModule={handleModuleSelect} machineIds={visibleMachineIds} />
        )}
        {view === 'matrix' && activeModule && (
          <MatrixView
            moduleType={activeModule}
            data={data}
            machineIds={visibleMachineIdsForModule(activeModule)}
            onSelectMachine={handleMachineSelect}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'machine' && activeModule && activeMachineId && (
          <MachineDetail
            machineId={activeMachineId}
            moduleType={activeModule}
            motors={data[activeMachineId][activeModule]}
            onBack={() => setView('matrix')}
            onSelectMotor={(idx) => setActiveMotorIndex(idx)}
            onNavigate={handleNavigateMachine}
            onUpdateMotorName={updateMotorName}
            onDeleteReport={handleDeleteDcMotorReport}
          />
        )}
        {view === 'machine' && activeModule === ModuleType.DC_MOTOR && activeMachineId && activeMotorIndex !== null && (
          <div className="card p-4">
            <MaintenanceForm
              task={buildDcMotorTask(
                activeMachineId,
                data[activeMachineId][activeModule][activeMotorIndex],
                activeMotorIndex
              )}
              onBack={() => setActiveMotorIndex(null)}
              onSave={handleDcMotorSave}
            />
          </div>
        )}
        {view === 'settings' && (
          <SettingsView
            configs={configs}
            data={data}
            hiddenMachines={hiddenMachines}
            onUpdateConfig={handleUpdateConfig}
            onUpdateMotorName={updateMotorNameFromSettings}
            onToggleMachineHidden={toggleMachineHidden}
            onBack={() => setView('dashboard')}
          />
        )}
      </div>

      {activeMotorIndex !== null && activeMachineId && activeModule && activeModule !== ModuleType.DC_MOTOR && (
        <MotorModal
          motor={data[activeMachineId][activeModule][activeMotorIndex]}
          onClose={() => setActiveMotorIndex(null)}
          onUpdate={updateMotorData}
        />
      )}
    </div>
  );
};

export default BakimTakipMerkezi;
