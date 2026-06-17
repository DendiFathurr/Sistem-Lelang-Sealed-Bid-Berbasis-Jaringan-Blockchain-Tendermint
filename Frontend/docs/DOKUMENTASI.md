# 📖 Dokumentasi Proyek AETHER AUCTION

## Lelang Chain — Frontend React + Tailwind CSS v4

> Antarmuka pengguna (UI) untuk platform lelang terenkripsi berbasis blockchain menggunakan skema **Sealed-Bid Auction** (penawaran tertutup).

---

## 📁 Struktur Folder Proyek

```
src/
├── layouts/
│   └── DashboardLayout.jsx    # Layout utama (sidebar, header mobile, footer)
├── pages/
│   ├── AuthPage.jsx           # Halaman Login & Registrasi
│   ├── MarketplacePage.jsx    # Etalase/Galeri Aset Lelang (Home)
│   ├── BidDetailPage.jsx      # Form Pengiriman Penawaran Rahasia (Commit)
│   ├── ActiveBidsPage.jsx     # Riwayat Penawaran Aktif Pengguna
│   └── RevealPortalPage.jsx   # Form Pembukaan Penawaran (Reveal)
├── App.jsx                    # Pusat Orkestrator State & Routing
├── index.css                  # Tailwind v4 Theme & Custom Styles
└── main.jsx                   # Entry point React
```

---

## 🔄 Alur Navigasi Halaman

```
┌──────────────┐
│   AuthPage   │   ← Halaman pertama (Login / Daftar)
│  (opsional)  │
└──────┬───────┘
       │ Login berhasil
       ▼
┌─────────────────────────────────────────────┐
│            DashboardLayout                  │
│  ┌────────┐  ┌──────────────────────────┐   │
│  │Sidebar │  │     Konten Utama         │   │
│  │        │  │                          │   │
│  │ Market │──│→  MarketplacePage        │   │
│  │ Place  │  │   (Etalase Barang)       │   │
│  │        │  │                          │   │
│  │ Lelang │──│→  BidDetailPage          │   │
│  │        │  │   (Form Penawaran)       │   │
│  │        │  │                          │   │
│  │Penawa- │──│→  ActiveBidsPage         │   │
│  │ran     │  │   (Riwayat Sesi)         │   │
│  │ Aktif  │  │                          │   │
│  │        │  │                          │   │
│  │Reveal  │──│→  RevealPortalPage       │   │
│  │Portal  │  │   (Buka Penawaran)       │   │
│  └────────┘  └──────────────────────────┘   │
│              Footer                         │
└─────────────────────────────────────────────┘
```

---

## 🔒 Klasifikasi Hak Akses Halaman (Pribadi vs Publik)

Setiap halaman/tab menu di dalam dashboard diklasifikasikan ke dalam tingkat privasi yang berbeda berdasarkan interaksinya terhadap ledger blockchain dan data pengguna:

### 1. 🌐 Tampil ke Publik (Terbuka/Read-Only Ledger)
Halaman yang menampilkan data publik terdistribusi dari blockchain yang bebas dipantau oleh siapa saja:
- **MarketPlace (`MarketplacePage.jsx`):** Menampilkan daftar galeri aset lelang, sisa waktu, statistik global, serta umpan aktivitas transaksi penawaran (*Global Commits*) tanpa mewajibkan pengguna menghubungkan dompet MetaMask terlebih dahulu.
- **Peringkat (`LeaderboardPage.jsx`):** Berfungsi sebagai papan transparansi publik untuk melihat urutan penawar tertinggi dan alamat wallet peserta lelang. Saldo dompet semua penawar dibuka secara transparan untuk mencegah kecurangan di jaringan konsorsium.

