import type { ServicePageConfig, ServiceNominalOption } from "./ServiceOrderPage";


type ClassicNominalOption = ServiceNominalOption & { category: "promo" | "perWin" };

const classicOptions: ClassicNominalOption[] = [
  {
    id: "classic1",
    title: "Promo 10x Win",
    category: "promo",
    price: 35000,
    imageSrc: "/classic/Promo.png",
  },
  {
    id: "classic2",
    title: "Promo 10x Win Rank Honor",
    category: "promo",
    price: 37500,
    imageSrc: "/classic/Promo Honor.png",
  },
  {
    id: "classic3",
    title: "Promo 10x Win Rank Glory+",
    category: "promo",
    price: 40000,
    imageSrc: "/classic/Promo Glory.png",
  },
  {
    id: "classic4",
    title: "Joki Classic / Win",
    category: "perWin",
    price: 4000,
    imageSrc: "/classic/Classic.png",
  },
  {
    id: "classic5",
    title: "Joki Classic / Win (Rank Honor)",
    category: "perWin",
    price: 4500,
    imageSrc: "/classic/Classic Honor.png",
  },
  {
    id: "classic6",
    title: "Joki Classic / Win (Rank Glory+)",
    category: "perWin",
    price: 5000,
    imageSrc: "/classic/Classic Glory.png",
  },
];

