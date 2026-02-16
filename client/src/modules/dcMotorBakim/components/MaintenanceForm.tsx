
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Check, Thermometer, Zap, Settings, Eye, Droplet, FileText, Wrench } from 'lucide-react';
import { MaintenanceTask, ChecklistData, MotorSpecs } from '../types';
import { EMPTY_FORM_DATA } from '../constants';

interface MaintenanceFormProps {
  task: MaintenanceTask;
  onBack: () => void;
  onSave: (data: ChecklistData) => void;
  onUpdateSpecs?: (specs: MotorSpecs) => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ task, onBack, onSave, onUpdateSpecs }) => {
  const [formData, setFormData] = useState<ChecklistData>(EMPTY_FORM_DATA);
  const [specsDraft, setSpecsDraft] = useState<MotorSpecs>(task.specs);
  const [activeTab, setActiveTab] = useState<'info' | 'brushes' | 'electrical' | 'mechanical' | 'visual' | 'lubrication' | 'result'>('info');

  useEffect(() => {
    setFormData({
      ...EMPTY_FORM_DATA,
      general: {
        ...EMPTY_FORM_DATA.general,
        maintenanceDate: new Date().toISOString().split('T')[0]
      }
    });
    setSpecsDraft(task.specs);
  }, [task.id, task.specs]);

  const updateSpecs = (field: keyof MotorSpecs, value: MotorSpecs[keyof MotorSpecs]) => {
    const nextSpecs = { ...specsDraft, [field]: value };
    setSpecsDraft(nextSpecs);
    if (onUpdateSpecs) {
      onUpdateSpecs(nextSpecs);
    }
  };

  const updateField = (section: keyof ChecklistData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const checkLimit = (val: number, limit: number, type: 'min' | 'max') => {
    if (!val) return 'border-gray-300';
    if (type === 'max' && val > limit) return 'border-red-500 bg-red-50 text-red-900';
    if (type === 'min' && val < limit) return 'border-red-500 bg-red-50 text-red-900';
    return 'border-green-500 bg-green-50';
  };

  const tabs = [
    { id: 'info', label: 'Genel', icon: FileText },
    { id: 'brushes', label: 'Fırçalar', icon: Wrench },
    { id: 'electrical', label: 'Elektriksel', icon: Zap },
    { id: 'mechanical', label: 'Mekanik', icon: Settings },
    { id: 'visual', label: 'Görsel', icon: Eye },
    { id: 'lubrication', label: 'Yağlama', icon: Droplet },
    { id: 'result', label: 'Sonuç', icon: Check }
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{task.equipmentName}</h1>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                {specsDraft.tagNo}
              </span>
            </div>
            <p className="text-sm text-gray-500">{task.taskName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Taslak Kaydet
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Tamamla
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
          <div className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-none px-4 py-2 text-sm font-medium rounded-full border whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Ekipman Künyesi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Tag No</label>
                      <input
                        type="text"
                        value={specsDraft.tagNo}
                        onChange={(e) => updateSpecs('tagNo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Lokasyon</label>
                      <input
                        type="text"
                        value={specsDraft.location}
                        onChange={(e) => updateSpecs('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Marka/Model</label>
                      <input
                        type="text"
                        value={specsDraft.brandModel}
                        onChange={(e) => updateSpecs('brandModel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Güç (kW)</label>
                      <input
                        type="number"
                        value={specsDraft.powerKW === 0 ? '' : specsDraft.powerKW}
                        onChange={(e) =>
                          updateSpecs('powerKW', e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Nominal Gerilim (V)</label>
                      <input
                        type="number"
                        value={specsDraft.voltageV === 0 ? '' : specsDraft.voltageV}
                        onChange={(e) =>
                          updateSpecs('voltageV', e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Nominal Akım (A)</label>
                      <input
                        type="number"
                        value={specsDraft.currentA === 0 ? '' : specsDraft.currentA}
                        onChange={(e) =>
                          updateSpecs('currentA', e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Devir (RPM)</label>
                      <input
                        type="number"
                        value={specsDraft.rpm === 0 ? '' : specsDraft.rpm}
                        onChange={(e) =>
                          updateSpecs('rpm', e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Devreye Alma</label>
                      <input
                        type="date"
                        value={specsDraft.commissionDate}
                        onChange={(e) => updateSpecs('commissionDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Bakım Detayları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bakım Tarihi</label>
                      <input
                        type="date"
                        value={formData.general.maintenanceDate}
                        onChange={(e) => updateField('general', 'maintenanceDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bakım Tipi</label>
                      <select
                        value={formData.general.maintenanceType}
                        onChange={(e) => updateField('general', 'maintenanceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>Rutin</option>
                        <option>Periyodik</option>
                        <option>Arıza Sonrası</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teknisyen</label>
                      <input
                        type="text"
                        value={formData.general.technician}
                        onChange={(e) => updateField('general', 'technician', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'brushes' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Fırçalar ve Komütatör</h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Fırça Uzunluğu</span>
                        <span className="text-gray-500 text-xs">Min: 15mm</span>
                      </label>
                      <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${checkLimit(formData.brushes.brushLength, 15, 'min')}`}
                            value={formData.brushes.brushLength || ''}
                            onChange={(e) => updateField('brushes', 'brushLength', parseFloat(e.target.value))}
                            placeholder="Ölçülen"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-400 text-sm">mm</span>
                        </div>
                        <div className="flex-none">
                          {formData.brushes.brushLength && formData.brushes.brushLength < 15 ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">DEĞİŞMELİ</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">UYGUN</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {[
                      { label: 'Fırça Yüzey Teması', field: 'surfaceContact', options: ['>70%', '<70%'], warn: '<70%' },
                      { label: 'Fırça Basınç Ayarı', field: 'pressure', options: ['Uygun', 'Ayarlandı'] },
                      { label: 'Kıvılcımlanma', field: 'sparking', options: ['Yok', 'Hafif', 'Şiddetli'], warn: 'Şiddetli' },
                      { label: 'Komütatör Yüzeyi', field: 'commutatorSurface', options: ['Parlak', 'Mat', 'Yanık iz'], warn: 'Yanık iz' },
                      { label: 'Segment Arası', field: 'segmentGap', options: ['Temiz', 'Kir/karbon var'], warn: 'Kir/karbon var' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-center">
                        <span className="text-sm font-semibold text-gray-700 mb-3 text-center">{item.label}</span>
                        <div className="flex gap-2 w-full">
                          {item.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateField('brushes', item.field, opt)}
                              className={`flex-1 px-2 py-2.5 text-sm font-medium rounded-md border shadow-sm transition-all text-center
                                ${
                                  formData.brushes[item.field as keyof typeof formData.brushes] === opt
                                    ? item.warn === opt
                                      ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-200'
                                      : 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'electrical' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Elektriksel Ölçümler</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Direnç Testleri</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Armatür Direnci</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.electrical.armatureResistance || ''}
                          onChange={(e) => updateField('electrical', 'armatureResistance', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">Ω</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alan Sargı Direnci</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.electrical.fieldResistance || ''}
                          onChange={(e) => updateField('electrical', 'fieldResistance', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">Ω</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Yalıtım (Megger) Testi</h4>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Armatür - Gövde</span>
                        <span className="text-xs text-gray-400">Limit: {'>'}1 MΩ</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.electrical.insulationArmature || ''}
                          onChange={(e) => updateField('electrical', 'insulationArmature', parseFloat(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg ${checkLimit(formData.electrical.insulationArmature, 1, 'min')}`}
                        />
                        <span className="absolute right-3 top-2 text-gray-500">MΩ</span>
                      </div>
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Alan - Gövde</span>
                        <span className="text-xs text-gray-400">Limit: {'>'}1 MΩ</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.electrical.insulationField || ''}
                          onChange={(e) => updateField('electrical', 'insulationField', parseFloat(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg ${checkLimit(formData.electrical.insulationField, 1, 'min')}`}
                        />
                        <span className="absolute right-3 top-2 text-gray-500">MΩ</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Çalışma Değerleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Akım (Yüksüz)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.electrical.loadCurrentNoLoad || ''}
                            onChange={(e) => updateField('electrical', 'loadCurrentNoLoad', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <span className="absolute right-3 top-2 text-gray-500">A</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Akım (Yüklü)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.electrical.loadCurrentLoad || ''}
                            onChange={(e) => updateField('electrical', 'loadCurrentLoad', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <span className="absolute right-3 top-2 text-gray-500">A</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Uyarma Akımı</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.electrical.excitationCurrent || ''}
                            onChange={(e) => updateField('electrical', 'excitationCurrent', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <span className="absolute right-3 top-2 text-gray-500">A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'mechanical' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Mekanik Kontroller</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-4 text-orange-800">
                      <Thermometer className="w-5 h-5" />
                      <h4 className="font-semibold">Sıcaklık Kontrolü</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Ön Rulman</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.bearingTempFront, 80, 'max')}`}
                            value={formData.mechanical.bearingTempFront || ''}
                            onChange={(e) => updateField('mechanical', 'bearingTempFront', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">°C</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Arka Rulman</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.bearingTempRear, 80, 'max')}`}
                            value={formData.mechanical.bearingTempRear || ''}
                            onChange={(e) => updateField('mechanical', 'bearingTempRear', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">°C</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Gövde</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.bodyTemp, 90, 'max')}`}
                            value={formData.mechanical.bodyTemp || ''}
                            onChange={(e) => updateField('mechanical', 'bodyTemp', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">°C</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-800">
                      <Activity className="w-5 h-5" />
                      <h4 className="font-semibold">Titreşim & Salgı</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Ön Rulman Vib.</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.vibrationFront, 4.5, 'max')}`}
                            value={formData.mechanical.vibrationFront || ''}
                            onChange={(e) => updateField('mechanical', 'vibrationFront', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">mm/s</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Arka Rulman Vib.</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.vibrationRear, 4.5, 'max')}`}
                            value={formData.mechanical.vibrationRear || ''}
                            onChange={(e) => updateField('mechanical', 'vibrationRear', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">mm/s</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Mil Salgısı</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-24 px-2 py-1 text-right border rounded ${checkLimit(formData.mechanical.shaftRunout, 0.05, 'max')}`}
                            value={formData.mechanical.shaftRunout || ''}
                            onChange={(e) => updateField('mechanical', 'shaftRunout', parseFloat(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Rulman Sesi', 'Kaplin Durumu', 'Fan Durumu'].map((label, idx) => {
                      const fieldMap = ['bearingSound', 'couplingStatus', 'fanStatus'] as const;
                      const field = fieldMap[idx];
                      const val = formData.mechanical[field];
                      const isOk = val === 'Normal' || val === 'Uygun';

                      return (
                        <div key={label} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <button
                            onClick={() =>
                              updateField(
                                'mechanical',
                                field,
                                isOk ? (idx === 0 ? 'Anormal' : 'Hasarlı') : idx === 0 ? 'Normal' : 'Uygun'
                              )
                            }
                            className={`px-3 py-1 rounded text-sm font-medium ${isOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {val}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'visual' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Görsel Kontroller</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'terminalBox', label: 'Terminal Kutusu', ok: 'Sağlam', bad: 'Hasarlı' },
                    { id: 'cables', label: 'Kablo Bağlantıları', ok: 'Sıkı', bad: 'Gevşek' },
                    { id: 'covers', label: 'Koruma Kapakları', ok: 'Tam', bad: 'Eksik' },
                    { id: 'cleanliness', label: 'Gövde Temizliği', ok: 'Temiz', bad: 'Kirli' },
                    { id: 'vents', label: 'Havalandırma', ok: 'Açık', bad: 'Tıkalı' },
                    { id: 'grounding', label: 'Topraklama', ok: 'Sağlam', bad: 'Hasarlı' },
                    { id: 'corrosion', label: 'Korozyon/Pas', ok: 'Yok', bad: 'Var' }
                  ].map((item) => {
                    const value = formData.visual[item.id as keyof typeof formData.visual];
                    return (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-center">
                        <span className="text-sm font-semibold text-gray-700 mb-3 text-center">{item.label}</span>
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => updateField('visual', item.id as string, true)}
                            className={`flex-1 px-2 py-2.5 text-sm font-medium rounded-md border shadow-sm transition-all text-center
                              ${
                                value === true
                                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                              }`}
                          >
                            {item.ok}
                          </button>
                          <button
                            onClick={() => updateField('visual', item.id as string, false)}
                            className={`flex-1 px-2 py-2.5 text-sm font-medium rounded-md border shadow-sm transition-all text-center
                              ${
                                value === false
                                  ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-200'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                              }`}
                          >
                            {item.bad}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === 'lubrication' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Yağlama İşlemleri</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="frontGrease"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.lubrication.frontGrease}
                      onChange={(e) => updateField('lubrication', 'frontGrease', e.target.checked)}
                    />
                    <label htmlFor="frontGrease" className="text-gray-700 font-medium">
                      Ön rulman greslemesi yapıldı
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="rearGrease"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.lubrication.rearGrease}
                      onChange={(e) => updateField('lubrication', 'rearGrease', e.target.checked)}
                    />
                    <label htmlFor="rearGrease" className="text-gray-700 font-medium">
                      Arka rulman greslemesi yapıldı
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="oldDrain"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.lubrication.oldGreaseDrain}
                      onChange={(e) => updateField('lubrication', 'oldGreaseDrain', e.target.checked)}
                    />
                    <label htmlFor="oldDrain" className="text-gray-700 font-medium">
                      Eski gres tahliyesi yapıldı
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kullanılan Yağ/Gres Malzemesi</label>
                    <input
                      type="text"
                      placeholder="Örn: Mobil Polyrex EM"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={formData.lubrication.materialUsed}
                      onChange={(e) => updateField('lubrication', 'materialUsed', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'result' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300 mb-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Bakım Sonucu ve Onay</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genel Değerlendirme</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                      value={formData.result.overallAssessment}
                      onChange={(e) => updateField('result', 'overallAssessment', e.target.value)}
                    >
                      <option>Çalışmaya uygun</option>
                      <option>İzleme altında çalışabilir</option>
                      <option>Planlı onarım gerekli</option>
                      <option>Acil müdahale gerekli</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tespit Edilen Arızalar</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Bulguları yazın..."
                        value={formData.result.faultsDetected}
                        onChange={(e) => updateField('result', 'faultsDetected', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Yapılan İşlemler</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Uygulanan işlemleri yazın..."
                        value={formData.result.actionsTaken}
                        onChange={(e) => updateField('result', 'actionsTaken', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sonraki Bakım Önerileri</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={formData.result.recommendations}
                      onChange={(e) => updateField('result', 'recommendations', e.target.value)}
                    />
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Onaylar</h4>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase">Bakım Teknisyeni</span>
                        <p className="font-medium text-gray-900 mt-1">{formData.general.technician}</p>
                        <div className="mt-4 border-t border-gray-300 pt-2 flex justify-between text-sm text-gray-500">
                          <span>İmza: ________________</span>
                          <span>Tarih: {formData.general.maintenanceDate}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase">Bakım Sorumlusu</span>
                        <p className="font-medium text-gray-900 mt-1">Onay Bekleniyor</p>
                        <div className="mt-4 border-t border-gray-300 pt-2 flex justify-between text-sm text-gray-500">
                          <span>İmza: ________________</span>
                          <span>Tarih: __/__/____</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function Activity(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

