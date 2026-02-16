import { ComponentStatus, HealthStatus, MotorState } from './types';

export const getStatusPriority = (status: ComponentStatus): number => {
  switch (status) {
    case ComponentStatus.OK:
      return 0;
    case ComponentStatus.MAINTENANCE_REQUIRED:
    case ComponentStatus.PROBLEMATIC_WORKING:
      return 1;
    case ComponentStatus.DAMAGED_NOT_WORKING:
    case ComponentStatus.NOT_PRESENT:
    case ComponentStatus.PROBLEMATIC_NOT_WORKING:
      return 2;
    default:
      return 0;
  }
};

const getReportPriority = (assessment?: string): number => {
  if (!assessment) return 0;
  const normalized = assessment.toLocaleLowerCase('tr-TR');
  if (normalized.includes('acil')) return 2;
  if (normalized.includes('planlı')) return 1;
  if (normalized.includes('izleme')) return 1;
  return 0;
};

const getLatestReportPriority = (state: MotorState): number => {
  const reports = Object.values(state.dcMotorReports || {});
  if (reports.length === 0) return 0;
  const latest = reports.reduce((acc, item) => {
    if (!acc) return item;
    return acc.timestamp > item.timestamp ? acc : item;
  }, reports[0]);
  return getReportPriority(latest?.assessment);
};

export const calculateMotorHealth = (state: MotorState): { status: HealthStatus; hasE: boolean; hasM: boolean } => {
  const hasElectricalComment = state.electricalComment && state.electricalComment.trim().length > 0;
  const hasMechanicalComment = state.mechanicalComment && state.mechanicalComment.trim().length > 0;

  let ePriority = Math.max(
    getStatusPriority(state.motorStatus),
    getStatusPriority(state.otherElectrical)
  );

  let mPriority = Math.max(
    getStatusPriority(state.reducerStatus),
    getStatusPriority(state.rollerStatus),
    getStatusPriority(state.otherMechanical)
  );

  if (hasElectricalComment && ePriority === 0) ePriority = 1;
  if (hasMechanicalComment && mPriority === 0) mPriority = 1;

  const reportPriority = getLatestReportPriority(state);
  const overallPriority = Math.max(ePriority, mPriority, reportPriority);

  let status = HealthStatus.HEALTHY;
  if (overallPriority === 1) status = HealthStatus.CAUTION;
  if (overallPriority === 2) status = HealthStatus.CRITICAL;

  return {
    status,
    hasE: ePriority > 0,
    hasM: mPriority > 0
  };
};

export const getMotorDetailedReasons = (state: MotorState) => {
  const reasons: { label: string; value: string; type: 'E' | 'M' }[] = [];

  if (state.motorStatus !== ComponentStatus.OK)
    reasons.push({ label: 'Motor', value: state.motorStatus, type: 'E' });
  if (state.otherElectrical !== ComponentStatus.OK)
    reasons.push({ label: 'Elek. Diğer', value: state.otherElectrical, type: 'E' });

  if (state.reducerStatus !== ComponentStatus.OK)
    reasons.push({ label: 'Redüktör', value: state.reducerStatus, type: 'M' });
  if (state.rollerStatus !== ComponentStatus.OK)
    reasons.push({ label: 'Makara', value: state.rollerStatus, type: 'M' });
  if (state.otherMechanical !== ComponentStatus.OK)
    reasons.push({ label: 'Mek. Diğer', value: state.otherMechanical, type: 'M' });

  const comments: { label: string; text: string }[] = [];
  if (state.electricalComment && state.electricalComment.trim())
    comments.push({ label: 'Elek. Not', text: state.electricalComment.trim() });
  if (state.mechanicalComment && state.mechanicalComment.trim())
    comments.push({ label: 'Mek. Not', text: state.mechanicalComment.trim() });

  return { reasons, comments };
};

export const getStatusStyles = (status: HealthStatus): string => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    case HealthStatus.CAUTION:
      return 'border-amber-500 bg-amber-50 text-amber-700';
    case HealthStatus.CRITICAL:
      return 'border-rose-600 bg-rose-50 text-rose-800';
    default:
      return 'border-slate-300 bg-slate-50 text-slate-500';
  }
};

export const getStatusColor = (status: HealthStatus): string => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'bg-emerald-500';
    case HealthStatus.CAUTION:
      return 'bg-amber-400';
    case HealthStatus.CRITICAL:
      return 'bg-rose-600';
    default:
      return 'bg-slate-300';
  }
};

export const getStatusText = (status: HealthStatus): string => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'SAĞLIKLI';
    case HealthStatus.CAUTION:
      return 'DİKKAT';
    case HealthStatus.CRITICAL:
      return 'KRİTİK';
    default:
      return '';
  }
};
