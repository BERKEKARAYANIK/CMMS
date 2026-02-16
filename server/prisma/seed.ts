import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { personelListesi as defaultPersonelListesi } from '../../client/src/data/lists.js';

const prisma = new PrismaClient();

function normalizeAuthText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDefaultPassword(ad: string, soyad: string): string {
  const parts = normalizeAuthText(`${ad} ${soyad}`)
    .split(' ')
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  const initials = parts.map((part) => part.charAt(0).toLowerCase()).join('');
  return `${initials || 'user'}123456`;
}

function buildDefaultEmail(sicilNo: string): string {
  const compact = normalizeAuthText(sicilNo).replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `${compact || 'user'}@cmms.local`;
}

async function upsertMakinaSeed(makina: { ekipmanAdi: string; ekipmanKodu: string; sira: number }) {
  // Prefer ekipmanKodu as the stable identity. If it doesn't exist yet, fall back to ekipmanAdi.
  // This avoids "unique constraint failed on ekipmanKodu" when eski seed verisi farklı isimle aynı kodu içeriyorsa.
  const existingByCode = await prisma.makina.findUnique({
    where: { ekipmanKodu: makina.ekipmanKodu }
  });

  if (existingByCode) {
    const data: Prisma.MakinaUpdateInput = {
      sira: makina.sira,
      aktif: true,
      durum: 'AKTIF'
    };

    // Keep the name in sync only if it won't collide with another record.
    if (existingByCode.ekipmanAdi !== makina.ekipmanAdi) {
      const existingByName = await prisma.makina.findUnique({
        where: { ekipmanAdi: makina.ekipmanAdi }
      });
      if (!existingByName || existingByName.id === existingByCode.id) {
        data.ekipmanAdi = makina.ekipmanAdi;
      }
    }

    await prisma.makina.update({
      where: { id: existingByCode.id },
      data
    });
    return;
  }

  const existingByName = await prisma.makina.findUnique({
    where: { ekipmanAdi: makina.ekipmanAdi }
  });

  if (existingByName) {
    await prisma.makina.update({
      where: { id: existingByName.id },
      data: {
        ekipmanKodu: makina.ekipmanKodu,
        sira: makina.sira,
        aktif: true,
        durum: 'AKTIF'
      }
    });
    return;
  }

  await prisma.makina.create({ data: makina });
}

