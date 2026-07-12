# AGENTS.md — Panduan Pengembangan NutriSphere

Dokumen ini adalah sumber konteks utama bagi developer/agent yang melanjutkan proyek **NutriSphere**. Baca seluruh dokumen sebelum mengubah kode. Isi dokumen didasarkan pada implementasi aktual di repository, bukan hanya teks pemasaran pada UI.

## 1. Gambaran Produk

NutriSphere adalah ekosistem pembelajaran gizi berbasis web untuk mahasiswa. Produk menggabungkan lima pilar:

1. **NutriSolve** — decision support system (DSS) dan simulasi clinical reasoning.
2. **NutriBase** — katalog referensi dan regulasi gizi.
3. **NutriPath** — modul pembelajaran berbasis materi dan kasus.
4. **NutriRead** — pustaka jurnal/e-book dan ringkasan jurnal berbantuan AI.
5. **NutriQuest** — pretest, posttest, asesmen kasus, tracking kompetensi, dan dashboard dosen.

Alur ideal mahasiswa:

`Landing page → login/registrasi → pretest → eksplorasi fitur belajar → latihan kasus → posttest`

Pretest adalah global feature gate. Landing, login, dan halaman pretest tetap terbuka; halaman fitur lain mengharuskan pengguna login dan sudah menyelesaikan pretest. Posttest tidak menjadi gate global.

## 2. Arsitektur Teknis

### Frontend

- Multi-page static site: HTML, CSS, dan vanilla JavaScript tanpa bundler/framework.
- Semua halaman utama berada di root repository.
- Shared stylesheet: `assets/css/styles.css`.
- Shared behavior: `assets/js/main.js`.
- Shared semantic icon sprite: `assets/icons/nutrisphere-icons.svg`; gunakan `<span class="card-icon"><svg><use ...></use></svg></span>` untuk kartu fitur/resource baru, bukan singkatan huruf sebagai icon.
- Supabase JS v2 dimuat dari CDN pada setiap halaman utama.
- Beberapa halaman memiliki inline script kecil; logic kompleks berada di `assets/js/`.
- Three.js r128, GLTFLoader, OrbitControls, dan fflate dari CDN dipakai khusus AR Patient.

Karena tidak ada build step, perubahan HTML/JS/CSS langsung menjadi output aplikasi. Jaga urutan script: `main.js` → Supabase CDN → `supabase-config.js` → `auth.js` → `tracking.js` → `pretest-gate.js` → script khusus halaman.

### Backend AI

- Flask + Flask-CORS di `app.py` untuk local development.
- Salinan entry point serverless berada di `api/index.py` untuk Vercel.
- **Kedua file saat ini identik byte-for-byte. Setiap perubahan backend wajib diterapkan pada keduanya**, atau lakukan refactor ke modul bersama agar tidak drift.
- Environment variable utama: `GEMINI_API_KEY` (dibaca melalui `python-dotenv`).
- Backend mencoba model secara berurutan: `gemini-3.5-flash`, `gemini-2.5-flash`, lalu `gemini-2.0-flash` pada error kuota/model tidak ditemukan.
- Tanpa API key atau saat kuota habis, endpoint menggunakan respons simulasi berbasis keyword.
- `vercel.json` me-rewrite `/api/*` ke `api/index.py` dan mengecualikan asset/test dari function bundle.

Frontend menentukan base backend sebagai `http://localhost:5000` ketika hostname localhost/127.0.0.1 atau protocol `file:`, dan `window.location.origin` di deployment.

### Persistence dan autentikasi

- Supabase URL dan anon key dikonfigurasi di `assets/js/supabase-config.js`.
- `assets/js/auth.js` adalah facade untuk auth, profil, test, kasus, progress, event, dan dashboard.
- Schema, trigger, RPC, RLS policies, grants, serta index berada di `supabase/schema.sql`.
- Auth mahasiswa memakai email/password Supabase.
- Signup menyimpan `full_name` dan `nim` dalam user metadata; trigger `handle_new_user_profile` membuat row `profiles`. Frontend `ensureStudentProfile` menjadi fallback jika trigger belum menghasilkan profil.
- Email berakhiran `@nutrisphere.local` memakai mock user/localStorage untuk development. Jalur mock tidak mencerminkan seluruh operasi Supabase; misalnya penyimpanan detail jawaban tetap memerlukan client Supabase.