### 2. 🔑 Bersifat Pribadi (Gated/Write State & Zero-Knowledge)
Halaman berinteraksi langsung dengan data dompet sensitif dan membutuhkan koneksi wallet MetaMask aktif serta tanda tangan transaksi:
- **Lelang (`BidDetailPage.jsx`):** Mengelola nominal penawaran rahasia pengguna (Fase Komitmen). Memerlukan saldo MetaMask pengguna dan pembuatan hash otomatis di sisi klien.
- **Penawaran Aktif (`ActiveBidsPage.jsx`):** Menampilkan log riwayat penawaran milik Anda sendiri secara rahasia. Tombol klaim dana kembali (*refund*) dan klaim kepemilikan aset hanya aktif untuk alamat wallet pemilik komitmen yang sah.
- **Reveal Portal (`RevealPortalPage.jsx`):** Fase pembukaan bid rahasia. Membutuhkan verifikasi komitmen secara mandiri oleh pemilik transaksi asli untuk membuka nilai bid sesungguhnya di blockchain.

---

## 📄 Penjelasan Setiap File

### `src/App.jsx` — Pusat Orkestrator

File utama yang mengelola **seluruh state global** aplikasi dan membungkus rendering halaman dinamis dalam sebuah kontainer transisi animasi (`page-transition`). Perpindahan antar tab (`activeTab`) akan memicu re-mount komponen secara dinamis untuk menghasilkan efek transisi visual *fade + slide-up* yang sangat halus.

| State            | Tipe     | Fungsi                                       |
|------------------|----------|----------------------------------------------|
| `currentPage`    | string   | Menentukan halaman aktif (`auth` / `bids`)   |
| `activeTab`      | string   | Tab aktif di dashboard                       |
| `assets`         | array    | Daftar aset lelang beserta countdown timer   |
| `selectedAsset`  | object   | Aset yang sedang dipilih untuk ditawar       |
| `balance`        | number   | Saldo ETH pengguna (simulasi)                |
| `walletConnected`| boolean  | Status koneksi dompet                        |
| `saltKey`        | string   | Kunci rahasia acak untuk sealed-bid          |
| `bidsSubmitted`  | array    | Log riwayat penawaran yang sudah dikirim     |
| `refundedBids`   | array    | Log timestamp bid yang dananya sudah ditarik |
| `claimedBids`    | array    | Log timestamp bid yang asetnya sudah diklaim |

### `src/layouts/DashboardLayout.jsx` — Layout Bersama

Komponen pembungkus (*wrapper*) yang menampilkan:
- **Sidebar permanen** (desktop) dengan navigasi, info portofolio, dan tombol wallet
- **Header mobile** dengan hamburger menu
- **Drawer navigasi** (mobile overlay)
- **Footer** halaman

Menerima `children` sebagai konten halaman yang berubah-ubah sesuai tab aktif.

### `src/pages/AuthPage.jsx` — Halaman Login & Registrasi

- Antarmuka login/daftar dengan tema glassmorphism gelap
- Efek glow mengikuti posisi mouse
- Tab toggle antara mode **MASUK** dan **DAFTAR**
- Seluruh teks dalam **Bahasa Indonesia**

### `src/pages/MarketplacePage.jsx` — Etalase Galeri Lelang

- Menampilkan kartu-kartu aset lelang aktif dalam grid responsif
- **Kartu Statistik Dinamis:** Menampilkan data real-time berupa *Total Aset Aktif*, *Volume Penawaran* (jumlah tawaran yang diajukan dalam sesi berjalan, mulai dari 0 ETH), *Komitmen Global* (total penawaran terkirim), dan *Rata-rata Sisa Waktu* semua aset lelang.
- Setiap kartu menampilkan: gambar, nama, ID, tawaran tertinggi, sisa waktu
- Indikator waktu kritis (warna merah berkedip jika < 3 menit)
- Panel **Komitmen Terbaru (Global)** di samping kanan: Berfungsi menampilkan log transaksi Anda yang dikirim secara real-time (dimulai dari kosong jika belum ada transaksi)
- Tombol "Ajukan Penawaran" yang mengarahkan ke `BidDetailPage`

### `src/pages/BidDetailPage.jsx` — Form Penawaran Rahasia (Commit)

- Menampilkan detail lengkap aset yang dipilih (gambar, deskripsi, tags, hash tertinggi, sisa waktu)
- Form pengisian penawaran: jumlah ETH + Salt Key
- Tooltip bantuan "Cara Kerja Salt" (hover & klik)
- Peringatan kritis untuk menyimpan Salt Key
- Tombol "Hash & Kirim ke Blockchain"

### `src/pages/ActiveBidsPage.jsx` — Hasil Lelang & Klaim (Winner & Claims)

