import React from 'react';
import { CompletedReport } from '../types';
import { ArrowLeft, Printer, ClipboardList, AlertTriangle } from 'lucide-react';

interface ReportDetailProps {
  report: CompletedReport;
  onBack: () => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
  if (!report || !report.data || !report.task) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Rapor verisi yüklenemedi.</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-200 rounded">
          Geri Dön
        </button>
      </div>
    );
  }

  const { data, task } = report;

  const StatusBadge = ({ isOk, text }: { isOk: boolean; text?: string }) => (
    <span
      className={`px-2 py-0.5 text-xs font-bold rounded border ${
        isOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      {text || (isOk ? 'UYGUN' : 'UYGUN DEĞİL')}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Listeye Dön
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
        >
          <Printer className="w-4 h-4" />
          Yazdır / PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:max-w-full">
        <div className="bg-gray-800 text-white p-8 border-b-4 border-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide">DC Motor Bakım Kontrol Raporu</h1>
              <p className="text-gray-300 mt-1 text-sm">Rapor No: {report.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">Tarih</p>
              <p className="font-mono font-bold text-lg">{data.general.maintenanceDate}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
              Genel Bilgiler & Ekipman
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-gray-500 text-xs">Ekipman Adı</span>
                <span className="font-semibold text-gray-900">{task.equipmentName}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Tag No</span>
                <span className="font-semibold text-gray-900">{task.specs.tagNo}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Marka / Model</span>
                <span className="font-semibold text-gray-900">{task.specs.brandModel}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Güç / Devir</span>
                <span className="font-semibold text-gray-900">
                  {task.specs.powerKW} kW / {task.specs.rpm} rpm
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Bakım Tipi</span>
                <span className="font-semibold text-gray-900">{data.general.maintenanceType}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Teknisyen</span>
                <span className="font-semibold text-gray-900">{data.general.technician}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
              Fırçalar ve Komütatör
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded p-4 border border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">Fırça Uzunluğu</td>
                      <td className="py-2 font-mono text-right">{data.brushes.brushLength} mm</td>
                      <td className="py-2 pl-4 text-right">
                        <StatusBadge isOk={data.brushes.brushLength >= 15} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Yüzey Teması</td>
                      <td className="py-2 font-medium text-right">{data.brushes.surfaceContact}</td>
                      <td className="py-2 pl-4 text-right">
                        <StatusBadge isOk={data.brushes.surfaceContact === '>70%'} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 rounded p-4 border border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">Kıvılcımlanma</td>
                      <td className="py-2 font-medium text-right">{data.brushes.sparking}</td>
                      <td className="py-2 pl-4 text-right">
                        <StatusBadge isOk={data.brushes.sparking !== 'Şiddetli'} />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">Komütatör Yüzeyi</td>
                      <td className="py-2 font-medium text-right">{data.brushes.commutatorSurface}</td>
                      <td className="py-2 pl-4 text-right">
                        <StatusBadge isOk={data.brushes.commutatorSurface === 'Parlak'} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                Elektriksel Ölçümler
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs text-left">
                  <tr>
                    <th className="py-2 px-2 font-medium">Parametre</th>
                    <th className="py-2 px-2 font-medium text-right">Değer</th>
                    <th className="py-2 px-2 font-medium text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Armatür Direnci</td>
                    <td className="py-2 px-2 text-right font-mono">{data.electrical.armatureResistance} Ω</td>
                    <td className="py-2 px-2 text-right text-gray-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Yalıtım (Armatür)</td>
                    <td className="py-2 px-2 text-right font-mono">{data.electrical.insulationArmature} MΩ</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.electrical.insulationArmature > 1} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Yalıtım (Alan)</td>
                    <td className="py-2 px-2 text-right font-mono">{data.electrical.insulationField} MΩ</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.electrical.insulationField > 1} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Yüksüz Akım</td>
                    <td className="py-2 px-2 text-right font-mono">{data.electrical.loadCurrentNoLoad} A</td>
                    <td className="py-2 px-2 text-right text-gray-400">-</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                Mekanik Ölçümler
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs text-left">
                  <tr>
                    <th className="py-2 px-2 font-medium">Parametre</th>
                    <th className="py-2 px-2 font-medium text-right">Değer</th>
                    <th className="py-2 px-2 font-medium text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Ön Rulman Sıcaklık</td>
                    <td className="py-2 px-2 text-right font-mono">{data.mechanical.bearingTempFront} °C</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.mechanical.bearingTempFront < 80} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Arka Rulman Sıcaklık</td>
                    <td className="py-2 px-2 text-right font-mono">{data.mechanical.bearingTempRear} °C</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.mechanical.bearingTempRear < 80} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Ön Titreşim</td>
                    <td className="py-2 px-2 text-right font-mono">{data.mechanical.vibrationFront} mm/s</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.mechanical.vibrationFront < 4.5} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-700">Mil Salgısı</td>
                    <td className="py-2 px-2 text-right font-mono">{data.mechanical.shaftRunout} mm</td>
                    <td className="py-2 px-2 text-right">
                      <StatusBadge isOk={data.mechanical.shaftRunout < 0.05} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
              Görsel Kontroller & Yağlama
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Terminal Kutusu', val: data.visual.terminalBox },
                { label: 'Kablo Bağlantıları', val: data.visual.cables },
                { label: 'Gövde Temizliği', val: data.visual.cleanliness },
                { label: 'Topraklama', val: data.visual.grounding },
                { label: 'Korozyon/Pas', val: data.visual.corrosion, text: data.visual.corrosion ? 'YOK' : 'VAR' },
                { label: 'Ön Rulman Gres', val: data.lubrication.frontGrease, text: data.lubrication.frontGrease ? 'YAPILDI' : '-' },
                { label: 'Arka Rulman Gres', val: data.lubrication.rearGrease, text: data.lubrication.rearGrease ? 'YAPILDI' : '-' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded bg-gray-50/50">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <StatusBadge isOk={item.val} text={item.text} />
                </div>
              ))}
            </div>
            {data.lubrication.materialUsed && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-semibold">Kullanılan Malzeme:</span> {data.lubrication.materialUsed}
              </div>
            )}
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 print:border-gray-300 print:bg-white">
            <h2 className="flex items-center gap-2 text-lg font-bold text-blue-900 mb-4 print:text-black">
              <ClipboardList className="w-5 h-5" />
              Bakım Sonucu: <span className="uppercase underline">{data.result.overallAssessment}</span>
            </h2>

            <div className="space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Tespit Edilen Arızalar</h3>
                  <p className="p-3 bg-white border border-gray-200 rounded-lg min-h-[60px]">
                    {data.result.faultsDetected || 'Arıza tespit edilmedi.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Yapılan İşlemler</h3>
                  <p className="p-3 bg-white border border-gray-200 rounded-lg min-h-[60px]">
                    {data.result.actionsTaken || 'Rutin kontroller yapıldı.'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sonraki Bakım Önerileri</h3>
                <p className="p-3 bg-white border border-gray-200 rounded-lg">
                  {data.result.recommendations || '-'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-blue-200 flex flex-col md:flex-row justify-between gap-12 print:border-gray-400">
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-gray-500 mb-8">Bakım Teknisyeni</p>
                <div className="border-b border-gray-400 border-dashed pb-2">
                  <span className="font-semibold">{data.general.technician}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-gray-500 mb-8">Bakım Sorumlusu / Onay</p>
                <div className="border-b border-gray-400 border-dashed pb-2">
                  <span className="text-gray-400 italic">İmza</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