## 3. Peta Halaman dan Fungsinya

### `index.html` — Landing/Beranda

Tujuan: menjelaskan positioning NutriSphere dan menjadi pintu masuk ke seluruh pilar.

Fitur:

- Hero dan CTA menuju NutriQuest, NutriSolve, serta daftar fitur.
- Parallax dekoratif berbasis pointer pada layer hero.
- Kalkulator makronutrisi interaktif berbasis slider kalori, persentase karbohidrat, protein, dan lemak. Nilai gram dihitung di inline script dari distribusi energi; ini alat eksplorasi UI, bukan rekomendasi klinis personal.
- Slider/kartu lima pilar produk.
- Ringkasan status kesiapan resource dan CTA evaluasi.
- Halaman termasuk open page pada pretest gate, sehingga dapat dibuka tanpa login/pretest.

### `login.html` — Login dan registrasi

Logic: `assets/js/login.js` dan `assets/js/auth.js`.

Fitur mahasiswa:

- Login email/password.
- Registrasi nama lengkap, NIM, email, dan password minimal enam karakter.
- Parameter query `next` mengembalikan pengguna ke halaman tujuan setelah auth; URL absolut/protocol-relative ditolak untuk mencegah open redirect sederhana.
- Signup mencoba langsung memakai session; jika Supabase masih mewajibkan konfirmasi email, UI menampilkan instruksi konfigurasi.

Fitur admin demo:

- Tab “Login as Admin” memeriksa password statis `nutrisphere123` di browser.
- Jika cocok, flag `nutrisphere_admin_unlocked=true` ditulis ke `sessionStorage`, lalu pengguna diarahkan ke dashboard.
- Ini **bukan autentikasi admin production-grade** karena password dan gate berada di frontend.

### `pretest.html` — Baseline awal

Logic: `assets/js/pretest-data.js` dan `assets/js/test-runner.js`.

- Menampilkan 25 soal pilihan ganda satu per satu, dengan tombol kembali/lanjut dan validasi jawaban wajib.
- Kategori soal: PSG, GDDK, MIPMG, dan MAKRO.
- Setelah soal terakhir, menghitung skor dan persentase, menyimpan `test_attempts`, lalu menyimpan 25 detail jawaban ke `test_attempt_answers`.
- Satu user hanya boleh punya satu pretest karena unique constraint `(user_id, test_type)`.
- Keberhasilan juga mengisi cache `nutrisphere_pretest_v1_completed`, tetapi Supabase tetap source of truth untuk gate.
- Query `next` menentukan halaman setelah submit; default pretest adalah `nutrisolve.html`.

### `posttest.html` — Evaluasi akhir

Menggunakan bank soal dan runner yang sama persis dengan pretest, dibedakan oleh `data-test-type="posttest"`.

- Hanya bisa dimulai setelah pretest selesai.
- Hanya satu attempt per user.
- Default redirect setelah submit adalah `dashboard-dosen.html`.
- Posttest bersifat opsional terhadap akses fitur: belum mengerjakan posttest tidak mengunci halaman lain.

### `nutriquest.html` — Hub evaluasi kompetensi

Tujuan: pintu masuk terpusat untuk pretest, posttest, asesmen kasus AR, dan dashboard dosen.

- Menjelaskan jenis data yang dilacak: nilai test, detail jawaban, penyelesaian kasus, progress modul, dan feature events.
- Kartu menggunakan declarative tracking attributes (`data-track-*`).
- Halaman ini sendiri dilindungi login + pretest gate.

### `dashboard-dosen.html` — Rekap kompetensi

Logic: `assets/js/dashboard-dosen.js`.

