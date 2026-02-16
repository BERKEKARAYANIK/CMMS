import React from 'react';
import { CompletedReport } from '../types';
import { Calendar, User, FileText, CheckCircle, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';

interface ReportHistoryProps {
  reports: CompletedReport[];
  onBack: () => void;
  onViewReport: (report: CompletedReport) => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({ reports, onBack, onViewReport }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 bg-white shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapor Geçmişi</h1>
          <p className="text-gray-500 mt-1">Tamamlanan bakım kayıtları ve sonuçları.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Henüz Rapor Yok</h3>
          <p className="text-gray-500">Yeni bir bakım kaydı oluşturmak için geri dönün.</p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Yeni Kayıt Oluştur
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-blue-200 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">
                      {report.task.id}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                      {report.task.specs.tagNo}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{report.task.equipmentName}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                      report.data.result.overallAssessment === 'Çalışmaya uygun'
                        ? 'bg-green-100 text-green-800'
                        : report.data.result.overallAssessment.includes('Acil')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.data.result.overallAssessment === 'Çalışmaya uygun' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {report.data.result.overallAssessment}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    Bakım Tarihi: <span className="font-medium text-gray-900">{report.data.general.maintenanceDate}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>
                    Teknisyen: <span className="font-medium text-gray-900">{report.data.general.technician || '-'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>
                    Kayıt Zamanı:{' '}
                    <span className="font-medium text-gray-900">
                      {new Date(report.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onViewReport(report)}
                  className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Rapor Detayını İncele
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
