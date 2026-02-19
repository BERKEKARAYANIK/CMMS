export default function IsSagligiGuvenligi() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">Is Sagligi ve Guvenligi</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bu bolum ISG odakli takip, kontrol ve bildirim ekranlari icin ayrilmistir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900">Risk Degerlendirme</h2>
          <p className="mt-2 text-sm text-gray-600">Bolum bazli risk kayitlari ve aksiyon plani.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900">Kaza / Olay Bildirimi</h2>
          <p className="mt-2 text-sm text-gray-600">Olay kaydi acma ve duzeltici faaliyet takibi.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900">ISG Kontrol Listeleri</h2>
          <p className="mt-2 text-sm text-gray-600">Saha denetimleri ve periyodik kontrol maddeleri.</p>
        </div>
      </div>
    </div>
  );
}
