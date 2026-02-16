export interface MotorSpecs {
  id: string;
  tagNo: string;
  location: string;
  brandModel: string;
  powerKW: number;
  voltageV: number;
  currentA: number;
  rpm: number;
  excitationType: 'Seri' | 'Şönt' | 'Kompund' | 'Ayrı';
  commissionDate: string;
}

export interface Machine {
  id: string;
  name: string;
  location: string;
  motors: MotorSpecs[];
}

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  machineId?: string;
  machineName?: string;
  taskName: string;
  status: 'Bekliyor' | 'Devam Ediyor' | 'Tamamlandı';
  plannedDate: string;
  technician?: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  progress: number;
  specs: MotorSpecs;
}

export interface ChecklistData {
  general: {
    maintenanceDate: string;
    maintenanceType: string;
    technician: string;
  };
  brushes: {
    brushLength: number;
    surfaceContact: '>70%' | '<70%';
    pressure: 'Uygun' | 'Ayarlandı';
    holderDistance: 'Uygun' | 'Ayarlandı';
    sparking: 'Yok' | 'Hafif' | 'Şiddetli';
    commutatorSurface: 'Parlak' | 'Mat' | 'Yanık iz';
    segmentGap: 'Temiz' | 'Kir/karbon var';
  };
  electrical: {
    armatureResistance: number;
    fieldResistance: number;
    insulationArmature: number;
    insulationField: number;
    brushVoltageDiff: number;
    loadCurrentNoLoad: number;
    loadCurrentLoad: number;
    excitationCurrent: number;
  };
  mechanical: {
    bearingTempFront: number;
    bearingTempRear: number;
    vibrationFront: number;
    vibrationRear: number;
    bearingSound: 'Normal' | 'Anormal';
    shaftRunout: number;
    couplingStatus: 'Uygun' | 'Hasarlı';
    couplingAlignment: 'Uygun' | 'Ayarlandı';
    fanStatus: 'Uygun' | 'Hasarlı';
    bodyTemp: number;
  };
  visual: {
    terminalBox: boolean;
    cables: boolean;
    covers: boolean;
    cleanliness: boolean;
    vents: boolean;
    grounding: boolean;
    corrosion: boolean;
  };
  lubrication: {
    frontGrease: boolean;
    rearGrease: boolean;
    oldGreaseDrain: boolean;
    materialUsed: string;
  };
  result: {
    overallAssessment:
      | 'Çalışmaya uygun'
      | 'İzleme altında çalışabilir'
      | 'Planlı onarım gerekli'
      | 'Acil müdahale gerekli';
    faultsDetected: string;
    actionsTaken: string;
    recommendations: string;
    partsNeeded: Array<{ name: string; quantity: number; urgency: 'Acil' | 'Planlı' }>;
  };
}

export interface CompletedReport {
  id: string;
  task: MaintenanceTask;
  data: ChecklistData;
  timestamp: string;
}
