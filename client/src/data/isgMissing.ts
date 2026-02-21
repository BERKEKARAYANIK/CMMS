import type { IsgYearKey } from './isg';

export type IsgMissingTopicId =
  | 'uygunsuzluk-yillik'
  | 'capraz-denetim'
  | 'durum-kaynakli-kazalar'
  | 'ramak-kala'
  | 'ifade-gelmeyen'
  | 'sari-kart-gelmeyen';

export type IsgMissingItem = {
  date: string;
  person: string;
  detail: string;
  missingField: string;
  sourceRowNo?: number;
};

export type IsgDepartmentMissing = {
  department: string;
  total: number;
  missing: number;
  missingRate: number;
  items: IsgMissingItem[];
};

export type IsgTopicMissingBreakdown = {
  total: number;
  missing: number;
  missingRate: number;
  departments: IsgDepartmentMissing[];
};

export const ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR: Record<IsgYearKey, Record<IsgMissingTopicId, IsgTopicMissingBreakdown>> = 
{
  "2025": {
    "uygunsuzluk-yillik": {
      "total": 4091,
      "missing": 353,
      "missingRate": 8.63,
      "departments": [
        {
          "department": "HAT BORULAR",
          "total": 466,
          "missing": 140,
          "missingRate": 30.04,
          "items": [
            {
              "date": "2025-01-29",
              "person": "AYSE NUR UYE",
              "detail": "5. BOYAMA ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZALAR BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 306
            },
            {
              "date": "2025-01-30",
              "person": "AYSE NUR UYE",
              "detail": "5. HIDROTEST TEST KAFALARININ BULUNDUGU ALANDAN GELEN BASINCLI SU OPERATORE GELMEKTEDIR. SEFFAF MUHAFAZA GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 331
            },
            {
              "date": "2025-04-09",
              "person": "AYSE NUR UYE",
              "detail": "5. BOYAMA PAKETLEME SEHPASI ZINCIR MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1125
            },
            {
              "date": "2025-04-14",
              "person": "AYSE NUR UYE",
              "detail": "11 BMK HAVSA ALANI SONRASI ROLE YOLU YAN MUHAFAZA KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1166
            },
            {
              "date": "2025-04-19",
              "person": "AYSE NUR UYE",
              "detail": "5. BOYAMA KABINI UZERINDE BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1245
            },
            {
              "date": "2025-05-29",
              "person": "MURAT OZDEN",
              "detail": "12 BMK HAVSA KAFASI DONER AKSAM YAN MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1675
            },
            {
              "date": "2025-06-02",
              "person": "AYSE NUR UYE",
              "detail": "9.-10. BMK ARASINDAN BULUNAN 2.KALITE MALZEMELER GECIS YOLUNU KAPATIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1725
            },
            {
              "date": "2025-06-11",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA KABINI UZERINDE BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1782
            },
            {
              "date": "2025-06-12",
              "person": "AHMET MIGIRDAGI",
              "detail": "15 BMK HAVSA ALANINDA BULUNAN CAPAK KAZANLARINDA KILIT SISTEMI OLMADIGINDAN TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1797
            },
            {
              "date": "2025-06-17",
              "person": "MUSTAFA MAT",
              "detail": "12 BMK TESTERE KONTROL PANOSU UZERINE CATI YAPILMALIDIR. 2. KALITE MALZEMELER UZERINDEN GECIRILIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1848
            },
            {
              "date": "2025-06-18",
              "person": "AYSE NUR UYE",
              "detail": "12 BMK IC YIKAMA KARSISI KORKULUK ILE CEVRILI ALAN ICINDE ZEMIN ACIKLIKLARI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1855
            },
            {
              "date": "2025-06-24",
              "person": "MURAT OZDEN",
              "detail": "15 BMK TESTERE ONUNE MUHAFAZA MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1913
            },
            {
              "date": "2025-07-10",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TAVLAMA MAKINESI ARKASI KOLONDA BULUNAN E. PANOSUNA ERISIM ICIN YAPILMIS OLAN OLTAFORMDA KORKULUK BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2057
            },
            {
              "date": "2025-07-16",
              "person": "AYSENUR UYE",
              "detail": "9 ILE 10 BMK ARASINDA BULUNAN 2 NOLU 2. KALITE ISTIF AYAKLARINA SABIT MERDIVEN MONTAJI YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2113
            },
            {
              "date": "2025-07-23",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2213
            },
            {
              "date": "2025-07-24",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK HAVSA ALANI ROLE YOLU DONER AKSAM MUHAFAZA TAKILI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2228
            },
            {
              "date": "2025-08-04",
              "person": "AYSENUR UYE",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2347
            },
            {
              "date": "2025-08-05",
              "person": "MURAT OZDEN",
              "detail": "15 BMK DE KULLANILAN HURDA KAZANLARININ TUTMA KOLU VE PIMI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2356
            },
            {
              "date": "2025-08-05",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA PAKETLEME ALANINDA BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2363
            },
            {
              "date": "2025-08-05",
              "person": "AYSENUR UYE",
              "detail": "11 BMK KURUTMA FIRINI SONRASI ROLE YOLUNDA ACIKLIK BULUNMAKTADIR. GECISIN ENGELLENMESI ICIN KAPATILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2364
            },
            {
              "date": "2025-08-06",
              "person": "AYSENUR UYE",
              "detail": "9 BMK SARICI BOLGESINDE BULUNDAN DONER AKSAMIN MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2386
            },
            {
              "date": "2025-08-11",
              "person": "AYSENUR UYE",
              "detail": "9 BMK TESTERE BOLGESINDE BULUNAN FAN MUHAFAZA HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2436
            },
            {
              "date": "2025-08-12",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2456
            },
            {
              "date": "2025-08-15",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU GECIS MERDIVENIN ALT KISMINDA BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2507
            },
            {
              "date": "2025-08-27",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK PAKETLEME SEHPASI DONER AKSAM MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2596
            },
            {
              "date": "2025-09-04",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU UST MERDIVEN GECIS ALANI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2660
            },
            {
              "date": "2025-09-05",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ALANI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2672
            },
            {
              "date": "2025-09-05",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA MERDIVEN KORKULUGU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2681
            },
            {
              "date": "2025-09-08",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA ONCESI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZA TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2735
            },
            {
              "date": "2025-09-08",
              "person": "AYSENUR UYE",
              "detail": "9 ILE 10 BMK ARASI YURUME YOLUNDA BULUNAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2737
            },
            {
              "date": "2025-09-09",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA MAKINESI PAKETLEME CALISMA ALANINA YAPILAN ISTIFLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2765
            },
            {
              "date": "2025-09-10",
              "person": "AYSENUR UYE",
              "detail": "5. HIDROTEST PAKETLEME ALANINDA BULUNAN ISTIFLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2781
            },
            {
              "date": "2025-09-15",
              "person": "AYSENUR UYE",
              "detail": "11 BMK 1. SIRADAKI 2. KALITE AYAGININ KORKULUGU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2811
            },
            {
              "date": "2025-09-15",
              "person": "ILYAS GEZER",
              "detail": "11 BMK CATI HAVALANDIRMA BACALARINA ULASIM ICIN UYGUN STANDARTLARDA MERDIVEN YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2812
            },
            {
              "date": "2025-09-15",
              "person": "ILYAS GEZER",
              "detail": "12 BMK CATI HAVALANDIRMA BACALARINA ULASIM ICIN UYGUN STANDARTLARDA MERDIVEN YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2813
            },
            {
              "date": "2025-09-22",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU MERDIVEN ALTI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2895
            },
            {
              "date": "2025-09-23",
              "person": "AYSENUR UYE",
              "detail": "11 BMK HIDROTEST SONRASI ROLE YOLU ZEMINDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2927
            },
            {
              "date": "2025-09-25",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK YATAY FLOOP ALT KISIM MAZGALLAR BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2950
            },
            {
              "date": "2025-09-25",
              "person": "MURAT OZDEN",
              "detail": "11 BMK HAVSA SONRASI GECIS ALANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2955
            },
            {
              "date": "2025-09-25",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME ARKASINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2956
            },
            {
              "date": "2025-09-29",
              "person": "AYSENUR UYE",
              "detail": "11 BMK HIDROTEST ALANINDA BULUNAN VANTILATORUN MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2994
            },
            {
              "date": "2025-09-29",
              "person": "AYSENUR UYE",
              "detail": "11 BMK HIDROTEST SONRASI ROLE YOLU UZERINDE BULUNAN MERDIVENIN BASAMAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2996
            },
            {
              "date": "2025-09-30",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ARKA KISIMDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3023
            },
            {
              "date": "2025-09-30",
              "person": "MURAT OZDEN",
              "detail": "9 BMK PAKETLEME BOLUMU BOR YAGI POMPASI OLMADIGINDAN DOLAYI BOR YAG ALANA DOLUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3034
            },
            {
              "date": "2025-10-02",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK PAKETLEME SEHPASI MUHAFAZA YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3045
            },
            {
              "date": "2025-10-06",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME TARAFINDA SOKULEN MEKANIK PARCALARIN AYAKLARI TAKILMA TEHLIKESI YARATIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3087
            },
            {
              "date": "2025-10-07",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA KAFASI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3102
            },
            {
              "date": "2025-10-08",
              "person": "ILYAS GEZER",
              "detail": "9 BMK PAKETLEME ZINCIR MOTOR MUHAFAZA HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3110
            },
            {
              "date": "2025-10-08",
              "person": "AYSENUR UYE",
              "detail": "11 BMK BANT SEHPALARI DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3120
            },
            {
              "date": "2025-10-09",
              "person": "MURAT OZDEN",
              "detail": "11 BMK HIDROTEST DONEN MEKANIK PARCALAR TEHLIKE OLUSTURUYOR. MUHAFAZA ILE KAPATILMALI YA DA ALAN SINIRLANDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3133
            },
            {
              "date": "2025-10-13",
              "person": "AYSENUR UYE",
              "detail": "9 BMK PAKETLEME SEHPASI UZERINE BAKIM PERSONELLERININ GUVENLI MUDAHALESI ICIN PLATFORM MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3158
            },
            {
              "date": "2025-10-13",
              "person": "AYSENUR UYE",
              "detail": "11 BMK BOYAMA ALANINDA CEMBERLEME ALANINA GECIS ICIN KULLANILAN MERDIVENIN BASAMAKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3166
            },
            {
              "date": "2025-10-16",
              "person": "AYSENUR UYE",
              "detail": "11 BMK KOLON DIBINDE TAVALARIN OLDUGU ALANDAKI MUHAFAZA YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3203
            },
            {
              "date": "2025-10-20",
              "person": "AYSENUR UYE",
              "detail": "12 BMK TESTERE BOLGESI HURDA AYAKLARI KORKULUKLAR HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3228
            },
            {
              "date": "2025-10-21",
              "person": "CUMA GURCINAR",
              "detail": "11 BMK FLOOP GIRIS PINCROLL MOTOR ARIZA VE BAKIM DURUMLARI ICIN PLATFORM IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3258
            },
            {
              "date": "2025-10-21",
              "person": "CUMA GURCINAR",
              "detail": "12 BMK FLOOP GIRIS PINCROLL MOTOR ARIZA VE BAKIM DURUMLARI ICIN PLATFORM IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3259
            },
            {
              "date": "2025-10-22",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3265
            },
            {
              "date": "2025-10-23",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ARKA TARAF MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3277
            },
            {
              "date": "2025-10-23",
              "person": "YASIN TOPBAS",
              "detail": "15 BMK MAKARA ALANI YOLDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3278
            },
            {
              "date": "2025-10-24",
              "person": "OGUZ BEKTAS",
              "detail": "12 BMK PAKETLEME MERDIVENLER DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3304
            },
            {
              "date": "2025-10-27",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA ONCESI ALANDA BULUNAN MAZGAL ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3315
            },
            {
              "date": "2025-10-28",
              "person": "YASIN TOPBAS",
              "detail": "12 BMK IC YIKAMA SONRASI YERDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3334
            },
            {
              "date": "2025-10-28",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ALANI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3335
            },
            {
              "date": "2025-10-28",
              "person": "YASIN TOPBAS",
              "detail": "9 BMK TESTERE SONRASI ROLE YOLU MERDIVEN ALTI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3336
            },
            {
              "date": "2025-10-30",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA TERAZI SEHPA AYAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3347
            },
            {
              "date": "2025-10-31",
              "person": "YASIN TOPBAS",
              "detail": "15 BMK YURUME YOLUNDA BULUNAN CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3370
            },
            {
              "date": "2025-11-04",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3407
            },
            {
              "date": "2025-11-04",
              "person": "MURAT OZDEN",
              "detail": "11 BMK PAH KIRMA KONVEYOR KANAL USTU ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3412
            },
            {
              "date": "2025-11-11",
              "person": "AYSENUR UYE",
              "detail": "11 BMK TESTERE ONCESI SOGUTMA YANI MAZGALLARDA SEVIYE FARKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3486
            },
            {
              "date": "2025-11-12",
              "person": "MURAT OZDEN",
              "detail": "15 BMK YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3494
            },
            {
              "date": "2025-11-18",
              "person": "MURAT OZDEN",
              "detail": "12 BMK TESTERE OPER PANOSUNDA KULLANILAN SANDALYELER UYGUN DEGIL. UYGUN SANDALYE TEMIN EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3550
            },
            {
              "date": "2025-11-19",
              "person": "AYSENUR UYE",
              "detail": "15 BMK PAKETLEME ALANINDA BULUNAN SEHPA ARASINDA RULMAN DEGISIMI SUREKLI YAPILDIGINDAN ALANA GUVENLI ULASIM ICIN PLATFORM MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3569
            },
            {
              "date": "2025-11-19",
              "person": "AYSENUR UYE",
              "detail": "12 BMK 2. KALITE AYAKLARI KAPISI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3573
            },
            {
              "date": "2025-11-26",
              "person": "YASIN TOPBAS",
              "detail": "11. BMK IC YIKAMA ONCESI ROLE YOLU YANI ZEMIN ACIKLIK MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3642
            },
            {
              "date": "2025-11-26",
              "person": "YASIN TOPBAS",
              "detail": "12 BMK PAKETLEME YOLDAN BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3643
            },
            {
              "date": "2025-11-26",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA YANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3644
            },
            {
              "date": "2025-11-26",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA ARKASI ZEMINDE BULUNAN ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3645
            },
            {
              "date": "2025-11-26",
              "person": "AYSENUR UYE",
              "detail": "11 BMK TESTERE SONRASI ROLE YANINDA BULUNAN CAPAKLAR TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3646
            },
            {
              "date": "2025-11-26",
              "person": "AYSENUR UYE",
              "detail": "12 BMK 2. KALITE ALANINDA BULUNAN PLATFORM KORKULUKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3647
            },
            {
              "date": "2025-11-28",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME ARKASINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3668
            },
            {
              "date": "2025-12-01",
              "person": "MURAT OZDEN",
              "detail": "9 BMK PAKETLEME DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3695
            },
            {
              "date": "2025-12-02",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3721
            },
            {
              "date": "2025-12-02",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME GECIS MERDIVENI YANINDA BULUNAN HURDA KAZANINDAN TASMIS CEMBERLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3722
            },
            {
              "date": "2025-12-05",
              "person": "AYSENUR UYE",
              "detail": "16. HOL S HUCRESI KOLON ARASINDA CEMBER ATIKLARI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3747
            },
            {
              "date": "2025-12-08",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA YANI YURUME YOLU UZERINMDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3753
            },
            {
              "date": "2025-12-09",
              "person": "MURAT OZDEN",
              "detail": "12 BMK TESTERE ARKASI MAZGAL EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3773
            },
            {
              "date": "2025-12-09",
              "person": "MURAT OZDEN",
              "detail": "12 BMK TESTERE ONCESI PORTATIF MERDIVENIN KORKULUGU YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3775
            },
            {
              "date": "2025-12-09",
              "person": "MURAT OZDEN",
              "detail": "11 BMK FLOOP ONU MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3776
            },
            {
              "date": "2025-12-09",
              "person": "AYSENUR UYE",
              "detail": "11 BMK ACICI BOLGESI DUZLESTIRME MAKARALARI TAM ANLAMIYLA CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3780
            },
            {
              "date": "2025-12-09",
              "person": "CUMA GURCINAR",
              "detail": "11. BMK KURUTMA FIRINI CIKISI MANYETIK KOLLARA MUDAHALE ICIN PLATFORM VE ANKRAJ NOKTASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3781
            },
            {
              "date": "2025-12-11",
              "person": "MURAT OZDEN",
              "detail": "11 BMK HAVSA KONVEYORLERI BULUNMADIGINDAN ALANA KORKULUK YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3806
            },
            {
              "date": "2025-12-11",
              "person": "MURAT OZDEN",
              "detail": "12 BMK HAVSA KONVEYOR KAFA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3807
            },
            {
              "date": "2025-12-11",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA ONCESI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3809
            },
            {
              "date": "2025-12-15",
              "person": "BERKAY ASLAN",
              "detail": "15 BMK KAYNAK GRUBU SONRASI YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3828
            },
            {
              "date": "2025-12-15",
              "person": "MURAT OZDEN",
              "detail": "9 BMK YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3841
            },
            {
              "date": "2025-12-15",
              "person": "MURAT OZDEN",
              "detail": "9 BMK DAVLUMBAZ BACASI SOKULMUS YERINE TAKILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3842
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA KABIN ONCESI ALANDA BULUNAN MERDIVENIN BASAMAGI VE KORKULUGU BULUNMUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3847
            },
            {
              "date": "2025-12-17",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK TESTERE KORUYUCU MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3864
            },
            {
              "date": "2025-12-17",
              "person": "AYSENUR UYE",
              "detail": "11 BMK UTULEME KILAVUZ MAKARALARI KALIN BANTLARDA CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3868
            },
            {
              "date": "2025-12-17",
              "person": "MURAT OZDEN",
              "detail": "9 ILE 10 BMK ARASI AYAKLARDA YER OLMASINA RAGMEN YERDE BULUNAN 2. KALITELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3872
            },
            {
              "date": "2025-12-18",
              "person": "MURAT OZDEN",
              "detail": "9 BMK PAKETLEME DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3879
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA ONCESI ROLE YOLU YANINDA BULUNAN MAZGALLARDA ACIKLIK MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3891
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA ALANI ZEMINDE BULUNAN ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3892
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA BOR YAG KANAL MUHAFAZASI CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3893
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "9 BMK GIRISI PALETLER VE KARTONLAR TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3909
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI ALANI BARIYER ILE SINIRLANDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3915
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI HAREKETLI AKSAMLARDA MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3916
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI HURDA KAZANI IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3917
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI ISTIF AYAGI IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3918
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI IKARSIYA GECIS ICIN MERDIVEN IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3919
            },
            {
              "date": "2025-12-22",
              "person": "MURAT OZDEN",
              "detail": "9 BMK PAKETLEME DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3920
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "5. BOYAMA YANI SERPATIN KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3929
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME ARKASINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3944
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "11 BMK HAVSA SONRASI GECIS ALANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3945
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "11 BMK HAVSA SONRASI MAZGALLAR TAKILMAMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3946
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "11 BMK TESTERE SONRASI ROLE YOLU ZEMIN ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3947
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "9 ILE 10 BMK ARASINDA BULUNAN TERAZILER, 2. KALITELER, PALETLER VE VARILLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3948
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "9 BMK ACICI ARKASI YERDE BULUNAN BANT ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3949
            },
            {
              "date": "2025-12-23",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TAVLAMA E. PANOSUNA CIKAN MERDIVEN AYAKLARINDAN BIRI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3955
            },
            {
              "date": "2025-12-24",
              "person": "BERKAY ASLAN",
              "detail": "9 BMK PAKETLEME MOTOR MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3971
            },
            {
              "date": "2025-12-24",
              "person": "BERKAY ASLAN",
              "detail": "9 BMK ROLE YOLUNDA BULUNAN MOTOR MUHAFAZA YETERLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3972
            },
            {
              "date": "2025-12-25",
              "person": "MURAT OZDEN",
              "detail": "12 BMK MANYETIK KOLLAR CIVARI ZEMINDE BULUNAN YAG TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3993
            },
            {
              "date": "2025-12-25",
              "person": "MURAT OZDEN",
              "detail": "12 BMK BANT SEHPALARI TUTUCU DESTEK AYAKLARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3994
            },
            {
              "date": "2025-12-26",
              "person": "MURAT OZDEN",
              "detail": "9 BMK CEMBERLEME ALANI YERDE BULUNAN CEMBER ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4008
            },
            {
              "date": "2025-12-26",
              "person": "AYSENUR UYE",
              "detail": "9 BMK BANT SEHPASI ALANI HURDA KAZANI TASMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4029
            },
            {
              "date": "2025-12-26",
              "person": "AYSENUR UYE",
              "detail": "12 BMK 2. KALITE SEHPASI MAZGALLAR ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4031
            },
            {
              "date": "2025-12-26",
              "person": "AYSENUR UYE",
              "detail": "12 BMK ACICI BOLGESI ISITICI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4032
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "11. BMK KAYNAK GRUBU ALANINDA ZEMINDE YAG AKINTISI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4036
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "11. BMK HAVSALAMA SONRASI ROLE YOLU KAYIS KASNAK MUHAFAZALARI SOKULMUS YERDE DURUYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4058
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "11. BMK HAVSALAMA GIRISINDE BULUNAN PNOMATIK BOX KAPAGI ACIKTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4059
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "15. BMK PAKETLEME ALANINDA BULUNAN EL SPIRALININ MUHAFAZASI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4060
            },
            {
              "date": "2025-12-30",
              "person": "BERKAY ASLAN",
              "detail": "11.BMK FLOOP YANINDA BULUNAN BASINCLI TUPLERIN DEVRILME RISKINE KARSI SABITLENMESI GEREKMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4064
            },
            {
              "date": "2025-12-30",
              "person": "BERKAY ASLAN",
              "detail": "15.BMK PAKETLEME ALANIDNA YURUME YOLU UZERINDE MALZEMELER BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4068
            },
            {
              "date": "2025-12-30",
              "person": "BERKAY ASLAN",
              "detail": "15.BMK SOGUTMA KAPAKLARI KAPATILMALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4071
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "9. BMK HAVSALAMA SEHPASI ALANINDA BULUNAN MAZGAL ACIKILIKLARI TEHLIKELI DURUM ARZ ETMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4074
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "9. BMK TESTERE SONRASI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZASI ZARAR GORMUSTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4075
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "12. BMK TESTERE SONRASI ROLE YOLU KENARI YURUME YOLUNDA YAG DOKUNTUSU MEVCUTTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4078
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "11.BMK IC YIKAMA CIKISI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZASI YERINDEN CIKMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4084
            },
            {
              "date": "2025-12-31",
              "person": "BERKAY ASLAN",
              "detail": "11. BMK BOLGESINDE BULUNAN PORTATIF MERDIVENIN SOL ON TEKERI DENGESIZ DURMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4089
            },
            {
              "date": "2025-12-31",
              "person": "BERKAY ASLAN",
              "detail": "11. BMK FLOOP YANI KAYNAK MAKINESINE AIT BASINCLI TUPLER SABITLENMEMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4090
            }
          ]
        },
        {
          "department": "E. BAKIM-1",
          "total": 591,
          "missing": 37,
          "missingRate": 6.26,
          "items": [
            {
              "date": "2025-06-27",
              "person": "MURAT OZDEN",
              "detail": "5. HOL STOK SAHASINDA BULUNAN AYDINLATMALARDAN BIR KAC TANESI YANMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1941
            },
            {
              "date": "2025-07-07",
              "person": "YASIN TOPBAS",
              "detail": "ISLEM HATLARI TAVLAMA BOLGESINDEKI AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2030
            },
            {
              "date": "2025-08-11",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ALANI BOR YAG CUKURU KAPAGI ACIK BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2423
            },
            {
              "date": "2025-09-03",
              "person": "AYSENUR UYE",
              "detail": "11 BMK JUT AYDINLATMASI PANO ICERISINDEN ACILIYOR. HARICI ANAHTAR YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2651
            },
            {
              "date": "2025-09-03",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ARKA TARAF TANKIN KAPAGI ACIK BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2652
            },
            {
              "date": "2025-09-07",
              "person": "YUCEL DURGUN",
              "detail": "FABRIKA AMBARA GIDEN YOL COK KARANLIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2689
            },
            {
              "date": "2025-09-08",
              "person": "UFUK CELIK",
              "detail": "9.dilme sarici frenleme sistemi arizali acil stopa basildiginda harekete devam ediyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2723
            },
            {
              "date": "2025-09-17",
              "person": "ILYAS GEZER",
              "detail": "E. BAKIM ATOLYESINDE BULUNAN YSC KULLANIM DISI DEGISTIRILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2858
            },
            {
              "date": "2025-10-16",
              "person": "MURAT OZDEN",
              "detail": "11 BMK IC YIKAMA ARKASI BOR YAGI KANALI MUHAFAZASINDA ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3208
            },
            {
              "date": "2025-10-20",
              "person": "YASIN TOPBAS",
              "detail": "1 BMK FLOOP MOTOR KAPAGI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3225
            },
            {
              "date": "2025-10-20",
              "person": "ILYAS GEZER",
              "detail": "12 BMK HIDROTEST CIVARI E. PANOSU KAPAK BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3236
            },
            {
              "date": "2025-10-20",
              "person": "ILYAS GEZER",
              "detail": "12 BMK HIDROTEST SONRASI ROLE YOLUNDA BULUNAN MOTORLARIN FAN MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3237
            },
            {
              "date": "2025-10-24",
              "person": "OGUZ BEKTAS",
              "detail": "11 BMK DOGRULTMA GIRISI MOTOR MUHAFAZA KAPAKLARI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3298
            },
            {
              "date": "2025-10-28",
              "person": "UMIT KARABULUT",
              "detail": "S16 G HUCRESI AYDINLATMALAR YETERSIZ VE YANMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3345
            },
            {
              "date": "2025-11-19",
              "person": "YASIN TOPBAS",
              "detail": "11 BMK IC YIKAMA ALANI ARKA KISIM BOR YAG KANALI KAPAGI ACIK BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3567
            },
            {
              "date": "2025-12-03",
              "person": "ILYAS GEZER",
              "detail": "12 BMK KAYNAK GRUBU CIVARI KOLONDA BULUNAN E. PANOSU YERDE HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3742
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "6' OFFLINE SOGUTMA KABINI AYDINLATMALAR HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3835
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "12 BMK JUTLEME ALANINDA BULUNAN OPER. PANOSU TUSLARI TANIMLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3846
            },
            {
              "date": "2025-12-15",
              "person": "ILYAS GEZER",
              "detail": "6 BMK PAKETLEME ZINCIR YOLUNDA BULUNAN KLEMENS KUTUSU HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3849
            },
            {
              "date": "2025-12-16",
              "person": "BERKAY ASLAN",
              "detail": "10 BMK TESTERE SONRASI KONTROL PANOSU TUSLARI TANIMLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3856
            },
            {
              "date": "2025-12-17",
              "person": "BERKAY ASLAN",
              "detail": "3. DILME KARSISI YURUME YOLUNDA BULUNAN AYDINLATMA CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3865
            },
            {
              "date": "2025-12-17",
              "person": "AYSENUR UYE",
              "detail": "15 BMK ACICI BOLGESINDE BULUNAN 3 OPER. PANOSUNDA DA ACIL STOP BUTONLARI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3866
            },
            {
              "date": "2025-12-17",
              "person": "AYSENUR UYE",
              "detail": "15 BMK FLOOP KISMINDA BULUNAN ACIL STOP BUTONU KOMUTU YANLIS VERIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3867
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "12 BMK JUTLEME KABINI AYDINLATMA CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3888
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "1 BMK BOLGESI TRAFO USTU MALZEMELER TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3932
            },
            {
              "date": "2025-12-23",
              "person": "AYSENUR UYE",
              "detail": "3. DILME FIRE CUKURU ICIN ISIKLI VE SESLI IKAZ, ACIL STOP BUTONU GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3956
            },
            {
              "date": "2025-12-24",
              "person": "BERKAY ASLAN",
              "detail": "2. DILME RULO HAVUZU USTU AYDINLATMA CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3970
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "AMBAR TARAFI AYDINLATMA CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4001
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "5 NOLU KAPI GIRISI AYDINLATMA CALISMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4035
            },
            {
              "date": "2025-12-27",
              "person": "AYSENUR UYE",
              "detail": "11. BMK TESTERE SONRASI ROLE YOLUNDA BULUNAN ELEKTRIK PANOSUNUN KAPAGI ZARAR GORMUSTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4045
            },
            {
              "date": "2025-12-27",
              "person": "BERKAY ASLAN",
              "detail": "11. BMK HAVSALAMA ZEMINDE BULUNAN KABLO TAVASI KAPAGI ACILMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4050
            },
            {
              "date": "2025-12-27",
              "person": "BERKAY ASLAN",
              "detail": "11. BMK FLOOP SEPET MILL MOTORU MUHAFAZASI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4051
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "10. BMK FLOOP DURDURMA SENSORLERI CALISMIYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4055
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "6. DILME ACICI BOLGESI ELEKTRIK PANO KAPAGI ACIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4056
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "6. DILME BICAKLARI YANINDA BULUNAN MOTORUN DONEN AKSAM MUHAFAZASI BULUNMUYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4057
            },
            {
              "date": "2025-12-30",
              "person": "BERKAY ASLAN",
              "detail": "11.BMK KAYNAK GRUBU DAVLUMBAZ ICI YETERLI AYDINLATMA BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4065
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "11. BMK IC YIKAMA CIKISI ROLE YOLUNDA BULUNAN ELEKTRIK PANOSUNUN KAPAGI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4085
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 808,
          "missing": 36,
          "missingRate": 4.46,
          "items": [
            {
              "date": "2025-01-13",
              "person": "ILYAS GEZER",
              "detail": "13 BMK PAKETLEME TARAFINDA BULUNAN ISTIF AYAGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 104
            },
            {
              "date": "2025-01-27",
              "person": "ALPARSLAN DURMUSCAN",
              "detail": "7. HOL V HUCRESI GUVENLI GECIS ALANI AYAKLARI UST KISMI KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 251
            },
            {
              "date": "2025-02-07",
              "person": "AYSE NUR UYE",
              "detail": "8. HOL H HUCRESI ISTIF AYAGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 413
            },
            {
              "date": "2025-02-17",
              "person": "ILYAS GEZER",
              "detail": "15 BMK PAKETLEME ALANINDA BULUNAN ISTIFLER ICIN DESTEK AYAGI MONTAJI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 523
            },
            {
              "date": "2025-04-22",
              "person": "MURAT CAYLAKLI",
              "detail": "5. BMK PAKETLEME YANI ISTIF KENARINDA ISTIF AYAGI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1289
            },
            {
              "date": "2025-04-22",
              "person": "MURAT CAYLAKLI",
              "detail": "7. BMK PAKETLEME YANI ISTIF KENARINDA ISTIF AYAGI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1290
            },
            {
              "date": "2025-04-22",
              "person": "AYSE NUR UYE",
              "detail": "5. HOL L HUCRESI DAHA ONCEDEN YAPILMIS OLAN PROFIL KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1293
            },
            {
              "date": "2025-04-22",
              "person": "AYSE NUR UYE",
              "detail": "8. HOL M HUCRESI ISTIF AYAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1295
            },
            {
              "date": "2025-05-12",
              "person": "ILYAS GEZER",
              "detail": "7. HOL V HUCRESINDE BULUNAN ISTIF ALANINDA DESTEK AYAGI YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1452
            },
            {
              "date": "2025-06-16",
              "person": "ALPARSLAN DURMUSCAN",
              "detail": "10. HOL T HUCRESI ISTIF AYAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1813
            },
            {
              "date": "2025-07-16",
              "person": "MURAT OZDEN",
              "detail": "EK BINADA YETERLI SAYIDA YUKLEME MERDIVENI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2108
            },
            {
              "date": "2025-07-22",
              "person": "YASIN TOPBAS",
              "detail": "17. HOL O,N,M HUCRELERINDE YURUME YOLUNA GELEN MALZEMELER MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2194
            },
            {
              "date": "2025-07-22",
              "person": "AYSENUR UYE",
              "detail": "11. HOL L HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2200
            },
            {
              "date": "2025-07-22",
              "person": "MEHMET KAPLAN",
              "detail": "23 BMK ISTIF ALANINDA TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2208
            },
            {
              "date": "2025-07-29",
              "person": "YASIN TOPBAS",
              "detail": "18. HOL I HUCRESINDE BULUNAN STOK MERDIVENI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2290
            },
            {
              "date": "2025-08-05",
              "person": "YASIN TOPBAS",
              "detail": "18. HOL L,M,P HUCRELERINDE YOLA UZANAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2353
            },
            {
              "date": "2025-08-06",
              "person": "AYSENUR UYE",
              "detail": "20 BMK PAKETLEME ISTIF SAHASINDA KULLANILAN EL MERDIVENI COK KISA UYGUN DEGIL. MERDIVEN TEDARIK EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2378
            },
            {
              "date": "2025-08-09",
              "person": "YASIN TOPBAS",
              "detail": "10. HOL R HUCRESI ISTIF AYAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2414
            },
            {
              "date": "2025-08-12",
              "person": "SAMET KUPELI",
              "detail": "S4 HOLUNDE BULUNAN ISTIF MERDIVENI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2471
            },
            {
              "date": "2025-08-18",
              "person": "AYSENUR UYE",
              "detail": "EK BINA IHRACAT HOLU YURUME YOLUNA KONULAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2523
            },
            {
              "date": "2025-08-27",
              "person": "YASIN TOPBAS",
              "detail": "EK BINA YUKLEME HOLUNDE BULUNAN MERDIVENIN KORKULUGU BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2598
            },
            {
              "date": "2025-09-05",
              "person": "YASIN TOPBAS",
              "detail": "11. HOL J VE I HUCRESI DUZENSIZ ISTIFLER MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2668
            },
            {
              "date": "2025-09-10",
              "person": "ILYAS GEZER",
              "detail": "EK BINADA YETERLI SAYIDA YUKLEME MERDIVENI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2783
            },
            {
              "date": "2025-09-23",
              "person": "ILYAS GEZER",
              "detail": "29 BMK ACICI BOLGESINDE BULUNAN SEMERLER KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2931
            },
            {
              "date": "2025-10-31",
              "person": "YASIN TOPBAS",
              "detail": "22. HOL YAGLAMA PLATFORM KORKULUK ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3363
            },
            {
              "date": "2025-11-13",
              "person": "MURAT OZDEN",
              "detail": "YENI 2. KALITE SECME ALANINA YETERLI SAYIDA ISTIF AYAGI VE SEHPA MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3499
            },
            {
              "date": "2025-12-08",
              "person": "MURAT OZDEN",
              "detail": "EK BINADA YETERLI SAYIDA YUKLEME MERDIVENI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3755
            },
            {
              "date": "2025-12-08",
              "person": "MURAT OZDEN",
              "detail": "ANA BINADA YETERLI SAYIDA YUKLEME MERDIVENI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3756
            },
            {
              "date": "2025-12-15",
              "person": "BERKAY ASLAN",
              "detail": "YUKLEME MERDIVENLERININ BIRCOGUNUN FREN SISTEMI CALISMAMAKTADIR. KONTROL EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3830
            },
            {
              "date": "2025-12-16",
              "person": "AYSENUR UYE",
              "detail": "8. HOL R HUCRESI ISTIF MERDIVENI TEKERLERI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3861
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "6' OFFLINE BOLGESI LASTIKLER VE PROFIL ATIKLARI KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3930
            },
            {
              "date": "2025-12-23",
              "person": "MURAT CAYLAKLI",
              "detail": "13 BMK PAKETLEME ILK HUCRESINDE ISTIF AYAGI OLMAMASINA RAGMEN MALZEME KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3967
            },
            {
              "date": "2025-12-23",
              "person": "MURAT CAYLAKLI",
              "detail": "14 BMK PAKETLEME ILK HUCRESINDE ISTIF AYAGI OLMAMASINA RAGMEN MALZEME KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3968
            },
            {
              "date": "2025-12-24",
              "person": "AYSENUR UYE",
              "detail": "5 ILE6 BMK ARASI HAREKETLI MERDIVEN HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3984
            },
            {
              "date": "2025-12-25",
              "person": "MURAT OZDEN",
              "detail": "ESKI CNC ALANINDA BULUNAN 2. KALITE MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3991
            },
            {
              "date": "2025-12-25",
              "person": "MUSTAFA SAHIN",
              "detail": "14. HOL DE BULUNAN BASINCLI HAVA HORTUMU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3998
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 317,
          "missing": 35,
          "missingRate": 11.04,
          "items": [
            {
              "date": "2025-04-08",
              "person": "AYSE NUR UYE",
              "detail": "27 BMK DAVLUMBAZ YETERSIZ KALIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1108
            },
            {
              "date": "2025-06-04",
              "person": "MUSTAFA OZCELIK",
              "detail": "16 BMK ACICI BASKI OLMAMASI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1764
            },
            {
              "date": "2025-06-30",
              "person": "YASIN TOPBAS",
              "detail": "DILME MAKINELERI FIRE SARICI BOLGELERINDE, M. BAKIM PERSONELLERININ GUVENLI MUDAHALEDE BULUNABILMELERI ICIN ANKRAJ NOKTASI MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1953
            },
            {
              "date": "2025-07-07",
              "person": "YASIN TOPBAS",
              "detail": "17. BMK FLOOP MOTOR DONER AKSAM MUHAFAZASI ZARAR GORMUSTUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2022
            },
            {
              "date": "2025-08-06",
              "person": "AYSENUR UYE",
              "detail": "9 BMK DAVLUMBAZ BACASI SOKULMUS YERINE TAKILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2377
            },
            {
              "date": "2025-08-06",
              "person": "MURAT OZDEN",
              "detail": "14. HOLDE BULUNAN YURUME YOLUNUN KORKUGU KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2385
            },
            {
              "date": "2025-08-18",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TAVLAMA TEKERI KIRIK OLDUGUNDAN SAPAN ILE SABITLEME YAPILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2522
            },
            {
              "date": "2025-09-02",
              "person": "AYSENUR UYE",
              "detail": "7. DILME ACICI OPERATOR PANOSUNDA, BANDIN SABIT ILERLEMESINI SAGLAYAN SISTEMIN AKTIF KALMASI ICIN BUTONA METAL CUBUK YERLESTIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2641
            },
            {
              "date": "2025-09-08",
              "person": "UFUK CELIK",
              "detail": "7. dilme fire konveyoru reduktoru eksik",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2727
            },
            {
              "date": "2025-10-02",
              "person": "AYSENUR UYE",
              "detail": "1. BMK YANI M. BAKIM ATOLYESI MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3050
            },
            {
              "date": "2025-10-08",
              "person": "AYSENUR UYE",
              "detail": "9 BMK HAVSA SONRASI ROLE YOLU HAVA KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3121
            },
            {
              "date": "2025-10-10",
              "person": "YASIN TOPBAS",
              "detail": "4 BMK CEMBERLEME ALANI DAIRE TESTERE MUHAFAZA SABIT DEGIL VE TESTERE ON KISMA DOGRU CEKILDIGINDE YAY KOPUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3142
            },
            {
              "date": "2025-10-14",
              "person": "ILYAS GEZER",
              "detail": "12 BMK ROLE YOLUNDA BULUNAN MOTOR KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3176
            },
            {
              "date": "2025-10-21",
              "person": "AYSENUR UYE",
              "detail": "11 BMK BANT BIRLESTIRME ALANI YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3254
            },
            {
              "date": "2025-10-24",
              "person": "ILYAS GEZER",
              "detail": "15 BMK PAKETLEME ZINCIR CIVARI ZEMINDE MOTOR MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3293
            },
            {
              "date": "2025-10-27",
              "person": "AYSENUR UYE",
              "detail": "6 BMK BOYAMA KABINI UZERINDEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3309
            },
            {
              "date": "2025-10-27",
              "person": "ILYAS GEZER",
              "detail": "15 BMK HAVSA SONRASI ROLE YOLUNDAKI ZEMINDE BULUNAN MOTOR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3319
            },
            {
              "date": "2025-11-04",
              "person": "AYSENUR UYE",
              "detail": "1. DILME FIRE SARICI SILINDIR ASINMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3414
            },
            {
              "date": "2025-11-11",
              "person": "MURAT OZDEN",
              "detail": "27 BMK PAKETLEME TAMPON ZEMINE YETERINCE SABITLENMEMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3481
            },
            {
              "date": "2025-11-17",
              "person": "AYSENUR UYE",
              "detail": "1. DILME FIRE SARICI SILINDIR ASINMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3525
            },
            {
              "date": "2025-11-18",
              "person": "MURAT OZDEN",
              "detail": "12 BMK TESTERE SONRASI ROLE YOLU MOTORLARI SALLANIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3549
            },
            {
              "date": "2025-11-19",
              "person": "AYSENUR UYE",
              "detail": "15 BMK ACICI BALATA TAM ANLAMIYLA DONMUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3578
            },
            {
              "date": "2025-11-20",
              "person": "MUSTAFA COLAK",
              "detail": "3. DILME ACICI DORTLU KOL ZEMIN SASE OYNUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3591
            },
            {
              "date": "2025-11-28",
              "person": "SINAN MUTLU",
              "detail": "11. DILME BICAK SIYIRILARI EGIK OLDUGUNDAN EL ALETI ILE MUDAHALE ZORUNLULUGU VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3669
            },
            {
              "date": "2025-11-28",
              "person": "MUSTAFA TONAK",
              "detail": "10. DILME SARICI ARABA CUKUR APARATI KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3675
            },
            {
              "date": "2025-12-10",
              "person": "AYSENUR UYE",
              "detail": "11 BMK HIDROTEST OPER. PANO ARKASI ALANDA YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3793
            },
            {
              "date": "2025-12-12",
              "person": "SAMI CAN TAVSAN",
              "detail": "6. DILME ACICI DORTLU KOL TABAN KISMINDAN OYNUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3816
            },
            {
              "date": "2025-12-15",
              "person": "MURAT OZDEN",
              "detail": "29 BMK CEMBERLEME MAKINESI HORTUM EMNIYET KLIPSLERI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3833
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "19 BMK ACICI BOLGESINDE HIDROLIK YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3889
            },
            {
              "date": "2025-12-23",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME AYAGI MOTOR SOKULMUS YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3943
            },
            {
              "date": "2025-12-23",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA ONCESI ROLE YOLU UZERINDE SENSOR ONU BASINCLI HAVA ARIZALI OLDUGUNDAN CAPAK GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3954
            },
            {
              "date": "2025-12-25",
              "person": "MURAT OZDEN",
              "detail": "ESKI CNC ALANINDA BULUNAN METAL HURDA PARCALARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3992
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "19 BMK DAVLAMBAZ YETERI KADAR CEKMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4003
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "18 BMK DAVLAMBAZ YETERI KADAR CEKMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4004
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "2. BMK DAVLUMBAZ EMIS ZAYIFTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4041
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 111,
          "missing": 30,
          "missingRate": 27.03,
          "items": [
            {
              "date": "2025-03-11",
              "person": "ALPARSLAN DURMUSCAN",
              "detail": "MANUEL PAKETLEME ALANI CEMBER MAKINESINE GIDEN BASINCLI HAVA HORTUMU YURUYUS YOLUNDAN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 809
            },
            {
              "date": "2025-03-20",
              "person": "ALPARSLAN DURMUSCAN",
              "detail": "4. BOYAMA COIL BAGLANTISI MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 923
            },
            {
              "date": "2025-05-29",
              "person": "AYSE NUR UYE",
              "detail": "1. BOYAMA MAKINESI GIRIS SEHPASI TAKOZLAR MAKINEYE DESTEK AMACLI KONULMUS TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1680
            },
            {
              "date": "2025-06-16",
              "person": "ALPARSLAN DURMUSCAN",
              "detail": "6' OFFLINE ROLE YOLU YURUYUS YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1811
            },
            {
              "date": "2025-06-16",
              "person": "AYSE NUR UYE",
              "detail": "3. HIDROTEST TRANSFER ARACI TAMPONU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1822
            },
            {
              "date": "2025-06-30",
              "person": "YASIN TOPBAS",
              "detail": "3. HIDROTEST ALANINDA BULUNAN EL ARABASININ 1 TEKERI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1950
            },
            {
              "date": "2025-07-04",
              "person": "YASIN TOPBAS",
              "detail": "3. BOYAMA PAKETLEME ONCESI ALANDA BULUNAN SERBEST MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2005
            },
            {
              "date": "2025-07-08",
              "person": "YASIN TOPBAS",
              "detail": "ISLEM HATLARI OFIS ONUNDE BULUNAN UZATMA KABLOSUNDA ACIKLIK MEVCUTTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2043
            },
            {
              "date": "2025-07-28",
              "person": "YASIN TOPBAS",
              "detail": "ISLEM HATLARI OFIS CIVARI YURUYUS YOLUNA KONULAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2265
            },
            {
              "date": "2025-08-11",
              "person": "ILYAS GEZER",
              "detail": "OFFLINE TAVLAMA CIVARINDA BULUNAN KIMYASAL MALZEMELER DAHA GUVENLI ALANDA MUHAFAZA EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2442
            },
            {
              "date": "2025-08-12",
              "person": "AYSENUR UYE",
              "detail": "4. BOYAMA BASINCLI HAVA PANOLARININ KAPAKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2461
            },
            {
              "date": "2025-08-19",
              "person": "YASIN TOPBAS",
              "detail": "OTOMATIK DOGRULTMA YURUME YOLUNDA BULUNAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2529
            },
            {
              "date": "2025-09-01",
              "person": "MURAT OZDEN",
              "detail": "MANUEL PAKETLEMEDE YAPILAN ISTIFLER TEHLIKE OLULTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2617
            },
            {
              "date": "2025-09-02",
              "person": "YASIN TOPBAS",
              "detail": "DOGRULTMA GIRIS KAPISI ONUNDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2623
            },
            {
              "date": "2025-09-22",
              "person": "AYSENUR UYE",
              "detail": "4. BOYAMA GIRIS BOLGESINDE BULUNAN PAKETLERIN CEMBERLERI GEVSEK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2911
            },
            {
              "date": "2025-10-08",
              "person": "YASIN TOPBAS",
              "detail": "OTOMATIK DOGRULTMA GIRIS KAPISINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3113
            },
            {
              "date": "2025-10-14",
              "person": "ILYAS GEZER",
              "detail": "M1 TAVLAMA HOLU PANJUR SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3171
            },
            {
              "date": "2025-10-16",
              "person": "AYSENUR UYE",
              "detail": "4. BOYAMA KABINI ONCESI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3206
            },
            {
              "date": "2025-11-03",
              "person": "YASIN TOPBAS",
              "detail": "OTOMATIK DOGRULTMA ALANI MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3384
            },
            {
              "date": "2025-11-12",
              "person": "MURAT OZDEN",
              "detail": "ISLEM HATLARI MANUEL PAKETLEME CEMBERLEME YANI YUKSEK ISTIF TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3490
            },
            {
              "date": "2025-11-18",
              "person": "AYSENUR UYE",
              "detail": "44 NOLU TAVLAMA BACASI ILE FAN BAGLANTI NOKTASI TAM OTURMAMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3555
            },
            {
              "date": "2025-12-01",
              "person": "BERKAY ASLAN",
              "detail": "3. HIDROTEST ALANI MAZGAL SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3686
            },
            {
              "date": "2025-12-08",
              "person": "ILYAS GEZER",
              "detail": "21 NUMARALI KAPININ PERVAZI KIRILMIS TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3768
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "6' OFFLINE SOGUTMA KABINI ZEMIN KAYGAN",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3834
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "6' OFFLINE HIDROTEST ALANI GEMICI MERDIVENI ICIN YAPILAN PLATFORMDA GECISI ENGELLEYEN PROFIL TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3836
            },
            {
              "date": "2025-12-18",
              "person": "AYSENUR UYE",
              "detail": "1. BOYAMA KABINI UZERINDE BULUNAN DONER AKSAM MUHAFAZASI YETERLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3882
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "15 BMK TAVLAMA BOLGESI ATIKLAR TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3926
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "OFFLINE DEPO ALANI TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3931
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "4' OFFLINE BOLGESI MALZEMELER TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3933
            },
            {
              "date": "2025-12-22",
              "person": "CEMIL BALIKCI",
              "detail": "4' OFFLINE ARKAS MALZEMELER TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3934
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 310,
          "missing": 28,
          "missingRate": 9.03,
          "items": [
            {
              "date": "2025-02-05",
              "person": "AYSE NUR UYE",
              "detail": "25 BMK FLOOP GIRISINDE BANTA EL ILE MUDAHALE ZORUNLULUGU BULUNMAKTADIR. GEREKLI KONTROLLER YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 396
            },
            {
              "date": "2025-04-08",
              "person": "YAHYA KORKMAZ",
              "detail": "27 BMK ICIN KILITLI KAZAN IHTIYACI VAR. KULLANILAN KAZANLARIN KILIT SISTEMI YOK. TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1112
            },
            {
              "date": "2025-07-16",
              "person": "MURAT OZDEN",
              "detail": "29 BMK KAYNAK CAPAGI ICIN PRES BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2110
            },
            {
              "date": "2025-07-16",
              "person": "AYSENUR UYE",
              "detail": "24 ILE 26 BMK ARASINDA BULUNAN 2. KALITE ISTIF AYAKLARINA SABIT MERDIVEN MONTAJI YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2111
            },
            {
              "date": "2025-07-24",
              "person": "BURAK OZASLAN",
              "detail": "1 BMK HAVSA ACMA ALANI CAPAKLAR GECIS NOKTASINA GELIYOR MUHAFAZA YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2231
            },
            {
              "date": "2025-08-01",
              "person": "AYSENUR UYE",
              "detail": "29 BMK TAVLAMA MAKINE ARKASINDA BULUNAN ZEMIN ACIKLIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2328
            },
            {
              "date": "2025-08-04",
              "person": "AYSENUR UYE",
              "detail": "29 BMK TAVLAMA MAKINE ARKASINDA BULUNAN ICI SIVI DOLU VARIL ETRAFINA KORKULUK MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2341
            },
            {
              "date": "2025-08-04",
              "person": "AYSENUR UYE",
              "detail": "29 BMK TAVLAMA MAKINE ARKASINDA BULUNAN PLATFORM YERE SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2342
            },
            {
              "date": "2025-09-03",
              "person": "AYSENUR UYE",
              "detail": "29 BMK PAKETLEMEDE BULUNAN SAC ZEMIN KAYGAN YUZEYE SAHIP",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2657
            },
            {
              "date": "2025-09-15",
              "person": "AYSENUR UYE",
              "detail": "25 BMK FLOOP ICERISINDE BANT DISARIYA DOGRU SARKMA YAPIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2817
            },
            {
              "date": "2025-09-25",
              "person": "AYSENUR UYE",
              "detail": "29 BMK CALISMA ALANINDA HURDA BANTLAR ICIN ETRAFI SINIRLANDIRILMIS ALAN YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2958
            },
            {
              "date": "2025-10-30",
              "person": "MURAT OZDEN",
              "detail": "29 BMK CAPAK PRES IHTIYACI BULUNMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3351
            },
            {
              "date": "2025-11-17",
              "person": "MURAT OZDEN",
              "detail": "29 BMK ACICI ALANINDA BULUNAN BANT ATIKLARI VE MALZEMELR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3533
            },
            {
              "date": "2025-11-17",
              "person": "MURAT OZDEN",
              "detail": "29 BMK BANT ATIKLARI ICIN TANIMLI ALAN BELIRLENMELI VE ALANI SINIRLANDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3534
            },
            {
              "date": "2025-12-01",
              "person": "MURAT OZDEN",
              "detail": "29 BMK PAKETLEME SEHPASINA KISA MALZEMELERE GUVENLI MUDAHALE ICIN PLATFORM MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3705
            },
            {
              "date": "2025-12-01",
              "person": "BERKAY ASLAN",
              "detail": "29 BMK PAKETLEME CEMBERLEME ALANINDA BULUNAN ROLE YOLU ACIKLIGI TEHLIKE OLUSTURUYOR. SENSORLU KAPI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3707
            },
            {
              "date": "2025-12-02",
              "person": "MURAT OZDEN",
              "detail": "24 BMK KALIBRE ICIN PORTATIF MERDIVEN GEREKIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3730
            },
            {
              "date": "2025-12-08",
              "person": "ILYAS GEZER",
              "detail": "1 BMK ROLE YOLUNDA BULUNAN MERDIVENIN BASAMAKLARI KAYGAN",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3766
            },
            {
              "date": "2025-12-15",
              "person": "MURAT OZDEN",
              "detail": "29 BMK MALZEME SECME ALANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3844
            },
            {
              "date": "2025-12-16",
              "person": "BERKAY ASLAN",
              "detail": "25 BMK PAKETLEME YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3858
            },
            {
              "date": "2025-12-17",
              "person": "MURAT OZDEN",
              "detail": "29 BMK YUKLEME HOLUNE KONULAN CAPAK ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3874
            },
            {
              "date": "2025-12-17",
              "person": "AYSENUR UYE",
              "detail": "29 BMK CEMBERLEME NOKTASINDA PERSONELIN UZERINDE CIKTIGI PLATFORM UYGUN DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3875
            },
            {
              "date": "2025-12-23",
              "person": "AYSENUR UYE",
              "detail": "29 BMK CALISMA ALANINDA BULUNAN MANUEL PAKETLEME SEHPASININ TEKERLEGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3965
            },
            {
              "date": "2025-12-25",
              "person": "BERKAY ASLAN",
              "detail": "29 BMK BOYAMA BOLUMUNDE BULUNAN IBC PLATFORMUNDA KAYMAYA KARSI TUPUKLUK YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3987
            },
            {
              "date": "2025-12-26",
              "person": "AYSENUR UYE",
              "detail": "25 BMK FLOOP MOTOR DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4025
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "27. BMK GIRISINDE BULUNAN BANT SEHPA DESTEK AYAGI KIRILMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4044
            },
            {
              "date": "2025-12-29",
              "person": "AYSENUR UYE",
              "detail": "26.BMK YURUME YOLUNDA MALZEMELER GECISI ENGELLEMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4063
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "24. BMK FLOOP SEPETI BANT GIRISINI KAPATAN MUHAFAZA ZARAR GORMUSTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4086
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 328,
          "missing": 14,
          "missingRate": 4.27,
          "items": [
            {
              "date": "2025-04-23",
              "person": "ORHAN KURT",
              "detail": "3 NOLU TRANSFER ARACININ FREN SISTEMI CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1312
            },
            {
              "date": "2025-05-02",
              "person": "ORHAN KURT",
              "detail": "1. 2. DILME ARASINDA BULUNAN TRANSFER ARACININ FREN SISTEMI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1391
            },
            {
              "date": "2025-05-28",
              "person": "FATIH ATLAS",
              "detail": "4' OFFLINE HIDROTEST UZERINDEKI YURUME YOLU BAGLANTI DEMIRIN ALT CIVATASI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1659
            },
            {
              "date": "2025-07-11",
              "person": "ILYAS GEZER",
              "detail": "ARKA SOYUNMA ODASINDA Y. TESISLER BIRIMINE AIT MERDIVENIN MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2077
            },
            {
              "date": "2025-07-28",
              "person": "ERSIN BAGRIYANIK",
              "detail": "29 BMK BOR YAG VANASI VE BORUSU, VINC ILE KALDIRMA ESNASINDA CAPMA OLASILIGINA KARSIN MUHAFAZA YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2276
            },
            {
              "date": "2025-08-22",
              "person": "AYSENUR UYE",
              "detail": "11 BMK TAVLAMA MAKINE ARKASINDAKI SOGUTMA MUSLUGU ULASILABILIR BIR YERE TASINMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2565
            },
            {
              "date": "2025-09-01",
              "person": "MURAT OZDEN",
              "detail": "10. BMK CIVARINDA ZEMIN USTUNDEN GECEN BOR YAG HATTI TEHLIKE OLUSTURUYOR. MUHAFAZA VE BOYAMA FARKINDALIK CALISMASI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2609
            },
            {
              "date": "2025-11-14",
              "person": "UMIT KARABULUT",
              "detail": "ANA HOLDE BULUNAN TRANSFER ARACI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3510
            },
            {
              "date": "2025-11-24",
              "person": "AYSENUR UYE",
              "detail": "9 BMK TESTERE SONRASI ZEMIN USTUNDEN YUKSEK GECIRILEN BOR YAG HATTI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3608
            },
            {
              "date": "2025-12-09",
              "person": "MURAT OZDEN",
              "detail": "SU TESISLERI OFIS KAPISI, E. PANOLARI VE BILGISAYARI ACIK BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3778
            },
            {
              "date": "2025-12-12",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME TRANSFER ARACI KUMANDA BUTONLARI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3819
            },
            {
              "date": "2025-12-18",
              "person": "MURAT OZDEN",
              "detail": "9,10,11,12 BMK ZEMIN USTUNDEN GECEN BORULAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3877
            },
            {
              "date": "2025-12-26",
              "person": "MURAT OZDEN",
              "detail": "9,10,11,12 BMK ZEMIN USTUNDEN GECEN BORULAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4024
            },
            {
              "date": "2025-12-30",
              "person": "AYSENUR UYE",
              "detail": "22.BMK TESTERE SONRASI ROLE YOLU YANINDA BULUNAN SU HATTINDA KACAK MEVCUTTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4079
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 290,
          "missing": 10,
          "missingRate": 3.45,
          "items": [
            {
              "date": "2025-02-13",
              "person": "KAMIL OZKAYA",
              "detail": "20 BMK PAKETLEME 2. KALITE ATMA APARATI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 468
            },
            {
              "date": "2025-02-13",
              "person": "KAMIL OZKAYA",
              "detail": "18 BMK ACICIDA UST BASKI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 470
            },
            {
              "date": "2025-02-13",
              "person": "KAMIL OZKAYA",
              "detail": "18 BMK PAKETLEME 2. KALITE ATMA APARATI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 471
            },
            {
              "date": "2025-02-13",
              "person": "KAMIL OZKAYA",
              "detail": "21 BMK ACICI UST BASKI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 472
            },
            {
              "date": "2025-05-13",
              "person": "AYSE NUR UYE",
              "detail": "17 BMK HAVSALAMA SONRASI VARIL BOSALTMA ISLEMI ICIN PLATFORM MONTAJI GEREKIYOR. PERSONEL VARIL UZERINE CIKARAK BU ISLEMI YAPIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1461
            },
            {
              "date": "2025-07-02",
              "person": "MURAT OZDEN",
              "detail": "20. BMK DIKEY FLOOPTA YUKSEKTE CALISMA ICIN PLATFORM-ANKRAJ NOKTALARI-YATAY YASAM HATTI MONTAJI YAPILMALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1976
            },
            {
              "date": "2025-07-17",
              "person": "AYSENUR UYE",
              "detail": "21 ILE 23 BMK ARASINDA BULUNAN 2. KALITE AYAKLARINA SABIT MERDIVEN MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2136
            },
            {
              "date": "2025-07-21",
              "person": "AYSENUR UYE",
              "detail": "22 BMK 2. KALITE ISTIF AYAKLARINA SABIT MERDIVEN MONTAJI YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2180
            },
            {
              "date": "2025-11-20",
              "person": "MURAT OZDEN",
              "detail": "17 BMK PAKETLEME BOLUMU ZEMINDE BULUNAN BORU CIKINTISI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3584
            },
            {
              "date": "2025-12-26",
              "person": "MURAT OZDEN",
              "detail": "19 BMK HAVSA KAFA MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4023
            }
          ]
        },
        {
          "department": "E. BAKIM-2",
          "total": 215,
          "missing": 7,
          "missingRate": 3.26,
          "items": [
            {
              "date": "2025-06-24",
              "person": "AYSE NUR UYE",
              "detail": "BORU MAKINELERI ADP LERDE BULUNAN BESLEME GIRISI VE ACIKLIGININ IZOLASYON ILE KAPATILMASI GEREKMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1910
            },
            {
              "date": "2025-07-25",
              "person": "YASIN TOPBAS",
              "detail": "ERW AMBAR ALANINDA AYDINLATMALAR YANMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2242
            },
            {
              "date": "2025-09-19",
              "person": "YASIN TOPBAS",
              "detail": "27 BMK ACICI KONTROL PANOSU KAPAGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2876
            },
            {
              "date": "2025-10-06",
              "person": "YASIN TOPBAS",
              "detail": "TOZ EPOKSI CEMBERLEME ONCESI SEHPA ALANI ALT KISIMDA BULUNAN KABLO TAVASININ MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3079
            },
            {
              "date": "2025-12-15",
              "person": "AYSENUR UYE",
              "detail": "ASIT HAVUZU GIRISI OPER PANOSU TUSLARI TANIMLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 3832
            },
            {
              "date": "2025-12-27",
              "person": "AYSENUR UYE",
              "detail": "19. BMK PAKETLEME ELK. PANOSU KAPAGI ZARAR GORMUSTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4046
            },
            {
              "date": "2025-12-31",
              "person": "BERKAY ASLAN",
              "detail": "PAHLAMA BOLGESI OPERATOR PANOSU BUTON ETIKETLERI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4091
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 197,
          "missing": 5,
          "missingRate": 2.54,
          "items": [
            {
              "date": "2025-07-16",
              "person": "AYSENUR UYE",
              "detail": "10 BMK BOYAMA SEHPASI KORKULUGU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2106
            },
            {
              "date": "2025-07-16",
              "person": "AYSENUR UYE",
              "detail": "9 ILE 10 BMK ARASINDA BULUNAN 1 NOLU 2. KALITE ISTIF AYAKLARINA SABIT MERDIVEN MONTAJI YAPILMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2112
            },
            {
              "date": "2025-08-04",
              "person": "AYSENUR UYE",
              "detail": "10 BMK BOYAMA SEHPASI KORKULUGU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2348
            },
            {
              "date": "2025-12-26",
              "person": "AYSENUR UYE",
              "detail": "4 BMK TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4016
            },
            {
              "date": "2025-12-30",
              "person": "BERKAY ASLAN",
              "detail": "7. BMK BILGISAYAR DOLABI YANINDA ISTIF MERDIVENI KARTONLA SARILARAK AMACI DISINDA PARAVAN YAPILMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4070
            }
          ]
        },
        {
          "department": "GALVANIZ",
          "total": 80,
          "missing": 4,
          "missingRate": 5,
          "items": [
            {
              "date": "2025-05-26",
              "person": "UMIT KARABULUT",
              "detail": "S5 HOL GALVANIZ BRANDA YIRTILMIS KOPMAK UZERE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1637
            },
            {
              "date": "2025-08-11",
              "person": "ILYAS GEZER",
              "detail": "ASIT HAVUZU UZERINDE YERE KONULMUS 3 PROFIL TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2450
            },
            {
              "date": "2025-09-15",
              "person": "ILYAS GEZER",
              "detail": "GALVANIZ CATIDA BACAYA ULASIM ICIN KULLANILAN MERDIVEN TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2814
            },
            {
              "date": "2025-12-26",
              "person": "BERKAY ASLAN",
              "detail": "GALVANIZ E AIT FORKLIFT IN YAN AYNALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 4000
            }
          ]
        },
        {
          "department": "GES",
          "total": 26,
          "missing": 3,
          "missingRate": 11.54,
          "items": [
            {
              "date": "2025-05-29",
              "person": "OMER CAN",
              "detail": "28. HOL OFIS YANI CATIDAN SU AKIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1692
            },
            {
              "date": "2025-09-01",
              "person": "ILYAS GEZER",
              "detail": "EK BINA GES CATIYA CIKAN MERDIVEN ONUNDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2619
            },
            {
              "date": "2025-09-26",
              "person": "MURAT OZDEN",
              "detail": "S22 HOLDE SOKULEN CITLERIN TABAN VIDALARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2975
            }
          ]
        },
        {
          "department": "MALZEME YONETIM BIRIMI",
          "total": 3,
          "missing": 3,
          "missingRate": 100,
          "items": [
            {
              "date": "2025-01-24",
              "person": "MURAT OZDEN",
              "detail": "AMBAR KIMYASAL DEPOLAMA ALANI, MATRISE UYGUN SEKILDE AYRISTIRILMALI VE TANIMLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 237
            },
            {
              "date": "2025-09-26",
              "person": "MURAT OZDEN",
              "detail": "EK AMBARDA YSC BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2976
            },
            {
              "date": "2025-09-26",
              "person": "MURAT OZDEN",
              "detail": "KIMYASALLAR ILE YANGIN SONDURUCULERIN BIRLIKTE DEPOLANMASI TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2977
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 42,
          "missing": 1,
          "missingRate": 2.38,
          "items": [
            {
              "date": "2025-09-01",
              "person": "ILYAS GEZER",
              "detail": "EK BINADA YAPILAN SEMERLER DAHA GUVENLI BIR ALANA ISTIFLENMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 2621
            }
          ]
        }
      ]
    },
    "durum-kaynakli-kazalar": {
      "total": 233,
      "missing": 56,
      "missingRate": 24.03,
      "departments": [
        {
          "department": "DILME",
          "total": 31,
          "missing": 13,
          "missingRate": 41.94,
          "items": [
            {
              "date": "2025-01-02",
              "person": "HACI AHMET SAHIN",
              "detail": "FIRE BATMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-01-28",
              "person": "GOKHAN BASPINAR",
              "detail": "BANT KESMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-24",
              "person": "MUHAMMED RESUL AKINCI",
              "detail": "BOBIN DEMIRINE CARPMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-26",
              "person": "ALI KAYA",
              "detail": "BURKULMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-03-04",
              "person": "ILYAS EKINCI",
              "detail": "BANT UCUNUN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-04-10",
              "person": "UMUT AKDEMIR",
              "detail": "CAPAK BATMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-04-12",
              "person": "MUSTAFA ALAOGLU",
              "detail": "CEMBERIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-05-03",
              "person": "HIDIR YULEK",
              "detail": "SEHPA UCUNUN DUSMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-05-29",
              "person": "YAKUP SARI",
              "detail": "REDUKTOR CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-09-03",
              "person": "ILKER KARA",
              "detail": "BANT KESMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-09-05",
              "person": "MEHMET ALI KURTUL",
              "detail": "FIRENIN DUSMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-11-15",
              "person": "HACI AHMET SAHIN",
              "detail": "YABANCI CISIM KACMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-12-09",
              "person": "MESUT ATES",
              "detail": "FIRENIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 41,
          "missing": 9,
          "missingRate": 21.95,
          "items": [
            {
              "date": "2025-01-05",
              "person": "KADIR SEN",
              "detail": "BURKULMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-01-11",
              "person": "SULEYMAN DEMIR",
              "detail": "TINER SICRAMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-01-23",
              "person": "AHMET MERT",
              "detail": "SARJLI MOTORDAN DUSMEK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-03-05",
              "person": "KADIR SEN",
              "detail": "BANT CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-03-15",
              "person": "DURDU MEHMET KARAGOZ",
              "detail": "MALZEMENIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-08-31",
              "person": "HARUN TATAR",
              "detail": "MAZGAL ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-09-27",
              "person": "KADIR CELIK",
              "detail": "SPIRALIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-10-24",
              "person": "OMER SUNTUR",
              "detail": "MAZGALIN ICINE DUSMEK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-12-08",
              "person": "YUNUS AGAR",
              "detail": "CAPAK KESMESI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 24,
          "missing": 6,
          "missingRate": 25,
          "items": [
            {
              "date": "2025-01-17",
              "person": "RAMAZAN GUNEY",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-22",
              "person": "IBRAHIM TUT",
              "detail": "DEMIRE CARPMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-03-29",
              "person": "ISMAIL UGUR",
              "detail": "CAPAK KESMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-04-29",
              "person": "CENGIZHAN KADIOGLU",
              "detail": "MALZEMENIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-05-03",
              "person": "ALI AKMAN",
              "detail": "MAZGAL CUKURUNA DUSMEK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-10-20",
              "person": "MIKAIL KUPELI",
              "detail": "BORU ILE SEHPA ARASI SIKISMA",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 21,
          "missing": 6,
          "missingRate": 28.57,
          "items": [
            {
              "date": "2025-01-27",
              "person": "KAAN DURAN",
              "detail": "SAC CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-04-14",
              "person": "BAHRI CIHAN ALTINSOZ",
              "detail": "YAG ILE TEMAS",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-07-11",
              "person": "BESIR SEN",
              "detail": "PROFILIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-08-26",
              "person": "HACI MUSTAFA GERCINCI",
              "detail": "CAPAK SICRAMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-09-10",
              "person": "BURAK OZDEMIR",
              "detail": "BURKULMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-11-20",
              "person": "FAHRI ARIK",
              "detail": "SPIRAL ILE TEMAS",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 18,
          "missing": 5,
          "missingRate": 27.78,
          "items": [
            {
              "date": "2025-01-04",
              "person": "MEHMET KOROGLU",
              "detail": "AYNA ILE KOL ARASI SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-14",
              "person": "AHMET YASIN OZTURK",
              "detail": "IKI MIL ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-20",
              "person": "HALIL IBRAHIM KAYA",
              "detail": "ANAHTARIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-04-12",
              "person": "MUSTAFA ABAY",
              "detail": "SENSOR APARATININ CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-12-18",
              "person": "YASIN SAMAGAN",
              "detail": "CEKIC ILE VURMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 14,
          "missing": 4,
          "missingRate": 28.57,
          "items": [
            {
              "date": "2025-04-12",
              "person": "BULENT KOMUC",
              "detail": "MALZEME ILE MAKARA ARASI SIKISMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-05-01",
              "person": "SULEYMAN MUTLU USTA",
              "detail": "SACIN KESMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-08-20",
              "person": "OMER PANAVUR",
              "detail": "ANAHTARIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-08-23",
              "person": "MUSA YAZGAN",
              "detail": "BORU AGZININ KESMESI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 24,
          "missing": 4,
          "missingRate": 16.67,
          "items": [
            {
              "date": "2025-01-27",
              "person": "OSMAN KASTAL",
              "detail": "MEKANIK PARCA DUSMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-03-01",
              "person": "IBRAHIM ALKILINC",
              "detail": "PROFILIN DUSMESI VE CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-05-07",
              "person": "ENES KAS",
              "detail": "MALZEMENIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-06-20",
              "person": "FURKAN SARICICEK",
              "detail": "MALZEME VE TAMPON ARASINDA SIKISMA",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 33,
          "missing": 4,
          "missingRate": 12.12,
          "items": [
            {
              "date": "2025-01-25",
              "person": "MIKAIL BORK",
              "detail": "CEMBERIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-02-07",
              "person": "IBRAHIM KINIS",
              "detail": "TAKILIP DUSMEK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-10-23",
              "person": "HUSEYIN KAMISKIRAN",
              "detail": "MALZEMEYE CARPMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-11-24",
              "person": "RAMAZAN DEMIRKAN",
              "detail": "PROFILE CARPMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "E. BAKIM",
          "total": 3,
          "missing": 2,
          "missingRate": 66.67,
          "items": [
            {
              "date": "2025-06-23",
              "person": "IBRAHIM TURKOGLU",
              "detail": "ELEKTRIK CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2025-08-18",
              "person": "ALI MUHSIN UZUN",
              "detail": "ELEKTRIK CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 8,
          "missing": 1,
          "missingRate": 12.5,
          "items": [
            {
              "date": "2025-01-13",
              "person": "EMRE GULSEN",
              "detail": "MALZEMENIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "KALITE KONTROL",
          "total": 6,
          "missing": 1,
          "missingRate": 16.67,
          "items": [
            {
              "date": "2025-03-11",
              "person": "ERDEM MEHMELET",
              "detail": "KIMYASAL ILE TEMAS",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 6,
          "missing": 1,
          "missingRate": 16.67,
          "items": [
            {
              "date": "2025-01-17",
              "person": "MEHMET ALI OZDEMIR",
              "detail": "SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        }
      ]
    },
    "ramak-kala": {
      "total": 408,
      "missing": 15,
      "missingRate": 3.68,
      "departments": [
        {
          "department": "M. BAKIM",
          "total": 57,
          "missing": 6,
          "missingRate": 10.53,
          "items": [
            {
              "date": "2025-08-22",
              "person": "SERKAN DALKILIC",
              "detail": "5. BMK TESTERE KIRILMASI SONUCU MAKINENIN DURMAMASI SONUCU MALZEMENIN YIGMA YAPMASI.(YIGMA SENSORUNUN DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-08-26",
              "person": "YUNUS ALPAR",
              "detail": "14 BMK TESTEREDE MALZEMENIN YIGMA YAPMASI.(TESTERE ONCESI YIGMA SENSORUNUN DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-10-01",
              "person": "SERKAN DALKILIC",
              "detail": "14 BMK TESTERE KIRILMASI SONUCU MALZEMENIN YIGMA YAPMASI.(SENSOR SASESININ TEMIN EDILMESI VE SENSORUN DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-10-18",
              "person": "AYSE NUR UYE",
              "detail": "11. DILME BICAK KISMINDA BULUNAN MIL'IN FIRLAMASI(KONTROLLERIN YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-10-22",
              "person": "AYSE NUR UYE",
              "detail": "5. BOYAMA MAKINESI PAKETLEME ASANSORUNDE MALZEMENIN PAKETLEMEYE GELMEDEN ASAGIYA DUSMESI.(EKSIK ASANSOR AYAKLAARININ TAMAMLANMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-12-16",
              "person": "AYSE NUR UYE",
              "detail": "13 BMK PAKETLEME ONCESI ROLE YOLUNDA MALZEMENIN YIGMA YAPMASI(SENSOR SASESININ TAKILMASI VE SENSORUN DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 81,
          "missing": 3,
          "missingRate": 3.7,
          "items": [
            {
              "date": "2025-09-10",
              "person": "ALI DONMEZ",
              "detail": "S12 HOLUNCE CEMBER PATLAMASI SONUCU ISTIF AYAGI OLMADIGINDAN ANA HOLE YAPILAN ISTIFLERE KADAR PAKETLERIN DEVRILMESI.(CEMBER MAKINESININ KONTROL EDILMESI VE ISTIF AYAGI MONTAJI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-11-13",
              "person": "MURAT OZDEN",
              "detail": "DOGRULTMA GIRISINDE MANEVRA ESNASINDA ROMORKUN DEVRILMESI.(SEVKIYAT VE YORULMAZ TASIMACILIK'A EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-12-09",
              "person": "HAKAN ALGUL",
              "detail": "18. YUKLEME HOLUNDE TRAKTOR ILE ROMORKUN DONUSU SIRASINDA ROMORKUN DEVRILMESI.(EGITIM VERILMESI VE ROMORKUN BAKIMININ YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 21,
          "missing": 2,
          "missingRate": 9.52,
          "items": [
            {
              "date": "2025-04-09",
              "person": "METINCAN SARI",
              "detail": "12 BMK 3 NOLU VINC HALATI KANCA KAPAKTAN SIYRILMASI SONUCU KANCA DUSMUSTUR.(VINC KONTROL FORMLARININ DOLDURULMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2025-12-18",
              "person": "AHMET YASIN OZTURK",
              "detail": "9 BMK TESTERE SONRASI MERDIVENIN ASIRI YAGLI OLMASI NEDENIYLE AYAGIMIN KAYMASI DUSMEYE RAMAK KALMASI(MERDIVEN IZGARALARININ REVIZYON YAPILMASI VE TEMIZLIK YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "E. BAKIM-1",
          "total": 24,
          "missing": 1,
          "missingRate": 4.17,
          "items": [
            {
              "date": "2025-12-01",
              "person": "SEFA KURT",
              "detail": "ENERJININ KESILMESI SONUCU PERSONELLERIN KAZA GECIRMESINE RAMAK KALMASI.(ACIL DURUM AYDINLATMASININ DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "E. BAKIM-2",
          "total": 13,
          "missing": 1,
          "missingRate": 7.69,
          "items": [
            {
              "date": "2025-12-01",
              "person": "SEFA KURT",
              "detail": "ENERJININ KESILMESI SONUCU PERSONELLERIN KAZA GECIRMESINE RAMAK KALMASI.(ACIL DURUM AYDINLATMASININ DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 7,
          "missing": 1,
          "missingRate": 14.29,
          "items": [
            {
              "date": "2025-09-01",
              "person": "MURAT OZDEN",
              "detail": "6' HIDROTEST 'TE KAYNAK KISMI BOZUK BORUNUN TEST SIRASINDA KAYNAK YERININ ACILMASI SONUCU TEST SIVISININ TAZZIKLI SEKILDE YAKLASIK 10M KADAR(KOLONDA BULUNAN CADIRA KADAR) SICRAMASI.(BU TUR DURUMLARDA TEST SIVISININ ETRAFA SACILMASINI ENGELLEYICI MUHAFAZA/BARIYER VB. SISTEM YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 18,
          "missing": 1,
          "missingRate": 5.56,
          "items": [
            {
              "date": "2025-10-29",
              "person": "ALI RIZA KORPE",
              "detail": "17 BMK ACICI YANINDA BULUNAN C KANCA SEHPASININ SABIT OLMAMASI NEDENIYLE KANCA TAKMA ESNASINDA BASINCLI TUPLERE CARPMASI VE BASINCLI TUPLERIN DEVRILMESI.(C KANCA SEHPASININ UYGUN YERE ZEMINE SAGLAM SEKILDE YAPILMASI VE KAFESIN TAMIR EDILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        }
      ]
    },
    "ifade-gelmeyen": {
      "total": 233,
      "missing": 25,
      "missingRate": 10.73,
      "departments": [
        {
          "department": "DILME",
          "total": 31,
          "missing": 5,
          "missingRate": 16.13,
          "items": [
            {
              "date": "2025-07-23",
              "person": "HASAN SENOL",
              "detail": "FIRE DUSMESI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-09-01",
              "person": "AHMET GOZ",
              "detail": "SARICI ARABA CUKURUNA DUSMEK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-09-04",
              "person": "BILGEHAN KAPLAN",
              "detail": "SARICI ILE BANT ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-12",
              "person": "SEFA SOLAK",
              "detail": "BALYOZ SAPI ILE KUREK ARASI SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-26",
              "person": "YASAR ALTINTOP",
              "detail": "SEPERATOR ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 24,
          "missing": 4,
          "missingRate": 16.67,
          "items": [
            {
              "date": "2025-08-22",
              "person": "SINAN KUNDAKCI",
              "detail": "BORU ILE MAKARA ARASINDA SIKISTIRMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-08-31",
              "person": "KOCALI YIR",
              "detail": "KUREK SAPININ CARPMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-17",
              "person": "OZKAN AKOGUL",
              "detail": "CAPAK SICRAMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-12-13",
              "person": "ADEM DINDORUK",
              "detail": "BURKULMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 8,
          "missing": 4,
          "missingRate": 50,
          "items": [
            {
              "date": "2025-01-10",
              "person": "ALI ULVI GUNSUR",
              "detail": "KAYIP DUSMEK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-10-12",
              "person": "MURAT TEKIN",
              "detail": "MERDIVENDEN DUSMEK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-01",
              "person": "ALI GELDI",
              "detail": "BORU ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-12-10",
              "person": "SULEYMAN KARATAS",
              "detail": "PROFIL DUSMESI",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 33,
          "missing": 4,
          "missingRate": 12.12,
          "items": [
            {
              "date": "2025-10-09",
              "person": "SAMET ODMAN",
              "detail": "ISTIF AYAGINA CARPMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-07",
              "person": "ZEKI ASLAN",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-12-08",
              "person": "MUSTAFA ASKAR",
              "detail": "BURKULMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-12-30",
              "person": "HIDAYET ARSLAN",
              "detail": "BURKULMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 41,
          "missing": 2,
          "missingRate": 4.88,
          "items": [
            {
              "date": "2025-12-22",
              "person": "ALI ERDEN",
              "detail": "BANT DUSMESI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-12-31",
              "person": "KADIR OZBERMEK",
              "detail": "MALZEMENIN CARPMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 21,
          "missing": 2,
          "missingRate": 9.52,
          "items": [
            {
              "date": "2025-08-06",
              "person": "OZGUR KUS",
              "detail": "MALZEMEYE CARPMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-11-15",
              "person": "MEHMET ALI MENGILLI",
              "detail": "CEKIC ILE VURMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 6,
          "missing": 2,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2025-07-23",
              "person": "ALI ERBAKICI",
              "detail": "KIMYASAL ILE TEMAS",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2025-08-22",
              "person": "ALI ERBAKICI",
              "detail": "POMPA ARASINDA SIKISTIRMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 24,
          "missing": 1,
          "missingRate": 4.17,
          "items": [
            {
              "date": "2025-12-27",
              "person": "EBUTALHA UCAR",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 18,
          "missing": 1,
          "missingRate": 5.56,
          "items": [
            {
              "date": "2025-08-26",
              "person": "OMER BAYTEKIN",
              "detail": "FIZIKSEL ZORLANMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        }
      ]
    },
    "sari-kart-gelmeyen": {
      "total": 535,
      "missing": 50,
      "missingRate": 9.35,
      "departments": [
        {
          "department": "DILME",
          "total": 37,
          "missing": 17,
          "missingRate": 45.95,
          "items": [
            {
              "date": "2025-02-21",
              "person": "SINAN CAPAR",
              "detail": "IS KAZASINA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-04-02",
              "person": "MEHMET CEYHAN",
              "detail": "RAMAK KALA OLAYA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-06-05",
              "person": "CUMHUR UZAL",
              "detail": "C KANCA ILE BANT SEHPASINI TALIMATLARA AYKIRI SEKILDE TASIMA YAPMISTIR.",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-20",
              "person": "SINAN CAPAR",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-29",
              "person": "KADIR TURK",
              "detail": "ES ZAMANLI 2 VINC ILE RULO TASIMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-08",
              "person": "FIKRET ASLANER",
              "detail": "ZEMINE TAKOZSUZ BANT KOYMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-13",
              "person": "AHMET DERELIOGLU",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-18",
              "person": "MEHMET CEYHAN",
              "detail": "BANTLARI SEHPA DISINA KOYMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-27",
              "person": "NECMETTIN ACIK",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-27",
              "person": "AHMET DERELIOGLU",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-09-03",
              "person": "ILYAS EKINCI",
              "detail": "REVIR MUDAHALELI OLAYA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-05",
              "person": "HASAN SENOL",
              "detail": "E. KEMERI OLMADAN YUKSEKTE CALISMA YAPMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-12",
              "person": "OSMAN IYIN",
              "detail": "MUKAVVA CEMBER ATARKEN KORUYUCU EKIPMAN KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-24",
              "person": "HARUN SANAL",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-24",
              "person": "ALI PEPU",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-08",
              "person": "MEHMET TURKOGLU",
              "detail": "HAREKETLI BANDA EL ILE MUDAHALE ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-09",
              "person": "MESUT ATES",
              "detail": "REVIR MUDAHALELI OLAYA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "GALVANIZ",
          "total": 24,
          "missing": 8,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2025-03-16",
              "person": "KAMIL CALIK",
              "detail": "RAMAK KALA OLAYA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-04-04",
              "person": "HULUSI GUZEL",
              "detail": "CINKO KAZANI ALANINA ISIYA DAYANIKLI KIYAFET OLMADAN GIRMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-04-19",
              "person": "COSKUN AKBUGA",
              "detail": "CINKO KAZANI ALANINA ISIYA DAYANIKLI KIYAFET OLMADAN GIRMEK VE SIPERLIK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-05-02",
              "person": "YUNUS EMRE GOCER",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-05",
              "person": "ISMAIL GUZEL",
              "detail": "KIRMIZI ALAN OLARAK SINIRLANDIRILMIS CINKO HAVUZU BOLUMUNDE ISIYA DAYANIKLI KIYAFET KULLANMAMASI",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-05",
              "person": "YUNUS EMRE ERDINC",
              "detail": "KIRMIZI ALAN OLARAK SINIRLANDIRILMIS CINKO HAVUZU BOLUMUNDE ISIYA DAYANIKLI KIYAFET KULLANMAMASI",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-07",
              "person": "COSKUN AKBUGA",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-19",
              "person": "ISMAIL EKINCI",
              "detail": "BARET TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 51,
          "missing": 8,
          "missingRate": 15.69,
          "items": [
            {
              "date": "2025-03-20",
              "person": "KEMAL DEMIR",
              "detail": "L KANCA ILE HURDA KAZANI TASIMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-05-20",
              "person": "EKREM ONYIG",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-03",
              "person": "SEREF TUFAN",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-06",
              "person": "TUFAN KARAER",
              "detail": "BARET TAKMAMAK VE PERSONELIN MAKINE CALISIRKEN ETKI ALANINDA BULUNMASINA MUDAHALE ETMEMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-11-06",
              "person": "MUSTAFA KEMAL DURSUN",
              "detail": "MAKINE CALISIRKEN ETKI ALANINDA BULUNMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-17",
              "person": "OMER GOROGLU",
              "detail": "CALISAN MAKINENIN ETKI ALANINDA BULUNMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-17",
              "person": "ZAFER DEMIR",
              "detail": "CALISAN MAKINENIN ETKI ALANINDA BULUNMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-18",
              "person": "EMRE KIRAC",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 36,
          "missing": 7,
          "missingRate": 19.44,
          "items": [
            {
              "date": "2025-04-26",
              "person": "AHMET KARTAL",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-05-07",
              "person": "MEHMET ALI TURKER",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-06-17",
              "person": "ABDULKADIR KARACA",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-06-27",
              "person": "SULEYMAN KARATAS",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-07-09",
              "person": "CEBRAIL ERDOGAN",
              "detail": "GOREV YERINI HABER VERMEDEN TERK ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-13",
              "person": "AHMET KARTAL",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-21",
              "person": "ABDULKADIR KARACA",
              "detail": "MESAI SAATLERI ICERISINDE TELEFON ILE MESGUL OLMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 39,
          "missing": 4,
          "missingRate": 10.26,
          "items": [
            {
              "date": "2025-01-24",
              "person": "FATIH KILINC",
              "detail": "SALOMA ILE CALISIRKEN KORUYUCU GOZLUK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-04-17",
              "person": "FATIH CIFCI",
              "detail": "CEMBERLEME FAALIYETI ETKI ALANINDA SIPERLIK TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-08-05",
              "person": "IBRAHIM GOK",
              "detail": "SALOMA ILE CALISIRKEN KORUYUCU GOZLUK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-10-24",
              "person": "ARIF ORSDEMIR",
              "detail": "MUHAFAZA OLMADAN SPIRAL KULLANMAK VE KORUYUCU GOZLUK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 66,
          "missing": 2,
          "missingRate": 3.03,
          "items": [
            {
              "date": "2025-12-27",
              "person": "MUHAMMET ALI GULER",
              "detail": "CALISAN MAKINE UZERINDE ZINCIRE MUDAHELE ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-12-31",
              "person": "BASAR YAVAS",
              "detail": "MAKINE BASINDA COIL DEGISIMI YAPARKEN BARET KULLANMAMASI",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 82,
          "missing": 2,
          "missingRate": 2.44,
          "items": [
            {
              "date": "2025-08-19",
              "person": "CENK OZSOY",
              "detail": "ARAC DORSE UZERINE SOFORUN CIKMASINA MUSAADE ETMEK VE YARDIMCI OLMASINA IZIN VERMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2025-09-03",
              "person": "IBRAHIM OZDEMIR",
              "detail": "5 PAKET KALDIRMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 18,
          "missing": 1,
          "missingRate": 5.56,
          "items": [
            {
              "date": "2025-12-05",
              "person": "HASAN SAPAN",
              "detail": "L KANCAYA TERAZI TAKARAK MALZEME TASIMASI",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 12,
          "missing": 1,
          "missingRate": 8.33,
          "items": [
            {
              "date": "2025-06-16",
              "person": "GURKAN CETIN",
              "detail": "MESAI SAATLERI ICERISINDE UYUMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        }
      ]
    },
    "capraz-denetim": {
      "total": 0,
      "missing": 0,
      "missingRate": 0,
      "departments": []
    }
  },
  "2026": {
    "uygunsuzluk-yillik": {
      "total": 793,
      "missing": 406,
      "missingRate": 51.2,
      "departments": [
        {
          "department": "HAT BORULAR",
          "total": 74,
          "missing": 62,
          "missingRate": 83.78,
          "items": [
            {
              "date": "2026-01-02",
              "person": "AYSENUR UYE",
              "detail": "12. BMK IC YIKAMA ONCESI ROLE YOLU DONEN AKSAM KAYIS-KASNAK MUHAFAZASI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 6
            },
            {
              "date": "2026-01-02",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA PAKETLEME YANINDA BULUNAN ZEMINDE BOR YAGI ILE HIDROLIK YAG KARISIMI DOKUNTUSU MEVCUTTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 8
            },
            {
              "date": "2026-01-05",
              "person": "AYSENUR UYE",
              "detail": "12 BMK 2. KALITE SEHPASI YANINDA BULUNAN ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 17
            },
            {
              "date": "2026-01-06",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA ALANINDA BULUNAN BOR YAGI KANALININ USTU ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 39
            },
            {
              "date": "2026-01-07",
              "person": "AYSENUR UYE",
              "detail": "11 BMK TESTERE SONRASI ROLE YOLU YANI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 49
            },
            {
              "date": "2026-01-08",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK KAYNAK GRUBU MAZGAL ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 60
            },
            {
              "date": "2026-01-09",
              "person": "AYSENUR UYE",
              "detail": "15 BMK 2. KALITE ATMA YERI YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 77
            },
            {
              "date": "2026-01-12",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK ACICI VE FLOOP KISMINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 96
            },
            {
              "date": "2026-01-13",
              "person": "BERKAY ASLAN",
              "detail": "9 BMK PAKETLEME CEMBER ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 138
            },
            {
              "date": "2026-01-13",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK IC YIKAMA YANINDA BULUNAN MERDIVENIN ONUNDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 140
            },
            {
              "date": "2026-01-13",
              "person": "AYSENUR UYE",
              "detail": "11 BMK TESTERE ARKASI ZEMINDE BULUNAN SAC HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 149
            },
            {
              "date": "2026-01-14",
              "person": "BERKAY ASLAN",
              "detail": "9 BMK PAKETLEME DONER AKSAM MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 170
            },
            {
              "date": "2026-01-14",
              "person": "UMIT KARABULUT",
              "detail": "5. HIDROTEST BOYAMA ONU ATIKLAR TOPLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 176
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "12 BMK KAYNAK GRUBU BOLGESINDE BULUNAN ISTIF MERDIVENINE UYGUN OLMAYAN BASAMAK MONTAJI YAPILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 209
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "11 BMK TESTERE SONRASI MAZGALLAR TAKILI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 216
            },
            {
              "date": "2026-01-19",
              "person": "UMIT KARABULUT",
              "detail": "5. HIDROTEST SU KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 222
            },
            {
              "date": "2026-01-19",
              "person": "UMIT KARABULUT",
              "detail": "5. BOYAMA BOYA KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 223
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "9 BMK TESTERE BOLGESINDE DEMIR SAPLI CEKIC TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 230
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "12 BMK TESTERE SONRASI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 233
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "11 BMK GIRIS KISMINDA BULUNAN HAREKETLI MERDIVEN HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 234
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA ALANI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 235
            },
            {
              "date": "2026-01-20",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK TESTERE SONRASI MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 244
            },
            {
              "date": "2026-01-20",
              "person": "AYSENUR UYE",
              "detail": "12 BMK KURUTMA FIRINI UZERINDE BULUNAN KORKULUK HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 246
            },
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "9 ILE 10 BMK ARASI YOLA KONULAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 256
            },
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK E. PANOLARI YANINDA BULUNAN GALERI KAPAGI ACIK BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 257
            },
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK HAVSA CIVARI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 258
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "5. HIDROTEST STOK ALANINA ISTIF AYAGI MONTAJI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 266
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "15 BMK DAVLUMBAZ YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 275
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "11 BMK MAKARA SEHPA ALANI ZEMINDE BULUNAN SIVI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 276
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "9 BMK CEMBER HURDA KAZANI DOLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 278
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "11 BMK MAKARA SEHPA ALANI ZEMINDE BULUNAN SIVI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 280
            },
            {
              "date": "2026-01-22",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK TESTERE SONRASI 2. KALITE SEHPASI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 289
            },
            {
              "date": "2026-01-22",
              "person": "AYSENUR UYE",
              "detail": "9 BMK PAKETLEME SEHPASI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 292
            },
            {
              "date": "2026-01-22",
              "person": "MURAT OZDEN",
              "detail": "12 BMK PAKETLEME GECIS ALANINA UZANAN CEMBER ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 297
            },
            {
              "date": "2026-01-23",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK 2. KALITE PLATFORM ICINE KONULAN TERAZI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 323
            },
            {
              "date": "2026-01-26",
              "person": "BERKAY ASLAN",
              "detail": "9 BMK KAYNAK KALIBRE DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 340
            },
            {
              "date": "2026-01-26",
              "person": "AYSENUR UYE",
              "detail": "15 BMK KAYNAK GRUBU MAKINE ARKASINDA BULUNAN DAVLUMBAZ MOTORU PLATFORMU VE KORKULUKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 354
            },
            {
              "date": "2026-01-26",
              "person": "MURAT OZDEN",
              "detail": "12 BMK IC YIKAMA ALANI MERDIVEN BASAMAGINDA BULUNAN MALZEME TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 364
            },
            {
              "date": "2026-01-28",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK 8. TONLUK VINCIN E. MANDALI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 392
            },
            {
              "date": "2026-01-30",
              "person": "AYSENUR UYE",
              "detail": "9 BMK CEMBERLEME MAKINESI CEMBERIN GIRIS KISMI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 433
            },
            {
              "date": "2026-01-30",
              "person": "AYSENUR UYE",
              "detail": "9 BMK CEMBERLEME MAKINESI GECIS ZEMIN SAC ASIRI KAYGAN",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 434
            },
            {
              "date": "2026-01-30",
              "person": "AYSENUR UYE",
              "detail": "11 BMK OTOMATIK CEMBERLEME MAKINESI HAREKETLI KISIMLAR MUHAFAZA/BARIYER BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 435
            },
            {
              "date": "2026-02-03",
              "person": "MURAT OZDEN",
              "detail": "15 BMK HAVSA VINC E. MANDALI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 473
            },
            {
              "date": "2026-02-03",
              "person": "MURAT OZDEN",
              "detail": "9 BMK FLOOP ISTIF AYAGINA KONULMUS BORUNUN UCU YURUME YOLUNA PARALEL UZANIYOR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 474
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA ALANI ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 492
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA KAFASI MOTOR DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 497
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA SEHPA ZINCIR MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 498
            },
            {
              "date": "2026-02-06",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK DOGRULTMA ROLE YOLU VIDA YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 512
            },
            {
              "date": "2026-02-06",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA KABINI UZERINDEN AKAN SIVI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 517
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK 2 NOLU VINC E. MANDALI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 562
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "5. BOYAMA MAKINESI PAKETLEME SEHPASI MERDIVEN ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 574
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "12 BMK 2. KALITE SEHPASI YANINDA BULUNAN ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 575
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "12 BMK IC YIKAMA SEHPASI ALANINDA BULUNAN ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 576
            },
            {
              "date": "2026-02-10",
              "person": "MURAT OZDEN",
              "detail": "12 BMK ISTIF AYAGI PLATFORM ZARAR GORMUS DESTEK AYAKLARI VE MERDIVENI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 595
            },
            {
              "date": "2026-02-10",
              "person": "AYSENUR UYE",
              "detail": "YENI KURULAN DOGRULTMA MAKINESI CIKIS ONCESI YERDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 597
            },
            {
              "date": "2026-02-12",
              "person": "YUCEL DURGUN",
              "detail": "11 BMK IC YIKAMA ALANI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 662
            },
            {
              "date": "2026-02-12",
              "person": "AYSENUR UYE",
              "detail": "HAT BORULAR MANUEL DOGRULTMA ISLEMI TEHLIKE OLUSTURMAKTADIR. BELIRLENEN AKSIYONLARIN TAMAMLANMASI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 668
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "11 BMK IC YIKAMA ALANI CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 715
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA SONRASI ROLE YOLU MUHAFAZA YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 759
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "YENI DOGRULTMA MAKINESI ALANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 769
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "15 BMK PAKETLEME YANI YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 770
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "11 BMK HIDROTEST SONRASI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 771
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 83,
          "missing": 62,
          "missingRate": 74.7,
          "items": [
            {
              "date": "2026-01-05",
              "person": "AYSENUR UYE",
              "detail": "29 BMK GECIS ALANINDA CUVALA KONULMUS HURDA MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 15
            },
            {
              "date": "2026-01-05",
              "person": "MURAT OZDEN",
              "detail": "24 BMK SEHPA ONUNDE BULUNAN HURDA BANT ATIKLARI VE CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 22
            },
            {
              "date": "2026-01-05",
              "person": "MURAT OZDEN",
              "detail": "29 BMK SECME ALANINDA BULUNAN ATIKLAR TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 23
            },
            {
              "date": "2026-01-05",
              "person": "MURAT OZDEN",
              "detail": "29 BMK ACICI ALANI BANT ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 24
            },
            {
              "date": "2026-01-08",
              "person": "MURAT OZDEN",
              "detail": "1 BMK DAVLUMBAZ TAKILI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 72
            },
            {
              "date": "2026-01-12",
              "person": "BERKAY ASLAN",
              "detail": "26 BMK PAKETLEME ALANI MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 100
            },
            {
              "date": "2026-01-12",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA 29 BMK PAKETLEME YANI KAPI KAPANMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 102
            },
            {
              "date": "2026-01-12",
              "person": "MURAT OZDEN",
              "detail": "1 BMK GIRIS HIDROLIK KAPI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 110
            },
            {
              "date": "2026-01-15",
              "person": "AYSENUR UYE",
              "detail": "26 BMK PAKETLEME YANI YURUME YOLU MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 186
            },
            {
              "date": "2026-01-15",
              "person": "MURAT OZDEN",
              "detail": "29 BMK OPER. PANOSU CIVARI YERDE BULUNAN CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 195
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "29 BMK PAKETLEME ATIKLAR TOPLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 225
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "29 BMK YUKLEME HOLU CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 226
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "29 BMK SECME ALANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 227
            },
            {
              "date": "2026-01-20",
              "person": "BERKAY ASLAN",
              "detail": "26 BMK PAKETLEME YANI YURUME YOLU MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 238
            },
            {
              "date": "2026-01-21",
              "person": "MURAT OZDEN",
              "detail": "25 BMK GIRISI SEHPA VE HURDA MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 282
            },
            {
              "date": "2026-01-21",
              "person": "MURAT OZDEN",
              "detail": "29 BMK PAKETLEMEDEN STOK SAHASINA GECIS MALZEME VE HURDA ATIKLAR NEDENIYLE KAPANMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 283
            },
            {
              "date": "2026-01-21",
              "person": "MURAT OZDEN",
              "detail": "29 BMK SECME ALANI HAREKETLI SEHPA TEKERLER HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 284
            },
            {
              "date": "2026-01-22",
              "person": "AYSENUR UYE",
              "detail": "29 BMK 2. KALITE MALZEME ALANI ILE ELEKTRIK PANOSU ARASINA MUHAFAZA YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 295
            },
            {
              "date": "2026-01-22",
              "person": "VEDAT BICEN",
              "detail": "1 BMK TESTERE SONRASI ROLE YOLU YANINDA BULUNAN MAZGALLARDA SEVIYE FARKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 301
            },
            {
              "date": "2026-01-24",
              "person": "HAKAN ALGUL",
              "detail": "29 BMK HOLUNDE BOYALAR YOLA BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 337
            },
            {
              "date": "2026-01-26",
              "person": "AYSENUR UYE",
              "detail": "29 BMK 2. KALITE ISTIF AYAKLARINA PLATFORM VE SABIT MERDIVEN MONTAJI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 353
            },
            {
              "date": "2026-01-26",
              "person": "MURAT OZDEN",
              "detail": "27 BMK FLOOP YSC BOS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 367
            },
            {
              "date": "2026-01-27",
              "person": "UMIT KARABULUT",
              "detail": "3550 YUKLEME YOLUNA IBC KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 383
            },
            {
              "date": "2026-01-27",
              "person": "MURAT OZDEN",
              "detail": "16 BMK SUZDURME RAMPASI UFLEME KARSISI MUHAFAZA YETERLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 386
            },
            {
              "date": "2026-01-27",
              "person": "AYSENUR UYE",
              "detail": "16 BMK ARKASI TESTERE SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 387
            },
            {
              "date": "2026-01-29",
              "person": "AYSENUR UYE",
              "detail": "2 BMK FLOOP BANT GIRISI MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 418
            },
            {
              "date": "2026-01-30",
              "person": "BERKAY ASLAN",
              "detail": "26 BMK PAKETLEME YANI YURUME YOLU UZERINDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 422
            },
            {
              "date": "2026-02-02",
              "person": "MURAT OZDEN",
              "detail": "27 BMK PAKETLEME BOLUMU YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 449
            },
            {
              "date": "2026-02-02",
              "person": "MURAT OZDEN",
              "detail": "26 BMK PAKETLEME BOLUMU YURUME YOLUNDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 450
            },
            {
              "date": "2026-02-03",
              "person": "AYSENUR UYE",
              "detail": "2 BMK ACICI BOLGESI YSC BOS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 476
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "29 BMK KAYNAK GRUBU OPER. PANOSUNDA BULUNAN ELEKTRIKLI ISITICI SABITLENMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 487
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "29 BMK FLOOP MERDIVEN KORKUGU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 490
            },
            {
              "date": "2026-02-05",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "29 BMK 2. KALITE TARAFI KAPI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 499
            },
            {
              "date": "2026-02-05",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "29 BMK YUKLEME HOLU CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 500
            },
            {
              "date": "2026-02-05",
              "person": "BERKAY ASLAN",
              "detail": "2 BMK BANT SEHPA AYAGI KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 502
            },
            {
              "date": "2026-02-05",
              "person": "MURAT OZDEN",
              "detail": "29 BMK FLOOP VINCI C KANCA TIRNAK BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 504
            },
            {
              "date": "2026-02-06",
              "person": "BERKAY ASLAN",
              "detail": "2 BMK FLOOP ELEKTRIKLI ISITICI REZIDANSIN BIRI KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 508
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "27 BMK ACICI ONU MAZGAL SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 568
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME SEHPASI DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 573
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "26 BMK PAKETLEME UFLEME FAN KAPAGI YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 591
            },
            {
              "date": "2026-02-10",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "29 BMK CAPAK FIRELERI YOLA KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 611
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "1 BMK BANT SEHPASI DESTEK AYAGI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 616
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "27 BMK HURDA KAZANLARI TASMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 617
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "27 BMK PAKETLEME ROLE YOLU DONER AKSAM ZINCIR MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 618
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "27 BMK BANT SEHPASI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 619
            },
            {
              "date": "2026-02-12",
              "person": "BERKAY ASLAN",
              "detail": "1 BMK SOGUTMA HATTI YANI ZEMINDE BULUNAN SAC TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 650
            },
            {
              "date": "2026-02-12",
              "person": "BERKAY ASLAN",
              "detail": "1 BMK FLOOP SEPET DONER AKSAM MUHAFAZASI SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 651
            },
            {
              "date": "2026-02-12",
              "person": "BERKAY ASLAN",
              "detail": "2 BMK KAYNAK FORM GRUBU MOTOR DONEN AKSAM MUHAFAZASI SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 652
            },
            {
              "date": "2026-02-15",
              "person": "ABDULLAH AYTEN",
              "detail": "2 VE 3 BMK ACILI KALDIRMA YAPILMIS. UYARI YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 695
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME ALANINDA TRANSFER ARABASI BOLGESINDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 706
            },
            {
              "date": "2026-02-17",
              "person": "BERKAY ASLAN",
              "detail": "29 BMK KOLON DIBINDE SERBEST HALDE BULUNAN BASINCLI TUP TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 726
            },
            {
              "date": "2026-02-17",
              "person": "BERKAY ASLAN",
              "detail": "26 BMK PAKETLEME YANINDA YERDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 727
            },
            {
              "date": "2026-02-17",
              "person": "BERKAY ASLAN",
              "detail": "16 BMK PAKETLEME MERDIVENINE YAPILAN BASANAK KAYGAN YUZEYE SAHIP",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 728
            },
            {
              "date": "2026-02-17",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "26 BMK PAKETLEME YOLUNA KONULAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 744
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "3 BMK ACICI MUHAFAZA TAKILI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 748
            },
            {
              "date": "2026-02-18",
              "person": "MURAT OZDEN",
              "detail": "29 BMK YUKLEME HOLU CAPAKLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 753
            },
            {
              "date": "2026-02-18",
              "person": "MURAT OZDEN",
              "detail": "29 BMK ACICI BOLGESI BANT ATIKLARI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 754
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME ARABASI UZERINDE BULUNAN SAC LEVHA COKME YAPMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 756
            },
            {
              "date": "2026-02-19",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "3570 IC DOLUM YOLU UZERINDE YAPILAN SECIM ALANI YOLU KAPATIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 779
            },
            {
              "date": "2026-02-19",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "3540 YOL KENARI 29 BMK DEN CIKAN PATLAK MALZEMELER YOL KENARINDAKI AYAKLARA GELISI GUZEL KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 780
            },
            {
              "date": "2026-02-19",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "29 BMK YOL KENARINA CAPAK VE BANT FIRE ATIKLARI GELISI GUZEL ATILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 781
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "29 BMK TESTERE SONRASI ROLE YOLU YANI ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 789
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 81,
          "missing": 45,
          "missingRate": 55.56,
          "items": [
            {
              "date": "2026-01-02",
              "person": "AYSENUR UYE",
              "detail": "EK-2 BINA 33. HOL STOK SAHASINDA BULUNA ISTIFLER TEHLIKE ARZ ETMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 13
            },
            {
              "date": "2026-01-08",
              "person": "BERKAY ASLAN",
              "detail": "22 VE 23 BMK PAKETLEME ARASINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 56
            },
            {
              "date": "2026-01-08",
              "person": "BERKAY ASLAN",
              "detail": "9. HOL S HUCRESI DESTEK AYAGI OLMADAN KONULAN KISA BORULAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 61
            },
            {
              "date": "2026-01-12",
              "person": "AYSENUR UYE",
              "detail": "4. HOL S HUCRESINDEKI 2. KALITE AYAKLARI ICIN ISTIF MERDIVENI GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 115
            },
            {
              "date": "2026-01-23",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA 35. HOLDE BULUNAN ISTIF TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 320
            },
            {
              "date": "2026-01-27",
              "person": "AYSENUR UYE",
              "detail": "EK BINADA YUKLEME MERDIVENI IHTIYACI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 376
            },
            {
              "date": "2026-01-28",
              "person": "BERKAY ASLAN",
              "detail": "20 BMK 2. KALITE AYAKLARI YANINDA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 390
            },
            {
              "date": "2026-02-02",
              "person": "AYSENUR UYE",
              "detail": "EK BINA YUKLEME HOLUNDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 446
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "3. HOLDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 488
            },
            {
              "date": "2026-02-04",
              "person": "BESIR UGUR",
              "detail": "S3 YUKLEME HOLUNDE BULUNAN ISTIF TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 496
            },
            {
              "date": "2026-02-06",
              "person": "AYSENUR UYE",
              "detail": "27 BMK ISTIF ALANI MERDIVEN HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 519
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "27. HOL 20. BMK GIRISI ISTIF TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 567
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "7. HOL 1 NOLU VINC E. MANDALI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 571
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME YANINDA BULUNAN EL MERDIVENI KULLANIMA UYGUN DEGILDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 580
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "24 BMK PAKETLEME ARKASINDA KULLANILAN ISTIF MERDIVENI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 590
            },
            {
              "date": "2026-02-10",
              "person": "MURAT OZDEN",
              "detail": "3. HOLDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 594
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "5 BMK STOK SAHASINDA KULLANILAN ISTIF MERDIVENI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 614
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA HOL GIRISI MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 615
            },
            {
              "date": "2026-02-11",
              "person": "AYSENUR UYE",
              "detail": "S12 YUKLEME HOLUNE KONULAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 627
            },
            {
              "date": "2026-02-11",
              "person": "YUCEL DURGUN",
              "detail": "EK BINA 3550 O HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 631
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA 3510 2 NOLU 8 TONLUK VINC E. MANDALI ISLEVSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 677
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA YUKLEME HOLUNDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 678
            },
            {
              "date": "2026-02-14",
              "person": "VEYSEL GULENC",
              "detail": "3. HOL M HUCRESI ELEKTRIK PANOSUNA DAYANMIS MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 694
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "EK BINA YUKLEME HOLUNDE KULLANILAN MERDIVEN HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 698
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "EK BINA 37. HOLDE BULUNAN ISTIF MERDIVENI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 699
            },
            {
              "date": "2026-02-16",
              "person": "MURAT OZDEN",
              "detail": "21. HOLDE BULUNAN ISTIF MERDIVENI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 709
            },
            {
              "date": "2026-02-16",
              "person": "MURAT OZDEN",
              "detail": "9. HOLDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 710
            },
            {
              "date": "2026-02-16",
              "person": "MURAT OZDEN",
              "detail": "29. HOLDE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 711
            },
            {
              "date": "2026-02-16",
              "person": "MURAT OZDEN",
              "detail": "EK BINA JUTLEME ALANINDA BULUNAN YAGLI ZEMIN TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 712
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "EK BINADA BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 713
            },
            {
              "date": "2026-02-16",
              "person": "GOKHAN TANIN",
              "detail": "12 BMK S8 D HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 720
            },
            {
              "date": "2026-02-16",
              "person": "YUCEL DURGUN",
              "detail": "S10 P HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 721
            },
            {
              "date": "2026-02-16",
              "person": "YUCEL DURGUN",
              "detail": "S7 G HUCRESI ESKI MERDIVEN HATTININ BIR UCU YERE DUSMUS TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 722
            },
            {
              "date": "2026-02-16",
              "person": "YUCEL DURGUN",
              "detail": "S14 L HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 723
            },
            {
              "date": "2026-02-16",
              "person": "YUCEL DURGUN",
              "detail": "S13 P HUCRESI TEHLIKELI ISTIF MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 724
            },
            {
              "date": "2026-02-17",
              "person": "MUSTAFA OZCELIK",
              "detail": "29 BMK YOL PAKETLER YOLA KONULMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 729
            },
            {
              "date": "2026-02-17",
              "person": "AYSENUR UYE",
              "detail": "27 BMK PAKETLEME ALANINDA BULUNAN ISTIF MERDIVENI HASAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 732
            },
            {
              "date": "2026-02-17",
              "person": "BILAL BALDIR",
              "detail": "29 BMK PAKETLEME YARI YUKLEME HOLUNDEKI PAKETLER TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 734
            },
            {
              "date": "2026-02-17",
              "person": "MUSTAFA OZCELIK",
              "detail": "29 BMK YUKLEME HOLUNDE BULUNAN PAKETLER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 736
            },
            {
              "date": "2026-02-17",
              "person": "BILAL BALDIR",
              "detail": "29 BMK FLOOP GIRISI KAPLI BORULAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 741
            },
            {
              "date": "2026-02-17",
              "person": "BILAL BALDIR",
              "detail": "EK BINA 3520 HOLU KAPLI BORULAR ISTIFI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 742
            },
            {
              "date": "2026-02-18",
              "person": "BERKAY ASLAN",
              "detail": "EK BINA YUKLEME HOLUNE KONULAN KAPLI BORULAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 745
            },
            {
              "date": "2026-02-18",
              "person": "MURAT OZDEN",
              "detail": "EK BINA YUKLEME HOLUNDE BULUNAN YUKLEME MERDIVENININ KORKULUGU YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 755
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "6. HOL D HUCRESINDE BULUNAN YUKLEME MERDIVENIN BASAMAGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 777
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "7. HOL T HUCRESI KOLON ARKASINDA BULUNAN ATIKLAR TOPARLANMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 778
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 85,
          "missing": 43,
          "missingRate": 50.59,
          "items": [
            {
              "date": "2026-01-09",
              "person": "ERDEM BATMAZ",
              "detail": "3 BMK ANA HIDROLIK TANKI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 93
            },
            {
              "date": "2026-01-09",
              "person": "UMIT KARABULUT",
              "detail": "S6 L HUCRESI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 94
            },
            {
              "date": "2026-01-09",
              "person": "HAKAN ALGUL",
              "detail": "S10 TAVLAMA TARAFI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 95
            },
            {
              "date": "2026-01-12",
              "person": "BURAK OZASLAN",
              "detail": "S6 K HUCRESI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 109
            },
            {
              "date": "2026-01-12",
              "person": "MUSTAFA BELEN",
              "detail": "S19 1 BMK PAKETLEME YANI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 124
            },
            {
              "date": "2026-01-12",
              "person": "METIN CAN SARI",
              "detail": "S8 PAKETLEME TARAFI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 127
            },
            {
              "date": "2026-01-12",
              "person": "YUCEL DURGUN",
              "detail": "1 BMK FLOOP KAPI KENARI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 132
            },
            {
              "date": "2026-01-22",
              "person": "FATIH ONAL",
              "detail": "S3 ASIT HAVUZLARI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 303
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "27. HOL YUKLEME HOLU KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 307
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "22. HOL T HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 311
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "EK BINA 3510 S HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 313
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "EK BINA 3550 S GIRIS CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 314
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "3550 3560 ARASI U HUCRE KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 315
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "3560 3570 KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 316
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "3540 3550 A HUCRESI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 317
            },
            {
              "date": "2026-01-23",
              "person": "HAKAN ALGUL",
              "detail": "3550 VE 3560 KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 335
            },
            {
              "date": "2026-01-30",
              "person": "SAMET KUPELI",
              "detail": "S27 CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 426
            },
            {
              "date": "2026-01-30",
              "person": "AHMET YURTAKUL",
              "detail": "S3 S4 GALVANIZ MAKINA YANI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 436
            },
            {
              "date": "2026-01-30",
              "person": "OZKAN BELEDIOGLU",
              "detail": "3 NOLU KAPI E. PANOSU KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 438
            },
            {
              "date": "2026-02-02",
              "person": "METIN CAN SARI",
              "detail": "12 BMK HAVSA KAFALARI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 456
            },
            {
              "date": "2026-02-02",
              "person": "UGUR BATAR",
              "detail": "20 BMK MIL PANO UZERINE KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 457
            },
            {
              "date": "2026-02-03",
              "person": "AYSENUR UYE",
              "detail": "DILME OFISI TRANSFER ARACI E. PANOSU KAPAGI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 475
            },
            {
              "date": "2026-02-09",
              "person": "A. YASIN OZTURK",
              "detail": "5. BMK ACICI BOLGESINE 4. BMK DEN GELEN BOR YAGI ACICI ALTINA DOLUYOR. ONLEM ALINMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 583
            },
            {
              "date": "2026-02-10",
              "person": "HILMI CAN ERDEM",
              "detail": "22. BMK FLOOP GIRISI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 612
            },
            {
              "date": "2026-02-11",
              "person": "HAKAN ALGUL",
              "detail": "35. HOL S HUCRESI KOLONDAN SY GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 622
            },
            {
              "date": "2026-02-11",
              "person": "MURAT OZDEN",
              "detail": "M1 HOLU KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 628
            },
            {
              "date": "2026-02-11",
              "person": "MURAT OZDEN",
              "detail": "1 BMK FLOOP KARSISI KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 629
            },
            {
              "date": "2026-02-11",
              "person": "MEHMET KAPLAN",
              "detail": "S27 22 BMK ACICI ARKASI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 632
            },
            {
              "date": "2026-02-11",
              "person": "AHMET HEKIMOGLU",
              "detail": "2 BMK TESTERE ARKASI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 633
            },
            {
              "date": "2026-02-11",
              "person": "FATIH ONAL",
              "detail": "S3 GALVANIZ MAKINA YANI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 634
            },
            {
              "date": "2026-02-11",
              "person": "FATIH ONAL",
              "detail": "S3 GALVANIZ ASIT HAVUZLARI YANI KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 635
            },
            {
              "date": "2026-02-11",
              "person": "HAKAN HASGUVEN",
              "detail": "1 BMK ACICI BOLGESI KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 636
            },
            {
              "date": "2026-02-11",
              "person": "FERIT ORUZ",
              "detail": "S27 KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 638
            },
            {
              "date": "2026-02-11",
              "person": "MEHMET KAPLAN",
              "detail": "23 BMK FORM ARKASI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 642
            },
            {
              "date": "2026-02-11",
              "person": "MURAT CAYLAKLI",
              "detail": "14 BMK BOYAMA E. PANO ARKASI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 645
            },
            {
              "date": "2026-02-12",
              "person": "HAKAN ALGUL",
              "detail": "10. HOL U HUCRESI KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 659
            },
            {
              "date": "2026-02-16",
              "person": "CUMHUR UZAL",
              "detail": "2 VE 3 BMK 16 TONLUK VINC KULLANMADA ZORLUK YASANIYOR. KONTROL EDILMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 716
            },
            {
              "date": "2026-02-17",
              "person": "BILAL BALDIR",
              "detail": "EK BINA 29 BMK BORYAG TOPLAMA TANKI UZERINDE BULUNAN BINC ARIZALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 733
            },
            {
              "date": "2026-02-17",
              "person": "AHMET YURTAKUL",
              "detail": "DIS ACMA MAKINESI S7 S8 ARASI KIRISTEN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 738
            },
            {
              "date": "2026-02-17",
              "person": "HAKAN ALGUL",
              "detail": "36 VE 37 HOLDE KOLONDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 743
            },
            {
              "date": "2026-02-18",
              "person": "AHMET YASIN OZTURK",
              "detail": "3 BMK BOR YAG MUHAFAZA KAPAGINDA BULUNAN ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 747
            },
            {
              "date": "2026-02-18",
              "person": "BILAL BALDIR",
              "detail": "2 BMK FLOOP 16 TONLUK VINC TEK KADEME CALISIYOR. KONTROL EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 760
            },
            {
              "date": "2026-02-18",
              "person": "UMIT KARABULUT",
              "detail": "1 BMK YANI WC ICI LAMBANIN ICINDEN SU GELIYOR. WC USTU KONTROL EDILMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 761
            }
          ]
        },
        {
          "department": "E.BAKIM-1",
          "total": 107,
          "missing": 34,
          "missingRate": 31.78,
          "items": [
            {
              "date": "2026-01-08",
              "person": "AYSENUR UYE",
              "detail": "2. DILME FIRE SARICI PANOSU ISIMLENDIRME BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 70
            },
            {
              "date": "2026-01-09",
              "person": "AYSENUR UYE",
              "detail": "13. HOL D,E,F,G,H,I,J AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 81
            },
            {
              "date": "2026-01-12",
              "person": "MURAT OZDEN",
              "detail": "15 BMK ROLE YOLU USTU AYDINLATMA YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 117
            },
            {
              "date": "2026-01-12",
              "person": "MURAT OZDEN",
              "detail": "5,6,7 DILME SARICI KISIMLARI AYDINLATMA YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 118
            },
            {
              "date": "2026-01-12",
              "person": "UMIT KARABULUT",
              "detail": "12 BMK S6-7-8 PAKETLEME AYDINLATMA YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 133
            },
            {
              "date": "2026-01-13",
              "person": "YUNUS ALPAR",
              "detail": "10 BMK PAKETLEME VE BOYAMA AYDINLATMA YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 153
            },
            {
              "date": "2026-01-14",
              "person": "BERKAY ASLAN",
              "detail": "7. DILME CIKIS TESIS DISI AYDINLATMA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 162
            },
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "15 BMK TAVLAMA KUMANDA PANOSU YANI KABLO TAVASI MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 259
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TAVLAMA AYDINLATMALAR CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 274
            },
            {
              "date": "2026-01-23",
              "person": "BERKAY ASLAN",
              "detail": "11 BMK IC YIKAMA E. PANO MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 324
            },
            {
              "date": "2026-01-23",
              "person": "UMIT KARABULUT",
              "detail": "S14 HOL AYDINLATMALARIN COGU YANMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 336
            },
            {
              "date": "2026-01-27",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK 2. KALITE AYAGI USTU AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 370
            },
            {
              "date": "2026-01-27",
              "person": "AYSENUR UYE",
              "detail": "15 BMK TRANSFER ARACI KABLOSU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 371
            },
            {
              "date": "2026-01-29",
              "person": "AYSENUR UYE",
              "detail": "5. DILME SARICI BOLGESINDE BULUNAN KUMANDA PANO TUSLARI TANIMLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 407
            },
            {
              "date": "2026-01-29",
              "person": "AYSENUR UYE",
              "detail": "5. DILME FIRE SARICI KONVEYORUNUN KARSI TARAFINDA HAREKET KUMANDASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 408
            },
            {
              "date": "2026-02-03",
              "person": "ZAFER SAHBAZ",
              "detail": "DILME ARAC KABUL KULUBESI ELEKTRIK DALGALANMASI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 465
            },
            {
              "date": "2026-02-03",
              "person": "MAHMUT KARTAY",
              "detail": "8. DILME KAMERALAR ARIZALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 466
            },
            {
              "date": "2026-02-03",
              "person": "AYSENUR UYE",
              "detail": "8 BMK FORM MAKARA GRUBU MOTOR DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 477
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK PAKETLEME USTU AYDINLATMALAR YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 481
            },
            {
              "date": "2026-02-06",
              "person": "BERKAY ASLAN",
              "detail": "2. DILME ACICI PANO TUSLARI ISIMLENDIRME BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 509
            },
            {
              "date": "2026-02-06",
              "person": "AYSENUR UYE",
              "detail": "6 BMK FORM MAKARA MOTOR DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 518
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK HAVSA SONRASI MOTOR FAN MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 563
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "12 BMK TAVLAMA ROLE YOLUNDA BULUNAN AYDINLATMLANIN DIS KORUMA MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 577
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "9. DILME OPER. PANOSU TUSLARI TANIMLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 589
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK HAVSA ONCESI 2. KALITE SEHPASI MOTOR FAN MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 593
            },
            {
              "date": "2026-02-11",
              "person": "BERKAY ASLAN",
              "detail": "8. DILME SARICI SESLI VE ISIKLI IKAZ CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 621
            },
            {
              "date": "2026-02-12",
              "person": "HAKAN ATES",
              "detail": "8. DILME SARICI PANO TUSLARI ISIMLENDIRMELER YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 669
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "7. DILME DORTLU KOL E. PANOSU HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 681
            },
            {
              "date": "2026-02-13",
              "person": "OMER UKU",
              "detail": "11. DILME BASKI VALF ELEKTRIK AKSAMI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 683
            },
            {
              "date": "2026-02-17",
              "person": "BERKAY ASLAN",
              "detail": "6 BMK ACICI PANOSU TUS ISIMLENDIRMELERI OKUNMUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 725
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "4' OFFLINE HATTI BOYUNCA AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 749
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "15 BMK HAVSA SONRASI ROSE YOLU YANI YERDE BULUNAN MOTOR SABITLENMELIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 758
            },
            {
              "date": "2026-02-19",
              "person": "BERKAY ASLAN",
              "detail": "12 BMK KAYNAK GRUBU CAPAK KONVEYOR MOTORU FAN MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 765
            },
            {
              "date": "2026-02-20",
              "person": "ZEKI ASLAN",
              "detail": "S20-21 HOL WO HUCRELERINDE AYDINLATMALAR YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 783
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 88,
          "missing": 32,
          "missingRate": 36.36,
          "items": [
            {
              "date": "2026-01-13",
              "person": "SINAN MUTLU",
              "detail": "11. DILME BICAK SIYIRICI AYARI TAMAMIYLE ALAMAMASI SEBEBIYLE AYARIN ARASINA DEMIR CUBUGU TUTMAK ZORUNDA KALIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 142
            },
            {
              "date": "2026-01-15",
              "person": "AYSENUR UYE",
              "detail": "9 BMK BANT BIRLESTIRME NOKTASI YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 189
            },
            {
              "date": "2026-01-15",
              "person": "AYSENUR UYE",
              "detail": "19 BMK ACICI YAG KACAGI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 199
            },
            {
              "date": "2026-01-21",
              "person": "HAKAN ATES",
              "detail": "8. DILME BICAK BASKI MOTOR ZINCIR KORUMA MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 269
            },
            {
              "date": "2026-01-21",
              "person": "MUZAFFER YALCIN",
              "detail": "3. DILME ACICI DORTLU KOLUN BIR TANESI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 272
            },
            {
              "date": "2026-01-26",
              "person": "BERKAY ASLAN",
              "detail": "KONSTRUKSIYON M. BAKIM ATOLYESINDE KULLANILAN SARJLI MOTORUN SINYAL, LAMBA VE ARKA STOP CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 338
            },
            {
              "date": "2026-01-28",
              "person": "AYSENUR UYE",
              "detail": "10. DILME SARICI ARABA MUHAFAZASI CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 397
            },
            {
              "date": "2026-01-30",
              "person": "AYSENUR UYE",
              "detail": "10 BMK FLOOP SEPET SILINDIRLERI MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 432
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "17 BMK Paketleme paket duzenleme kollari piston ve kollar eksik",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 521
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "17 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 522
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "18 BMK Down table'dan sonra paket sayma sehpasina malzemenin dik gelmemesi icin profil kaynatilmis sik sik kaynak kiriliyor parca dusuyor, kalici cozum bulunmasi lazim, o bolgede is kazasi da olmustur.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 524
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Acici giyotin makas bolgesinde asiri derecede yag kacagi var",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 525
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Karsima tamponuna malzemenin agzini bozmamasi icin sapan baglanilmis yakin tarihte is kazasi oldu, elektrik-mekanik ve isletme birimleri tarafindan kalici cozum bulunmasi",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 526
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Paketleme paket duzenleme kollari piston ve kollar eksik",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 529
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 530
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "20 BMK Acici giyotin makas bolgesinde asiri derecede yag kacagi var",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 532
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "20 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 534
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "21 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 537
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "22 BMK Paketleme sonrasi role yolu makaralarin kaplamalari asinmis yenilenmesi gerekli",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 541
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "22 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 542
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "23 BMK Paketleme sonrasi role yolu makaralarin kaplamalari asinmis yenilenmesi gerekli",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 546
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "23 BMK Kaynak grubu davlumbazlar aktif kullanilamiyor",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 547
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "6. DILME DORTLU KOL HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 569
            },
            {
              "date": "2026-02-10",
              "person": "MURAT CAYLAKLI",
              "detail": "6 BMK BOYAMA 3 NOLU KOLA MALZEMELER HIZALI GELMIYOR KOL ALTINA ALIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 607
            },
            {
              "date": "2026-02-12",
              "person": "BERKAY ASLAN",
              "detail": "21 BMK DAVLUMBAZ CEKIS GUCU YETERLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 654
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "OFFLINE MANUEL DOGRULTMA ROLE YOLU MAKARALARINDAN BAZILARI CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 679
            },
            {
              "date": "2026-02-13",
              "person": "ERHAN ASLANOGLU",
              "detail": "9. DILME MAKINASINDA FIRE SARICIDAN DOLU OLAN FIREYI ASAGI EL ILE DUSURME ZORUNLULUGU MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 684
            },
            {
              "date": "2026-02-15",
              "person": "HAKAN ALGUL",
              "detail": "3570 HOL 29 BMK TARAFINA MAKINE PARCALARI BIRAKILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 696
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "5 BMK KAYNAK GRUBU YANI E. PANOLARI PLATFORM KORKULUK BULUNMAMAKTADIR. DAVLUMBAZ YAPILIRKEN KESILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 717
            },
            {
              "date": "2026-02-19",
              "person": "BERKAY ASLAN",
              "detail": "2 BMK FLOOP MOTORU YERDE CALISMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 766
            },
            {
              "date": "2026-02-19",
              "person": "BERKAY ASLAN",
              "detail": "16 BMK PAKETLEME TAMPON HALAT ILE SABITLENMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 767
            },
            {
              "date": "2026-02-20",
              "person": "ADIL CIFTCI",
              "detail": "7. DILME SARICI DORTLU KOL TABANDAN OYNUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 787
            }
          ]
        },
        {
          "department": "GES",
          "total": 53,
          "missing": 31,
          "missingRate": 58.49,
          "items": [
            {
              "date": "2026-01-12",
              "person": "MEHMET NALBANT",
              "detail": "AMBAR CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 131
            },
            {
              "date": "2026-01-22",
              "person": "FERIT ORUZ",
              "detail": "S16 L HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 308
            },
            {
              "date": "2026-01-22",
              "person": "MEHMET NALBANT",
              "detail": "AMBAR CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 318
            },
            {
              "date": "2026-01-30",
              "person": "FERIT ORUZ",
              "detail": "S9 T HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 425
            },
            {
              "date": "2026-01-30",
              "person": "I. DENIZ CIVIT",
              "detail": "12 BMK KAYNAK GRUBU PANO UZERI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 427
            },
            {
              "date": "2026-01-30",
              "person": "KURSAT KARAKUCUK",
              "detail": "5. DILME OPER. PANOSU UZERINE CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 437
            },
            {
              "date": "2026-01-31",
              "person": "MEHMET KAPLAN",
              "detail": "22 BMK S27 ACICI BOLGESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 439
            },
            {
              "date": "2026-01-31",
              "person": "MEHMET NALBANT",
              "detail": "ERW AMBAR CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 440
            },
            {
              "date": "2026-02-10",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "3550 S HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 609
            },
            {
              "date": "2026-02-10",
              "person": "KADIR BOZDOGANOGLU",
              "detail": "3540 S HUCRESI KOLON YANI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 610
            },
            {
              "date": "2026-02-11",
              "person": "HAKAN ALGUL",
              "detail": "9. HOL T HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 623
            },
            {
              "date": "2026-02-11",
              "person": "HAKAN ALGUL",
              "detail": "34. HOL S HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 624
            },
            {
              "date": "2026-02-11",
              "person": "METIN CAN SARI",
              "detail": "12 BMK BOYAMA BOLGESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 637
            },
            {
              "date": "2026-02-11",
              "person": "MURAT CAYLAKLI",
              "detail": "5 BMK FLOOP PANO USTU CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 639
            },
            {
              "date": "2026-02-11",
              "person": "GOKHAN KARAHAN",
              "detail": "OFFLINE TAVLAMA CIKISI S14 CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 640
            },
            {
              "date": "2026-02-11",
              "person": "MURAT CAYLAKLI",
              "detail": "4 BMK FLOOP PANO CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 641
            },
            {
              "date": "2026-02-11",
              "person": "UGUR BATAR",
              "detail": "22 BMK PAKETLEME CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 643
            },
            {
              "date": "2026-02-11",
              "person": "UGUR BATAR",
              "detail": "20 BMK MIL PANO UZERINE CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 644
            },
            {
              "date": "2026-02-11",
              "person": "UFUK CELIK",
              "detail": "2. DILME E. PANOSUNA CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 646
            },
            {
              "date": "2026-02-12",
              "person": "HAKAN ALGUL",
              "detail": "11 ILE 10 HOL F HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 660
            },
            {
              "date": "2026-02-12",
              "person": "KADIR ARGAN",
              "detail": "11 BMK KAYNAK GRUBU CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 661
            },
            {
              "date": "2026-02-12",
              "person": "HAKAN ALGUL",
              "detail": "16. HOL L HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 663
            },
            {
              "date": "2026-02-13",
              "person": "BURHAN SENYIGIT",
              "detail": "7 BMK OPER. PANOSU CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 689
            },
            {
              "date": "2026-02-13",
              "person": "SONER AVCI",
              "detail": "12 BMK 2. KALITE BOLGESINE CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 690
            },
            {
              "date": "2026-02-13",
              "person": "HARUN SARIKOSE",
              "detail": "GALVANIZ MAKINESI YANI S3 VE S34 CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 691
            },
            {
              "date": "2026-02-14",
              "person": "KADIR ARGAN",
              "detail": "11 BMK IC YIKAMA PANOSU CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 692
            },
            {
              "date": "2026-02-14",
              "person": "KADIR ARGAN",
              "detail": "12 BMK HAVSA KAFA 1 USTU CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 693
            },
            {
              "date": "2026-02-17",
              "person": "GOKHAN KUCUK",
              "detail": "12 BMK TAVLAMA ARKASI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 739
            },
            {
              "date": "2026-02-17",
              "person": "HAKAN ALGUL",
              "detail": "17. HOL N HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 740
            },
            {
              "date": "2026-02-18",
              "person": "HAKAN ALGUL",
              "detail": "5. HOLDE S-T-U HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 762
            },
            {
              "date": "2026-02-18",
              "person": "HAKAN ALGUL",
              "detail": "7 VE 8. HOL W HUCRESI CATIDAN SU GELIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 763
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 47,
          "missing": 26,
          "missingRate": 55.32,
          "items": [
            {
              "date": "2026-01-06",
              "person": "BERKAY ASLAN",
              "detail": "20 BMK HURDA BANT ALANI KORKULUK HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 36
            },
            {
              "date": "2026-01-13",
              "person": "RAMAZAN GUNDOGAN",
              "detail": "21 BMK TESTERE ARKASI KAPI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 157
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "23 BMK ROLE YOLU MERDIVEN BASAMAGI KAYNAK YERINDEN SALLANIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 214
            },
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "17 BMK BANT SEHPA KAYMA ENGELLEME AYAGI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 254
            },
            {
              "date": "2026-01-22",
              "person": "BERKAY ASLAN",
              "detail": "20 BMK FLOOP VINCI E. MANDALI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 286
            },
            {
              "date": "2026-01-22",
              "person": "BERKAY ASLAN",
              "detail": "23 BMK FLOOP VINCI E. MANDALI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 288
            },
            {
              "date": "2026-01-26",
              "person": "BERKAY ASLAN",
              "detail": "18 BMK VE 19 BMK MERDIVEN BASAMAKLARI YAGLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 344
            },
            {
              "date": "2026-01-27",
              "person": "AYSENUR UYE",
              "detail": "17 BMK PAKETLEME ALANINDA BULUNAN MAZGAL BOSLUKLARI TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 377
            },
            {
              "date": "2026-02-02",
              "person": "AYSENUR UYE",
              "detail": "17 BMK HAVSA ONCESI ROLE YOLU YANI ZEMINDE BULUNAN MAZGAL ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 443
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "19 BMK ACICI SONRASI BARIYER YERINE KONULMAMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 483
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "22 BMK ATIK ALANI KORKULUK HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 485
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "17 BMK MAKARA GRUBU SAFT MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 494
            },
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Karsima tamponuna malzemenin agzini bozmamasi icin sapan baglanilmis yakin tarihte is kazasi oldu, elektrik-mekanik ve isletme birimleri tarafindan kalici cozum bulunmasi",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 528
            },
            {
              "date": "2026-02-10",
              "person": "AYSENUR UYE",
              "detail": "18 BMK MAKARA GRUBU DONER AKSAM MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 596
            },
            {
              "date": "2026-02-10",
              "person": "AYSENUR UYE",
              "detail": "23 BMK TESTERE SONRASI ROLE YOLU YANINDA BULUNAN MAZGALLARDA KOT FARKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 603
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "20 BMK ACICI ALANI ZEMIN SACLARI SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 675
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "23 BMK FLOOP SEPET DONER AKSAM MUHAFAZASI YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 676
            },
            {
              "date": "2026-02-13",
              "person": "AYSENUR UYE",
              "detail": "17 BMK PAKETLEME ALANI MAZGALDA BULUNAN SEVIYE FARKI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 688
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "21 BMK ACICI BOLGESI TALIMAT LEVHASI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 702
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "23 BMK MANUEL PAKETLEME SEHPASI AYAGI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 707
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "17 BMK ACICI BOLGESI HURDA KAZANINDA BULUNAN SAPANLAR YIPRANMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 768
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "19 BMK KALIBRE MAKARA GRUBU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 774
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "19 BMK MAKARA SAFT MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 775
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "19 BMK HAVSA ONCESI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 776
            },
            {
              "date": "2026-02-20",
              "person": "BERKAY ASLAN",
              "detail": "19 BMK DIKEY FLOOP SONRASI BANT YANLARI BARIYER BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 784
            },
            {
              "date": "2026-02-20",
              "person": "BERKAY ASLAN",
              "detail": "17 BMK PAKETLEME YANI MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 785
            }
          ]
        },
        {
          "department": "DILME",
          "total": 62,
          "missing": 21,
          "missingRate": 33.87,
          "items": [
            {
              "date": "2026-01-08",
              "person": "AYSENUR UYE",
              "detail": "6. DILME LOOP CUKURU KAPISI VE MERDIVENI HASAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 62
            },
            {
              "date": "2026-01-13",
              "person": "MURAT OZDEN",
              "detail": "9 ILE 10 BMK ARASI SEHPA DISINA KONULAN BANTLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 148
            },
            {
              "date": "2026-01-19",
              "person": "MURAT OZDEN",
              "detail": "3. DILME BICAK DONER AKSAMLAR MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 224
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "10. DILME RULO HAVUZU MERDIVENI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 263
            },
            {
              "date": "2026-01-21",
              "person": "AYSENUR UYE",
              "detail": "5. DILME SARICI BANT C KANCA SAPANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 281
            },
            {
              "date": "2026-01-23",
              "person": "MURAT OZDEN",
              "detail": "9 ILE 10 BMK ARASI SEHPA DISINA KONULAN BANTLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 331
            },
            {
              "date": "2026-01-28",
              "person": "BERKAY ASLAN",
              "detail": "10 BMK BANT SEHPA DISINA KONULAN BANTLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 391
            },
            {
              "date": "2026-01-28",
              "person": "AYSENUR UYE",
              "detail": "10. DILME ACICI BOLGESI OPER. PANOSU YANI KORKULUK EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 398
            },
            {
              "date": "2026-02-03",
              "person": "BERKAY ASLAN",
              "detail": "11. DILME SARICI BOLUMU MOTOR DONEN AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 460
            },
            {
              "date": "2026-02-03",
              "person": "BERKAY ASLAN",
              "detail": "7. DILME RULO HAVUZU KORKULUK ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 462
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "6 DILME AYAR SEHPASI YANI KORKULUK BULUNMAMAKTADUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 561
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "2. DILME FIRE SARICI MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 570
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "9. DILME FIRE SARICI MOTOR ZINCIR MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 588
            },
            {
              "date": "2026-02-10",
              "person": "AYSENUR UYE",
              "detail": "5. DILME ACICI BOLGESI ISITICI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 600
            },
            {
              "date": "2026-02-13",
              "person": "BERKAY ASLAN",
              "detail": "7. DILME SARICI KISMINDA BULUNAN DONER AKSAM MUHAFAZASI YERINDEN CIKMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 682
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "29 BMK ACICI BOLGESINDE SEHPA DISINA KONULAN BANTLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 700
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "9. DILME ACICI BOLGESI PLATFORM ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 703
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "11. DILME RULO HAVUZU MERDIVEN HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 751
            },
            {
              "date": "2026-02-20",
              "person": "BERKAY ASLAN",
              "detail": "10. DILME BANT HAVUZU KORKULUKLAR ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 786
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "6. DILME FIRE SARICI BOLGESI ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 790
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "7 ILE 8 BMK SEHPA DISINA KONULAN BANTLAR TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 791
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 36,
          "missing": 18,
          "missingRate": 50,
          "items": [
            {
              "date": "2026-01-07",
              "person": "BERKAY ASLAN",
              "detail": "14 BMK TESTERE ONU MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 46
            },
            {
              "date": "2026-01-07",
              "person": "AYSENUR UYE",
              "detail": "7 BMK ILE 8 BMK SEHPALARI ZEMINE SABIT DEGIL DUZENSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 52
            },
            {
              "date": "2026-01-07",
              "person": "AYSENUR UYE",
              "detail": "7 BMK ILE 8 BMK BANT SEHPASI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 53
            },
            {
              "date": "2026-01-14",
              "person": "AYSENUR UYE",
              "detail": "7 BMK MAKARA GRUBU SAFT DONER AKSAM MUHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 173
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "8 BMK FLOOP MUHAFAZASI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 221
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "8 BMK ACICI BOLGESI ZEMIN PLAKALARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 232
            },
            {
              "date": "2026-01-26",
              "person": "AYSENUR UYE",
              "detail": "10 BMK BOYAMA KABINI ONCESI ROLE YOLUNDA BULUNAN L PROFILLER ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 362
            },
            {
              "date": "2026-01-28",
              "person": "AYSENUR UYE",
              "detail": "6 BMK ACICI BOLGESINDE BULUNAN KAYNAK MASKESI HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 394
            },
            {
              "date": "2026-01-29",
              "person": "BERKAY ASLAN",
              "detail": "10 BMK 8 TONLUK VINC E. MANDALI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 402
            },
            {
              "date": "2026-02-03",
              "person": "AYSENUR UYE",
              "detail": "6 BMK KAYNAK GRUBUNDA KULLANILAN ANAHTAR HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 470
            },
            {
              "date": "2026-02-04",
              "person": "BERKAY ASLAN",
              "detail": "6 BMK BILGISAYAR DOLABI YANI YSC BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 480
            },
            {
              "date": "2026-02-10",
              "person": "BERKAY ASLAN",
              "detail": "13 BMK OPER. PANO YANINDA BULUNAN ISITICININ MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 586
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "13 BMK BANT CEVIRME ALANI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 705
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "14 BMK TESTERE ONU MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 718
            },
            {
              "date": "2026-02-18",
              "person": "BERKAY ASLAN",
              "detail": "14 BMK BOYAMA ONCESI ROLE YOLU DONEN AKSAM MUHAFAZADA ACIKLIK MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 746
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "10 BMK BOYAMA SEHPA SONRASI ROLE YOLU DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 757
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "13 BMK SOGUTMA KAPAKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 792
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "13 BMK MAKARA GRUBU DONER AKSAM MUAHAFAZALARI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 793
            }
          ]
        },
        {
          "department": "GALVANIZ",
          "total": 20,
          "missing": 14,
          "missingRate": 70,
          "items": [
            {
              "date": "2026-01-06",
              "person": "UMIT KARABULUT",
              "detail": "S5 HOL GALVANIZ BRANDALARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 45
            },
            {
              "date": "2026-01-12",
              "person": "AYSENUR UYE",
              "detail": "7. HOL W HUCRESI ISTIF AYAGINDA EGILME MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 112
            },
            {
              "date": "2026-01-15",
              "person": "MURAT OZDEN",
              "detail": "FORKLIFT BICAK SAG SOL KOLU CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 182
            },
            {
              "date": "2026-01-15",
              "person": "MURAT OZDEN",
              "detail": "FORKLIFT SOL AYNA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 183
            },
            {
              "date": "2026-01-19",
              "person": "AYSENUR UYE",
              "detail": "ASIT HAVUZLARI YANI YURUME YOLU VE KORKULUKLARI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 206
            },
            {
              "date": "2026-01-27",
              "person": "BERKAY ASLAN",
              "detail": "DIS ACMA VINC E. MANDALI CALISMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 369
            },
            {
              "date": "2026-02-04",
              "person": "AYSENUR UYE",
              "detail": "DIS ACMA GIRIS SEHPASINDA YURUME YOLUNA PARALEL TAKOZ TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 491
            },
            {
              "date": "2026-02-06",
              "person": "AYSENUR UYE",
              "detail": "GALVANIZ KAZAN KISMINDA BULUNAN SEVIYE FARKI TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 514
            },
            {
              "date": "2026-02-09",
              "person": "AYSENUR UYE",
              "detail": "GALVANIZ PASIVASYON HAVUZU YANINDA BULUNAN ZEMIN ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 579
            },
            {
              "date": "2026-02-12",
              "person": "AYSENUR UYE",
              "detail": "GALVANIZ DIS ACMA PAKETLEME OPER. PANOSU MERDIVEN AYAGI KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 667
            },
            {
              "date": "2026-02-13",
              "person": "AYSENUR UYE",
              "detail": "GORSEL KONTROL YANI KOLON DIBI MAZGAL ACIKLIK TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 687
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "CINKO KAZANI ONCESI DONER AKSAM MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 708
            },
            {
              "date": "2026-02-18",
              "person": "AYSENUR UYE",
              "detail": "GALVANIZ OFIS YANINDA BULUNAN GIRIS KAPISI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 750
            },
            {
              "date": "2026-02-19",
              "person": "AYSENUR UYE",
              "detail": "KAZAN ONCESI ROLE YOLUNDA BULUNAN DONER AKSAM MUHAFAZA ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 772
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 12,
          "missing": 9,
          "missingRate": 75,
          "items": [
            {
              "date": "2026-01-05",
              "person": "AYSENUR UYE",
              "detail": "6' OFFLINE VE 3. BOYAMA ARASI GECISTE BULUNAN MALZEMELER TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 30
            },
            {
              "date": "2026-01-08",
              "person": "AYSENUR UYE",
              "detail": "4' OFFLINE PAKETLEME E. PANOSU YANINDA BULUNAN MAZGAL ACIKLIGI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 71
            },
            {
              "date": "2026-01-26",
              "person": "AYSENUR UYE",
              "detail": "4. BOYAMA MAKINESI GIRISI ROLE YOLU DONER AKSAM MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 346
            },
            {
              "date": "2026-01-29",
              "person": "BERKAY ASLAN",
              "detail": "3. BOYAMA PAKETLEME BOLUMU KABLO MUHAFAZASINDA BULUNAN SEVIYE FARKI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 400
            },
            {
              "date": "2026-02-12",
              "person": "AYSENUR UYE",
              "detail": "ISLEM HATLARI YENI KURULAN MAKINE ALANINA CEKILEN BOR YAG HATTI ZEMIN USTUNDEN GITMESI TEHLIKE OLUSTURUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 665
            },
            {
              "date": "2026-02-12",
              "person": "AYSENUR UYE",
              "detail": "ISLEM HATLARI YENI KURULAN MAKINE ALANINDA BULUNAN VINC PLATFORMU KESILMIS TEKRAR MONTAJI YAPILMISTIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 666
            },
            {
              "date": "2026-02-17",
              "person": "AYSENUR UYE",
              "detail": "3. BOYAMA MAKINESI BOYAMA KABINI UZERINDE BULUNAN DONER AKSAM MUHAFAZA BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 730
            },
            {
              "date": "2026-02-17",
              "person": "AYSENUR UYE",
              "detail": "3. BOYAMA PAKETLEME ONCESI ROLE YOLUNDA BULUNAN MUHAFAZA SALLANIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 731
            },
            {
              "date": "2026-02-20",
              "person": "AYSENUR UYE",
              "detail": "1. BOYAMA MAKINESI PAKETLEME ONCESI ROLE YOLU DISLILERININ MUHAFAZASI BULUNMAMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 788
            }
          ]
        },
        {
          "department": "E.BAKIM-2",
          "total": 35,
          "missing": 4,
          "missingRate": 11.43,
          "items": [
            {
              "date": "2026-02-07",
              "person": "HILMI CAN ERDEM",
              "detail": "19 BMK Karsima tamponuna malzemenin agzini bozmamasi icin sapan baglanilmis yakin tarihte is kazasi oldu, elektrik-mekanik ve isletme birimleri tarafindan kalici cozum bulunmasi",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 527
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "17 BMK FORM KAYNAK GRUBU E. PANOSU ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 564
            },
            {
              "date": "2026-02-18",
              "person": "HAKAN ALGUL",
              "detail": "5. HOL GALVANIZ TARAFI S-T-U HUCRESI AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 764
            },
            {
              "date": "2026-02-20",
              "person": "HAKAN ZORLU",
              "detail": "5. HOL V HUCRESI AYDINLATMALAR CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 782
            }
          ]
        },
        {
          "department": "ERW IDARI ISLER",
          "total": 3,
          "missing": 3,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-02-02",
              "person": "MURAT OZDEN",
              "detail": "ARKA YEMEKHANE WC PISUVAR GIDERLERI KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 447
            },
            {
              "date": "2026-02-02",
              "person": "MURAT OZDEN",
              "detail": "ARKA YEMEKHANE WC HAVALANDIRMA MUHAFAZA HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 448
            },
            {
              "date": "2026-02-09",
              "person": "BERKAY ASLAN",
              "detail": "ANA BINA ILE SERVIS BEKLEME ALANI GERISINDE BULUNAN ROGAR KAPAGINDA ACIKLIK MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 572
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 6,
          "missing": 2,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-02",
              "person": "AYSENUR UYE",
              "detail": "TOZ EPOKSI CIKIS BORU ICERISINDE DUMANA MARUZIYET TEHLIKE OLUSTURMAKTADIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 441
            },
            {
              "date": "2026-02-16",
              "person": "AYSENUR UYE",
              "detail": "DIS KUMLAMA GIRIS SEHPASI PLATFORM ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 697
            }
          ]
        }
      ]
    },
    "durum-kaynakli-kazalar": {
      "total": 31,
      "missing": 11,
      "missingRate": 35.48,
      "departments": [
        {
          "department": "HAT BORULAR",
          "total": 3,
          "missing": 3,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-29",
              "person": "AHMET CAKICI",
              "detail": "MAKARA ARASINDA SIKISMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2026-02-10",
              "person": "MIKAIL KUPELI",
              "detail": "KAYNAK TELI BATMASI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2026-02-20",
              "person": "HASAN SAPAN",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 4,
          "missing": 2,
          "missingRate": 50,
          "items": [
            {
              "date": "2026-01-06",
              "person": "SELCUK DOKUZ",
              "detail": "SASEYE CARPMAK",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2026-02-14",
              "person": "SEYIT AHMET ISIK",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 3,
          "missing": 2,
          "missingRate": 66.67,
          "items": [
            {
              "date": "2026-01-03",
              "person": "YUSUF SIMSEK",
              "detail": "KANCA ILE MAPA ARASI SIKISMA",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2026-02-12",
              "person": "OMER SERIF YIGIT",
              "detail": "CEMBERIN CARPMASI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 6,
          "missing": 2,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-06",
              "person": "OGUZHAN DURAN",
              "detail": "CEMBERIN KESMESI",
              "missingField": "Aksiyon Alani Bos"
            },
            {
              "date": "2026-02-16",
              "person": "KADIR KILIC",
              "detail": "CEMBER PAKETI ARASINDA SIKISTIRMAK",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "DILME",
          "total": 3,
          "missing": 1,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-15",
              "person": "EMRAH CAKAR",
              "detail": "TOZ KACMASI",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 3,
          "missing": 1,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-01-29",
              "person": "ERKAN KUPELI",
              "detail": "BURKULMA",
              "missingField": "Aksiyon Alani Bos"
            }
          ]
        }
      ]
    },
    "ramak-kala": {
      "total": 45,
      "missing": 25,
      "missingRate": 55.56,
      "departments": [
        {
          "department": "DILME",
          "total": 11,
          "missing": 8,
          "missingRate": 72.73,
          "items": [
            {
              "date": "2026-01-21",
              "person": "BERKAY ASLAN",
              "detail": "10. DILME RULO HAVUZUNDA RULO SEVKI ESNASINDA RULONUN DEVRILMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-22",
              "person": "OZKAN BELEDIOGLU",
              "detail": "8. DILME DE ACICIYA RULO VERME ESNASINDA ACICININ KAPALI OLMASI KAYNAKLI RULONUN ARABADAN DUSMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-23",
              "person": "AYSE NUR UYE",
              "detail": "6 BMK FLOOP ICERISINDE BULUNAN BANT DALGALI OLDUGUN ICIN DAGILMASI.(KONTROLLERIN YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-23",
              "person": "AYSE NUR UYE",
              "detail": "3. DILME SARICI BOLGESSNDE C KANCADAN BANDIN DUSMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-26",
              "person": "AYSE NUR UYE",
              "detail": "1. DILME YOL USTUNDE BIRAKILAN C KANCAYA BMC AKTARMA ARACININ CARPMASI.(EGITIM VERILMESI VE CAMIN DEGISTIRILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-27",
              "person": "BERKAY ASLAN",
              "detail": "9. DILME M. BAKIM PERSONELININ CALISMASI ESNASINDA DILME SEVKIYAT PERSONELI C KANCAYI HAREKET ETTIRMESI SIRASINDA C KANCA BAKIM PERSONELINE CARPMASINA RAMAK KALMASI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-02",
              "person": "MURAT CAYLAKLI",
              "detail": "14 BMK YERDE BULUNAN BANTIN MAKINEYE TAKILMASI ICIN KALDIRILMASI SIRASINDA BANT GOBEGININ DAGILMASI.(SEHPA DISINA BANT KONULMAMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-19",
              "person": "BERKAY ASLAN",
              "detail": "1. DILME ONUNDE BANT SEVKIYATI ESNASINDA AKTARMA ARACINDAKI BANTIN DEVRILMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 5,
          "missing": 5,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-14",
              "person": "MUSTAFA CELIK",
              "detail": "2 BMK DE M. BAKIM PERSONELI ARIZAYA MUDAHALE EDERKEN FLOOP PERSONELININ BANDI ALMA ESNASINDA C KANCADAN BANTI BAKIMCININ YANINA DUSURMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-26",
              "person": "AYSE NUR UYE",
              "detail": "26 BMK FLOOP PERSONELI BANDIN FAZLALIK KISMINI ALMA ESNASINDA DUSEN BANT PARCASININ ELEKTRIK AKSAMLARINA ZARAR VERMESI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-28",
              "person": "FERIT ORUZ",
              "detail": "S22 P HUCRESI CEMBER PATLAMASI SONUCU ISTIFIN YATMASI(CEMBER MAKINESININ KONTROL EDILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-17",
              "person": "MUSTAFA OZCELIK",
              "detail": "1 BMK PAKETLEME 9M URETIM YAPARKEN BORUNUN ARAYA DUSMESI.(PERSONELE EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-18",
              "person": "FERIT ORUZ",
              "detail": "24 BMK HOLUNDE PAKETIN CEMBERININ PATLAMASI.(CEMBER MAKINESININ KONTROL EDILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 5,
          "missing": 4,
          "missingRate": 80,
          "items": [
            {
              "date": "2026-01-17",
              "person": "ABDULLAH AYTEN",
              "detail": "S27 V2 6 PAKET KALDIRMA CALISIRKEN SURUCU VIRAYI KESMESI SONUCU PERSONEL SIKISAN SAPANI UYGUNSUZ SEKILDE CEKTIRME ILE CIKARMAYA CALISIRKEN VINC KENDINI KORUMAYA ALMIS VE PAKET DEVRILMISTIR.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-27",
              "person": "AYSE NUR UYE",
              "detail": "29 BMK YUKLEME HOLUNE GIRIS YAPAN YORULMAZ TASIMACILIK FIRMASINA AIT TRAKTORUN BILGI ISLEM PANOSUNA CARPMASI.(YUKLEME HOLUNDE BULUNAN PAKETLERIN KALDIRILMASI VE TRAKTOR SOFORLERINE EGITIM VERILMESI ONERILMISTIR.",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-07",
              "person": "HAKAN ALGUL",
              "detail": "EK BINA 36. HOLDE JUT PAKETLERININ DEVRILMESI.(PERSONELE EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-14",
              "person": "ABDULLAH BURAK ONCE",
              "detail": "S1 4 NOLU VINC(2. KALITE VINCI) VINC YUKTE IKEN SAPANIN KOPMASI.(EGITIM VERILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 2,
          "missing": 2,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-09",
              "person": "I. DENIZ CIVIT",
              "detail": "11 BMK IC YIKAMADA SENSOR ONUNE CAPAK GELMESI SONUCU BORULARDA DAGILMA MEYDANA GELMESI(KORDON KESICININ CALISMASI, IC YIKAMA BORYAG UFLEMENIN DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-01-23",
              "person": "AHMET YASIN OZTURK",
              "detail": "9 BMK DAN 10 BMK YE MERDIVENDEN GECERKEN AYAGIMIN KAYMASI.(BASAMAKLARIN DEGISIMI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 7,
          "missing": 2,
          "missingRate": 28.57,
          "items": [
            {
              "date": "2026-01-21",
              "person": "MEHMET TURKOGLU",
              "detail": "1. DILME SARICI BANT DORTLU KOLUN BIR TANESI BANT KALDIRMA ESNASINDA KAYNAK YERINDEN KIRILMASI.(KONTROLLERIN YAPILMASI VE TAMIR EDILMESI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            },
            {
              "date": "2026-02-16",
              "person": "HILMI CAN ERDEM",
              "detail": "20. BMK PAKETLEME FIRLATICI BANDIN CAP DURMASINDAN DOLAYI KARSIMA TAMPONUNDA MALZEMENIN YIGMA YAPMASI.(KONTROLLERIN YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "E. BAKIM-1",
          "total": 5,
          "missing": 1,
          "missingRate": 20,
          "items": [
            {
              "date": "2026-01-25",
              "person": "OKKES HAPHAP",
              "detail": "FABRIKA GENELINDE ENERJININ ANLIK ARIZA SEBEBIYLE KESILMESI.(ACIL DURUM AYDINLATMALARININ DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "E. BAKIM-2",
          "total": 2,
          "missing": 1,
          "missingRate": 50,
          "items": [
            {
              "date": "2026-01-25",
              "person": "OKKES HAPHAP",
              "detail": "FABRIKA GENELINDE ENERJININ ANLIK ARIZA SEBEBIYLE KESILMESI.(ACIL DURUM AYDINLATMALARININ DEVREYE ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "GALVANIZ",
          "total": 1,
          "missing": 1,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-29",
              "person": "MURAT OZDEN",
              "detail": "GALVANIZ CINKO KAZANININ DELINMESI.(KONTROLLERIN DUZENLI ARALIKLAR ILE YAPILMASI VE KAYIT ALTINA ALINMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 3,
          "missing": 1,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-18",
              "person": "BURAK OZASLAN",
              "detail": "S20 YUKLEME HOLUNDE YUKLEME SIRANSINDA VINC KEDININ BIRAKMASI.(KONTROLLERIN YAPILMASI ONERILMISTIR.)",
              "missingField": "Aksiyon Bekliyor"
            }
          ]
        }
      ]
    },
    "ifade-gelmeyen": {
      "total": 31,
      "missing": 17,
      "missingRate": 54.84,
      "departments": [
        {
          "department": "UNIVERSAL",
          "total": 6,
          "missing": 4,
          "missingRate": 66.67,
          "items": [
            {
              "date": "2026-01-03",
              "person": "AHMET SARIKOSE",
              "detail": "PISTON VE SASE ARASINDA SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-01-30",
              "person": "ILYAS KILINC",
              "detail": "BURKULMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-02-05",
              "person": "KADIR GULLU",
              "detail": "METAL AKSAMA CARPMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-02-19",
              "person": "UFUK OZKAN",
              "detail": "MAKARA ARASINDA SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 4,
          "missing": 3,
          "missingRate": 75,
          "items": [
            {
              "date": "2026-01-23",
              "person": "YASIN ATES",
              "detail": "PARCA SICRAMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-01-24",
              "person": "BURAK GOKDENIZ ZEYTUN",
              "detail": "TESTERENIN KESMESI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-01-31",
              "person": "MELIH GORMEZ",
              "detail": "KAYIS ILE KASNAK ARASI SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "DILME",
          "total": 3,
          "missing": 2,
          "missingRate": 66.67,
          "items": [
            {
              "date": "2026-01-07",
              "person": "ISRAFIL PEKSOY",
              "detail": "SPIRAL TASININ KESMESI",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-01-21",
              "person": "HASAN SENOL",
              "detail": "FIRE BATMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 3,
          "missing": 2,
          "missingRate": 66.67,
          "items": [
            {
              "date": "2026-01-05",
              "person": "MEHMET ALI TURKER",
              "detail": "PAKET ARASINDA SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-01-30",
              "person": "MUSTAFA OZER",
              "detail": "MAKARA ARASINDA SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 4,
          "missing": 2,
          "missingRate": 50,
          "items": [
            {
              "date": "2026-01-23",
              "person": "OSMAN KASTAL",
              "detail": "TAMPON ILE MALZEME ARASI SIKISTIRMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            },
            {
              "date": "2026-02-05",
              "person": "MURAT SELCUK",
              "detail": "KAYIP DUSMEK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 3,
          "missing": 1,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-20",
              "person": "HASAN SAPAN",
              "detail": "MALZEME ARASINDA SIKISTIRMAK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 1,
          "missing": 1,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-02-04",
              "person": "FERHAT DAG",
              "detail": "KKT TEMASI",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 4,
          "missing": 1,
          "missingRate": 25,
          "items": [
            {
              "date": "2026-02-09",
              "person": "SELCUK DOKUZ",
              "detail": "BASKI APARATI ILE KAZAN ARASI SIKISMA",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 3,
          "missing": 1,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2026-02-13",
              "person": "AHMET KOCABEYOGLU",
              "detail": "TAKILIP DUSMEK",
              "missingField": "Kaza Ifadesi Gelmedi"
            }
          ]
        }
      ]
    },
    "sari-kart-gelmeyen": {
      "total": 29,
      "missing": 20,
      "missingRate": 68.97,
      "departments": [
        {
          "department": "DILME",
          "total": 5,
          "missing": 5,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-17",
              "person": "HUSEYIN ATAS",
              "detail": "CALISMA ALANINDA SIPERLIK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-21",
              "person": "GORKEM OKTEM",
              "detail": "RULO CEMBER PATLATMA ISLEMI ESNASINDA SIPERLIK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-21",
              "person": "AYHAN BIKMAZ",
              "detail": "CEKIC KULLANIRKEN KORUYUCU GOZLUK/SIPERLIK TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-21",
              "person": "METIN SIMSEK",
              "detail": "CEKIC KULLANIRKEN KORUYUCU GOZLUK/SIPERLIK TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-02-07",
              "person": "MUHAMMED RESUL AKINCI",
              "detail": "FIRE SARICI ALANINDA SIPERLIK KULLANMAMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 3,
          "missing": 3,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-24",
              "person": "BURAK GOKDENIZ ZEYTUN",
              "detail": "ATOLYEDE BARET VE KORUYUCU GOZLUK KULLANMADAN CALISMAK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-24",
              "person": "BURAK GOKDENIZ ZEYTUN",
              "detail": "IS KAZASINA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-02-16",
              "person": "YASIN SAMAGAN",
              "detail": "SPIRAL ILE CALISMA YAPARKEN KORUYUCU GOZLUK/SIPERLIK KULLANMADIGI TESPIT EDILMISTIR.",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 2,
          "missing": 2,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-02-04",
              "person": "CAGRI CELIKKIRAN",
              "detail": "CALISMA ARKADASININ IS KAZASINA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-02-06",
              "person": "IBRAHIM TURHAN",
              "detail": "4 PAKETTEN FAZLA MALZEME KALDIRMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 2,
          "missing": 2,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-02-05",
              "person": "MURAT SELCUK",
              "detail": "IS KAZASINA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-02-18",
              "person": "ABDULKADIR DOGAN",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 5,
          "missing": 2,
          "missingRate": 40,
          "items": [
            {
              "date": "2026-01-14",
              "person": "KENAN KAYA",
              "detail": "RAMAK KALA OLAYA ETKI ETMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-15",
              "person": "MURAT ALI AKKAS",
              "detail": "CALISAN MAKINE UZERINDEN ATLAYARAK KARSIYA GECMEK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 7,
          "missing": 2,
          "missingRate": 28.57,
          "items": [
            {
              "date": "2026-01-20",
              "person": "ADEM FERIZ",
              "detail": "ISTIF UZERINE MERDIVENSIZ CIKMAK VE MALZEMENIN UZERINDE IKEN VINCE KALDIRMA KOMUTU VERMEK",
              "missingField": "Savunma Gelmedi"
            },
            {
              "date": "2026-01-22",
              "person": "ABDULLAH YILMAZ",
              "detail": "5 PAKET KALDIRMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 1,
          "missing": 1,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-16",
              "person": "HALIL GUVENC",
              "detail": "YUKSEKTE GEREKLI ONLEMLERI ALMADAN TEHLIKELI SEKILDE CALISMA YAPMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "IDARI ISLER",
          "total": 1,
          "missing": 1,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-29",
              "person": "BESIR UGUR",
              "detail": "BARET TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 1,
          "missing": 1,
          "missingRate": 100,
          "items": [
            {
              "date": "2026-01-29",
              "person": "TOLGA BRANDT",
              "detail": "CEMBERLEME YAPARKEN SIPERLIK TAKMAMASI",
              "missingField": "Savunma Gelmedi"
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 2,
          "missing": 1,
          "missingRate": 50,
          "items": [
            {
              "date": "2026-01-22",
              "person": "OSMAN GOK",
              "detail": "HIDROLIK PRES ILE CALISIRKEN KORUYUCU GOZLUK/SIPERLIK TAKMAMAK",
              "missingField": "Savunma Gelmedi"
            }
          ]
        }
      ]
    },
    "capraz-denetim": {
      "total": 1924,
      "missing": 514,
      "missingRate": 26.72,
      "departments": [
        {
          "department": "E. BAKIM",
          "total": 576,
          "missing": 178,
          "missingRate": 30.9,
          "items": [
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 578
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 579
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO TAVASI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 580
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "ISITICI KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 583
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 584
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 585
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 586
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "PANO ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 587
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "PANO ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 588
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "PANO ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 589
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO TAVASI ZARAR GORMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 590
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KAYNAK MAKINE KABLO DAGINIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 591
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KAYNAK MAKINE KABLO DAGINIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 592
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "ISITICI KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 593
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 594
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 595
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 596
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "ISITICI KALDIRILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 598
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLO YERDEN GECIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 599
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 602
            },
            {
              "date": "2025-03-13",
              "person": "E. BAKIM-1",
              "detail": "KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 603
            },
            {
              "date": "2025-03-14",
              "person": "DILME",
              "detail": "YATIRIM EK BINA TESISIN SON YOLUNDA DUVAR PANOSUNDA YER ALMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 634
            },
            {
              "date": "2025-03-14",
              "person": "DILME",
              "detail": "UZATY TESTERE BOLGESINDE ISITICI SARTEL ILE CALISMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 640
            },
            {
              "date": "2025-03-20",
              "person": "GALVANIZ",
              "detail": "15. BMK PAKETLEME ZINICIRI KONTROL PANOSUNDAKI BUTON KIRIK DURUMDADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 663
            },
            {
              "date": "2025-03-20",
              "person": "GALVANIZ",
              "detail": "15. BMK TESTERE BOLGESI PRES MAKINESININ KONTROL PANOSUNDA KIRIK BUTON BULUNMAKTADIR. AYRICA SEYYAR OLARAK CEKILEN KUMANDANIN MAKINE CALISMA BOLGESININ DISINA ALINMASI GEREKMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 664
            },
            {
              "date": "2025-03-20",
              "person": "GALVANIZ",
              "detail": "12. BMK OPERATOR KONTROL PANOSUNDA ACIKLIKLAR MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 668
            },
            {
              "date": "2025-03-20",
              "person": "KONVANSIYONEL",
              "detail": "3 NOLU TESTERE PANO ETIKETLEME EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 688
            },
            {
              "date": "2025-03-20",
              "person": "KONVANSIYONEL",
              "detail": "3 NOLU TESTERE ACMA KAPAMA BUTONU TANIMLAMA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 689
            },
            {
              "date": "2025-03-20",
              "person": "KONVANSIYONEL",
              "detail": "1 NOLU TESTERE HIZLANDIRMA BUTONU KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 690
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "MAKINELERIN BANT BIRLESTIRME PANOLARINDA ETIKETSIZ BUTONLAR MEVCUTTUR. AYRICA ETIKETLI OLAN BUTONLARIN ISE ETIKETLERI OKUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 748
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "MAKINELERIN TESTERE PANOLARINDA ETIKETLER OKUNMUYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 751
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "13. MAKINE TESTERE PANOSUNDA ACIL BUTONUNDA KIRMIZI BASMA BUTONU BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 752
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "4-5-6-7-8-10-13 VE 14. MAKINELERIN ROLE YOLU PANOLARINDA BUTONLARIN ETIKETLERI OKUNMUYOR. AYRICA ETIKETI OLMAYAN BUTONLAR MEVCUTTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 753
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "MAKINELERIN DOGRULTMA PANOLARINDA ETIKET BULUNMUYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 754
            },
            {
              "date": "2025-03-20",
              "person": "KALITE KONTROL",
              "detail": "10. MAKINE CEMBERLEME PANOSUNDA ETIKETLER OKUNMUYOR VE ETIKETSIZ BUTON MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 756
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "4 OFLINE OPERATOR PANOSU ADRESLEME BULUNMAMAKTADIR. TUSLARDA HASAR VE EKSIK OLANLAR BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 888
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "4 OFLINE OPERATOR PANOSU ADRESLEME BULUNMAMAKTADIR. TUSLARDA HASAR VE EKSIK OLANLAR BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 889
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "4 OFLINE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 890
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "4 OFFLINE.ADRESLEME BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 891
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 892
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE.ADRESLEME BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 893
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE.ADRESLEME BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 894
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 895
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE.TUSLARDA HASAR BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 896
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "6 OFFLINE.SARTEL ACIKTA BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 897
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "1.BOYAMA.TUSLARDA HASAR VE EKSIK TUS BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 898
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "3.BOYAMA.SARTEL ACIKTA BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 899
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "TAVLAMA.ADRESLEME VE TUSLARDA HASAR BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 900
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "DOGRULTMA.ADRESLEME VE TUSLARDA HASAR BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 901
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "DOGRULTMA.ADRESLEME BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 902
            },
            {
              "date": "2025-03-20",
              "person": "PLANLAMA",
              "detail": "DOGRULTMA.TUSLARDA EKSIK BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 903
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 708
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 709
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 724
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 725
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 726
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 727
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 740
            },
            {
              "date": "2025-03-21",
              "person": "KONSTRUKSIYON",
              "detail": "TUSLARIN GOREVLERI TANIMLI DEGIL DEFORME OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 741
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "6. DILME FIRE KIRICI PISTON LAMBA YANMIYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 757
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "8.DILME BANT GERDIRME BUTON KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 758
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "8.DILME EKSIK MARKALAMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 759
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "8.DILME EKSIK MARKALAMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 760
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "5.DILME MARKALAMA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 761
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "5.DILME MARKALAMA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 763
            },
            {
              "date": "2025-03-22",
              "person": "E. BAKIM-2",
              "detail": "3.DILME TANIMLAMA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 764
            },
            {
              "date": "2025-05-06",
              "person": "GALVANIZ",
              "detail": "UZAY TESTERE KAPAK SENSORU CALISMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 908
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "12. BMK CIKISINDA BULUNAN BOLGE GECISE MUSAIT BU BOLGEYE HAREKET SENSOR YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 881
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "12. BMK PAKETLEME DE YER ALAN BOLGEDE HAREKET SENSOR YOK YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 882
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "11. BMK CIKISI SEVK HOLU MALZEME CARPMA RSIKI OLABILIR. ETRAFI CEVRILMELI VEYA HAREKET SENSOR YERLESTIRILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 883
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "9. BMK PAKETLEME ARABASININ HAREKET SENSORU MEVCUT DEGIL. CARPMA RISKINE KARSI SENSOR MEKANIZMASI YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 884
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "15. BMK PAKETLEME ARABSINDAHAREKET SENSOR MEVCUT DEGIL. EKLENMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 885
            },
            {
              "date": "2025-05-07",
              "person": "DILME",
              "detail": "15. BMK PAKET CIKIS ROLE YOLU ACIK GECISE MUSAIT BURAYA SENSOR KOYULMALI RISK OLUSTURABILIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 886
            },
            {
              "date": "2025-07-09",
              "person": "KALITE KONTROL",
              "detail": "4 OFFLINE BOLGESINDE BULUNAN ELEKTRIK PANOLARININ KAPAKLARI ACIK. PANOLARIN SOGUTMA ISLEMININ YAPILABILMESI VE OLASI YANGINI ONLEMEK ICIN SOGUTUCU MONTE EDILMELI VE PANO KAPAKLARI KAPALI TUTULMALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1145
            },
            {
              "date": "2025-07-09",
              "person": "KALITE KONTROL",
              "detail": "DOGRULTMA HATTI CIKIS BOLGESINDE BULUNAN PRIZIN ORTA GOZUNUN GIRIS YUVASI DEFORME OLMUS. AYRICA PRIZE TAKILI OLAN KABLO BAGLANTI BOLGESINDE JUT BANDI ILE IZOLASYON YAPILMIS UYGUN DEGILDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1149
            },
            {
              "date": "2025-07-09",
              "person": "KALITE KONTROL",
              "detail": "TAVLAMA GIRISI 4. BOYAMA KABIN ETRAFI VE 6 OFFLINE GIRIS BOLGELERINDE BULUNAN PRIZ VE KABLOLARIN KONUMU UYGUN DEGIL. BOYAMA BOLGESINDE PRIZE BOYA TEMASI OLABILIR. 6 OFFLINE BOLGESINDEKI KABLO ISE DEFORME OLMUS BANT ILE KAPATILMIS.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1150
            },
            {
              "date": "2025-07-09",
              "person": "KALITE KONTROL",
              "detail": "6 OFFLINE HIDROTEST OPERATOR BOLGESINDE BULUNAN AYDINLATMA ICIN KULLANILAN KABLO VE PAKETLEME TAPALAMA BOLGESINDE BULUNAN ELEKTRIK KABLOSUNUN UCLARI BANT ILE KAPATILMIS. UYGUN DEGILDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1152
            },
            {
              "date": "2025-07-10",
              "person": "KONVANSIYONEL",
              "detail": "KULLANILAN MATKAP KABLOSUNDA DEFORME OLAN YERLER MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1166
            },
            {
              "date": "2025-07-11",
              "person": "KAPLAMA",
              "detail": "10.DILME SALTER KAPAGI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1121
            },
            {
              "date": "2025-07-11",
              "person": "KAPLAMA",
              "detail": "5.DILME PANO KAPAGI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1129
            },
            {
              "date": "2025-07-25",
              "person": "GALVANIZ",
              "detail": "UNIVERSAL SEFLIGI OFIS ONU SIGORTA KUTUSU UYGUNSUZDUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1165
            },
            {
              "date": "2025-07-30",
              "person": "SEVKIYAT",
              "detail": "27.MAKINE FLOOP BANT ACICI BOLGESINDE BANDIN BITTIGINI GORUP SISTEMI DURDURACAK SENSOR BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 905
            },
            {
              "date": "2025-07-30",
              "person": "SEVKIYAT",
              "detail": "26.MAKINE FLOOP BANT ACICI BOLGESINDE BANDIN BITTIGINI GORUP SISTEMI DURDURACAK SENSOR BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 906
            },
            {
              "date": "2025-07-30",
              "person": "SEVKIYAT",
              "detail": "25.MAKINE FLOOP BANT ACICI BOLGESINDE BANDIN BITTIGINI GORUP SISTEMI DURDURACAK SENSOR BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 907
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "12.BMK BANT BIRLESTIRME BOLGESINDE KULLANILAN KAYNAK MAKINESI KABLOLARINDA ACILMALAR MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1131
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "12.BORU MAKINESI TESTERE BOLGESINDE KULLANILAN KAYNAK MAKINESI KABLOLARINDA ACIKLIKLAR MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1133
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "12.BORU MAKINESI TESTERE BOLGESINDE KULLANILAN KAYNAK MAKINESI BAGLANTI SOKETLERI DEFORME OLMUS.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1134
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "11.BORU MAKINESI OPERATOR PANO BOLGESINDE KULLANILAN 3LU PRIZ KABLO ACIKLIKLARI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1135
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "15.BORU MAKINESI PAKETLEMEDE KULLANILAN SPIRAL TASLAMA KABLOLARINDA ACILMALAR MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1139
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "15.BORU MAKINESI PAKETLEMEDE KULLANILAN SPIRAL TASLAMA KABLOLARINDA ACILMALAR MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1140
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "16.BORU MAKINESI FLOOP PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1415
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "16.BORU MAKINESI GIYOTIN MAKAS PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1416
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "16.BORU MAKINESI OPERATOR PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1417
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "2.BORU MAKINESI FLOOP PINCH ROLL ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1433
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "2.BORU MAKINESI TESTERE PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1438
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "1.BORU MAKINESI FLOOP PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1441
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "1.BORU MAKINESI TESTERE PANOSU ETIKETLENDIRME YOK VE KIRIK BUTONLAR VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1443
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "1.BORU MAKINESI TESTERE PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1444
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "1.BORU MAKINESI HAVSA PANOSU ETIKETLENDIRME YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1445
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "27.BORU MAKINESI PAKETLEME PANOSU EKRAN YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1450
            },
            {
              "date": "2025-08-20",
              "person": "KONSTRUKSIYON",
              "detail": "27.BORU MAKINESI KAYNAK GRUBU PANOSU EKRAN YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1454
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "19 BMK PAKETLEME PANO ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1397
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "19 BMK HAVSALAMA PANO ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1398
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "19 BMK BORU SAYMA KONTROL PANOSUNDA ETIKETLENDIRME EKSIK VE YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1399
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "19 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1400
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "19 BMK FLOOP PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1401
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "17 BMK FLOOP PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1402
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "17 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1403
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "18 BMK FLOOP PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1404
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "18 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1405
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "18 BMK TESTERE KONTROL PANOSU ETIKETLENDIRMESI EKSIK BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1406
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "17 BMK PAKETLEME PANOSU ETIKETLENDIRMESI EKSIKLER VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1407
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "17 BMK HAVSALAMA PANO ETIKETLENDIRMESI EKSIK VE BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1408
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "20 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI EKSIK VE BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1409
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "20 BMK FLOOP PANOSU ETIKETLENDIRMESI EKSIK VE BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1410
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "20 BMK BANT ACICI PANOSU ETIKETLENDIRMESI EKSIK VE BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1411
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "22 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI EKSIK VE BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1412
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "23 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1413
            },
            {
              "date": "2025-08-21",
              "person": "KONVANSIYONEL",
              "detail": "21 BMK OPERATOR KONTROL PANOSU ETIKETLENDIRMESI BELLI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1414
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "9.MAK UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1342
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "9.MAK UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1343
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "11.MAKINA UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1352
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "11.MAKINA UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1358
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "11.MAKINA UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1360
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "11.MAKINA UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1362
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "11.MAKINA UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1369
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "12.MAKINE UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1375
            },
            {
              "date": "2025-08-25",
              "person": "KAPLAMA",
              "detail": "12.MAKINE UYGUNSUZ PANO",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1382
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "4 . OFFLINE PAKETLEME CIKIS PANOSUNDA ETIKETLEME",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1385
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "4 . OFFLINE HIDROTEST GIRIS KAPI PANO ETIKETLERI GORUNMEMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1386
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "4. OFFLINE ROLE YOLU PANOSUNDA ETIKETLENDIRMELER GORUNUR DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1387
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "4 .OFFLINE OPERATOR PANOSU ETIKETLENDIRMELER EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1388
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "4.OFFLINE BOYAMA PNAO ETIKETLENDIRMESI GORUNUR DEGIL .",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1389
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "DOGRULTMA SAHA CIKIS PANO ETKETLENDIRME GORUNUR DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1390
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "1. BOYAMA ETKETLEMELER EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1391
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "1. BOYAMA ETKETLEMELER EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1392
            },
            {
              "date": "2025-08-25",
              "person": "DILME",
              "detail": "3.BOYAMA ETKIETLERMELER KONTROL EDILEMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1393
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "1.DILME SARICI TARAFI 4LU KOL KILIT VE DONDURME SENSORU CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1467
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "11.DILME FIRE SARICI ACIL STOP CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1468
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "10.DILME FIRE SARICI ACIL STOP CALISMIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1469
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "3.DILMEDE SARICI VE ACICIDA FRENLEME SORUNU VAR ACIL STOPA BASILDIGINDA HAREKETE DEVAM EDIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1470
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "9.DILME SARICI FRENLEME SISTEMI ARIZALI ACIL STOPA BASILDIGINDA HAREKETE DEVAM EDIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1471
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "4.DILME EMNIYET SENSORLERI KONTROL EDILMELI AYRICA ACICI FRENLEME SISTEMINDE SORUN VAR ACIL STOPA BASILDIGINDA HAREKETE DEVAM EDIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1472
            },
            {
              "date": "2025-08-29",
              "person": "KAPLAMA",
              "detail": "5.DILME ACICI ACIL STOPA BASILDIGINDA DURMUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1473
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1308
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1309
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1310
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1311
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1312
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1313
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1314
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1315
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1316
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1317
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1318
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1319
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1320
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1324
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1325
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1326
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1327
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1328
            },
            {
              "date": "2025-09-05",
              "person": "HAT BORULAR",
              "detail": "11.DILME HARICINDE KI TUM PANOLARIN ETIKETLENDIRMELERI YAPILMAMIS YADA EKSIKTIR. FOTOGRAFLAR 1.DILMEDEN BASLAYARAK SIRALI HALDE EKLENMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1329
            },
            {
              "date": "2025-10-02",
              "person": "DILME",
              "detail": "11.MAKINA UFLEME KARSILAMA TAMPONUN ORADAKI SENSOR MALZEMEYI GORMUYOR BAKILMASI LAZIM",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1477
            },
            {
              "date": "2025-11-11",
              "person": "KAPLAMA",
              "detail": "16.BMK PANODAKI EKRAN SOKULMUS SOKULEN EKRANDA ACIKLIKLAR MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1736
            },
            {
              "date": "2025-11-11",
              "person": "KAPLAMA",
              "detail": "27.BMK PANO KAPAGI ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1744
            },
            {
              "date": "2025-11-11",
              "person": "KAPLAMA",
              "detail": "27.BMK PANO KAPAGI ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1745
            },
            {
              "date": "2025-11-11",
              "person": "KAPLAMA",
              "detail": "24.BMK PANO KAPAGI ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1746
            },
            {
              "date": "2025-11-11",
              "person": "KAPLAMA",
              "detail": "29MAKINA KABLOLAR ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1747
            },
            {
              "date": "2025-11-11",
              "person": "E. BAKIM-2",
              "detail": "PAKETLEME",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1755
            },
            {
              "date": "2025-11-11",
              "person": "E. BAKIM-2",
              "detail": "PAKETLEME",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1756
            },
            {
              "date": "2025-11-13",
              "person": "KONVANSIYONEL-2",
              "detail": "10.DILME HIDROLIK HORTUM YURUME YOLUNDA VE BASINC ILE HAREKETLI HALDE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1717
            },
            {
              "date": "2025-11-21",
              "person": "KALITE KONTROL",
              "detail": "TOZ EPOKSI MAKINESI BOLGESINDE BULUNAN AYDINLATMA ANAHTARININ MUFAZASI BULUNMAMAKTA BAGLANTI KABLOSUNUN IZOLASYONSUZ BOLUMU MEVCUT. UYGUN SEKILDE YENIDEN BAGLANTI YAPILMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1728
            },
            {
              "date": "2025-11-21",
              "person": "KALITE KONTROL",
              "detail": "TOZ EPOKSI MAKINESI BOLGESINDE ZEMIN UZERINE SEYYAR KABLO GELISIGUZEL SEKILDE CEKILMIS.KABLO KANALLARINDAN GECIRILEREK CEKILMELI VEYA GECICI ISE ISLEM BITINCE KALDIRILMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1729
            },
            {
              "date": "2025-11-21",
              "person": "KALITE KONTROL",
              "detail": "KAPLAMA MAKINESI SIGARA ICME BOLGESINDE BULUNAN PRIZ SABITLENMELI. AYRICA TEZGAH UZERINDE SU BULUNMAKLTA VE SEMAVERIN KABLOSU SULU BOLGEDE. KABLOLAR UYGUN SEKILDE CEKILMELI SU ILE TEMASI ENGELLENMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1734
            },
            {
              "date": "2025-12-03",
              "person": "GALVANIZ",
              "detail": "11. BMK PANO UYGUNSUZDUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1726
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "6 BMK BOYAMA GIRIS YAN ROLE YOLUNDA KABLOLAR TAVAYA ALINMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1761
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "10. BMK FLOOP KABLOLAR TAVAYA ALINMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1766
            }
          ]
        },
        {
          "department": "M. BAKIM",
          "total": 294,
          "missing": 87,
          "missingRate": 29.59,
          "items": [
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "2. DILME KAFALAR DONEN AKSAMDA MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 5
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "3. DILME AYAR KAFALARI MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 11
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "4. DILME KAFALAR MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 20
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "5. DILME KAFALAR DONEN AKSAM MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 27
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "6. DILME KAFALARDA MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 32
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "7. DILME KAFALARI MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 33
            },
            {
              "date": "2025-02-20",
              "person": "KONSTRUKSIYON",
              "detail": "1. DILME KAFASI HAREKETLI KAFA MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 39
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "15. BMK FORM SAFT MUHAFAZALARI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 44
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "15. BMK KALIBRE SAFT MUHAFAZALARI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 46
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "15. BMK HAVSA ZINCIRI MUHAFAZALARI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 48
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "9.BMK KALIBRE SAFT MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 50
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "9.BMK FORM SAFT MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 51
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "11.BMK FORM SAFT MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 52
            },
            {
              "date": "2025-02-20",
              "person": "KONVANSIYONEL",
              "detail": "11.BMK KALIBRE SAFT MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 53
            },
            {
              "date": "2025-02-20",
              "person": "KAPLAMA",
              "detail": "4.BOYAMA GERGI MAKARASI MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 63
            },
            {
              "date": "2025-02-20",
              "person": "KAPLAMA",
              "detail": "4 OFFLINE YIKAMA ONCESI ROLE YOLU MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 76
            },
            {
              "date": "2025-02-20",
              "person": "UNIVERSAL",
              "detail": "19. MAK HIZALAMA MOTOR MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 92
            },
            {
              "date": "2025-02-20",
              "person": "UNIVERSAL",
              "detail": "17. MAK PAKETLEME TAMPON ZINCIR MUHAFAZASI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 95
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "1.DILME MOBIL KAFA MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1168
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "2.DILME ACICI DISLI YAGLAMA SISTEMI MOTOR PERVANE KAPAGI KIRIK..",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1170
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "10.DILME FIRE SARICI MOTOR TARAFI MUHAFAZA EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1171
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "10.DILME FIRE SARICI OPERATOR TARAFI MUHAFAZA UYGUN DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1172
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "10.DILME BICAK MILI TAHRIK MEKANIZMASI MUHFAZASI UYGUN DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1173
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "9.DILME UTULEME SAFT MUHFAZASI EKSIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1174
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "9.DILME ACICI KAVRAMA MOTORU KLEMENS KUTUSU ACIK MOTOR MILI ACIKTA..",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1175
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "3.DILME MOBIL KAFA MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1178
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "4.DILME MOBIL KAFA MUHAFAZASI TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1181
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "8.DILME BICAK MILI TAHRIK MEKANIZMASI MUHFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1182
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "5.DILME MOBIL KAFA MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1183
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "5.DILME FIRE SARICI KAYIS MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1184
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "6.DILME MOBIL KAFA MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1186
            },
            {
              "date": "2025-08-07",
              "person": "M. BAKIM",
              "detail": "7.DILME MOBIL KAFA MUHAFAZA TAKILI DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1188
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "9. MAKINE FORM GURUBU SAFT KORKULUKLARI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1190
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE BANT ACICIYAN KORKULUK YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1191
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE KALIBRE BOLGESI SAFT KORKULUKLARI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1192
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE TESTERE ON MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1193
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE ROLE YOLU HAREKETLI MAKARA MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1194
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "15.MAKINE TAVLAMA CIKIS BOLGESI ELEKTIRIK KABLOLARI DAGINIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1195
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "15.MAKINE HAVSA BOLGESI HAREKETLI PARCA KORUMALIK YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1196
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "15.MAKINE MOTOR VE SAFT MUHAFAZALARI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1197
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "15.MAKINE MOTOR VE SAFT MUHAFAZALARI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1198
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "11.MAKINE FORM GURUBU SAFT KORKULUKLARI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1199
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "11.MAKINE TAVLAMA UST KAPAKLAR ACIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1200
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "12.MAKINE 2.KALITE ATMA SEHPASI MOTOR MUHAFAZASI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1201
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "12.MAKINE UFLEME SEHPASI MOTOR MUHAFAZASI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1202
            },
            {
              "date": "2025-08-08",
              "person": "SEVKIYAT",
              "detail": "UFLEME BOLGESI PANO ACIK KIVILCIM SONUCU YANGIN OLABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1203
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "2. MAK PAKETLEME RAMPA KARE MIL KORKULUK YOK. MAKINAYA GECIS ENGELLENMEMIS.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1220
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "1. MAK FLOOP MOTOR MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1222
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "1. MAK HAVSA GIRIS YILDIZ KOL KORKULUK YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1224
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "1. MAK HAVSALAMA KARE MIL MUHAFAZA YOK VEYA ERISIM ENGELLENMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1225
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "27. MAK PINCHROLL GIRIS KORKULUK YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1227
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "27. MAK KULLANILAN FANIN MUHAFAZASI CAPA GORE YETERSIZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1228
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "27. MAK PAKETLEME CIKIS ZINCIRI MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1229
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "24. MAK HAVSALAMA CAPAK KONVEYOR MOTOR MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1232
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "24. MAK ROLE YOLU DONER AKSAM MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1233
            },
            {
              "date": "2025-08-26",
              "person": "UNIVERSAL",
              "detail": "24. MAK FLOOP CIKIS TAMBUR KORKULUK YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1234
            },
            {
              "date": "2025-09-01",
              "person": "DILME",
              "detail": "VINC MOTOR KAPAGI KNTROL EDILMELI DUSMEK UZERE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1245
            },
            {
              "date": "2025-09-01",
              "person": "DILME",
              "detail": "YRD TESISLER PLATFORMLARIN USTUNDE BIR MOTOR BU SEKILDE BAGLI KONTROL EDILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1248
            },
            {
              "date": "2025-10-09",
              "person": "HAT BORULAR",
              "detail": "17.BMK. FORM GRUBU SAFT MUHAFAZALARI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1211
            },
            {
              "date": "2025-10-09",
              "person": "HAT BORULAR",
              "detail": "19.BMK. FORM GRUBU SAFT MUHAFAZALARI YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1213
            },
            {
              "date": "2025-10-09",
              "person": "HAT BORULAR",
              "detail": "19.BMK. PAKETLEME TAMPON MUHAFAZA EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1215
            },
            {
              "date": "2025-10-09",
              "person": "HAT BORULAR",
              "detail": "17.BMK. PAKETLEME MOTOR KAPAGI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1216
            },
            {
              "date": "2026-01-08",
              "person": "M. BAKIM",
              "detail": "22.BMK TESTERE MUHAFAZA KAPAGI SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1842
            },
            {
              "date": "2026-01-08",
              "person": "M. BAKIM",
              "detail": "20.BMK TESTERE KAYIS MUHAFAZA KAPAGI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1843
            },
            {
              "date": "2026-01-08",
              "person": "M. BAKIM",
              "detail": "17.BMK KALIBRE DONER AKSAM MUHAFAZASI EKSIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1844
            },
            {
              "date": "2026-01-10",
              "person": "E. BAKIM-2",
              "detail": "PASIVASYON HAREKETLI AKSAM ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1826
            },
            {
              "date": "2026-01-10",
              "person": "E. BAKIM-2",
              "detail": "PARASUT KORUMALAR TAKILI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1827
            },
            {
              "date": "2026-01-10",
              "person": "E. BAKIM-2",
              "detail": "GALVANIZ HAREKETLI KANCA ACIKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1828
            },
            {
              "date": "2026-01-10",
              "person": "KONSTRUKSIYON",
              "detail": "TAVLAMA BESLEME ZINCI MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1836
            },
            {
              "date": "2026-01-10",
              "person": "KONSTRUKSIYON",
              "detail": "3. HIDROTEST ZINCIR MUHAFAZA YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1837
            },
            {
              "date": "2026-01-16",
              "person": "SEVKIYAT",
              "detail": "3.BMK FLOOP FORM GURUBU BOLGESI MUHAFAZA DEFORME OLMUS DEGITIRILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1845
            },
            {
              "date": "2026-01-16",
              "person": "SEVKIYAT",
              "detail": "3.BMK FLOOP FORM GURUBU BOLGESI MUHAFAZASI EKSIK OLAN KISIMLAR MEVCUT KONTROL EDILIP MUHAFAZA YAPILMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1846
            },
            {
              "date": "2026-01-21",
              "person": "GALVANIZ",
              "detail": "6. BMK ROLE YOLU MUHAFAZA UYGUNSUZDUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1848
            },
            {
              "date": "2026-01-21",
              "person": "GALVANIZ",
              "detail": "13. BMK FAN MUHAFAZA BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1849
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "5.BOYAMA UYGUNSUZLUGUNUN GIDERILMESI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1829
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "9.BMK ZINCIR MUHAFAZASININ TAKILMASI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1830
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "9.BMK ZINCIR MUHAFAZASININ UYGUN HALE GETIRILMESI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1831
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "15.BMK ZINCIR MUHAFAZASI TAKILMASI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1832
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "15.BMK ZINCIR MUHAFAZASININ UYGUN HALE GETIRILMESI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1833
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "15.BMK ZINCIR MUHAFAZALARININ TAKILMASI VE UYGUN HALE GETIRILMESI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1834
            },
            {
              "date": "2026-01-22",
              "person": "ISLEM HATLARI",
              "detail": "15.BMK ZINCIR MUHAFAZALARININ TAKILMASI VE UYGUN HALE GETIRILMESI GEREKLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1835
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "8. DILME KAPAK BULUNMUYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1820
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "5. DILME FREN MUHAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1821
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "6. DILME FREN MUHAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1822
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "6. DILME MOTOR MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1823
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "6. DILME MOTOR MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1824
            },
            {
              "date": "2026-01-27",
              "person": "UNIVERSAL",
              "detail": "7. DILME FREN MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1825
            }
          ]
        },
        {
          "department": "DILME",
          "total": 204,
          "missing": 1,
          "missingRate": 0.49,
          "items": [
            {
              "date": "2025-02-27",
              "person": "M. BAKIM",
              "detail": "6.DILME FIRE SARICI ARKA ZEMINDE BULUNAN HAVA HATTININ UZERI UYARICI SEKILDE KAPATILMALI YANINDA BULUNAN GECIS ALANINDAKI TAVA KAPATILMALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 173
            }
          ]
        },
        {
          "department": "UNIVERSAL",
          "total": 158,
          "missing": 47,
          "missingRate": 29.75,
          "items": [
            {
              "date": "2025-02-27",
              "person": "KONSTRUKSIYON",
              "detail": "4.BMK PAKETLEME SUZDURME SEHPA ALTI MAZGAL OLMAYAN YERLER KAYIP DUSME RISKI VAR MAZGALLAR TAMAMLANMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 383
            },
            {
              "date": "2025-02-27",
              "person": "KONSTRUKSIYON",
              "detail": "8.BMK ACICI ALTINDA BULUNAN SAC DEFORME OLMUS DEGISTIRILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 399
            },
            {
              "date": "2025-07-03",
              "person": "KALITE KONTROL",
              "detail": "14. BMK BOYAMA KABINI BOLGESINDEKI SABIT DIK MERDIVENIN MUHAFAZASI BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1109
            },
            {
              "date": "2025-07-03",
              "person": "KALITE KONTROL",
              "detail": "10. BMK BOYAMA KABINI UZERINDE BULUNAN PLATFORMUN MUHAFAZASI DEFORME OLMUS. AYRICA PLATFORM UZERINDE BULUNAN MALZEMELERIN DUZENLENMESI GEREKLI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1113
            },
            {
              "date": "2025-09-11",
              "person": "KALITE KONTROL",
              "detail": "14. BMK BYPASS SONRASI ROLE YOLU ONU VE ARKASINDAKI MAZGALLARDA KOT FARKLI OLANLAR MEVCUT DUZELTILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1539
            },
            {
              "date": "2025-09-11",
              "person": "KALITE KONTROL",
              "detail": "13. BMK TESTERE SONRASI BOLGEDE DEFORME OLMUS KOT FARKI OLUSTURAN MAZGAL MEVCUT. TAKILMAYA SEBEP OLABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1542
            },
            {
              "date": "2025-09-11",
              "person": "KALITE KONTROL",
              "detail": "10. BMK ACICI ONUNDE BULUNAN CUKUR TAKILMAYA DUSMEYE SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1550
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "4.MK FLOP BOLGESI YANGIN TUPUNDE MUHUR YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1641
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "5 MK FLOP BOLGESINDE YANGIN TUPU YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1642
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "6 MK BOYAMA BOLGESINDE TUP YERINDE VE SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1643
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "6 MK FLOP BOLGESINDE TUP BASINCI AZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1644
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "7 MK FLOP BOLGESINDE TUP SABIT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1645
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "7 MK PAKETLEME TUP BASINCI AZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1646
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "8 MK FLOP BOLGESINDE TUP YERI UYGUN DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1647
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "8 MK MILL GRUBU BASINC AZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1648
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "10 MK BOYAMADA TUP YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1649
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "10 MK FLOP BOLGESINDE TUP YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1650
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "10 MK OPERATOR PANOSU BOLGESINDE TUP YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1651
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-2",
              "detail": "14 MK FLOP BOLGESINDE TUP BASNIC AZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1652
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "14. MAKINA TESTERE ELEKTRIK PANOSUNA GECIS OLMAMASI NEDENI ILE MAKINA UZERINDEN GECILMEKTE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1661
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "13. MAKINA KAYNAK GRUBU PLATFORMUN KORKULUKLARI KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1662
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "14. MAKINA TESTERE ELEKTRIK PANOSU KORKULUK KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1663
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "14. MAKINA FLOP ACICI ELEKTRIK PANOSU MERDIVEN ONUNDE HIDROLIK UNITE YER ALMAKTA RISK TESKIL ETTIGI ICIN YERI DEGISTIRILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1664
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "13. MAKINA FLOP MILL ARASI BANT ALTINDAN GECIS YER ALMAKTA BURASI RISK TESKIL ETTIGI ICIN KAPATILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1665
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "13. MAKINA TESTERE KAYNAK GRUBU ELEKTRIK PANOLARI ICIN MERDIVEN YAPILMALI MAKINA UZERINDEN GECIS YAPILMAKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1666
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "4. MAKINA MILL ELEKTRIK PANOSUNA GECIS ICIN MERDIVEN YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1667
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "5. MAKINA MILL ELEKTRIK PANOSUNA GECIS ICIN MERDIVEN YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1668
            },
            {
              "date": "2025-10-21",
              "person": "E. BAKIM-1",
              "detail": "8. MAKINA MILL ELEKTRIK PANOSUNA GECIS ICIN MERDIVEN YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1669
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "14.BMK FLOOP L KANCA TUTACAK KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1809
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "13.BMK L KANCA UCU TIRNAK YOK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1810
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "13.BMK L SAPAN ASINMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1811
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "13.BMK L KANCA TUTACAK KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1812
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "10.BMK V4 KILIT ACIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1813
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "10.BMK FLOOP VINCI L KANCA TIRNAK SAGLIKLI DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1814
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "8.BMK PAKETLEME VINCI KULLANIM HATALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1815
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "8.BMK BANT INDIRME VINCI HASARLI EKIPMAN",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1816
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "7.BMK FLOOP VINCI TUTACAK KIRIK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1817
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "6.BMK FLOOP VINCI TUTACAK KUCUK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1818
            },
            {
              "date": "2025-12-12",
              "person": "KONSTRUKSIYON",
              "detail": "5.BMK FLOOP VINC TUTACAK KIRILMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1819
            },
            {
              "date": "2026-01-21",
              "person": "GALVANIZ",
              "detail": "6. BMK MERDIVEN KORKULUK TEK TARAFLIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1606
            },
            {
              "date": "2026-01-21",
              "person": "GALVANIZ",
              "detail": "10. BMK MERDIVEN KORKULUK BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1607
            },
            {
              "date": "2026-01-21",
              "person": "GALVANIZ",
              "detail": "10. BMK MERDIVEN KORKULUK TEK TARAFLIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1608
            },
            {
              "date": "2026-01-21",
              "person": "SEVKIYAT",
              "detail": "14.MAKINE FLOOP BOLGESI BANT CUKURUNUN UZERINDEKI KAPAKTA KOT FARKI VAR TAKILIP DUSME YASANABILIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1888
            },
            {
              "date": "2026-01-21",
              "person": "SEVKIYAT",
              "detail": "4.MAKINE FORM GURUBU BOLGESI YERDEKI DAGINIKLIK SEBEBI ILE TAKILIP DUSME OLABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1889
            },
            {
              "date": "2026-01-21",
              "person": "SEVKIYAT",
              "detail": "6.MAKINE BANT SARICI BOLGESI YERDEKI PARCA TAKILIP DUSMEYE SEBEP OLABILIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1890
            },
            {
              "date": "2026-01-21",
              "person": "SEVKIYAT",
              "detail": "7.MAKINE BANT SEHPASININ UCU HAVAYA KALKMIS TAKILIP DUSMEYE SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1891
            },
            {
              "date": "2026-01-21",
              "person": "SEVKIYAT",
              "detail": "7.MAKINE ARKASI YERDEKI BANTLAR TAKILIP DUSMEYE SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1892
            }
          ]
        },
        {
          "department": "KONSTRUKSIYON",
          "total": 127,
          "missing": 27,
          "missingRate": 21.26,
          "items": [
            {
              "date": "2025-02-26",
              "person": "DILME",
              "detail": "19. BMK ACICI YANINDA TAKILMA RISKI OLABILECEK SAC MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 310
            },
            {
              "date": "2025-02-26",
              "person": "DILME",
              "detail": "19. BMK FLOOP BOLGESI TAKILMA RISKI OLUSMAKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 316
            },
            {
              "date": "2025-02-26",
              "person": "DILME",
              "detail": "20. BMK ACICI ZEMIN TABLA TAKILMA RISKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 323
            },
            {
              "date": "2025-03-06",
              "person": "E. BAKIM-2",
              "detail": "23 BM FORM GRUBUNDAKI ANAHTAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 478
            },
            {
              "date": "2025-06-19",
              "person": "E. BAKIM-1",
              "detail": "20. MAKINE ACISI SAC",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 962
            },
            {
              "date": "2025-06-19",
              "person": "E. BAKIM-1",
              "detail": "22. MAKINE ZEMIN USTUNDEN GECEN KABLO TAVASI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 964
            },
            {
              "date": "2025-06-19",
              "person": "E. BAKIM-1",
              "detail": "17. MAKINE YERDE BULUNAN SEVIYE FARKI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 968
            },
            {
              "date": "2025-09-11",
              "person": "KONVANSIYONEL",
              "detail": "17 BMK OPERATOR PANO BOLGESINDE KAYAGNA ZEMIN EGIM VE COKME DURUMU VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1512
            },
            {
              "date": "2025-09-11",
              "person": "KONVANSIYONEL",
              "detail": "20 BMK BANT ACICI ON TARAFINDA KOT FARKI VE SACI ACIK ALAN VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1513
            },
            {
              "date": "2025-10-14",
              "person": "SEVKIYAT",
              "detail": "17.MAKINE ROLE YOLU ARALARDA PERSONELIN GECIS YAPACAGI RISKLI ALANLAR MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1574
            },
            {
              "date": "2025-10-14",
              "person": "SEVKIYAT",
              "detail": "17.MAKINE ROLE YOLU ARALARDA PERSONELIN GECIS YAPACAGI RISKLI ALANLAR MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1575
            },
            {
              "date": "2025-10-14",
              "person": "SEVKIYAT",
              "detail": "19.MAKINE BANT SARICI ERTAFI MERDIVEN KORKULUGU YOK BASAMAKLAR HASARLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1577
            },
            {
              "date": "2025-10-16",
              "person": "KONVANSIYONEL-1",
              "detail": "22 BMK FLOOP BOLGESINDEKI YSC BASINCI DUSUK DEGISTIRILMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1628
            },
            {
              "date": "2025-10-21",
              "person": "HAT BORULAR",
              "detail": "21.BORU MAKINESI ACICI ILE BANT BIRLESTIRME ARASINDA KI KORKULUK UZATILMALI PERSONELE GECIS YERI BIRAKILMAMALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1675
            },
            {
              "date": "2025-10-21",
              "person": "HAT BORULAR",
              "detail": "17.BORU MAKINESI FLOOP ILE FORM GIRIS ARASI KORKULUK ILE KAPATILMALIDIR. 20.BORU MAKINESINDE KI CALISMA COK FAYDALIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1677
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "FLLOP 18. BMK KANCA UCUNDAKI KAYMA ENGELLEYICI SAGLAM YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 920
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "23 MK BOLGESI VINC MANDALI TEL ILE BAGLANMIS YENILENMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 922
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "23. BMK FLOOP KANCA UCU KONTROL EDILEREK SAGLAMLASTIRILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 923
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "C KANCA ILE MAPA IC ICE GIRMIS KALIKLIGI YARI YARIYA DUSURMUS CIDDI TEHLIKE ARZ EDIYOR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 924
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "21 MK ALTINDAKI MAPA 25 TONLUK TERAZI VE KALDIRMA YUKLERI VS 7 TON KAPASITE ASACAK DURUM VAR ISE DEGERLENDIRILMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 925
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "17.BMK OPERATOR PANOSU YANI ETRAFI SARI SIYAH BOYANACAK",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1859
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "17.BMK OPERATOR PANOSU ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1860
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "17.BMK TESTERE SONRASI ROLE YOLU ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1861
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "19.BMK OPERATOR PANOSU ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1862
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "21.BMK OPERATOR PANOSU ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1863
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "21.BMK FLOOP PANO ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1864
            },
            {
              "date": "2026-01-23",
              "person": "KONVANSIYONEL-2",
              "detail": "20BMK OPERATOR PANOSU ONU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1865
            }
          ]
        },
        {
          "department": "KONVANSIYONEL",
          "total": 123,
          "missing": 41,
          "missingRate": 33.33,
          "items": [
            {
              "date": "2025-02-27",
              "person": "KAPLAMA",
              "detail": "3 BMK PAKETLEME BORU HATTI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 331
            },
            {
              "date": "2025-02-27",
              "person": "KAPLAMA",
              "detail": "3 BMK PAKETLEME TASIMA ARABASI KOT FARKI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 332
            },
            {
              "date": "2025-02-27",
              "person": "KAPLAMA",
              "detail": "2 BMK PAKETLEME HIDROLIK PRES KOT FARKI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 333
            },
            {
              "date": "2025-02-27",
              "person": "KAPLAMA",
              "detail": "2 BMK KAYNAK GRUBU MAZGAL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 336
            },
            {
              "date": "2025-02-27",
              "person": "KAPLAMA",
              "detail": "24 BMK ACICI ALTI SACLAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 343
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "3.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 970
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "3.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 971
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "3.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 972
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "16.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 973
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "16.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 974
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "16.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 975
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "16.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 976
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "16.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 977
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "1.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 978
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "1.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 979
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "1.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 980
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "26.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 981
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "26.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 982
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "24.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 985
            },
            {
              "date": "2025-06-18",
              "person": "KAPLAMA",
              "detail": "25.BMK TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 986
            },
            {
              "date": "2025-10-08",
              "person": "KONSTRUKSIYON",
              "detail": "27 BMK ACICI ARKASI MUHAFAZA BAGLANTI DESTAK PROFIL TAKILMAYA SEBEP OLABILIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1581
            },
            {
              "date": "2025-10-15",
              "person": "SEVKIYAT",
              "detail": "3.MAKINE KABLO KANALI TAKILIP DUSMEYE VEYA AYAK BURKULMASINA SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1516
            },
            {
              "date": "2025-10-15",
              "person": "SEVKIYAT",
              "detail": "2.MAKINE BANT SARICI BOLGESI MERDIVEN ONUNDEKI KABLOLAR TAKILIP DUSMEYE SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1518
            },
            {
              "date": "2025-10-15",
              "person": "SEVKIYAT",
              "detail": "24.MAKINE FLOOP BOLGESI KABLO KANALI OLARAK KULLANILAN BORULAR AYAK BURKULMASI VEYA DUSMEYE SEBEBIYET VEREBILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1519
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "16.BMKDA BULUNAN EL ALETLERI UYGUN HALE GETIRILMELI VE UYGUN YERLERDE MUHAFAZA EDILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1917
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "3.BMKDA BULUNAN CEKIC UYGUN HALE GETIRILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1918
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "2.BMKDA KULLANILAN EL ALETLERI UYGUN YERLERE YERLESTSRLMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1919
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "2.BMKDA BULUNAN ANAHTARIN SAPINDAKI PLASTIK DEFORME OLMUS DEGISTIRILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1920
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "1.BMKDA KULLANILAN KAYNAK MAKINESININ KABLOSU DEGISTIRILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1921
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "25.BMKDA KULLANILAN ANAHTAR KIRILMIS KULLANILMAMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1922
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "26.BMKDA KULLANILAN CEKIC UYGUN DEGILDIR. UYGUN HALE GETIRILMELI YADA KULLANILMAMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1923
            },
            {
              "date": "2026-02-11",
              "person": "ISLEM HATLARI",
              "detail": "27.BMKDA KULLANILAN CEKICIN SAPINDAKI PLASTIK DEFORME OLMUS DEGISTIRILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1924
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "16. BMK MERDIVEN KORKULUKLARINDA BIR MIKTAR YUKSEK YAPILMASI TARTISILMALI .MUMKUNSE YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1866
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "2. BMK PLATFORM PROBLEMLI DUSME RISKI VAR. YENILENMLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1867
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "3. MK BU ACIKLIK KAZA RISKI TASIABILIYOR. KAPAMA YAPILMALI VEYA YURUME PLATFORM UZATILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1868
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "1. BMK MERDIVEN INME CIKMA SIRASINDA TUTMA KOLU YAPILMALI DENGESIZLIK DURUMDUNDA KAZA RISKINI ONLEMESI AMACIYLA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1869
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "MERDIVEN CIKILMASI SIRSINDA 1. MK BU ACIKLIK TEHLIKE OLUSTIRABIIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1870
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "27. MK FLOOP BOLGESI GENELLIKLE ACIKLIK DURUMDA . KAPATILMA DURUMU TARTISILMALI. MUMKUN ISE KAPATILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1871
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "25. MK PAKETLEME YURUS YOLUNDA ENGEL TESKIL EDEN BOLGELER MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1872
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "25. MK PAKETLEME ZEMIN ACIKLIGI TEHLIKELI . ORNEGI 4. MK DA CIDDI IS KAZASI OLDUGU ICIN BU GIBI BOLGELER KAPATILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1873
            },
            {
              "date": "2026-02-12",
              "person": "DILME",
              "detail": "25. MK PAKETLEME ZEMINDE BULUNAN KABLO BORUSU TEHLIKE OLUSTURMAKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1874
            }
          ]
        },
        {
          "department": "HAT BORULAR",
          "total": 111,
          "missing": 67,
          "missingRate": 60.36,
          "items": [
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "15. BMK PAKETLEME BOLGESINDE BETON KIRIKLARI KAYNAKLI KOT FARKI VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 219
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "15. BMK PAKETLEME MERDIVENI EKSIK KISIM VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 220
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "11. BMK PAKETLEME BOLGESI KABLO KAPGINDA ACIKLIKLAR VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 222
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "11. BMK ROLE YOLU KOT FARKINA NEDEN OLAN MAZGALLAR KESILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 223
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "11. BMK HIDROTEST BOLGESI BORYAGI TANKI ETRAFINDA ACIK KISIM VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 224
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "11. BMK KAYNAK GRUBU BOLGESI KOT FARKI VE ACIK BOLGE VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 226
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "11. BMK FLOOP BOLGESI BANT ACICI CEVRESI ACIK VE ISARETLEME YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 227
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK FORM GRUBU BORAYGI MAZGALLARI KOT FARKI VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 228
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK FORM GRUBU MERDIVENI KORKULUK EKSIK VE ARALIKLAR ESIT DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 229
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK SOGUTMA YOLU BORYAGI ARKA MAZGALLAR ACIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 231
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK TESTERE BOLGESI ZEMINDE ACIK ALAN VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 233
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK ROLE YOLU MAZGALI KISALTILMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 234
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK 2. KALITE SEHPASI MAZGALI KOT FARKI VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 235
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK IC YIKAMA BOLGESI KORKULUK EKSIK TAMAMLANACAK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 236
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12. BMK PHASE ARRAY-HIDROTEST ARASI KANALA MAZGAL YAPILACAK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 237
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12 BMK HAVSA CAPAK TASIYICI KAPAKLARI MUHAFAZA YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 238
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12 BMK IC YIKAMA ELEKTRIK PANISU ALTINDA ACIKLIK VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 239
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "12 BMK IC YIKAMA BORYAGI TANKI ETRAFINDA KOT FARKI OLAN YERLER VAR VE MERDIVEN BASAMAGI YOK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 240
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "9 BMK FLOOP BANT ACICI BOLGESI IKAZ ISARETI YAPILMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 241
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "9 BMK CEMBERLEME BOLGESI KOT FARKI BASAMAK YAPILACAK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 244
            },
            {
              "date": "2025-02-27",
              "person": "KONVANSIYONEL",
              "detail": "9. BMK PAKETLEME BOLGESI BORYAGI MAZGAL ACIKLIK VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 245
            },
            {
              "date": "2025-03-07",
              "person": "DILME",
              "detail": "12. MK KULLANILAN TUTUCU EKIPMAN UYGUN ZEMIN HAZIRLANMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 451
            },
            {
              "date": "2025-03-07",
              "person": "DILME",
              "detail": "12. BMK BOYAMA TARAFI 2. KALITE SEHBASU TARAFINDA KABLO ACIKTA KOPMAYA MUSAIT DURUMDA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 452
            },
            {
              "date": "2025-03-07",
              "person": "DILME",
              "detail": "11. BMK CEMBER AYAR KOLU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 462
            },
            {
              "date": "2025-03-07",
              "person": "DILME",
              "detail": "11. BMK KATER AYAR KOLU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 463
            },
            {
              "date": "2025-05-16",
              "person": "GALVANIZ",
              "detail": "12. BMK C KANCA EMNIYET MANDALI UYGUNSUZ.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 914
            },
            {
              "date": "2025-05-16",
              "person": "GALVANIZ",
              "detail": "11. BMK C KANCA EMNIYET MANDALI UYGUNSUZ. HALATTA TELLENME VAR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 915
            },
            {
              "date": "2025-05-16",
              "person": "GALVANIZ",
              "detail": "15. BMK L KANCA TUTMA NOKTASI UYGUNSUZ.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 916
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "11. BMK HIDROTEST BOLGESINDE BULUNAN TESISAT BORULARINA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 949
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "11. BMK PHASED ARRAY BOLGESI YAGLAMA VE HAVA HATTI BORULARINA VEYA KORUYUCUSUNA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 950
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "12. BMK IC YIKAMA BOLGESI YURUME YOLUNDAN GECEN TESISAT BORUSUNA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 951
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "12. BMK PHASED ARRAY BOLGESI YAGLAMA ICIN CEKILEN HATTA VEYA MUHAFAZASINA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 952
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "9. BMK PAKETLEME HAVSA ZINCIRLERI VE TESTERE BOLGELERINDE BULUNAN TESISAT BORULARINA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 953
            },
            {
              "date": "2025-06-19",
              "person": "KALITE KONTROL",
              "detail": "15. BMK TESTERE VE ARKASINDAKI BOLGEDEN GECEN TESISAT BORULARINA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 954
            },
            {
              "date": "2025-06-26",
              "person": "E. BAKIM-2",
              "detail": "12 BM ACICI TUP BOS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1013
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "12.BORU MAKINESI VE 11.BORU MAKINESI ARASINDA KULLANILAN 2.KALITE ISTIF AYAGI MERDIVEN KORKULUGU KIRIK.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1078
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "12.BORU MAKINESI SOGUTMA YOLU BOLGESINDE BULUNAN 2.KALITE ISTIF AYAGINA YAPILAN KORKULUK TEK TARAFLI YAPILMIS. CIFT TARAF KORKULUK YAPILMASI GEREKMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1079
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "11.BORU MAKINESI HAREKETLI MERDIVEN DEFORME OLMUS DURUMDADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1080
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "15.BORU MAKINESI VE 11.BORU MAKINESI ARASINDA BULUNAN ELEKTRIK PANO KORKULUKLARI VE SASE KESILMI. KORKULUK VE SASENIN YAPILMASI GEREKMEKETEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1081
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "9.BORU MAKINESI FLOOP KORKULUKLARININ EKSIKLERININ TAMAMLANMASI GEREKMKETEDIR. UST KORKULUK MEVCUT DEGIL",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1082
            },
            {
              "date": "2025-08-01",
              "person": "M. BAKIM",
              "detail": "9.BORU MAKINESI PAKETLEME TARAFINDA BULUNAN GUVENLI GECIS MERDIVEN AYAKLARI ZEMIN KAYNAGINDAN KIRILMIS.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1083
            },
            {
              "date": "2025-10-01",
              "person": "DILME",
              "detail": "12. MK OPERATOR EKIPMANI DAHA ERGONOMIK OLABILIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1274
            },
            {
              "date": "2025-10-01",
              "person": "DILME",
              "detail": "12. MK FLOOP BOLGESI KULLANILAN CEKIC METAL SAPLI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1275
            },
            {
              "date": "2025-10-01",
              "person": "DILME",
              "detail": "BU BOLGE DUSMEYE SEBEP OLABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1279
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "9. MAKINE PAKET ROLE YOLU BIR YONDE KORUMA VE ARAYA GIRIS ICIN ENGELLER VAR IKEN DIGER TARAFTA BUNU ENGELLEYECEK HERHANGIBIR BIR BARIYER BULUNMAMAKTA BARIYER HER KI TARAFA YAPILMALIDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1560
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "9. MAKINE PAKETLEME ALANINDA ELEKTRIK PANOLARINA GECIS ICIN MERDIVEN BULUNMALIDIR EN YAKIN MERDIVEN PAKETLEME ONCESI YER ALMAKTA VE UZUN BIR MESAFEDE YER ALMAKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1561
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "12. MAKINE HAVSALAMA ILE IC YIKAMA ARASINDAN ELEKTRIK PANOSU KISMINA GECISTE MERDIVEN BULUNMALIDIR GECIS BORU ALTINDAN YAPILMAKTA VEYA EN YAKIN MERDIVENI KULLANMAK ICIN UZUN MESAFELER GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1562
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "12. MAKINE OTOMATIK CEMBERLEME MAKINALARINDAKI YUKSEKTE BULUNAN DONANIMA ARIZA ANINDA ERISIMI SAGLANMASI ICIN PLATFORM GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1563
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "12. MAKINE PHASE ARRAY ISTASYONLARINDAKI YUKSEKTE BULUNAN DONANIMA ARIZA ANINDA ERISIMI SAGLAMAK ICIN PLARFORM GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1564
            },
            {
              "date": "2025-10-02",
              "person": "E. BAKIM-1",
              "detail": "11. MAKINE PHASE ARRAY ISTASYONLARINDAKI YUKSEKTE BULUNAN DONANIMA ARIZA ANINDA ERISIMI SAGLAMAK ICIN PLARFORM GEREKMEKTEDIR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1565
            },
            {
              "date": "2025-10-16",
              "person": "SEVKIYAT",
              "detail": "15.MAKINE HAT BORU OFISI ARKASINDAKI BOLGEDE YANGIN TUPLERI YERDE BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1618
            },
            {
              "date": "2025-10-16",
              "person": "SEVKIYAT",
              "detail": "12.MAKINE HIDROTEST CEVRESINDEKI YANGIN TUPU UYGUNSUZ SEKILDE KONULMUSTUR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1619
            },
            {
              "date": "2025-10-16",
              "person": "SEVKIYAT",
              "detail": "11.MAKINE PAKETLEME ARKASI YANGIN TUPU YERDE DURMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1620
            },
            {
              "date": "2025-10-16",
              "person": "SEVKIYAT",
              "detail": "12.MAKINE PAKETLEME YANI YANGIN TUPLERININ BULUNDUGU BOLGE UYGUN DEGIL.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1621
            },
            {
              "date": "2025-12-03",
              "person": "GALVANIZ",
              "detail": "12. BMK IC YIKAMA BOLGESI MAZGAL UYGUNSUZ",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1504
            },
            {
              "date": "2025-12-03",
              "person": "GALVANIZ",
              "detail": "12 BMK MAZGAL ARASI ACIKLIK UYGUNSUZDUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1505
            },
            {
              "date": "2025-12-03",
              "person": "GALVANIZ",
              "detail": "11 BMK FLOP BOLGESI YER SAPLAMA CIKINTILARI UYGUNSUZDUR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1506
            },
            {
              "date": "2025-12-11",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE FLOOP VINCI EMNIYET MANDALI ARIZALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1780
            },
            {
              "date": "2025-12-11",
              "person": "SEVKIYAT",
              "detail": "9.MAKINE FLOOP VINC 2 EMNIYET MANDALI ARIZALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1781
            },
            {
              "date": "2025-12-11",
              "person": "SEVKIYAT",
              "detail": "11.MAKINE FLOOP VINCI EMNIYET MANDALI ARIZALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1782
            },
            {
              "date": "2025-12-11",
              "person": "SEVKIYAT",
              "detail": "11.MAKINE FLOOP BANT KACASININ UCUNDAKI TIRNAK ERIMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1783
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "12 MK BIRIKEN HF KAYNAK CAPAGINI CEKMEK ICIN KULLANILIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1911
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "12 MK METAL SAPLI CEKIC",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1912
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "11 MK KAYNAK CAPAK CEKME APARAT UYGUNSUZLUGU",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1913
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "11.MK UYGUNSUZ CEKIC",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1914
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "15 MK KAYNAK GRUBUNDA EGRI 32 LIK ANAHTAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1915
            },
            {
              "date": "2026-02-11",
              "person": "KONVANSIYONEL-2",
              "detail": "9 MK BIRIKEN HF KAYNAK CAPAGINI CEKMEK ICIN KULLANILIYOR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1916
            }
          ]
        },
        {
          "department": "SEVKIYAT",
          "total": 107,
          "missing": 12,
          "missingRate": 11.21,
          "items": [
            {
              "date": "2025-06-26",
              "person": "KALITE KONTROL",
              "detail": "EK-2 BINADA BULUNAN YANGIN SONDURME TUPLERININ MUHAFAZA EDILDIGI ALANLAR UYGUN DEGILDIR VE TANIMLAMA BULUNMAMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1037
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S18 YURUME YOLUNDA MALZEMELER VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1089
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S13 GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1091
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S14 GUVENLI GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1097
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S13 GUVENLI GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1098
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S8 DE MALZEME ISTIF SAHASINDAN CIKMIS YURUYUS GUZERGAHINI KAPATMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1100
            },
            {
              "date": "2025-07-07",
              "person": "UNIVERSAL",
              "detail": "S10 BATI TARAF ISTIF KORKULUGU HASAR ALMISTIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1101
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "YENI YATIRIM BOLGESI 29. MK YANI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1603
            },
            {
              "date": "2026-01-19",
              "person": "UNIVERSAL",
              "detail": "HOLLER ARASINDAKI MERDIVEN RAY YOLU HASAR ALMIS S7J HUCRESI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1698
            },
            {
              "date": "2026-01-19",
              "person": "UNIVERSAL",
              "detail": "S14 K GUVENLI GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1701
            },
            {
              "date": "2026-01-19",
              "person": "UNIVERSAL",
              "detail": "S16 K GUVENLI GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1702
            },
            {
              "date": "2026-01-19",
              "person": "UNIVERSAL",
              "detail": "S13 N GUVENLI GECIS ALANI HASAR ALMIS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1703
            }
          ]
        },
        {
          "department": "ISLEM HATLARI",
          "total": 85,
          "missing": 36,
          "missingRate": 42.35,
          "items": [
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4 OFFLINE BOYA KURUTMA VE TAPALAMA BOLGESINDE KAYNAKLI SAC ILE ZEMIN ARASINDA KOT FARKI OLUSMUS. BAGLANTI KAYNAKLARI DEFORME OLMUS. TAKILMA RISKI MEVCUT. SAC KOT FARKI VE KAYNAK BAGLANTI UYGUNSUZLUKLARI GIDERILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 347
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4 OFFLINE BOYAMA GIRISI ONCESIZEMINDE KOT FARKI OLAN BOLGELER MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 352
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4 OFFLINE HIDROTEST BOLGESI ZEMINDE KOT FARKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 354
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4 OFFLINE HIDROTEST BOLGESI MAZGALLARDA KOT FARKI OLAN BOLGELER MEVCUT. AYRICA MAZGALLA KAPATILMAYAN BIR BOLGE MEVCUT. MAZGALLARDAKI UYGUNSUZLUKLAR DUZELTILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 355
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "MANUEL DOGRULTMA BOLGESI ZEMINDEN GECEN BORUYA TAKILMA RISKI MEVCUT.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 357
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4. BOYAMA BOLGESI KOT FARKI BULUNAN ZEMIN UYGUN DURUMA GETIRILMELI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 359
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4. BOYAMA COIL ARKASINDA BULUNAN SAC PLATFORMDAN DUSME TEHLIKESI MEVCUT. MERDIVEN VEYA KORKULUK YAPILABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 360
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "4. BOYA PAKETLEME BOLGESI KANALIN UZERINE UYGULANAN KORUYUCU SAC KAPAK KOT FARKI OLUSTURUYOR. ZEMINLI UYUMLU HALE GETIRILEBILIR VEYA MAZGAL TAKILABILIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 361
            },
            {
              "date": "2025-02-27",
              "person": "KALITE KONTROL",
              "detail": "6 OFFLINE BOYA KURUTMA VE TAPALAMA KABINI GIRISI ONCESINDE CUKUR ALAN MEVCUT. ZEMIN UYGUNSUZLUGU GIDERILMELIDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 364
            },
            {
              "date": "2025-06-19",
              "person": "GALVANIZ",
              "detail": "6 OFF LINE YURUS YOLUNDA KAPAK KULPU TAKILMA RISKI OLUSTURMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 956
            },
            {
              "date": "2025-06-19",
              "person": "GALVANIZ",
              "detail": "4 OFF LINE TAKILMA RISKI BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 957
            },
            {
              "date": "2025-06-19",
              "person": "GALVANIZ",
              "detail": "TAVLAMA CIKIS TRANSFER ARACI YOLUNDA TAKILMA RISKI BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 958
            },
            {
              "date": "2025-06-19",
              "person": "GALVANIZ",
              "detail": "1. BOYAMA BOYA TABANCASI VE SAYYAR TAKILMA RISKI OLUSTURMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 959
            },
            {
              "date": "2025-07-11",
              "person": "KAPLAMA",
              "detail": "DOGRULTMA MAKINASINDAN DIGER TARAFA GECIS OLMADIGINDAN MERDIVEN PLATFORM YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1066
            },
            {
              "date": "2025-09-22",
              "person": "M. BAKIM",
              "detail": "OTOMATIK DOGRULTMA-TAKILMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1522
            },
            {
              "date": "2025-09-22",
              "person": "M. BAKIM",
              "detail": "OTOMATIK DOGRULTMA-TAKILMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1523
            },
            {
              "date": "2025-09-22",
              "person": "M. BAKIM",
              "detail": "6 OFFLINE-TAKILMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1524
            },
            {
              "date": "2025-09-22",
              "person": "M. BAKIM",
              "detail": "4 OFFLINE-TAKILMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1525
            },
            {
              "date": "2025-09-22",
              "person": "M. BAKIM",
              "detail": "4 OFFLINE-TAKILMA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1526
            },
            {
              "date": "2025-10-06",
              "person": "KALITE KONTROL",
              "detail": "3. BOYAMA BOLGESINDEKI MERDIVEN ONUNDE 2. KALITE MALZEME MEVCUT OLUP GECISI ENGELLEMEKTEDIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1571
            },
            {
              "date": "2025-10-23",
              "person": "KONVANSIYONEL-2",
              "detail": "4 OFFLINE HATTINDA HIDROTEST EBAT DEGISIMINDE KULLANILAN MERDIVENDE 3 UYGUNSUZLUK 1-YERLE ARA MESAFE BOSLUGU 2-KAPI KIRILMIS 3-UST SAC TAKILMAYA MUSAIT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1687
            },
            {
              "date": "2025-10-23",
              "person": "KONVANSIYONEL-2",
              "detail": "4.BOYAMA KABIN ARKASI HAVALANDIRMA CIKIS ICIN MERDIVEN YAPILMASI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1689
            },
            {
              "date": "2025-10-23",
              "person": "KONVANSIYONEL-2",
              "detail": "1. OFFLINE ISITICI COIL UNITESI GECIS MERDIVENI SAC ILE YAPILMIS ALT KISMI BOS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1690
            },
            {
              "date": "2025-10-23",
              "person": "KONVANSIYONEL-2",
              "detail": "3.BOYAMA PAKETLEME ASANSOR MERDIVENINDE EGIK UYGUNSLUGU MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1695
            },
            {
              "date": "2025-10-23",
              "person": "KONVANSIYONEL-2",
              "detail": "6 OFFLINE DAN ECT TARAFINA GECILEN MERDIVENDE ZEMIN BALCIK KAYGAN",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1696
            },
            {
              "date": "2025-12-25",
              "person": "DILME",
              "detail": "3. BOYAMA CIKIS DEFORME OLMUS EN KISA ZAMANDA DEGISIMI YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1792
            },
            {
              "date": "2025-12-25",
              "person": "DILME",
              "detail": "4. BOYAMA 2 NOLU VINC SAPAN DEFORM OLMUS DEGISIMI YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1793
            },
            {
              "date": "2025-12-25",
              "person": "DILME",
              "detail": "1. BOYAMA SAPAN DEFORM OLMUS",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1794
            },
            {
              "date": "2025-12-25",
              "person": "DILME",
              "detail": "4. BOYAMA SAPAN AZ DEFORM OLMUS TAKIP EDILMELI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1795
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "6 OFFLINE-3.BOYAMA ARASI YERDEN GIDEN BORUYA TAKILMA RISKI VAR",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1875
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "TAVLAMA SONRASI MANUEL PAKETLEME BOLGESINDE YERDEKI BORUYA TAKILMA RISKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1876
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "4 OFFLINE YIKAMA YANI YERDE KOT FARKI OLAN BOLGE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1877
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "4 OFFLINE BOYAMA SONRASI MAZGALLARDA YUKSEKLIK FARKI TAKILMA RISKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1878
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "3.HIDROTEST YERDE BOSLUK OLAN BOLGEDE TAKILMA RISKI MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1879
            },
            {
              "date": "2026-01-29",
              "person": "KAPLAMA",
              "detail": "3.HIDROTEST YERDEKI MAZGALDA YUKSEKLIK FARKI OLAN BOLGE MEVCUT",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1880
            },
            {
              "date": "2026-02-04",
              "person": "SEVKIYAT",
              "detail": "EKIPMAN DOLAPLARI GENEL OLARAK DAGINIK VE ALAKASIZ ESYALAR UZAKLASTIRILARAK DUZEN SAGLANMALI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1893
            }
          ]
        },
        {
          "department": "GALVANIZ",
          "total": 46,
          "missing": 10,
          "missingRate": 21.74,
          "items": [
            {
              "date": "2026-01-26",
              "person": "UNIVERSAL",
              "detail": "YURUYUS YOLUNA ATILMIS MALZEME BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1855
            },
            {
              "date": "2026-01-26",
              "person": "UNIVERSAL",
              "detail": "PAKETLEME ARABASI ETRAFINDA YERINDE OLMAYAN MAZGAL BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1856
            },
            {
              "date": "2026-01-26",
              "person": "UNIVERSAL",
              "detail": "2. KALITE AYAGI DISINA ATILMIS VE YURUYUS YOLUNDA BULUNAN MALZEMELER BULUNMAKTADIR.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1857
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1904
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1905
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1906
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1907
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1908
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1909
            },
            {
              "date": "2026-02-11",
              "person": "KONSTRUKSIYON",
              "detail": "UYGUN OLMAYAN VE YERI BELLI OLMAYAN EL ALETI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1910
            }
          ]
        },
        {
          "department": "Y. TESISLER",
          "total": 43,
          "missing": 8,
          "missingRate": 18.6,
          "items": [
            {
              "date": "2025-03-27",
              "person": "DILME",
              "detail": "YARDIMCI TESISLER SU DEPOLARI BOLGESINDE TUP GELISI GUZEL BULUNMAKTA",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 871
            },
            {
              "date": "2025-07-03",
              "person": "KONVANSIYONEL",
              "detail": "ATOLYE BOLGESI GENEL OLARAK DAGINIK VE TOPARLAMA YAPILMASI GEREKLI.",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1116
            },
            {
              "date": "2025-09-10",
              "person": "KAPLAMA",
              "detail": "TAKILIP DUSME RISKI OLAN BOLGE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1552
            },
            {
              "date": "2025-09-10",
              "person": "KAPLAMA",
              "detail": "TAKILIP DUSME RISKI OLAN BOLGE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1553
            },
            {
              "date": "2025-09-10",
              "person": "KAPLAMA",
              "detail": "TAKILIP DUSME RISKI OLAN BOLGE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1554
            },
            {
              "date": "2025-09-10",
              "person": "KAPLAMA",
              "detail": "TAKILIP DUSME RISKI OLAN BOLGE",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1555
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "YRD TESISLER YANGIN TUPU ICIN SEHBA EKSIK YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1654
            },
            {
              "date": "2025-12-04",
              "person": "DILME",
              "detail": "YANGIN TUPU YETERSIZ EKLEME YAPILMALI",
              "missingField": "Giderilmedi (Devam Ediyor)",
              "sourceRowNo": 1655
            }
          ]
        },
        {
          "department": "KAPLAMA",
          "total": 39,
          "missing": 0,
          "missingRate": 0,
          "items": []
        },
        {
          "department": "KALITE KONTROL",
          "total": 11,
          "missing": 0,
          "missingRate": 0,
          "items": []
        }
      ]
    }
  }
} as Record<IsgYearKey, Record<IsgMissingTopicId, IsgTopicMissingBreakdown>>;