- Halaman pemenang lelang dan penarikan jaminan dana (*refund*)
- **Banner Lelang Selesai:** Menampilkan status lelang aset #4092 yang telah rampung dengan nilai penawaran tertinggi
- **Kartu Klaim Pemenang (You Won):** Memungkinkan pemenang untuk mengklaim aset yang telah dimenangkannya ke alamat dompet terhubung
- **Kartu Tarik Pengembalian (Outbid):** Memungkinkan penawar yang kalah untuk menarik kembali dana jaminannya (menambahkan kembali 0.85 ETH ke saldo MetaMask pengguna)
- **Tabel Peringkat Akhir (Final Leaderboard):** Menampilkan daftar penawar, jumlah penawaran, status, dan menandai baris penawar saat ini dengan lencana "ANDA" secara dinamis berdasarkan alamat MetaMask terhubung

### `src/pages/RevealPortalPage.jsx` — Tahap Pembukaan (Reveal)

- Modul simulasi pembukaan/dekripsi penawaran rahasia
- **Input Form:** Pengguna memilih Aset, memasukkan Jumlah ETH asli, dan Salt Key
- **Logika Verifikasi Cryptographic Hash:** Memverifikasi input secara dinamis terhadap riwayat penawaran aktif (`bidsSubmitted`)
- **Status Sukses (Verified):** Jika data cocok, menampilkan kartu hijau sukses dengan detail penawaran dan hash transaksi komitmen asli yang terverifikasi di blockchain
- **Status Gagal (Error):** Jika data tidak cocok, menampilkan kartu merah error dan meminta pengguna memasukkan data yang tepat untuk dicoba kembali

---

## 🛠️ Teknologi yang Digunakan

| Teknologi         | Versi    | Keterangan                              |
|-------------------|----------|-----------------------------------------|
| React             | 19.x     | Library UI berbasis komponen            |
| Vite              | 8.x      | Build tool & dev server                 |
| Tailwind CSS      | 4.x      | Utility-first CSS framework             |
| @tailwindcss/vite | -        | Plugin Tailwind untuk Vite              |
| Material Symbols  | -        | Ikon dari Google Fonts                  |
| Inter Font        | -        | Tipografi utama dari Google Fonts       |

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies (jika belum)
npm install

# Jalankan dev server
npm run dev

