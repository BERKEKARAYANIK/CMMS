import React, { useState } from 'react';
import { ModuleType, MotorState, HealthStatus } from '../types';
import { calculateMotorHealth, getStatusText } from '../utils';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReportDetail } from '../../dcMotorBakim/components/ReportDetail';
import { CompletedReport } from '../../dcMotorBakim/types';

interface MachineDetailProps {
  machineId: number;
  moduleType: ModuleType;
  motors: MotorState[];
  onBack: () => void;
  onSelectMotor: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onUpdateMotorName: (index: number, name: string) => void;
  onDeleteReport: (motorIndex: number, reportId: string, monthLabel: string) => void;
}

const getBadgeClass = (status: HealthStatus) => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'badge-success';
    case HealthStatus.CAUTION:
      return 'badge-warning';
    case HealthStatus.CRITICAL:
      return 'badge-danger';
    default:
      return 'badge-gray';
  }
};

const MachineDetail: React.FC<MachineDetailProps> = ({
  machineId,
  moduleType,
  motors,
  onBack,
  onSelectMotor,
  onNavigate,
  onUpdateMotorName,
  onDeleteReport
}) => {
  const monthLabels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const [reportModal, setReportModal] = useState<{
    motorName: string;
    motorIndex: number;
    monthLabel: string;
    reportIds: string[];
    reportData: Record<string, { date: string; technician: string; assessment: string; data: any; task: any; timestamp: string }>;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);

  const openReportModal = (
    motorName: string,
    motorIndex: number,
    monthLabel: string,
    reportIds: string[],
    reportData: Record<string, { date: string; technician: string; assessment: string; data: any; task: any; timestamp: string }>
  ) => {
    setReportModal({ motorName, motorIndex, monthLabel, reportIds, reportData });
  };

  const machineHealth = motors.reduce((acc, motor) => {
    const h = calculateMotorHealth(motor);
    if (h.status === HealthStatus.CRITICAL) return HealthStatus.CRITICAL;
    if (h.status === HealthStatus.CAUTION && acc !== HealthStatus.CRITICAL) return HealthStatus.CAUTION;
    return acc;
  }, HealthStatus.HEALTHY);

  const overallIndicator = motors.reduce(
    (acc, motor) => {
      const h = calculateMotorHealth(motor);
      if (h.hasE) acc.hasE = true;
      if (h.hasM) acc.hasM = true;
      return acc;
    },
    { hasE: false, hasM: false }
  );

  return (
    <div className="space-y-6">
      <div className="card p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Matrise Dön
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{machineId}. Boru Makinası</h3>
            <p className="text-xs text-gray-500">{moduleType}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('prev')}
            className="btn btn-secondary inline-flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Önceki
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="btn btn-secondary inline-flex items-center"
          >
            Sonraki
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
          <span className={`badge ${getBadgeClass(machineHealth)}`}>
            {getStatusText(machineHealth)}
          </span>
          {overallIndicator.hasE && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              E
            </span>
          )}
          {overallIndicator.hasM && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              M
            </span>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700">Motor Envanteri</h4>
          <span className="text-xs text-gray-500">Toplam: {motors.length} Ünite</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Ünite</th>
                <th className="px-4 py-3 text-left font-semibold">Durum</th>
                {moduleType === ModuleType.DC_MOTOR && (
                  <th className="px-4 py-3 text-left font-semibold">Aylık Raporlar</th>
                )}
                <th className="px-4 py-3 text-right font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {motors.map((motor, idx) => {
                const health = calculateMotorHealth(motor);
                const reportStore = motor.monthlyReports || {};
                const reportData = motor.dcMotorReports || {};
                const reportList = monthLabels.flatMap((label) => reportStore[label] || []);
                const lastReports = reportList.slice(-3);
                return (
                  <tr key={`${machineId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <input
                        type="text"
                        value={motor.name || `Motor Ünitesi ${idx + 1}`}
                        onChange={(e) => onUpdateMotorName(idx, e.target.value)}
                        className="w-full max-w-xs rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getBadgeClass(health.status)}`}>
                        {getStatusText(health.status)}
                      </span>
                      {moduleType === ModuleType.DC_MOTOR && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lastReports.length > 0 ? `Rapor: ${lastReports.join(', ')}` : 'Rapor: -'}
                        </div>
                      )}
                    </td>
                    {moduleType === ModuleType.DC_MOTOR && (
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-6 gap-1 min-w-[360px]">
                          {monthLabels.map((label) => {
                            const reports = reportStore[label] || [];
                            const lastReport = reports[reports.length - 1];
                            const extraCount = reports.length > 1 ? ` +${reports.length - 1}` : '';
                            return (
                              <button
                                key={`${motor.id}-${label}`}
                                onClick={() => {
                                  if (reports.length === 0) return;
                                  openReportModal(
                                    motor.name || `Motor Ünitesi ${idx + 1}`,
                                    idx,
                                    label,
                                    reports,
                                    reportData
                                  );
                                }}
                                className={`relative rounded border px-1.5 py-1 text-[10px] leading-tight text-left ${
                                  reports.length > 0
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-400'
                                }`}
                                disabled={reports.length === 0}
                              >
                                {reports.length > 0 && (
                                  <span className="absolute left-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-semibold leading-none text-white">
                                    {reports.length}
                                  </span>
                                )}
                                <div className="font-semibold text-[9px] text-gray-500">{label}</div>
                                <div className="truncate">{lastReport ? `${lastReport}${extraCount}` : '-'}</div>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelectMotor(idx)}
                        className="btn btn-secondary text-xs"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportModal(null)} />
          <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">DC Motor Bakım Rapor Özeti</h3>
                <p className="text-sm text-gray-500">{reportModal.motorName} - {reportModal.monthLabel}</p>
              </div>
              <button onClick={() => setReportModal(null)} className="btn btn-secondary text-xs">
                Kapat
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Rapor No</th>
                    <th className="px-3 py-2 text-left font-semibold">Tarih</th>
                    <th className="px-3 py-2 text-left font-semibold">Teknisyen</th>
                    <th className="px-3 py-2 text-left font-semibold">Sonuç</th>
                    <th className="px-3 py-2 text-right font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportModal.reportIds.map((reportId) => {
                    const report = reportModal.reportData[reportId];
                    return (
                      <tr key={reportId}>
                        <td className="px-3 py-2 font-mono text-xs">{reportId}</td>
                        <td className="px-3 py-2">{report?.date || '-'}</td>
                        <td className="px-3 py-2">{report?.technician || '-'}</td>
                        <td className="px-3 py-2">{report?.assessment || '-'}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              if (!report?.data || !report?.task) return;
                              setReportModal(null);
                              setSelectedReport({
                                id: reportId,
                                data: report.data,
                                task: report.task,
                                timestamp: report.timestamp
                              });
                            }}
                          >
                            Raporu Aç
                          </button>
                          <button
                            className="ml-3 text-xs text-red-600 hover:text-red-700"
                            onClick={() => {
                              onDeleteReport(reportModal.motorIndex, reportId, reportModal.monthLabel);
                              setReportModal(null);
                            }}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-100">
          <ReportDetail
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MachineDetail;
