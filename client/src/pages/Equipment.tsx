import { type FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Eye,
  Download,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  FolderOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { isBerkeUser } from '../utils/access';

type Department = 'MEKANIK' | 'ELEKTRIK' | 'YARDIMCI_TESISLER';
type FormType = 'DEMIRBAS_FORMU' | 'BILGI_FORMU';
type ApprovalStatus = 'BEKLIYOR' | 'KABUL' | 'RED';
type DecisionStatus = 'KABUL' | 'RED';
type PackageId = `${Department}__${FormType}`;

interface StoredFormPackage {
  id: PackageId;
  department: Department;
  formType: FormType;
  approvalStatus: ApprovalStatus;
  formNumber: string;
  pypNo: string;
  formName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedByName: string;
  uploadedBySicilNo: string;
  dataUrl: string;
}

const departments: Array<{ id: Department; label: string }> = [
  { id: 'MEKANIK', label: 'Mekanik' },
  { id: 'ELEKTRIK', label: 'Elektrik' },
  { id: 'YARDIMCI_TESISLER', label: 'Yardimci Tesisler' }
];

const forms: Array<{ id: FormType; label: string }> = [
  { id: 'DEMIRBAS_FORMU', label: 'Demirbas Formu' },
  { id: 'BILGI_FORMU', label: 'Bilgi Formu' }
];

const DB_NAME = 'cmms-form-packages';
const DB_VERSION = 2;
const STORE_NAME = 'formPackagesByDepartment';

function makePackageId(department: Department, formType: FormType): PackageId {
  return `${department}__${formType}` as PackageId;
}

const allPackageIds: PackageId[] = departments.flatMap((department) =>
  forms.map((form) => makePackageId(department.id, form.id))
);

type PackageState = Record<PackageId, StoredFormPackage | null>;

const initialPackageState: PackageState = allPackageIds.reduce((acc, id) => {
  acc[id] = null;
  return acc;
}, {} as PackageState);

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizeStoredPackage(raw: unknown): StoredFormPackage | null {
  if (!raw || typeof raw !== 'object') return null;

  const value = raw as Partial<StoredFormPackage>;
  if (!value.id || !value.department || !value.formType || !value.fileName || !value.dataUrl) {
    return null;
  }

  return {
    id: value.id,
    department: value.department,
    formType: value.formType,
    approvalStatus: value.approvalStatus === 'RED'
      ? 'RED'
      : (value.approvalStatus === 'KABUL' ? 'KABUL' : 'BEKLIYOR'),
    formNumber: value.formNumber || '-',
    pypNo: value.pypNo || '',
    formName: value.formName || value.fileName,
    fileName: value.fileName,
    mimeType: value.mimeType || '',
    size: value.size || 0,
    uploadedAt: value.uploadedAt || new Date().toISOString(),
    uploadedByName: value.uploadedByName || '-',
    uploadedBySicilNo: value.uploadedBySicilNo || '-',
    dataUrl: value.dataUrl
  };
}

async function getStoredPackage(id: PackageId): Promise<StoredFormPackage | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(normalizeStoredPackage(request.result));
    };

    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function saveStoredPackage(value: StoredFormPackage): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function removeStoredPackage(id: PackageId): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function triggerDownload(filePackage: StoredFormPackage) {
  const link = document.createElement('a');
  link.href = filePackage.dataUrl;
  link.download = filePackage.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getDepartmentLabel(department: Department): string {
  return departments.find((item) => item.id === department)?.label || department;
}

function normalizeIdentity(value: string | null | undefined): string {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

export default function EquipmentPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canDelete = isBerkeUser(currentUser);
  const currentUserSicilNo = normalizeIdentity(currentUser?.sicilNo);
  const currentUserFullName = normalizeIdentity(`${currentUser?.ad || ''} ${currentUser?.soyad || ''}`);

  const [packages, setPackages] = useState<PackageState>(initialPackageState);
  const [isLoading, setIsLoading] = useState(true);

  const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('MEKANIK');
  const [formNumber, setFormNumber] = useState('');
  const [rowPypNoInput, setRowPypNoInput] = useState('');
  const [formName, setFormName] = useState('');
  const [demirbasFile, setDemirbasFile] = useState<File | null>(null);
  const [bilgiFile, setBilgiFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDecisionSaving, setIsDecisionSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPackages = async () => {
      try {
        const values = await Promise.all(allPackageIds.map((id) => getStoredPackage(id)));

        if (!cancelled) {
          const nextState: PackageState = { ...initialPackageState };
          allPackageIds.forEach((id, index) => {
            nextState[id] = values[index];
          });
          setPackages(nextState);
        }
      } catch {
        if (!cancelled) {
          toast.error('Paketler okunamadi');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPackages();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetUploadModal = () => {
    setSelectedDepartment(activeDepartment || 'MEKANIK');
    setFormNumber('');
    setFormName('');
    setDemirbasFile(null);
    setBilgiFile(null);
  };

  const openUploadModal = () => {
    setSelectedDepartment(activeDepartment || 'MEKANIK');
    setIsUploadModalOpen(true);
  };

  const upsertPackage = async (
    department: Department,
    formType: FormType,
    file: File,
    number: string,
    name: string
  ) => {
    const packageId = makePackageId(department, formType);
    const dataUrl = await readFileAsDataUrl(file);

    const fullName = `${currentUser?.ad || ''} ${currentUser?.soyad || ''}`.trim() || 'Bilinmiyor';
    const sicilNo = currentUser?.sicilNo || '-';

    const value: StoredFormPackage = {
      id: packageId,
      department,
      formType,
      approvalStatus: 'BEKLIYOR',
      formNumber: number,
      pypNo: '',
      formName: name,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedByName: fullName,
      uploadedBySicilNo: sicilNo,
      dataUrl
    };

    await saveStoredPackage(value);
    setPackages((prev) => ({ ...prev, [packageId]: value }));
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFormNumber = formNumber.trim();
    const trimmedFormName = formName.trim();

    if (!trimmedFormNumber) {
      toast.error('Form numarasi zorunludur');
      return;
    }

    if (!trimmedFormName) {
      toast.error('Form adi zorunludur');
      return;
    }

    if (!demirbasFile || !bilgiFile) {
      toast.error('Yukleme icin iki dosya da zorunludur');
      return;
    }

    setIsUploading(true);
    try {
      await Promise.all([
        upsertPackage(
          selectedDepartment,
          'DEMIRBAS_FORMU',
          demirbasFile,
          trimmedFormNumber,
          trimmedFormName
        ),
        upsertPackage(
          selectedDepartment,
          'BILGI_FORMU',
          bilgiFile,
          trimmedFormNumber,
          trimmedFormName
        )
      ]);

      toast.success('Iki dosya secilen klasore yuklendi');
      setIsUploadModalOpen(false);
      setActiveDepartment(selectedDepartment);
      resetUploadModal();
    } catch {
      toast.error('Paket yuklenemedi');
    } finally {
      setIsUploading(false);
    }
  };

  const isRowUploader = (rowItem: StoredFormPackage) => {
    const rowUploaderSicilNo = normalizeIdentity(rowItem.uploadedBySicilNo);
    if (rowUploaderSicilNo && rowUploaderSicilNo === currentUserSicilNo) {
      return true;
    }

    const rowUploaderName = normalizeIdentity(rowItem.uploadedByName);
    return Boolean(rowUploaderName && rowUploaderName === currentUserFullName);
  };

  const getDecisionPermission = (rowItem: StoredFormPackage | null) => {
    if (!rowItem || !currentUser) {
      return {
        canEdit: false,
        message: 'Karar yetkisi yok'
      };
    }

    if (canDelete) {
      return {
        canEdit: true,
        message: ''
      };
    }

    if (!isRowUploader(rowItem)) {
      return {
        canEdit: false,
        message: 'Karar yetkisi yok'
      };
    }

    if (rowItem.approvalStatus !== 'BEKLIYOR') {
      return {
        canEdit: false,
        message: 'Karar verildi, sadece Berke Karayanik mudahale edebilir'
      };
    }

    return {
      canEdit: true,
      message: ''
    };
  };

  const handleDecisionUpdate = async (department: Department, status: DecisionStatus) => {
    const demirbasId = makePackageId(department, 'DEMIRBAS_FORMU');
    const bilgiId = makePackageId(department, 'BILGI_FORMU');
    const demirbasItem = packages[demirbasId];
    const bilgiItem = packages[bilgiId];
    const rowItem = demirbasItem || bilgiItem;

    if (!rowItem) {
      toast.error('Karar verilecek satir bulunamadi');
      return;
    }

    const permission = getDecisionPermission(rowItem);
    if (!permission.canEdit) {
      toast.error(permission.message);
      return;
    }

    const trimmedPypNo = rowPypNoInput.trim();
    if (status === 'KABUL' && !trimmedPypNo) {
      toast.error('Kabul icin PYP No zorunludur');
      return;
    }

    const nextPypNo = status === 'KABUL' ? trimmedPypNo : '';
    const nextDemirbas = demirbasItem ? { ...demirbasItem, approvalStatus: status, pypNo: nextPypNo } : null;
    const nextBilgi = bilgiItem ? { ...bilgiItem, approvalStatus: status, pypNo: nextPypNo } : null;

    setIsDecisionSaving(true);
    try {
      await Promise.all([
        nextDemirbas ? saveStoredPackage(nextDemirbas) : Promise.resolve(),
        nextBilgi ? saveStoredPackage(nextBilgi) : Promise.resolve()
      ]);

      setPackages((prev) => ({
        ...prev,
        [demirbasId]: nextDemirbas,
        [bilgiId]: nextBilgi
      }));

      if (status === 'RED') {
        setRowPypNoInput('');
      }

      toast.success(status === 'KABUL' ? 'Satir KABUL olarak guncellendi' : 'Satir RED olarak guncellendi');
    } catch {
      toast.error('Karar kaydedilemedi');
    } finally {
      setIsDecisionSaving(false);
    }
  };

  const handleDelete = async (department: Department, formType: FormType) => {
    if (!canDelete) {
      toast.error('Silme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }

    const packageId = makePackageId(department, formType);

    try {
      await removeStoredPackage(packageId);
      setPackages((prev) => ({ ...prev, [packageId]: null }));
      toast.success('Paket silindi');
    } catch {
      toast.error('Paket silinemedi');
    }
  };

  const handleDeleteBoth = async (department: Department) => {
    if (!canDelete) {
      toast.error('Silme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }

    try {
      await Promise.all([
        removeStoredPackage(makePackageId(department, 'DEMIRBAS_FORMU')),
        removeStoredPackage(makePackageId(department, 'BILGI_FORMU'))
      ]);

      setPackages((prev) => ({
        ...prev,
        [makePackageId(department, 'DEMIRBAS_FORMU')]: null,
        [makePackageId(department, 'BILGI_FORMU')]: null
      }));
      toast.success('Klasordeki dosyalar silindi');
    } catch {
      toast.error('Klasor dosyalari silinemedi');
    }
  };

  const handleRead = (value: StoredFormPackage) => {
    const opened = window.open(value.dataUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      toast.error('Tarayici yeni sekme acmayi engelledi');
    }
  };

  const getRowCount = (department: Department): number => {
    const demirbasItem = packages[makePackageId(department, 'DEMIRBAS_FORMU')];
    const bilgiItem = packages[makePackageId(department, 'BILGI_FORMU')];
    return demirbasItem || bilgiItem ? 1 : 0;
  };

  const activeRow = useMemo(() => {
    if (!activeDepartment) return null;
    const demirbasItem = packages[makePackageId(activeDepartment, 'DEMIRBAS_FORMU')];
    const bilgiItem = packages[makePackageId(activeDepartment, 'BILGI_FORMU')];
    const rowItem = demirbasItem || bilgiItem;

    return {
      demirbasItem,
      bilgiItem,
      rowItem
    };
  }, [activeDepartment, packages]);

  useEffect(() => {
    if (!activeDepartment) {
      setRowPypNoInput('');
      return;
    }

    const rowItem = activeRow?.rowItem || null;
    if (rowItem?.approvalStatus === 'KABUL') {
      setRowPypNoInput(rowItem.pypNo || '');
      return;
    }

    setRowPypNoInput('');
  }, [activeDepartment, activeRow]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demirbas Form Paketleri</h1>
          <p className="text-sm text-gray-500 mt-1">
            Yeni Ekle ile klasor secin, Form No ve Form Adi girin, iki dosyayi birlikte yukleyin.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary inline-flex items-center"
          onClick={openUploadModal}
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ekle
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-sm text-gray-500">Paketler yukleniyor...</div>
      ) : activeDepartment ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="btn btn-secondary inline-flex items-center"
              onClick={() => setActiveDepartment(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Bolumlere Don
            </button>
            <span className="text-sm text-gray-600">
              Aktif Bolum: <span className="font-semibold">{getDepartmentLabel(activeDepartment)}</span>
            </span>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-500 text-white">
                    <th className="px-3 py-3 text-left font-semibold">Form No</th>
                    <th className="px-3 py-3 text-left font-semibold">Karar</th>
                    <th className="px-3 py-3 text-left font-semibold">PYP No</th>
                    <th className="px-3 py-3 text-left font-semibold">Form Adi</th>
                    <th className="px-3 py-3 text-left font-semibold">Demirbas Dosyasi</th>
                    <th className="px-3 py-3 text-left font-semibold">Bilgi Dosyasi</th>
                    <th className="px-3 py-3 text-left font-semibold">Yukleyen Kisi</th>
                    <th className="px-3 py-3 text-left font-semibold">Yuklenme</th>
                    <th className="px-3 py-3 text-center font-semibold">Islem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const demirbasItem = activeRow?.demirbasItem || null;
                    const bilgiItem = activeRow?.bilgiItem || null;
                    const rowItem = activeRow?.rowItem || null;

                    return (
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono">{rowItem?.formNumber || '-'}</td>
                        <td className="px-3 py-2">
                          {rowItem ? (
                            rowItem.approvalStatus === 'KABUL'
                              ? (
                                <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">KABUL</span>
                              )
                              : rowItem.approvalStatus === 'RED'
                                ? (
                                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">RED</span>
                                )
                                : (
                                  <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">BEKLIYOR</span>
                                )
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {rowItem
                            ? (rowItem.approvalStatus === 'RED'
                              ? 'RED'
                              : (rowItem.approvalStatus === 'KABUL' ? (rowItem.pypNo || '-') : '-'))
                            : '-'}
                        </td>
                        <td className="px-3 py-2">{rowItem?.formName || '-'}</td>
                        <td className="px-3 py-2">
                          {demirbasItem ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="text-primary-700 underline underline-offset-2"
                                onClick={() => handleRead(demirbasItem)}
                              >
                                {demirbasItem.fileName}
                              </button>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Oku"
                                onClick={() => handleRead(demirbasItem)}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="text-emerald-600 hover:text-emerald-800 p-1"
                                title="Indir"
                                onClick={() => triggerDownload(demirbasItem)}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Sil"
                                  onClick={() => void handleDelete(activeDepartment, 'DEMIRBAS_FORMU')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Yuklenmedi</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {bilgiItem ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="text-primary-700 underline underline-offset-2"
                                onClick={() => handleRead(bilgiItem)}
                              >
                                {bilgiItem.fileName}
                              </button>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Oku"
                                onClick={() => handleRead(bilgiItem)}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="text-emerald-600 hover:text-emerald-800 p-1"
                                title="Indir"
                                onClick={() => triggerDownload(bilgiItem)}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Sil"
                                  onClick={() => void handleDelete(activeDepartment, 'BILGI_FORMU')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Yuklenmedi</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          {rowItem
                            ? `${rowItem.uploadedByName} (${rowItem.uploadedBySicilNo})`
                            : '-'}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {rowItem ? new Date(rowItem.uploadedAt).toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {rowItem ? (
                            <div className="flex flex-col items-center gap-2">
                              {(() => {
                                const permission = getDecisionPermission(rowItem);
                                return permission.canEdit ? (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                    onClick={() => void handleDecisionUpdate(activeDepartment, 'RED')}
                                    disabled={isDecisionSaving}
                                  >
                                    RED
                                  </button>
                                  <input
                                    type="text"
                                    className="input !h-8 !w-28 text-xs"
                                    placeholder="PYP No"
                                    value={rowPypNoInput}
                                    onChange={(event) => setRowPypNoInput(event.target.value)}
                                    disabled={isDecisionSaving}
                                  />
                                  <button
                                    type="button"
                                    className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                                    onClick={() => void handleDecisionUpdate(activeDepartment, 'KABUL')}
                                    disabled={isDecisionSaving || !rowPypNoInput.trim()}
                                  >
                                    KABUL
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">{permission.message}</span>
                              );
                              })()}

                              {canDelete && (
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Tumunu Sil"
                                  onClick={() => void handleDeleteBoth(activeDepartment)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((department) => {
            const rowCount = getRowCount(department.id);

            return (
              <button
                key={department.id}
                type="button"
                className="card p-5 text-left hover:shadow-md transition-shadow"
                onClick={() => setActiveDepartment(department.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-900 flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2 text-primary-600" />
                    {department.label}
                  </span>
                  <span className="text-xs text-gray-500">{rowCount}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Bu bolumun form listesini ac
                </p>
              </button>
            );
          })}
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => {
              setIsUploadModalOpen(false);
              resetUploadModal();
            }} />

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Paket Ekle</h3>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    resetUploadModal();
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="label">Klasor</label>
                  <select
                    className="input"
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value as Department)}
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Form Numarasi</label>
                    <input
                      type="text"
                      className="input"
                      value={formNumber}
                      onChange={(event) => setFormNumber(event.target.value)}
                      placeholder="ORN: FRM-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Form Adi</label>
                    <input
                      type="text"
                      className="input"
                      value={formName}
                      onChange={(event) => setFormName(event.target.value)}
                      placeholder="ORN: Mekanik Aylik Kontrol"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Demirbas Formu Paketi (Zorunlu)</label>
                    <input
                      type="file"
                      className="input"
                      onChange={(event) => setDemirbasFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Bilgi Formu Paketi (Zorunlu)</label>
                    <input
                      type="file"
                      className="input"
                      onChange={(event) => setBilgiFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Yukleyen Kisi</label>
                  <input
                    type="text"
                    className="input"
                    value={`${currentUser?.ad || ''} ${currentUser?.soyad || ''} (${currentUser?.sicilNo || '-'})`}
                    readOnly
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Yukleme sadece iki dosya birlikte secildiginde yapilir. Kabul/Red islemi satir olustuktan sonra yapilir.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      resetUploadModal();
                    }}
                    disabled={isUploading}
                  >
                    Iptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isUploading}>
                    {isUploading ? 'Yukleniyor...' : 'Yukle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