- Memerlukan flag session admin yang dibuat oleh login statis.
- Memanggil Supabase RPC `admin_dashboard_rows(admin_password)`.
- Menampilkan nama, NIM, email, nilai/waktu pretest dan posttest, improvement, jumlah kasus selesai, modul selesai, event fitur, dan status belajar.
- Output string profil di-escape sebelum dimasukkan lewat `innerHTML`.
- Status: belum pretest, belum posttest, test selesai, atau kompetensi berjalan.
- Tombol keluar hanya menghapus session unlock admin lalu kembali ke login.

Catatan keamanan: RPC adalah `SECURITY DEFINER`, dapat dipanggil oleh role `anon`/`authenticated`, dan hanya memeriksa password hardcoded. Ini sengaja cocok untuk demo statis, tetapi untuk production harus diganti dengan Supabase Auth role/claim dosen, authorization server-side, secret yang tidak dikirim ke browser, dan pembatasan grant RPC.

### `nutrisolve.html` — Hub DSS

Landing untuk empat subfitur:

- Anthropometry.
- Clinical.
- Dietary.
- AR Patient Visualization.

Halaman ini hanya navigasi/positioning; kalkulasi dan interaksi berada di subhalaman.

### `antropometri.html` — Anthropometry Assessment

Logic kalkulator: `assets/js/main.js`.

Empat mode:

1. **Balita/Bayi (0–5 tahun)**
   - Pengguna memasukkan Z-score yang sudah diperoleh dari WHO Anthro untuk BB/U, IMT/U, TB/U, PB/U, BB/TB, LIKA/U, dan LILA/U.
   - `classifyZScore()` memberi kategori, interpretasi, dan tindak lanjut berdasarkan threshold lokal di JS.
   - Aplikasi tidak menghitung Z-score dari umur/jenis kelamin/BB/TB mentah; link WHO Anthro disediakan untuk tahap tersebut.

2. **Remaja (5–18 tahun)**
   - Input umur dan Z-score IMT/U, BB/U, serta TB/U dari AnthroPLUS.
   - BB/U hanya dipakai pada umur ≤10; pada usia lebih tinggi ditandai tidak direkomendasikan.
   - Hasil berisi klasifikasi, fokus interpretasi, dan next step.

3. **Dewasa–Lansia**
   - Menghitung BMI dari berat/tinggi.
   - Menghitung waist-to-hip ratio dari lingkar pinggang/panggul dan menilai risiko menurut jenis kelamin.
   - Menampilkan interpretasi LILA.
   - Menghitung body density dari konstanta `c`, `m`, skinfold, dan umur, lalu body fat dengan persamaan Siri; klasifikasi body fat dibedakan menurut jenis kelamin.
   - Konstanta harus berasal dari formula/populasi yang sesuai; nilai default hanya simulasi.

4. **Pasien Rumah Sakit**
   - Input jenis kelamin, umur, lingkar betis, tinggi lutut, LILA, subscapular skinfold, demispan, dan ulna.
   - Estimasi berat badan memakai formula berbasis lingkar betis, tinggi lutut, LILA, dan subscapular.
   - Estimasi tinggi dapat dipilih: Chumlea, Bassey/demispan, atau ulna.
   - Formula ulna menyediakan pilihan Ilayperuma, Thummar, Pureepatpong, dan Bonell.

Semua kalkulasi berjalan client-side dan update saat input berubah. Treat hasil sebagai DSS edukatif; validasi formula, satuan, populasi, dan cut-off terhadap referensi resmi sebelum penggunaan klinis.

### `clinical.html` — Clinical Nutrition Screening

Logic: bagian `initClinicalScanner()` di `assets/js/main.js`.

- Meminta akses kamera browser melalui `navigator.mediaDevices.getUserMedia`.
- Pengguna memilih skenario simulasi (anemia atau stunting), mengaktifkan kamera, mengambil frame ke canvas, lalu menerima analisis visual simulasi.
- Hasil bukan computer vision/AI inference nyata; `simulateAIAnalysis()` memilih hasil preset sesuai skenario dan memakai loading delay.
- Foto dapat diulang dan media stream dihentikan saat retake/unload.
- Akses kamera biasanya memerlukan localhost atau HTTPS.

### `klinis.html` — Alias legacy

Halaman kompatibilitas lama yang memberi tahu bahwa fitur dipindahkan dan mengarahkan pengguna ke `clinical.html`. Jangan menambah logic clinical baru di sini; canonical page adalah `clinical.html`.

