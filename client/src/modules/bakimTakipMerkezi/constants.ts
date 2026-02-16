import { ModuleType, ComponentStatus, MotorState, AppData, MachineConfigs } from './types';

export const MACHINE_COUNT = 29;

export const STORAGE_KEYS = {
  data: 'cmms_bakim_takip_data',
  configs: 'cmms_bakim_takip_configs',
  hiddenMachines: 'cmms_bakim_takip_hidden_machines'
};

export const DEFAULT_CONFIGS: Record<ModuleType, number> = {
  [ModuleType.ACCUMULATION]: 8,
  [ModuleType.RELAY_WAY]: 10,
  [ModuleType.ALIGNMENT]: 5,
  [ModuleType.DC_MOTOR]: 2
};

export const MODULES = [
  { type: ModuleType.ACCUMULATION, motorCount: DEFAULT_CONFIGS[ModuleType.ACCUMULATION] },
  { type: ModuleType.RELAY_WAY, motorCount: DEFAULT_CONFIGS[ModuleType.RELAY_WAY] },
  { type: ModuleType.ALIGNMENT, motorCount: DEFAULT_CONFIGS[ModuleType.ALIGNMENT] },
  { type: ModuleType.DC_MOTOR, motorCount: DEFAULT_CONFIGS[ModuleType.DC_MOTOR] }
];

export const INITIAL_MOTOR_STATE: Omit<MotorState, 'id'> = {
  name: '',
  motorStatus: ComponentStatus.OK,
  reducerStatus: ComponentStatus.OK,
  rollerStatus: ComponentStatus.OK,
  otherElectrical: ComponentStatus.OK,
  otherMechanical: ComponentStatus.OK,
  electricalComment: '',
  mechanicalComment: '',
  history: [],
  maintenanceMonths: [],
  monthlyReports: {},
  dcMotorReports: {}
};

const generateInitialConfigs = (): MachineConfigs => {
  const configs: MachineConfigs = {};
  for (let m = 1; m <= MACHINE_COUNT; m += 1) {
    configs[m] = { ...DEFAULT_CONFIGS };
  }
  return configs;
};

export const INITIAL_CONFIGS = generateInitialConfigs();

const generateInitialData = (configs: MachineConfigs): AppData => {
  const data: AppData = {};
  for (let m = 1; m <= MACHINE_COUNT; m += 1) {
    data[m] = {
      [ModuleType.ACCUMULATION]: Array.from(
        { length: configs[m][ModuleType.ACCUMULATION] },
        (_, i) => ({ ...INITIAL_MOTOR_STATE, id: `M${i + 1}`, name: `Motor Ünitesi ${i + 1}`, history: [] } as MotorState)
      ),
      [ModuleType.RELAY_WAY]: Array.from(
        { length: configs[m][ModuleType.RELAY_WAY] },
        (_, i) => ({ ...INITIAL_MOTOR_STATE, id: `M${i + 1}`, name: `Motor Ünitesi ${i + 1}`, history: [] } as MotorState)
      ),
      [ModuleType.ALIGNMENT]: Array.from(
        { length: configs[m][ModuleType.ALIGNMENT] },
        (_, i) => ({ ...INITIAL_MOTOR_STATE, id: `M${i + 1}`, name: `Motor Ünitesi ${i + 1}`, history: [] } as MotorState)
      ),
      [ModuleType.DC_MOTOR]: Array.from(
        { length: configs[m][ModuleType.DC_MOTOR] },
        (_, i) => ({ ...INITIAL_MOTOR_STATE, id: `M${i + 1}`, name: `Motor Ünitesi ${i + 1}`, history: [] } as MotorState)
      )
    };
  }
  return data;
};

export const INITIAL_DATA = generateInitialData(INITIAL_CONFIGS);

export const COMPONENT_OPTIONS = [
  ComponentStatus.OK,
  ComponentStatus.MAINTENANCE_REQUIRED,
  ComponentStatus.DAMAGED_NOT_WORKING,
  ComponentStatus.NOT_PRESENT
];

export const OTHER_OPTIONS = [
  ComponentStatus.OK,
  ComponentStatus.PROBLEMATIC_WORKING,
  ComponentStatus.PROBLEMATIC_NOT_WORKING
];
