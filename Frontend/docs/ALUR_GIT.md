# 💻 Panduan Kolaborasi Git & GitHub/GitLab Kelompok

> Dokumentasi alur kerja Git untuk mengunggah dan memperbarui kode pada repositori bersama kelompok Aether Auction.

---

## 🚀 Alur Kerja Cepat (Quick Cheat Sheet)

```bash
# 1. Inisialisasi & Hubungkan (Hanya sekali di awal)
git init
git remote add origin <URL_REPO_KELOMPOK>

# 2. Sinkronisasi data
git fetch origin

# 3. Buat branch fitur baru
git checkout -b feature/frontend-react

# 4. Tambah & Commit perubahan
git add .
git commit -m "feat: inisialisasi frontend lelang react dengan integrasi metamask"

# 5. Push ke repositori online
git push -u origin feature/frontend-react
```

---

## 📖 Penjelasan Langkah Demi Langkah

### Langkah 1: Inisialisasi Git Lokal
Periksa apakah folder lokal Anda sudah memiliki pelacak Git aktif:
```bash
git status
```
Jika muncul pesan error `fatal: not a git repository`, jalankan inisialisasi pelacak lokal baru:
```bash
git init
```

### Langkah 2: Hubungkan dengan Repositori Bersama
Hubungkan repositori lokal Anda dengan repositori online kelompok di GitHub atau GitLab. Ganti URL di bawah ini dengan URL repositori kelompok Anda:
```bash
git remote add origin https://github.com/username/nama-repositori.git
```
Untuk memverifikasi bahwa URL remote sudah terpasang dengan benar, ketik:
```bash
git remote -v
```

### Langkah 3: Sinkronisasi Riwayat Server
Sebelum membuat branch baru, pastikan repositori lokal Anda mengetahui status/branch terbaru yang ada di server online:
```bash
git fetch origin
```

### Langkah 4: Gunakan Fitur Branching (Sangat Penting)
Jangan pernah melakukan push perubahan langsung ke branch utama (`main` atau `master`) di proyek kelompok. Hal ini bertujuan untuk menghindari tabrakan kode (*merge conflicts*) dengan anggota kelompok lain.

Buat branch khusus untuk fitur yang sedang Anda kerjakan:
```bash
# Membuat branch baru sekaligus berpindah ke dalamnya
git checkout -b feature/frontend-react
```
*Gunakan format nama branch yang deskriptif, contoh: `feature/frontend-react`, `feature/smart-contracts`, `bugfix/fix-login`.*

### Langkah 5: Rekam Perubahan (Stage & Commit)
Setelah menulis kode, daftarkan file-file baru untuk disimpan oleh Git:
```bash
# Daftarkan semua file yang berubah
git add .

# Rekam penyimpanan dengan deskripsi pesan yang jelas
git commit -m "feat: inisialisasi frontend lelang react dengan integrasi metamask"
```

### Langkah 6: Unggah Kode ke Server (Push)
Kirim branch beserta perubahan kode Anda ke server repositori online:
```bash
git push -u origin feature/frontend-react
```
*Catatan: Parameter `-u` hanya perlu digunakan saat push pertama kali pada branch tersebut.*

### Langkah 7: Lakukan Pull Request / Merge Request
1. Buka repositori online kelompok Anda di browser (GitHub/GitLab).
2. Temukan notifikasi kuning berbunyi **"Compare & pull request"** untuk branch Anda, lalu klik tombol tersebut.
3. Berikan deskripsi singkat mengenai fitur yang Anda tambahkan, kemudian klik **"Create pull request"**.
4. Beritahu rekan tim atau ketua kelompok untuk mereview dan menyetujui penggabungan (*merge*) kode Anda ke branch `main`.

---

## ⚠️ Aturan Penting Berkolaborasi dengan Git

* **Selalu Tarik Update Terbaru (Pull):** Sebelum mulai menulis kode baru setiap harinya, biasakan untuk mengambil pembaruan dari branch utama agar tidak tertinggal kode milik rekan setim:
  ```bash
  git checkout main
  git pull origin main
  git checkout feature/nama-branch-anda
  git merge main
  ```
* **Jangan Mengunggah Folder `node_modules`:** Pastikan folder `node_modules/` dan file lingkungan rahasia (`.env`) sudah terdaftar di dalam file `.gitignore` agar tidak ikut terunggah ke repositori online.
* **Gunakan Pesan Commit yang Informatif:** Contoh menggunakan standar *Conventional Commits*:
  * `feat: ...` (fitur baru)
  * `fix: ...` (perbaikan bug)
  * `docs: ...` (pembaruan dokumentasi)
  * `style: ...` (perubahan UI/styling tanpa mengubah fungsi)