### `dietary.html` — Dietary Pattern Assessment

- Saat ini merupakan mockup statis, bukan form input aktif.
- Menampilkan contoh frekuensi makan utama, sayur/buah, makanan manis, keluhan mudah lelah, lalu ringkasan edukatif.
- Teks “form simulasi” jangan ditafsirkan sebagai data pengguna atau analisis backend.
- Jika dikembangkan, tentukan lebih dulu instrumen (24-hour recall, FFQ, food record), struktur data, validasi, perhitungan, serta kebijakan privasi.

### `ar-patient.html` — Simulasi pasien 3D dan AI Clinical Supervisor

Logic: `assets/js/ar-patient.js`; backend: `/api/validate_diagnosis`.

- Nama “AR” saat ini berarti visualisasi model 3D interaktif pada canvas, bukan WebXR/marker-based augmented reality.
- Three.js memuat GLB pasien; OrbitControls memungkinkan rotasi/zoom. Loader menampilkan progres dan error state.
- Detail pasien memiliki tab profil/antropometri, pemeriksaan klinis, dan dietary recall.
- Pengguna menjawab diagnosis serta intervensi pada chat supervisor.
- Frontend mengirim `caseId`, `diagnosis_text`, dan history ke backend. Backend menilai diagnosis dan intervensi masing-masing 50 poin dengan keyword, serta dapat meminta Gemini memberi feedback dialogis.
- Tag backend `[DIAGNOSIS_BENAR]`, `[INTERVENSI_BENAR]`, dan `[BERHASIL MENDIAGNOSIS]` mengontrol status kelulusan dialog.
- Saat berhasil, frontend memperbarui streak, penyelesaian level, phase unlock, dan menyimpan attempt ke `case_attempts` jika ada user Supabase.
- Progress lokal disimpan pada `unlockedPhases`, `completedCases`, dan `diagStreak`. Progress direset bila `last_login_time` lebih lama dari 24 jam.
- Urutan phase: balita → remaja → dewasa → lansia; setiap phase memiliki easy/medium/hard sesuai data yang tersedia.
- Dataset frontend memiliki 10 kasus: balita 3, remaja 3, dewasa 3, lansia 1. Asset folder berisi beberapa GLB tambahan yang belum tentu direferensikan oleh case data.

Penting saat mengubah kasus: data digandakan di `assets/js/ar-patient.js` (display/model/keyword) dan backend `CASES` di `app.py` serta `api/index.py` (ground truth/feedback). ID, diagnosis, terapi, keyword, dan narasi harus tetap selaras pada ketiga lokasi.

### `nutribase.html` — Katalog referensi

- Search client-side berdasarkan `data-title`.
- Filter kategori: semua, PDF lokal, placeholder, dan Drive.
- PDF lokal meliputi TKPI, daftar konversi penyerapan minyak (ditampilkan sebagai DBMP), AKG, regulasi BPOM, buku foto makanan, dan PAGT/rumus gizi.
- SSGI dan SKI masih placeholder menuju folder Google Drive bersama.
- Setiap pembukaan resource dicatat lewat declarative feature tracking jika user/client tersedia.
- Saat menambah resource, tambahkan file ke `assets/pdf/`, kartu metadata yang tepat, `data-type`, `data-title`, serta `data-track-*`. Perhatikan nama file dengan spasi saat membuat URL/link.

### `nutripath.html` — Modul pembelajaran

- Menawarkan PPT, video, dan kasus gizi.
- PPT/video saat ini menuju folder Drive bersama; kasus menuju AR Patient.
- Klik kartu bertanda `data-module-progress` memanggil upsert `learning_progress` dengan module ID, status, dan persentase yang ditentukan di atribut HTML.
- Progress saat klik adalah indikator awal (`in_progress`, 35–50%), bukan bukti konsumsi/penyelesaian materi.
- Prinsip konten yang ditampilkan: valid akademik, aman etik, dan terukur.

### `nutriread.html` — Hub library

Pintu masuk ke daftar jurnal/e-book dan AI Summary. Tidak memiliki search/library database sendiri.