# Build untuk produksi
npm run build
```

---

## 📝 Riwayat Pengembangan (History Chat)

### Sesi 1 — Setup Awal
1. Inisialisasi proyek Vite + React
2. Instalasi dan konfigurasi Tailwind CSS v4 via `@tailwindcss/vite`
3. Definisi tema warna Material Design 3 di `src/index.css` (directive `@theme`)
4. Pembersihan file-file boilerplate bawaan Vite

### Sesi 2 — Halaman Login (AuthPage)
1. Konversi template HTML/CSS/JS murni ke komponen React
2. Implementasi glassmorphism, scanline effect, dan glow accent
3. Tab toggle Login/Register dengan state React
4. Terjemahan semua teks UI ke Bahasa Indonesia
5. Perbaikan responsivitas: `overflow-y: auto` pada body, padding adaptif

### Sesi 3 — Halaman Detail Penawaran (BidDetailPage)
1. Konversi template HTML sealed-bid commit phase ke React
2. Implementasi sidebar navigasi permanen (desktop) dan drawer (mobile)
3. Simulasi koneksi wallet, countdown timer, dan salt key generator
4. Terjemahan ke Bahasa Indonesia
5. Penambahan tab: Lelang, Penawaran Aktif, Reveal Portal

### Sesi 4 — Halaman Marketplace
1. Konversi template HTML marketplace dashboard ke React
2. Grid kartu aset responsif dengan gambar, statistik, dan tombol "Ajukan Penawaran"
3. Panel "Komitmen Terbaru" di samping kanan
4. Koneksi dinamis: klik kartu → navigasi ke detail penawaran aset tersebut

### Sesi 5 — Refaktorisasi & Integrasi MetaMask (Sesi Ini)
1. **Pemisahan file per halaman** — setiap tampilan dipindahkan ke file `.jsx` tersendiri
2. **Pembuatan layout bersama** — `DashboardLayout.jsx` mengekstrak sidebar, header, dan footer
3. **Pengangkatan state** — semua state global dipusatkan di `App.jsx`
4. **Integrasi Dompet Asli (MetaMask)** — mengintegrasikan `window.ethereum` untuk memicu popup login MetaMask asli, membaca address akun asli, mendengarkan perubahan akun (`accountsChanged`), dan mengambil saldo asli dompet (Wei ke ETH).
5. **🔔 Notifikasi Toast Kustom** — Mengganti seluruh pop-up `alert()` bawaan browser yang kaku dengan notifikasi Toast mengambang beranimasi (*slide-in*) yang responsif di pojok kanan atas, lengkap dengan ikon pendukung status (*Success*, *Info*, *Warning*, *Error*).
6. **⏳ Overlay Loading Spinner** — Menambahkan overlay loading glassmorphism layar penuh dengan spinner berputar kustom dan ikon bernadi (*pulsing token*) untuk menyimulasikan konfirmasi transaksi blockchain (misal saat menghubungkan dompet, mengirim komitmen penawaran, klaim aset, atau menarik refund).
7. **Pembersihan kode** — menghapus data dummy dan merapikan struktur folder
8. **Pembuatan dokumentasi** — file `docs/DOKUMENTASI.md` ini

---

### Sesi 6 — Sistem Blockchain Semi-Privat & Hash Otomatis (Sesi Ini)
1. **Hash Otomatis dari Sistem:** Kode hash komitmen kini sepenuhnya dibuat secara otomatis oleh sistem berdasarkan data penawaran (nominal ETH + nama aset + nonce unik). Pengguna **tidak perlu mengatur hash atau salt secara manual** — cukup masukkan nominal penawaran dan klik kirim.
2. **Penghapusan Salt Key dari UI:** Seluruh elemen Salt Key (input, tampilan, tombol show/hide) telah dihapus dari antarmuka pengguna. Salt tidak lagi relevan karena hash di-generate otomatis oleh sistem internal.
3. **Penghapusan Tombol Salin (Copy):** Semua tombol salin pada kode hash telah dihapus untuk mencegah data sensitif disalin dan dimanipulasi oleh pihak lain. Sesuai konsep blockchain **semi-privat**.
4. **Format Tampilan Kerucut (Truncated):** Hash komitmen ditampilkan dalam format ringkas menyerupai alamat dompet (misal: `0x5b17ce...9c89`), tanpa opsi penyalinan.
5. **Reveal Portal Otomatis:** Proses pembukaan penawaran (reveal) kini berjalan secara otomatis — pengguna hanya perlu memilih penawaran terkunci dan klik "Buka & Verifikasi". Sistem secara internal memverifikasi data komitmen tanpa memerlukan input manual apapun.
6. **Indikator Hasil Menang/Kalah Lelang:**
   - Setelah fase reveal selesai, halaman **Hasil Lelang & Klaim** akan otomatis membandingkan nominal tawaran Anda dengan peserta lain secara deterministik untuk menentukan status kemenangan.
   - Status **Menang** memicu tampilan banner piala hijau bertuliskan **🏆 LELANG DIMENANGKAN!** beserta tombol klaim aset.
   - Status **Kalah** memicu tampilan banner merah bertuliskan **⚠️ TAWARAN TERLAMPAUI (KALAH)** beserta tombol tarik refund.
7. **Pembersihan Visual Kunci & Sederhana:**
   - Menghapus badge visual data pribadi (ikon kunci `vpn_key`) dan kotak deskripsi privasi pada halaman penawaran aktif agar antarmuka menjadi sangat bersih, lega, dan berfokus pada informasi penting.
8. **Halaman Peringkat Terpisah (Dedicated Leaderboard Page):**
   - Membuat halaman/tab baru bernama **Peringkat** (`LeaderboardPage.jsx`) yang terpisah dari halaman penawaran aktif agar tampilan tidak terlalu padat.
   - Menyediakan fitur filter dropdown untuk melihat papan peringkat penawaran per aset secara real-time.
   - Menggunakan avatar profil biasa (berbentuk lingkaran dengan warna latar belakang gradasi dan inisial teks yang dibuat secara dinamis berdasarkan alamat wallet) tanpa memuat berkas gambar portofolio eksternal.
   - Menghapus aset gambar `leaderboard_avatars.png` dari folder publik.
9. **Showcase Carousel & Pilihan Target Aset (Bid Detail Page):**
   - Penambahan **Auto-sliding Showcase** pada kolom pratinjau aset di halaman **Detail Penawaran Lelang** (`BidDetailPage.jsx`). Foto dan deskripsi aset akan berganti secara otomatis setiap 3 detik (dapat dijeda saat kursor mouse di-hover).
   - Animasi transisi perpindahan menggunakan **CSS Hardware-Accelerated Cross-fade & Zoom** (`transition-all duration-[1000ms] ease-in-out`), membuat gambar bergeser masuk dan keluar dengan efek memudar yang sangat mulus tanpa berkedip atau patah-patah.
   - Pilihan dropdown **Pilih Aset Target** di formulir penawaran dibuat **independen**, artinya pilihan dropdown tidak akan ikut berubah secara otomatis saat gambar pratinjau slide berganti, sehingga penawaran Anda tetap terkunci pada target aset yang Anda pilih. Jika dropdown diubah secara manual, pratinjau kiri akan langsung menyinkronkan posisinya untuk menampilkan aset terpilih.
   - Sinkronisasi indeks slide otomatis diperbaiki dengan membatasi dependensi hanya pada ID primitif (`selectedAsset.id`), mencegah konflik interupsi dengan countdown timer 1 detik.
10. **Penyaringan Galeri Aset (Marketplace Page):**
    - Menyediakan **Dynamic Filter Pills** kategori aset (Semua Kategori, Core Data, Quantum CPU, Real Estate) pada galeri Marketplace agar daftar kartu aset dapat disaring secara instan dengan transisi masuk yang mulus.
11. **Nominal Tawaran Tertinggi Real-Time Tanpa Simulasi Bot**:
    - Seluruh nominal **Tawaran Tertinggi** (currentBid) pada aset diinisialisasi mulai dari `0.00 ETH` (bersih tanpa data dummy awal).
    - Tidak ada simulasi aktivitas penawar otomatis atau bot dalam sistem. Seluruh pemutakhiran nominal tawaran murni didorong secara real-time berdasarkan aktivitas penawaran yang diajukan langsung oleh Anda sebagai pengguna.
    - Ketika Anda mengirimkan penawaran pada suatu aset, nominal tawaran tertinggi dari aset tersebut akan diperbarui secara otomatis dan real-time jika penawaran Anda lebih besar dari nilai saat itu.
12. **Umpan Sidebar Publik & Notifikasi Toast Penawaran**:
    - Panel **Komitmen Terbaru (Global)** di sidebar kanan Marketplace kini dikonfigurasi untuk **selalu tampil** bagi publik tanpa mewajibkan dompet terhubung terlebih dahulu.
    - Menghapus modal dialog pemblokir layar. Sistem kini langsung memicu **Notifikasi Toast Informasi** di sisi kanan bawah layar dengan format pesan spesifik: *"Node [shortAddr] menaruh bid [amount] ETH pada [assetName]"*.

---

## 🗂️ Catatan Arsitektur

- **State Management:** Menggunakan `useState` dan prop-drilling sederhana. Untuk skala lebih besar, pertimbangkan Context API atau Zustand.
- **Routing:** Saat ini menggunakan state-based routing sederhana (`activeTab`). Untuk URL-based routing, pertimbangkan React Router.
- **Tailwind v4:** Konfigurasi tema dilakukan sepenuhnya di `src/index.css` menggunakan directive `@theme`, bukan file `tailwind.config.js`.
- **Responsivitas:** Semua halaman dioptimalkan untuk layar mobile (≥320px) hingga desktop (≥1440px).
- **Panduan Kolaborasi Git:** Panduan lengkap langkah-langkah kolaborasi Git kelompok dapat dilihat di file [ALUR_GIT.md](file:///home/ervan/proyek-lelang-blockchain/lelang-chain/docs/ALUR_GIT.md).

---

*Dokumentasi ini dibuat pada 6 Juni 2026, diperbarui pada 16 Juni 2026.*
