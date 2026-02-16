export default function DisabledPage({ title }: { title?: string }) {
  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold text-gray-900">
        {title ? `${title} (Deaktif)` : 'Sayfa Deaktif'}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Bu sayfa şu an deaktif. İlgili modül açılınca aktif edilecek.
      </p>
    </div>
  );
}
