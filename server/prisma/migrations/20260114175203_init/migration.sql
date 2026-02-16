-- CreateEnum
CREATE TYPE "IsEmriDurum" AS ENUM ('BEKLEMEDE', 'ATANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'IPTAL', 'ONAYLANDI', 'REDDEDILDI');

-- CreateEnum
CREATE TYPE "Oncelik" AS ENUM ('ACIL', 'YUKSEK', 'NORMAL', 'DUSUK');

-- CreateEnum
CREATE TYPE "PeriyotTipi" AS ENUM ('GUNLUK', 'HAFTALIK', 'AYLIK', 'UC_AYLIK', 'ALTI_AYLIK', 'YILLIK');

-- CreateEnum
CREATE TYPE "VardiyaDurum" AS ENUM ('AKTIF', 'IZINLI', 'RAPORLU', 'EGITIMDE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "sicil_no" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "ad_soyad" TEXT,
    "email" TEXT,
    "password" TEXT,
    "telefon" TEXT,
    "departman" TEXT NOT NULL,
    "unvan" TEXT,
    "uzmanlikAlani" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TEKNISYEN',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vardiyalar" (
    "id" SERIAL NOT NULL,
    "vardiya_adi" TEXT NOT NULL,
    "baslangic_saati" TEXT NOT NULL,
    "bitis_saati" TEXT NOT NULL,
    "renk" TEXT DEFAULT '#3B82F6',
    "sira" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vardiyalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mudahale_turleri" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 1,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mudahale_turleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "makinalar" (
    "id" SERIAL NOT NULL,
    "ekipmanAdi" TEXT NOT NULL,
    "ekipmanKodu" TEXT NOT NULL,
    "kategori" TEXT,
    "altKategori" TEXT,
    "marka" TEXT,
    "model" TEXT,
    "seriNo" TEXT,
    "lokasyon" TEXT,
    "kritiklikSeviyesi" TEXT NOT NULL DEFAULT 'B',
    "durum" TEXT NOT NULL DEFAULT 'AKTIF',
    "kurulumTarihi" TIMESTAMP(3),
    "garantiBitisTarihi" TIMESTAMP(3),
    "teknikOzellikler" TEXT,
    "notlar" TEXT,
    "sira" INTEGER NOT NULL DEFAULT 1,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "makinalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "is_emirleri" (
    "id" SERIAL NOT NULL,
    "is_emri_no" TEXT NOT NULL,
    "baslik" TEXT,
    "aciklama" TEXT,
    "equipmentId" INTEGER,
    "oncelik" "Oncelik" NOT NULL DEFAULT 'NORMAL',
    "talepEdenId" INTEGER,
    "atananId" INTEGER,
    "shiftId" INTEGER,
    "planlananBaslangic" TIMESTAMP(3),
    "planlananBitis" TIMESTAMP(3),
    "tahminiSure" INTEGER,
    "gercekBaslangic" TIMESTAMP(3),
    "gercekBitis" TIMESTAMP(3),
    "gerceklesenSure" INTEGER,
    "tamamlanmaNotlari" TEXT,
    "maliyetIscilik" DOUBLE PRECISION,
    "maliyetMalzeme" DOUBLE PRECISION,
    "durum" "IsEmriDurum" NOT NULL DEFAULT 'BEKLEMEDE',
    "tarih" TIMESTAMP(3),
    "baslangicSaati" TEXT,
    "bitisSaati" TEXT,
    "mudahaleSuresi" INTEGER,
    "mudahaleTuruId" INTEGER,
    "kullanilanMalzeme" TEXT,
    "onaylayanId" INTEGER,
    "onayTarihi" TIMESTAMP(3),
    "preventiveMaintenanceId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "is_emirleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "is_emri_personel" (
    "id" SERIAL NOT NULL,
    "is_emri_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "is_emri_personel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "is_emri_loglar" (
    "id" SERIAL NOT NULL,
    "work_order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "islem" TEXT NOT NULL,
    "eskiDurum" "IsEmriDurum",
    "yeniDurum" "IsEmriDurum",
    "aciklama" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "is_emri_loglar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vardiya_planlamalari" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL,
    "durum" "VardiyaDurum" NOT NULL DEFAULT 'AKTIF',
    "notlar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vardiya_planlamalari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periyodik_bakimlar" (
    "id" SERIAL NOT NULL,
    "planAdi" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "periyotTipi" "PeriyotTipi" NOT NULL,
    "periyotDegeri" INTEGER NOT NULL DEFAULT 1,
    "sonrakiTarih" TIMESTAMP(3) NOT NULL,
    "sonYapilanTarih" TIMESTAMP(3),
    "kontrolListesi" TEXT,
    "talimatlar" TEXT,
    "tahminiSure" INTEGER,
    "sorumluDepartman" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periyodik_bakimlar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_sicil_no_key" ON "users"("sicil_no");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vardiyalar_vardiya_adi_key" ON "vardiyalar"("vardiya_adi");

-- CreateIndex
CREATE UNIQUE INDEX "mudahale_turleri_ad_key" ON "mudahale_turleri"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "makinalar_ekipmanAdi_key" ON "makinalar"("ekipmanAdi");

-- CreateIndex
CREATE UNIQUE INDEX "makinalar_ekipmanKodu_key" ON "makinalar"("ekipmanKodu");

-- CreateIndex
CREATE UNIQUE INDEX "is_emirleri_is_emri_no_key" ON "is_emirleri"("is_emri_no");

-- CreateIndex
CREATE UNIQUE INDEX "is_emri_personel_is_emri_id_user_id_key" ON "is_emri_personel"("is_emri_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vardiya_planlamalari_userId_tarih_key" ON "vardiya_planlamalari"("userId", "tarih");

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "makinalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "vardiyalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_talepEdenId_fkey" FOREIGN KEY ("talepEdenId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_mudahaleTuruId_fkey" FOREIGN KEY ("mudahaleTuruId") REFERENCES "mudahale_turleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emirleri" ADD CONSTRAINT "is_emirleri_preventiveMaintenanceId_fkey" FOREIGN KEY ("preventiveMaintenanceId") REFERENCES "periyodik_bakimlar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emri_personel" ADD CONSTRAINT "is_emri_personel_is_emri_id_fkey" FOREIGN KEY ("is_emri_id") REFERENCES "is_emirleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emri_personel" ADD CONSTRAINT "is_emri_personel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emri_loglar" ADD CONSTRAINT "is_emri_loglar_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "is_emirleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_emri_loglar" ADD CONSTRAINT "is_emri_loglar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vardiya_planlamalari" ADD CONSTRAINT "vardiya_planlamalari_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vardiya_planlamalari" ADD CONSTRAINT "vardiya_planlamalari_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "vardiyalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periyodik_bakimlar" ADD CONSTRAINT "periyodik_bakimlar_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "makinalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