### `journal_ebook.html` — Daftar referensi eksternal

- Kartu menuju Nutrients, Food Research, Journal of Functional Foods, International Journal of Diabetes Research, Journal of the Science of Food & Agriculture, Frontiers in Nutrition, dan folder e-book Drive.
- Metadata/topik/tahun pada UI bersifat katalog frontend; link dibuka pada tab baru dan dicatat sebagai feature event.
- Periksa kembali URL, reputasi sumber, metadata, dan hak akses sebelum menambah/mengganti referensi.

### `ai_summary.html` — Ringkasan jurnal

Logic: `assets/js/ai-summary.js`; backend: `/api/health` dan `/api/summarize`.

- Pengguna menempel teks jurnal, lalu client melakukan health check ke Flask.
- Jika backend online, teks dikirim sebagai JSON `{ text }` ke `/api/summarize`.
- Gemini diminta menghasilkan ringkasan eksekutif, poin temuan, serta evaluasi metodologi/relevansi dalam Bahasa Indonesia.
- Bila backend offline/gagal, client menghasilkan ringkasan simulasi berdasarkan keyword stunting, anemia/besi/Hb, atau fallback generik.
- Mode backend tanpa API key juga merupakan simulasi keyword.
- Event dicatat sebagai `backend` atau `local_simulation` beserta panjang input.
- Renderer Markdown menggunakan regex sederhana dan menulis hasil melalui `innerHTML`; jangan menganggapnya sanitizer. Sebelum menerima output tidak tepercaya secara lebih luas, gunakan sanitizer/renderer Markdown yang aman.

## 4. Shared JavaScript

### `assets/js/main.js`

Berisi:

- Mobile/sidebar navigation toggle dan collapsible NutriSolve subnavigation.
- Anthropometry classifiers/calculators.
- Clinical camera simulation.
- Scroll reveal via IntersectionObserver.
- Global NutriBot widget yang diinjeksi ke hampir semua halaman. Chat memanggil `/api/chat`, mengirim history lokal, merender subset Markdown, dan fallback ke pesan offline bila request gagal.
- Global account control pada sidebar yang menampilkan state login, identitas singkat, tautan login/register, dan tombol logout di seluruh halaman.

Karena file ini dimuat global, semua initializer harus aman saat elemen halaman tidak ada (gunakan optional checks/early return) dan tidak boleh mengasumsikan DOM khusus satu halaman.

### `assets/js/pretest-gate.js`

- Open pages: halaman kosong/root, `index.html`, `login.html`, dan `pretest.html`.
- Page lain menampilkan modal lock jika Supabase belum terkonfigurasi, user belum login, atau pretest belum selesai.
- Bypass development: query `?bypass=true` atau localStorage `nutrisphere_dev_bypass=true`.
- Bypass tidak boleh dianggap mekanisme production dan jangan dipaparkan sebagai fitur pengguna.

### `assets/js/tracking.js`

- `data-track-feature`, `data-track-event`, `data-track-resource` → insert ke `feature_events`.
- `data-module-progress`, `data-progress-status`, `data-progress-percent` → upsert `learning_progress`.
- Tracking bersifat best-effort; error dicatat ke console dan tidak memblokir navigasi.

## 5. Kontrak Backend API

### `GET /api/health`

Mengembalikan status, apakah API key ada, dan label mode. Catatan: label mode saat ini menyebut `Gemini-1.5-Flash`, sedangkan model yang dicoba berbeda; rapikan jika kontrak status dipakai UI/monitoring.

### `POST /api/summarize`

Request: `{ "text": "..." }`.

Response sukses: `{ "summary": "..." }`.

400 jika field hilang/kosong; 500 untuk exception lain. AI aktif bila key valid, selain itu simulasi keyword.

### `POST /api/validate_diagnosis`

Request: `{ "caseId": "balita_easy", "diagnosis_text": "...", "history": [{"role":"user|model","text":"..."}] }`.

Response: `success`, `score`, `reply`, `diagnosis_correct`, `therapy_correct`. Diagnosis/intervensi bernilai 50 poin masing-masing. ID tidak dikenal menghasilkan 404.