const classicConfig: ServicePageConfig = {
  serviceName: "Mobile Legends Classic",
  summaryTitle: "Joki Classic Mobile Legends",
  hero: { imageSrc: "/mobilelegends/Joki%20Classic.jpg", imageAlt: "Joki Classic Mobile Legends", eyebrow: "Mobile Legends: Bang Bang", title: "Joki Classic Mobile Legends" },
  promoText: "ORDER 10 BINTANG FREE 1 BINTANG",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. Hp/Moonton ID", placeholder: "Masukkan Email/No. Hp/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "requestHero", label: "Request Hero", placeholder: "Masukkan Request Hero", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
  ],
  nominalGroups: [
    { title: "Promo Joki Classic", options: classicOptions.filter((option) => option.category === "promo") },
    { title: "Joki Classic / Win", options: classicOptions.filter((option) => option.category === "perWin") },
  ],
  description: {
    title: "Deskripsi Joki Classic Mobile Legends",
    headline: "Joki Classic Mobile Legends Solusi Cepat Naik Winrate !",
    body: "Kami mempersembahkan layanan joki Classic Mobile Legends yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan winrate Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Target Winrate (Pastikan jumlah order sesuai dengan winrate yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type MabarNominalOption = ServiceNominalOption;

const mabarCategories: { title: string; options: MabarNominalOption[] }[] = [
  {
    title: "Mabar Penjoki / Match",
    options: [
      {
        id: "gm-star",
        title: "Mabar GM / Match",
        price: 5000,
        imageSrc: "/rank/Grandmaster.png",
      },
      {
        id: "epic-star",
        title: "Mabar Epic / Match",
        price: 7000,
        imageSrc: "/rank/Epic.png",
      },
      {
        id: "legend-star",
        title: "Mabar Legend / Match",
        price: 8000,
        imageSrc: "/rank/Legend.png",
      },
      {
        id: "mythic-star",
        title: "Mabar Mythic / Match",
        price: 12000,
        imageSrc: "/rank/Mythic.png",
      },
      {
        id: "honor-star",
        title: "Mabar Mythic Honor / Match",
        price: 14000,
        imageSrc: "/rank/Mythic Honor.png",
      },
      {
        id: "glory-star",
        title: "Mabar Mythic Glory / Match",
        price: 17000,
        imageSrc: "/rank/Mythic Glory.png",
      },
    ],
  },
  {
    title: "Paket Mabar",
    options: [
      {
        id: "gm-v-epic-v",
        title: "Mabar GM V - Epic V",
        price: 125000,
        imageSrc: "/paketgm/Gm Epic.png",
      },
      {
        id: "legend-iv-mythic",
        title: "Mabar Legend IV - Mythic",
        price: 160000,
        imageSrc: "/paketlegend/Legend Mythic.webp",
      },
      {
        id: "epic-v-legend-v",
        title: "Mabar Epic V - Legend V",
        price: 175000,
        imageSrc: "/paketepic/Epic Legend.png",
      },
      {
        id: "open-grading",
        title: "Mabar Open Grading Auto 15",
        price: 120000,
        imageSrc: "/paketmythic/Grading.png",
      },
      {
        id: "legend-v-mythic",
        title: "Mabar Legend V - Mythic",
        price: 200000,
        imageSrc: "/paketlegend/Legend Mythic.webp",
      },
      {
        id: "epic-i-mythic",
        title: "Mabar Epic I - Mythic",
        price: 235000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-ii-mythic",
        title: "Mabar Epic II - Mythic",
        price: 270000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-iii-mythic",
        title: "Mabar Epic III - Mythic",
        price: 305000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "gm-v-legend-v",
        title: "Mabar GM V - Legend V",
        price: 300000,
        imageSrc: "/paketgm/Gm Legend.png",
      },
      {
        id: "epic-iv-mythic",
        title: "Mabar Epic IV - Mythic",
        price: 340000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-v-mythic",
        title: "Mabar Epic V - Mythic",
        price: 375000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "mythic-1-25",
        title: "Mabar Mythic 1 - Mythic 25",
        price: 240000,
        imageSrc: "/paketmythic/Mythic Honor.png",
      },
      {
        id: "gm-v-mythic",
        title: "Mabar GM V - Mythic",
        price: 500000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
      {
        id: "mythic-25-50",
        title: "Mabar Mythic 25 - 50",
        price: 350000,
        imageSrc: "/pakethonor/Honor Glory.png",
      },
      {
        id: "mythic-1-50",
        title: "Mabar Mythic 1 - Mythic 50",
        price: 590000,
        imageSrc: "/paketmythic/Mythic Glory.png",
      },
    ],
  },
];

const mabarConfig: ServicePageConfig = {
  serviceName: "Mabar / Gendong Mobile Legends",
  summaryTitle: "Joki Mabar / Gendong Mobile Legends",
  hero: { imageSrc: "/mobilelegends/Joki%20Mabar.jpg", imageAlt: "Joki Mabar / Gendong Mobile Legends", eyebrow: "Mobile Legends: Bang Bang", title: "Joki Mabar / Gendong Mobile Legends" },
  promoText: "ORDER 10 BINTANG FREE 1 BINTANG",
  accountFields: [
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    {
      name: "role",
      label: "Pilih Role",
      type: "select",
      selectPlaceholder: "Pilih Role",
      required: true,
      options: [
        { label: "Roamer", value: "Roamer" },
        { label: "Explaner", value: "Explaner" },
        { label: "Midlaner", value: "Midlaner" },
      ],
    },
    { name: "booking", label: "Tanggal & Jam Booking", placeholder: "Masukkan Tanggal & Jam Booking", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
  ],
  nominalGroups: mabarCategories,
  description: {
    title: "Deskripsi Joki Mabar / Gendong Mobile Legends",
    headline: "Joki Mabar / Gendong Mobile Legends Solusi Cepat Naik Rank !",
    body: "Kami mempersembahkan layanan joki Mobile Legends yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Tujuan Rank (Pastikan jumlah order sesuai dengan rank yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type MmrNominalOption = ServiceNominalOption;

const mmrOptions: MmrNominalOption[] = [
  {
    id: "master",
    title: "Master / Star",
    price: 3000,
    imageSrc: "/rank/Master.png",
  },
  {
    id: "grandmaster",
    title: "Grandmaster / Star",
    price: 4000,
    imageSrc: "/rank/Grandmaster.png",
  },
  {
    id: "epic",
    title: "Epic / Star",
    price: 6000,
    imageSrc: "/rank/Epic.png",
  },
  {
    id: "legend",
    title: "Legend / Star",
    price: 7000,
    imageSrc: "/rank/Legend.png",
  },
  {
    id: "mythic",
    title: "Mythic / Star",
    price: 11000,
    imageSrc: "/rank/Mythic.png",
  },
  {
    id: "honor",
    title: "Mythic Honor / Star",
    price: 13000,
    imageSrc: "/rank/Mythic Honor.png",
  },
  {
    id: "glory",
    title: "Mythic Glory / Star",
    price: 16000,
    imageSrc: "/rank/Mythic Glory.png",
  },
  {
    id: "immortal",
    title: "Mythic Immortal / Star",
    price: 21000,
    imageSrc: "/rank/Mythic Immortal.png",
  },
];

const mmrConfig: ServicePageConfig = {
  serviceName: "Mobile Legends MMR",
  summaryTitle: "Joki MMR Rank Mobile Legends",
  hero: { imageSrc: "/mobilelegends/Joki%20Mmr.jpg", imageAlt: "Joki MMR Rank Mobile Legends", eyebrow: "Mobile Legends: Bang Bang", title: "Joki MMR Rank Mobile Legends" },
  promoText: "ORDER 10 BINTANG FREE 1 BINTANG",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. Hp/Moonton ID", placeholder: "Masukkan Email/No. Hp/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "hero", label: "Request Hero", placeholder: "Pilih Request Hero", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
    { name: "mmr", label: "MMR Saat Ini", placeholder: "Masukkan MMR Saat Ini", required: true },
  ],
  nominalGroups: [{ title: "Joki Rank / Star", options: mmrOptions }],
  description: {
    title: "Deskripsi Joki MMR Rank Mobile Legends",
    headline: "Joki MMR Rank Solusi Cepat Naikkan MMR Heromu!",
    body: "Kami mempersembahkan layanan joki MMR Rank yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan MMR Hero Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Tujuan Rank (Pastikan jumlah order sesuai dengan rank yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type RankNominalOption = ServiceNominalOption;

const rankCategories: { title: string; options: RankNominalOption[] }[] = [
  {
    title: "Joki Rank / Star",
    options: [
      {
        id: "master-star",
        title: "Master / Star",
        price: 2000,
        imageSrc: "/rank/Master.png",
      },
      {
        id: "gm-star",
        title: "Grandmaster / Star",
        price: 3000,
        imageSrc: "/rank/Grandmaster.png",
      },
      {
        id: "epic-star",
        title: "Epic / Star",
        price: 5000,
        imageSrc: "/rank/Epic.png",
      },
      {
        id: "legend-star",
        title: "Legend / Star",
        price: 6000,
        imageSrc: "/rank/Legend.png",
      },
      {
        id: "mythic-star",
        title: "Mythic / Star",
        price: 10000,
        imageSrc: "/rank/Mythic.png",
      },
      {
        id: "honor-star",
        title: "Mythic Honor / Star",
        price: 12000,
        imageSrc: "/rank/Mythic Honor.png",
      },
      {
        id: "glory-star",
        title: "Mythic Glory / Star",
        price: 15000,
        imageSrc: "/rank/Mythic Glory.png",
      },
      {
        id: "immortal-star",
        title: "Mythic Immortal / Star",
        price: 20000,
        imageSrc: "/rank/Mythic Immortal.png",
      },
    ],
  },
  {
    title: "Paket Grandmaster",
    options: [
      {
        id: "gm-v-epic-v",
        title: "GM V - Epic V",
        price: 75000,
        imageSrc: "/paketgm/Gm Epic.png",
      },
      {
        id: "gm-v-legend-v",
        title: "GM V - Legend V",
        price: 200000,
        imageSrc: "/paketgm/Gm Legend.png",
      },
      {
        id: "gm-i-mythic",
        title: "GM I - Mythic",
        price: 290000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
      {
        id: "gm-ii-mythic",
        title: "GM II - Mythic",
        price: 305000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
      {
        id: "gm-iii-mythic",
        title: "GM III - Mythic",
        price: 320000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
      {
        id: "gm-iv-mythic",
        title: "GM IV - Mythic",
        price: 335000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
      {
        id: "gm-v-mythic",
        title: "GM V - Mythic",
        price: 350000,
        imageSrc: "/paketgm/Gm Mythic.png",
      },
    ],
  },
  {
    title: "Paket Epic",
    options: [
      {
        id: "epic-v-legend-v",
        title: "Epic V - Legend V",
        price: 125000,
        imageSrc: "/paketepic/Epic Legend.png",
      },
      {
        id: "epic-i-mythic",
        title: "Epic I - Mythic",
        price: 175000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-ii-mythic",
        title: "Epic II - Mythic",
        price: 200000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-iii-mythic",
        title: "Epic III - Mythic",
        price: 225000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-iv-mythic",
        title: "Epic IV - Mythic",
        price: 250000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
      {
        id: "epic-v-mythic",
        title: "Epic V - Mythic",
        price: 275000,
        imageSrc: "/paketepic/Epic Mythic.png",
      },
    ],
  },
  {
    title: "Paket Legend",
    options: [
      {
        id: "legend-v-mythic",
        title: "Legend V - Mythic",
        price: 150000,
        imageSrc: "/paketlegend/Legend Mythic.webp",
      },
      {
        id: "legend-v-honor",
        title: "Legend V - Mythic Honor",
        price: 350000,
        imageSrc: "/paketlegend/Legend Honor.png",
      },
      {
        id: "legend-v-glory",
        title: "Legend V - Mythic Glory",
        price: 650000,
        imageSrc: "/paketlegend/Legend Glory.png",
      },
      {
        id: "legend-v-immortal",
        title: "Legend V - Mythic Immortal",
        price: 1400000,
        imageSrc: "/paketlegend/Legend Immo.png", 
      },
    ],
  },
  {
    title: "Paket Mythic",
    options: [
      {
        id: "open-grading",
        title: "Open Grading (Auto Star 15)",
        price: 100000,
        imageSrc: "/paketmythic/Grading.png",
      },
      {
        id: "mythic-honor-grading",
        title: "Mythic Grading - Mythic Honor (25)",
        price: 200000,
        imageSrc: "/paketmythic/Grading Honor.png",
      },
      {
        id: "mythic-glory-grading",
        title: "Mythic Grading - Mythic Glory (50)",
        price: 500000,
        imageSrc: "/paketmythic/Grading Glory.webp",
      },
      {
        id: "mythic-immortal-grading",
        title: "Mythic Grading - Mythic Immortal (100)",
        price: 1250000,
        imageSrc: "/paketmythic/Grading Immo.png", 
      },
    ],
  },
  {
    title: "Paket Mythic Honor",
    options: [
      {
        id: "honor-to-glory",
        title: "Mythic Honor (25) - Mythic Glory (50)",
        price: 300000,
        imageSrc: "/pakethonor/Honor Glory.png",
      },
      {
        id: "honor-to-immortal",
        title: "Mythic Honor (25) - Mythic Immortal (100)",
        price: 1050000,
        imageSrc: "/pakethonor/Honor Immo.png", 
      },
    ],
  },
  {
    title: "Paket Mythic Glory",
    options: [
      {
        id: "glory-to-immortal",
        title: "Mythic Glory (50) - Mythic Immortal (100)",
        price: 750000,
        imageSrc: "/paketglory/Glory Immo.png",
      },
    ],
  },
];

const rankConfig: ServicePageConfig = {
  serviceName: "Mobile Legends Rank",
  summaryTitle: "Joki Rank Mobile Legends",
  hero: { imageSrc: "/mobilelegends/Joki%20Rank.jpg", imageAlt: "Joki Rank Mobile Legends", eyebrow: "Mobile Legends: Bang Bang", title: "Joki Rank Mobile Legends" },
  promoText: "ORDER 10 BINTANG FREE 1 BINTANG",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. HP/Moonton ID", placeholder: "Masukkan Email/No. HP/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "hero", label: "Request Hero (Min 3 Hero)", placeholder: "Masukkan Request Hero (Min 3 Hero)", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
  ],
  nominalGroups: rankCategories,
  description: {
    title: "Deskripsi Joki Rank Mobile Legends",
    headline: "Joki Rank Mobile Legends Solusi Cepat Naik Rank !",
    body: "Kami mempersembahkan layanan joki Mobile Legends yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Tujuan Rank (Pastikan jumlah order sesuai dengan rank yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type RisingLeagueNominalOption = ServiceNominalOption;

const risingLeagueOptions: RisingLeagueNominalOption[] = [
  {
    id: "pialacoklat",
    title: "Rising Piala Coklat",
    price: 25000,
    imageSrc: "/rising/Piala Coklat.png",
  },
  {
    id: "pialahijau",
    title: "Rising Piala Hijau (Bracket Area)",
    price: 35000,
    imageSrc: "/rising/Piala Hijau.png",
  },
  {
    id: "pialabiru",
    title: "Rising Piala Biru (Bracket Kota)",
    price: 45000,
    imageSrc: "/rising/Piala Biru.png",
  },
  {
    id: "pialaungu",
    title: "Rising Piala Ungu (Bracket Provinsi)",
    price: 55000,
    imageSrc: "/rising/Piala Ungu.png",
  },
  {
    id: "pialamerah",
    title: "Rising Piala Merah (Bracket Regional)",
    price: 65000,
    imageSrc: "/rising/Piala Merah.png",
  },
  {
    id: "pialaemas",
    title: "Rising Piala Emas (Bracket Subregional)",
    price: 75000,
    imageSrc: "/rising/Piala Emas.png",
  },
];

const risingLeagueConfig: ServicePageConfig = {
  serviceName: "Mobile Legends Rising League",
  summaryTitle: "Joki Rising League Mobile Legends",
  hero: { imageSrc: "/mobilelegends/Joki%20Rising%20League.jpg", imageAlt: "Joki Rising League Mobile Legends", eyebrow: "Mobile Legends: Bang Bang", title: "Joki Rising League Mobile Legends" },
  promoText: "ORDER RISING LEAGUE MOBILE LEGENDS",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. Hp/Moonton ID", placeholder: "Masukkan Email/No. Hp/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "hero", label: "Request Hero", placeholder: "Masukkan Request Hero", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
  ],
  nominalGroups: [{ title: "Joki Rising Star Mobile Legend", options: risingLeagueOptions }],
  description: {
    title: "Deskripsi Joki Rising League Mobile Legends",
    headline: "Joki Rising League Mobile Legends Solusi Cepat Memenangkan Rising Star!",
    body: "Kami mempersembahkan layanan joki Rising League yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Tujuan (Pastikan jumlah order sesuai dengan yang Anda inginkan dan sesuai dengan S&K)",
  },
};


type VideoMontageNominalOption = ServiceNominalOption;

const videoMontageOptions: VideoMontageNominalOption[] = [
  {
    id: "montage",
    title: "Video Polos No Edit / 1 Menit",
    price: 25000, 
    imageSrc: "/montage/Montage.png",
  },
];


const videoMontageConfig: ServicePageConfig = {
  serviceName: "Mobile Legends Video Montage",
  summaryTitle: "Joki Video Montage Mobile Legends",
  hero: {
    imageSrc: "/mobilelegends/Joki%20Video%20Montage.jpg",
    imageAlt: "Joki Video Montage Mobile Legends",
    eyebrow: "Mobile Legends: Bang Bang",
    title: "Joki Video Montage Mobile Legends",
  },
  promoText: "ORDER VIDEO MONTAGE MOBILE LEGENDS",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    {
      name: "recordVia",
      label: "Record Via",
      type: "select",
      selectPlaceholder: "Pilih Record Via",
      required: true,
      options: [
        { label: "In Game", value: "In Game" },
        { label: "Replay", value: "Replay" },
      ],
    },
    {
      name: "userId",
      label: "User ID & Nick Name",
      placeholder: "Masukkan User ID & Nick Name",
      required: true,
    },
    {
      name: "accountId",
      label: "Email/No. Hp/Moonton ID",
      placeholder: "Masukkan Email/No. Hp/Moonton ID",
      required: true,
    },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    {
      name: "hero",
      label: "Request Hero",
      placeholder: "Masukkan Request Hero",
      required: true,
    },
    {
      name: "notes",
      label: "Catatan Untuk Penjoki",
      placeholder: "Masukkan Catatan Untuk Penjoki",
    },
    {
      name: "videoLink",
      label: "Link Contoh Video",
      placeholder: "Masukkan Contoh Video (Link TikTok, Instagram, DLL)",
      type: "url",
      required: true,
    },
  ],
  nominalGroups: [{ title: "Joki Montage", options: videoMontageOptions }],
  description: {
    title: "Deskripsi Joki Video Montage Mobile Legends",
    headline: "Joki Video Montage Mobile Legends Solusi Cepat Mendapatkan Video Montage Idamanmu !",
    body: "Kami mempersembahkan layanan joki Video Montage Mobile Legends yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Target (Pastikan jumlah order sesuai dengan target yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type MagicGoGoNominalOption = ServiceNominalOption;

const magicGoGoOptions: MagicGoGoNominalOption[] = [
  {
    id: "gm",
    title: "Grandmaster / 4 Bintang",
    price: 2000,
    imageSrc: "/rank/Grandmaster.png",
  },
  {
    id: "epic",
    title: "Epic / 4 Bintang",
    price: 4000,
    imageSrc: "/rank/Epic.png",
  },
  {
    id: "legend",
    title: "Legend / 4 Bintang",
    price: 6000,
    imageSrc: "/rank/Legend.png",
  },
  {
    id: "mythic",
    title: "Mythic / 4 Bintang",
    price: 10000,
    imageSrc: "/rank/Mythic.png",
  },
  {
    id: "honor",
    title: "Mythic Honor / 4 Bintang",
    price: 16000,
    imageSrc: "/rank/Mythic Honor.png",
  },
  {
    id: "glory",
    title: "Mythic Glory / 4 Bintang",
    price: 20000,
    imageSrc: "/rank/Mythic Glory.png",
  },
];

const magicGoGoConfig: ServicePageConfig = {
  serviceName: "Magic Chess Go Go",
  summaryTitle: "Joki Magic Chess GO GO",
  hero: { imageSrc: "/magicchess/Joki%20Mcgg.jpg", imageAlt: "Magic Chess: Go Go", eyebrow: "Magic Chess: Go Go", title: "Joki Magic Chess Go Go" },
  promoText: "ORDER 40 BINTANG FREE 4 BINTANG",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. Hp/Moonton ID", placeholder: "Masukkan Email/No. Hp/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
  ],
  nominalGroups: [{ title: "Joki Magic Chess / 40 Point (4 Bintang)", options: magicGoGoOptions }],
  description: {
    title: "Deskripsi Joki Magic Chess Go Go",
    headline: "Joki Magic Chess Solusi Cepat Naik Rank Magic Chess!",
    body: "Kami mempersembahkan layanan joki Magic Chess yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Tujuan Rank (Pastikan jumlah order sesuai dengan rank yang Anda inginkan dan sesuai dengan S&K)",
  },
};



type MagicMmrNominalOption = ServiceNominalOption;

const magicMmrOptions: MagicMmrNominalOption[] = [
  {
    id: "gm",
    title: "Grandmaster / 4 Bintang",
    price: 4000,
    imageSrc: "/rank/Grandmaster.png",
  },
  {
    id: "epic",
    title: "Epic / 4 Bintang",
    price: 6000,
    imageSrc: "/rank/Epic.png",
  },
  {
    id: "legend",
    title: "Legend / 4 Bintang",
    price: 8000,
    imageSrc: "/rank/Legend.png",
  },
  {
    id: "mythic",
    title: "Mythic / 4 Bintang",
    price: 12000,
    imageSrc: "/rank/Mythic.png",
  },
  {
    id: "honor",
    title: "Mythic Honor / 4 Bintang",
    price: 18000,
    imageSrc: "/rank/Mythic Honor.png",
  },
  {
    id: "glory",
    title: "Mythic Glory / 4 Bintang",
    price: 22000,
    imageSrc: "/rank/Mythic Glory.png",
  },
];

const magicMmrConfig: ServicePageConfig = {
  serviceName: "Magic Chess Go Go MMR",
  summaryTitle: "Joki Magic Chess GO GO MMR",
  hero: { imageSrc: "/magicchess/Joki%20Mcgg%20Mmr.jpg", imageAlt: "Magic Chess: Go Go MMR", eyebrow: "Magic Chess: Go Go", title: "Joki Magic Chess Go Go MMR" },
  promoText: "ORDER 40 BINTANG FREE 4 BINTANG",
  accountFields: [
    { name: "loginVia", label: "Login Via", type: "select", required: true },
    { name: "userId", label: "User ID & Nick Name", placeholder: "Masukkan User ID & Nick Name", required: true },
    { name: "accountId", label: "Email/No. Hp/Moonton ID", placeholder: "Masukkan Email/No. Hp/Moonton ID", required: true },
    { name: "password", label: "Password", placeholder: "Masukkan Password", type: "password", required: true },
    { name: "notes", label: "Catatan Untuk Penjoki", placeholder: "Masukkan Catatan Untuk Penjoki" },
    { name: "commander", label: "Request Commander", placeholder: "Masukkan Request Commander", required: true },
    { name: "currentMmr", label: "MMR Saat Ini", placeholder: "Masukkan MMR Saat Ini", required: true },
  ],
  nominalGroups: [{ title: "Joki Magic Chess / 40 Point (4 Bintang)", options: magicMmrOptions }],
  description: {
    title: "Deskripsi Joki Magic Chess Go Go MMR",
    headline: "Joki Magic Chess Go Go MMR membantu meningkatkan MMR sesuai target !",
    body: "Kami mempersembahkan layanan joki Magic Chess Go Go MMR yang cepat, murah, serta aman dan terpercaya! Tingkatkan permainan dan rank Anda dengan bantuan dari profesional kami. Kami mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa yang kami berikan.",
    orderGoal: "Masukkan Jumlah Order Sesuai Target MMR (Pastikan jumlah order sesuai dengan target yang Anda inginkan dan sesuai dengan S&K)",
  },
};


export const MOBILE_LEGENDS_SERVICES = {
  "classic": classicConfig,
  "mabar": mabarConfig,
  "mmr": mmrConfig,
  "rank": rankConfig,
  "rising-league": risingLeagueConfig,
  "video-montage": videoMontageConfig,
} satisfies Record<string, ServicePageConfig>;

export const MAGIC_CHESS_SERVICES = {
  "go-go": magicGoGoConfig,
  "mmr": magicMmrConfig,
} satisfies Record<string, ServicePageConfig>;

export function getCatalogService(serviceTitle: string) {
  return [...Object.values(MOBILE_LEGENDS_SERVICES), ...Object.values(MAGIC_CHESS_SERVICES)]
    .find((item) => item.serviceName === serviceTitle) ?? null;
}

export function getCatalogPrice(serviceTitle: string, productTitle: string) {
  const service = getCatalogService(serviceTitle);
  const product = service?.nominalGroups.flatMap((group) => group.options)
    .find((option) => option.title === productTitle);
  return product?.price ?? null;
}
