import { MaintenanceTask, Machine, MotorSpecs } from './types';

const buildMotor = (machineIndex: number, motorIndex: number): MotorSpecs => {
  const motorNo = motorIndex + 1;
  const machineNo = machineIndex + 1;
  return {
    id: `MTR-${machineNo}-${motorNo}`,
    tagNo: `DC-MTR-${String(machineNo).padStart(2, '0')}-${String(motorNo).padStart(2, '0')}`,
    location: `Motor Ünitesi ${motorNo}`,
    brandModel: 'DC Motor',
    powerKW: 15 + motorNo * 5,
    voltageV: 440,
    currentA: 50 + motorNo * 10,
    rpm: 1500,
    excitationType: 'Şönt',
    commissionDate: '2022-01-01'
  };
};

export const MOCK_INVENTORY: Machine[] = Array.from({ length: 10 }, (_, machineIndex) => {
  const motorCount = 2 + (machineIndex % 6); // 2-7 arası
  return {
    id: `MACH-${String(machineIndex + 1).padStart(2, '0')}`,
    name: `${machineIndex + 1}. Makine`,
    location: 'ERW Üretim Hattı',
    motors: Array.from({ length: motorCount }, (_, motorIndex) => buildMotor(machineIndex, motorIndex))
  };
});

export const MOCK_TASKS: MaintenanceTask[] = [];

export const STORAGE_KEYS = {
  reports: 'cmms_dc_motor_reports',
  inventory: 'cmms_dc_motor_inventory'
};

export const EMPTY_FORM_DATA = {
  general: {
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'Periyodik',
    technician: ''
  },
  brushes: {
    brushLength: 0,
    surfaceContact: '>70%' as const,
    pressure: 'Uygun' as const,
    holderDistance: 'Uygun' as const,
    sparking: 'Yok' as const,
    commutatorSurface: 'Parlak' as const,
    segmentGap: 'Temiz' as const
  },
  electrical: {
    armatureResistance: 0,
    fieldResistance: 0,
    insulationArmature: 0,
    insulationField: 0,
    brushVoltageDiff: 0,
    loadCurrentNoLoad: 0,
    loadCurrentLoad: 0,
    excitationCurrent: 0
  },
  mechanical: {
    bearingTempFront: 0,
    bearingTempRear: 0,
    vibrationFront: 0,
    vibrationRear: 0,
    bearingSound: 'Normal' as const,
    shaftRunout: 0,
    couplingStatus: 'Uygun' as const,
    couplingAlignment: 'Uygun' as const,
    fanStatus: 'Uygun' as const,
    bodyTemp: 0
  },
  visual: {
    terminalBox: true,
    cables: true,
    covers: true,
    cleanliness: true,
    vents: true,
    grounding: true,
    corrosion: true
  },
  lubrication: {
    frontGrease: false,
    rearGrease: false,
    oldGreaseDrain: false,
    materialUsed: ''
  },
  result: {
    overallAssessment: 'Çalışmaya uygun' as const,
    faultsDetected: '',
    actionsTaken: '',
    recommendations: '',
    partsNeeded: []
  }
};