### `POST /api/chat`

Request: `{ "message": "...", "history": [...] }`.

Response: `{ "reply": "...", "history": [...] }`. Gemini memakai persona NutriBot; fallback simulasi mengenali greeting, stunting, anemia, obesitas, defisiensi vitamin B, fitur NutriSolve, dan ucapan terima kasih.

API saat ini tidak memiliki auth, rate limiting, request-size limit, persistence chat, atau moderation layer. Pertimbangkan semua ini sebelum production/public exposure.

## 6. Model Data Supabase

- `profiles`: identitas mahasiswa/dosen (`id`, nama, NIM, email, role).
- `test_attempts`: satu pretest dan satu posttest per user, skor/total/persentase/waktu.
- `test_attempt_answers`: jawaban per soal per attempt.
- `case_attempts`: setiap submission kasus, score, success, feedback.
- `learning_progress`: satu row per user+module, status dan persentase.
- `feature_events`: event telemetry dengan resource dan JSON metadata; `user_id` boleh null.

RLS secara umum memberi mahasiswa akses data milik sendiri dan teacher akses baca seluruh data. Trigger membuat profil student otomatis. RPC dashboard mengagregasi improvement dan count aktivitas.

Saat mengubah schema:

1. Update `supabase/schema.sql` secara idempotent.
2. Update constant/query/payload/select di `assets/js/auth.js`.
3. Update RPC mapper/table dashboard bila kolom agregasi berubah.
4. Review RLS untuk SELECT/INSERT/UPDATE/DELETE dan role anon/authenticated.
5. Uji user mahasiswa, dosen/admin, serta anonymous secara terpisah.

## 7. State Browser yang Dipakai

Local storage:

- `nutrisphere_mock_user_v1`, mock users, dan mock attempts untuk development auth.
- `last_login_time` untuk timestamp login dan reset progress kasus setelah 24 jam.
- `nutrisphere_pretest_v1_completed` sebagai cache completion.
- `unlockedPhases`, `completedCases`, `diagStreak` untuk game AR.
- `nutrisphere_dev_bypass` untuk bypass gate development.

Session storage:

- `nutrisphere_admin_unlocked` untuk gate dashboard admin demo.

Jangan mengganti nama key tanpa migration/backward compatibility atau reset state yang disengaja.

## 8. Menjalankan Proyek

Prasyarat: Python, pip, dan browser modern.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Buat `.env` lokal (jangan commit secret):

```dotenv
GEMINI_API_KEY=your_key
```

Jalankan backend:

```powershell
python app.py
```

Backend tersedia pada `http://localhost:5000`. Sajikan frontend melalui static HTTP server dari root repository (bukan mengandalkan `file://`) agar kamera, module loading, dan origin behavior konsisten, misalnya:

```powershell
python -m http.server 3000
```

Buka `http://localhost:3000/index.html`. Backend CORS saat ini terbuka untuk local frontend.

Supabase perlu schema `supabase/schema.sql` dan konfigurasi URL/anon key yang valid. Jangan pernah menaruh service-role key di frontend.

## 9. Test dan Verifikasi

Test struktur memakai Node built-in test runner tanpa package install:

```powershell
node --test tests/site-structure.test.mjs
```

Test memverifikasi keberadaan/marker halaman, wiring asset, kontrak gate/test/auth/tracking, schema, navigation, UI hooks, dan fitur anthropometry. Test ini terutama structural/string-based, sehingga belum membuktikan correctness formula, keamanan, integrasi Supabase live, API Gemini, kamera, GLB rendering, responsive layout, atau accessibility.

Checklist minimal setelah perubahan:

- Jalankan test Node.
- Jika backend berubah, pastikan `app.py` dan `api/index.py` tetap sama atau memakai shared module; uji `/api/health` serta payload valid/invalid setiap endpoint terdampak.
- Jika auth/schema berubah, uji signup, login, logout, gate, pretest sekali-saja, posttest prerequisite, dan dashboard.
- Jika AR berubah, uji semua phase/level, loading GLB, partial diagnosis, partial intervention, success, unlock, localStorage, dan insert Supabase.
- Jika UI berubah, uji desktop/mobile, keyboard focus, sidebar, global chat, scroll reveal, dan halaman tanpa DOM khusus.
- Jika resource berubah, cek file/link benar-benar dapat dibuka dan tracking metadata sesuai.