async function main() {
  console.log('Seeding database...');

  const vardiyalar = await Promise.all([
    prisma.vardiya.upsert({
      where: { vardiyaAdi: 'VARDIYA 1 (00:30-08:30)' },
      update: { baslangicSaati: '00:30', bitisSaati: '08:30', sira: 1 },
      create: {
        vardiyaAdi: 'VARDIYA 1 (00:30-08:30)',
        baslangicSaati: '00:30',
        bitisSaati: '08:30',
        sira: 1
      }
    }),
    prisma.vardiya.upsert({
      where: { vardiyaAdi: 'VARDIYA 2 (08:30-16:30)' },
      update: { baslangicSaati: '08:30', bitisSaati: '16:30', sira: 2 },
      create: {
        vardiyaAdi: 'VARDIYA 2 (08:30-16:30)',
        baslangicSaati: '08:30',
        bitisSaati: '16:30',
        sira: 2
      }
    }),
    prisma.vardiya.upsert({
      where: { vardiyaAdi: 'VARDIYA 3 (16:30-00:30)' },
      update: { baslangicSaati: '16:30', bitisSaati: '00:30', sira: 3 },
      create: {
        vardiyaAdi: 'VARDIYA 3 (16:30-00:30)',
        baslangicSaati: '16:30',
        bitisSaati: '00:30',
        sira: 3
      }
    })
  ]);
  console.log('Vardiyalar olusturuldu:', vardiyalar.length);

  const mudahaleTurleri = ['Bakim', 'Ariza', 'Onleyici Bakim', 'Planli Bakim', 'Uygunsuzluk Giderme', 'Diger'];

  for (const [index, ad] of mudahaleTurleri.entries()) {
    await prisma.mudahaleTuru.upsert({
      where: { ad },
      update: { sira: index + 1, aktif: true },
      create: { ad, sira: index + 1 }
    });
  }
  console.log('Mudahale turleri olusturuldu:', mudahaleTurleri.length);

  const makinaListesi = [
    ...Array.from({ length: 12 }, (_, i) => ({
      ekipmanAdi: `${i + 1}. BORU MAKINASI`,
      ekipmanKodu: `BM-${String(i + 1).padStart(2, '0')}`,
      sira: i + 1
    })),
    ...Array.from({ length: 11 }, (_, i) => ({
      ekipmanAdi: `${i + 1}. DILME MAKINASI`,
      ekipmanKodu: `DM-${String(i + 1).padStart(2, '0')}`,
      sira: 13 + i
    })),
    { ekipmanAdi: 'OFFLINE 4 BOYAMA', ekipmanKodu: 'BY-01', sira: 24 }
  ];

  for (const makina of makinaListesi) {
    await upsertMakinaSeed(makina);
  }
  console.log('Makinalar olusturuldu:', makinaListesi.length);

  const adminPassword = await bcrypt.hash('sy123456', 10);
  await prisma.user.upsert({
    where: { sicilNo: 'ADMIN' },
    update: {
      ad: 'Sistem',
      soyad: 'Yonetici',
      adSoyad: 'Sistem Yonetici',
      email: 'admin@cmms.local',
      password: adminPassword,
      departman: 'YONETIM',
      role: 'ADMIN',
      aktif: true
    },
    create: {
      sicilNo: 'ADMIN',
      ad: 'Sistem',
      soyad: 'Yonetici',
      adSoyad: 'Sistem Yonetici',
      email: 'admin@cmms.local',
      password: adminPassword,
      departman: 'YONETIM',
      role: 'ADMIN'
    }
  });

  const personelListesi: Array<{
    sicilNo: string;
    ad: string;
    soyad: string;
    departman: string;
    role: string;
  }> = [
    ...defaultPersonelListesi.map((personel) => ({
      sicilNo: personel.sicilNo,
      ad: personel.ad,
      soyad: personel.soyad,
      departman: personel.bolum,
      role: 'TEKNISYEN'
    })),
    { sicilNo: 'BERKE', ad: 'BERKE', soyad: 'KARAYANIK', departman: 'YONETIM', role: 'ADMIN' }
  ];

  for (const personel of personelListesi) {
    const fullName = `${personel.ad} ${personel.soyad}`.replace(/\s+/g, ' ').trim();
    const defaultPassword = buildDefaultPassword(personel.ad, personel.soyad);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.upsert({
      where: { sicilNo: personel.sicilNo },
      update: {
        ad: personel.ad,
        soyad: personel.soyad,
        adSoyad: fullName,
        email: buildDefaultEmail(personel.sicilNo),
        password: hashedPassword,
        departman: personel.departman,
        role: personel.role,
        aktif: true
      },
      create: {
        sicilNo: personel.sicilNo,
        ad: personel.ad,
        soyad: personel.soyad,
        adSoyad: fullName,
        email: buildDefaultEmail(personel.sicilNo),
        password: hashedPassword,
        departman: personel.departman,
        role: personel.role
      }
    });
  }
  console.log('Personeller olusturuldu:', personelListesi.length);

  const tarih = new Date();
  tarih.setHours(0, 0, 0, 0);

  const sampleEquipment =
    (await prisma.makina.findUnique({ where: { ekipmanKodu: 'BM-01' } })) ||
    (await prisma.makina.findFirst({ orderBy: { id: 'asc' } }));
  const sampleShift =
    (await prisma.vardiya.findUnique({ where: { vardiyaAdi: 'VARDIYA 3 (16:30-00:30)' } })) ||
    vardiyalar.at(2) ||
    (await prisma.vardiya.findFirst({ orderBy: { id: 'asc' } }));
  const sampleMudahaleTuru = await prisma.mudahaleTuru.findUnique({ where: { ad: 'Bakim' } });

  const sampleIsEmriCreate: Prisma.IsEmriUncheckedCreateInput = {
    isEmriNo: '20260110-0001',
    tarih,
    baslangicSaati: '03:00',
    bitisSaati: '08:00',
    mudahaleSuresi: 300,
    aciklama: 'Kablo degisimi yapildi',
    kullanilanMalzeme: '4x4 kablo',
    durum: 'TAMAMLANDI'
  };

  if (sampleEquipment) {
    sampleIsEmriCreate.equipmentId = sampleEquipment.id;
  }
  if (sampleShift) {
    sampleIsEmriCreate.shiftId = sampleShift.id;
  }
  if (sampleMudahaleTuru) {
    sampleIsEmriCreate.mudahaleTuruId = sampleMudahaleTuru.id;
  }

  const isEmri = await prisma.isEmri.upsert({
    where: { isEmriNo: '20260110-0001' },
    update: {},
    create: sampleIsEmriCreate
  });

  const firstPersonnel = await prisma.user.findFirst({
    where: { sicilNo: '181' }
  });

  if (firstPersonnel) {
    await prisma.isEmriPersonel.upsert({
      where: { isEmriId_userId: { isEmriId: isEmri.id, userId: firstPersonnel.id } },
      update: {},
      create: { isEmriId: isEmri.id, userId: firstPersonnel.id }
    });
  }

  console.log('Ornek is emri olusturuldu');
  console.log('\n=============================');
  console.log('Seeding tamamlandi!');
  console.log('=============================');
  console.log('\nGiris Bilgileri:');
  console.log('Email: admin@cmms.local');
  console.log('Sifre: sy123456');
  console.log('Tum personel icin varsayilan: giris adi = adsoyad, sifre = bas harfler + 123456');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