## 10. Known Limitations dan Risiko

- `dietary.html` masih statis.
- Clinical “AI scan” adalah preset simulation, bukan analisis citra.
- AR Patient adalah 3D viewer, belum augmented reality/WebXR.
- AI Summary dan NutriBot punya fallback simulasi yang dapat terlihat meyakinkan tetapi bukan analisis input yang sebenarnya.
- Formula/cut-off anthropometry perlu review ahli dan unit/population validation sebelum penggunaan klinis.
- Password admin/RPC secret hardcoded dan client-visible; tidak aman untuk production.
- Backend API publik tidak memiliki auth/rate limit/body limit.
- Regex Markdown renderer + `innerHTML` perlu hardening terhadap XSS.
- Data kasus diduplikasi frontend/backend dan mudah drift.
- `app.py` diduplikasi ke `api/index.py`.
- Beberapa string menunjukkan mojibake encoding (`Â`, karakter emoji rusak). Simpan seluruh source sebagai UTF-8 dan perbaiki secara terkontrol.
- `migrate.py` adalah script migrasi legacy dengan absolute path milik developer lama; bukan migration runner aktif dan jangan dijalankan tanpa refactor.
- `Web Design Claude.md` adalah instruksi desain legacy untuk tooling/path environment lain; bukan sumber arsitektur runtime proyek.
- CDN dependencies membuat aplikasi membutuhkan jaringan dan belum dipin dengan integrity attributes.

## 11. Konvensi Further Development

- Pertahankan vanilla/static architecture kecuali ada keputusan eksplisit untuk migrasi framework.
- Gunakan nama canonical `clinical.html`; `klinis.html` hanya redirect/compatibility page.
- Jangan klaim fitur simulasi sebagai diagnosis medis, computer vision, AR nyata, atau AI aktif bila hanya fallback.
- Untuk fitur klinis, tampilkan disclaimer edukasi dan validasi konten dengan ahli gizi.
- Jangan menyimpan data pasien teridentifikasi pada telemetry atau localStorage.
- Gunakan `textContent` untuk data pengguna; bila harus memakai `innerHTML`, sanitasi dahulu.
- Jangan commit `.env`, Gemini key, Supabase service-role key, password production, atau data sensitif.
- Jaga selector `data-*` karena HTML, JavaScript, dan test saling terikat melalui atribut tersebut.
- Saat menambah page utama, tambahkan shared CSS/JS, Supabase/auth/tracking/gate sesuai kebutuhan, link navigasi konsisten, dan registrasikan pada test struktur.
- Saat menambah soal, perbarui total/expectation test dan pastikan answer index valid terhadap options.
- Saat menambah kasus, sinkronkan frontend data, backend ground truth di dua entry point, asset GLB, progression rules, dan test.
- Prefer refactor data kasus ke satu JSON/shared source dan backend ke satu module sebelum ekspansi besar.
- Treat Supabase sebagai source of truth untuk hasil resmi; localStorage hanya cache/game state.

## 12. File yang Paling Sering Berubah Bersama

- Halaman/global UI: HTML terkait + `assets/css/styles.css` + `assets/js/main.js` + structural test.
- Auth/test: `login.html`, `pretest.html`, `posttest.html`, `assets/js/auth.js`, `login.js`, `test-runner.js`, `pretest-gate.js`, dan `supabase/schema.sql`.
- Dashboard: `dashboard-dosen.html`, `dashboard-dosen.js`, RPC di schema.
- AR cases: `ar-patient.html`, `ar-patient.js`, GLB, `app.py`, `api/index.py`, schema/tracking bila payload berubah.
- AI Summary/chat: page/client JS terkait + kedua Flask entry point.
- Learning resources: page katalog + asset PDF/URL + declarative tracking metadata.

Dokumentasikan perubahan perilaku besar kembali di file ini agar context untuk developer berikutnya tetap sesuai implementasi.
