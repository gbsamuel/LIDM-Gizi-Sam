import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes (necessary for local frontend files to call backend)
CORS(app)

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Gunakan gemini-3.5-flash sebagai model mutakhir utama yang didukung oleh Kunci API
    model = genai.GenerativeModel('gemini-3.5-flash')
else:
    model = None
    print("[WARNING] GEMINI_API_KEY tidak ditemukan. Aplikasi berjalan dalam MODE SIMULASI BACKEND.")

def generate_with_fallback(prompt, system_instruction=None, history=None):
    # Urutan model yang dicoba jika terjadi limit kuota atau 404
    models_to_try = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash']
    
    last_error = None
    for model_name in models_to_try:
        try:
            if system_instruction:
                m = genai.GenerativeModel(model_name, system_instruction=system_instruction)
            else:
                m = genai.GenerativeModel(model_name)
            
            if history is not None:
                # Memulai chat session dengan history
                gemini_chat = m.start_chat(history=history)
                response = gemini_chat.send_message(prompt)
                return response.text, model_name
            else:
                # Direct generate content
                response = m.generate_content(prompt)
                return response.text, model_name
        except Exception as e:
            err_str = str(e).lower()
            # Jika ini adalah error kuota (429) atau model tidak ditemukan (404), kita coba model berikutnya
            if any(w in err_str for w in ["quota", "exhausted", "429", "not found", "404"]):
                print(f"[FALLBACK] Model {model_name} gagal: {str(e)}. Mencoba model berikutnya...")
                last_error = e
                continue
            else:
                raise e
    raise last_error

# Grounding Database untuk Kasus Gizi (Reference Ground Truth)
CASES = {
    "balita_easy": {
        "name": "An. Bilal (Balita - 2 Tahun)",
        "complaint": "Ibunya mengeluh Bilal sangat kurus, rewel, nafsu makan menurun drastis sejak disapih, dan sering diare.",
        "status_gizi": "Gizi Buruk (Wasting) [Z-score BB/PB: -3.2 SD]",
        "lab": "Hemoglobin: 10.5 g/dL, Albumin: 2.8 g/dL (Rendah)",
        "physical_findings": "Wajah keriput seperti orang tua (old man face), iga gambang (ribs visible), pantat keriput (baggy pants appearance), lemak subkutan sangat tipis.",
        "dietary_recall": "Sarapan hanya air tajin dan teh manis. Makan siang nasi bubur polos dengan kuah kecap. Tidak mengonsumsi susu formula/ASI setelah disapih, lauk hewani hampir tidak pernah.",
        "correct_diagnosis": "Gizi Buruk tipe Marasmus",
        "correct_therapy": "Pemberian Formula F-75 untuk fase stabilisasi (mencegah refeeding syndrome), dilanjutkan secara bertahap ke F-100/RUTF (Ready-to-Use Therapeutic Food) untuk rehabilitasi, serta pemantauan ketat hidrasi dan pencegahan hipotermia/hipoglikemia.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Gizi Buruk Marasmus** pada An. Bilal.\n\n"
            "**Evaluasi Terapi:** Bagus sekali! Penanganan awal dengan Formula F-75 untuk stabilisasi dan mencegah refeeding syndrome, bertahap naik ke F-100/RUTF adalah terapi gizi standar medis yang sangat tepat."
        )
    },
    "balita_medium": {
        "name": "An. Kia (Balita - 3 Tahun)",
        "complaint": "Kia sering menabrak barang saat berjalan sore/malam hari, matanya sering berair dan tampak ada bercak keputihan.",
        "status_gizi": "Gizi Kurang [Z-score IMT/U: -2.2 SD]",
        "lab": "Serum Retinol: 0.15 µmol/L (Sangat Rendah)",
        "physical_findings": "Kulit kering bersisik (xerosis kutis), mata tampak kering, terdapat bercak busa abu-abu keputihan pada konjungtiva (Bercak Bitot / Bitot's Spots).",
        "dietary_recall": "Makanan utama hanya nasi dengan mi instan. Jarang mengonsumsi sayur hijau, wortel, telur, atau hati ayam.",
        "correct_diagnosis": "Defisiensi Vitamin A (Xerophthalmia) dan Gizi Kurang",
        "correct_therapy": "Suplementasi Vitamin A kapsul dosis tinggi segera (Hari ke-1, 2, dan 15), pemberian makanan kaya Vitamin A dan beta-karoten (wortel, bayam, kuning telur, hati) yang dimasak dengan sedikit minyak/lemak untuk mempercepat absorpsi.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Defisiensi Vitamin A (Xerophthalmia)** secara klinis dari Bercak Bitot pada mata An. Kia.\n\n"
            "**Evaluasi Terapi:** Hebat! Pemberian kapsul vitamin A dosis tinggi secara terjadwal dan saran memasak makanan kaya vitamin A/beta-karoten dengan minyak untuk penyerapan adalah tatalaksana gizi terbaik."
        )
    },
    "balita_hard": {
        "name": "An. Dodi (Balita - 2.5 Tahun)",
        "complaint": "Kaki Dodi tampak melengkung aneh seperti huruf 'O' saat berjalan, rewel, lambat berjalan dibanding anak seusianya.",
        "status_gizi": "Gizi Kurang-Normal [Z-score PB/U: -2.3 SD]",
        "lab": "Serum Kalsium: 7.8 mg/dL (Rendah), 25-hydroxyvitamin D: 12 ng/mL (Defisiensi)",
        "physical_findings": "Kaki berbentuk busur melengkung keluar (Genu Varum / Bowlegs), penebalan pada pergelangan tangan dan kaki, dada menonjol (pigeon chest).",
        "dietary_recall": "Sangat jarang diajak bermain di luar ruangan pagi hari (kurang paparan sinar matahari). Jarang minum susu, alergi ikan laut, asupan harian rendah kalsium.",
        "correct_diagnosis": "Rickets (Defisiensi Vitamin D dan Kalsium)",
        "correct_therapy": "Suplementasi Vitamin D3 dan Kalsium dosis klinis, edukasi berjemur sinar matahari pagi (10-15 menit), tingkatkan konsumsi susu formula fortifikasi, keju, kuning telur, dan teri nasi.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi **Rickets / Rakitis** akibat defisiensi vitamin D/kalsium berdasarkan gejala kaki O (genu varum).\n\n"
            "**Evaluasi Terapi:** Sempurna! Suplementasi kalsium dan vitamin D, dikombinasikan dengan anjuran berjemur sinar matahari pagi serta asupan teri/susu adalah tatalaksana pemulihan tulang anak yang tepat."
        )
    },
    "balita_extreme": {
        "name": "An. Caca (Balita - 1.5 Tahun)",
        "complaint": "Caca badannya bengkak-bengkak terutama pada kaki, wajah membulat, rewel, rambut kemerahan gampang dicabut, tidak mau makan.",
        "status_gizi": "Gizi Buruk (Edema bilateral) [Z-score BB/PB: -2.9 SD]",
        "lab": "Albumin Serum: 1.9 g/dL (Sangat Rendah), Hemoglobin: 9.0 g/dL",
        "physical_findings": "Edema pitting bilateral pada kedua kaki, wajah membulat sembab (moon face), rambut pirang kemerahan kering mudah dicabut (flag sign), ruam kulit bercak kehitaman terkelupas (crazy pavement dermatosis).",
        "dietary_recall": "Hanya diberi makan bubur nasi encer dengan kuah sayur tanpa protein hewani/nabati sejak ibunya hamil lagi dan berhenti menyusui.",
        "correct_diagnosis": "Gizi Buruk tipe Kwashiorkor (Defisiensi Protein Akut)",
        "correct_therapy": "Rawat inap klinis, stabilisasi dengan Formula F-75 (rendah protein pada awal stabilisasi untuk cegah beban hati/ginjal dan refeeding syndrome), dilanjutkan F-100 setelah edema mereda, monitoring edema dan cairan, edukasi pentingnya protein hewani tinggi.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Gizi Buruk Kwashiorkor** dengan gejala pitting edema bilateral pada kaki dan hipoalbuminemia ekstrem sangat tepat.\n\n"
            "**Evaluasi Terapi:** Tepat sekali! Formula stabilisasi F-75 rendah protein harus diberikan dulu untuk menghindari refeeding syndrome, baru dilanjutkan protein tinggi F-100 untuk pemulihan."
        )
    },
    "remaja_easy": {
        "name": "Siswa AP (Remaja Perempuan - 16 Tahun)",
        "complaint": "Saya akhir-akhir ini sering pusing dan cepat capek kalau di sekolah. Kalau naik tangga rasanya gampang lelah, dan kadang saya juga susah konsentrasi saat pelajaran.",
        "status_gizi": "Gizi Kurang (Underweight) [Z-score IMT/U: -1.8 SD]",
        "lab": "Hemoglobin (Hb): 10.2 g/dL (Anemia Ringan/Sedang)",
        "physical_findings": "Konjungtiva sangat pucat, kuku rapuh (CRT > 2 detik), rambut agak kering/kasar, kulit wajah pucat pasi (pallor).",
        "dietary_recall": "Sarapan teh manis hangat + roti tawar margarin. Makan siang nasi + ayam goreng tepung (tanpa sayur). Makan malam nasi + telur dadar. Camilan manis + teh botol kemasan setelah makan berat.",
        "correct_diagnosis": "Anemia Defisiensi Besi dan Gizi Kurang (Underweight)",
        "correct_therapy": "Pemberian tablet tambah darah (suplementasi zat besi & asam folat), konsumsi makanan kaya besi heme (hati, daging merah) dan besi non-heme dikombinasikan dengan Vitamin C (jeruk, buah segar) untuk mempercepat absorpsi, serta edukasi KETAT untuk menghindari minum teh/kopi langsung setelah makan (karena kandungan tanin mengikat besi sehingga tidak terserap tubuh).",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Anemia Defisiensi Besi** dan status **Gizi Kurang** pada AP.\n\n"
            "**Evaluasi Terapi:** Sangat bagus! Penambahan asupan besi heme (seperti hati, daging), asupan vitamin C untuk memperlancar absorpsi zat besi, serta edukasi untuk **menghindari minum teh setelah makan** (karena senyawa tanin mengikat zat besi) adalah tatalaksana yang sempurna untuk AP."
        )
    },
    "remaja_medium": {
        "name": "Siswa MR (Remaja Laki-Laki - 17 Tahun)",
        "complaint": "Saya sering lapar terus walaupun baru saja makan kenyang. Kalau di kelas saya sering sekali mengantuk, gampang haus, dan sesekali perut saya rasanya tidak nyaman.",
        "status_gizi": "Obesitas [Z-score IMT/U: +2.6 SD]",
        "lab": "Glukosa Darah Puasa (GDP): 118 mg/dL (Prediabetes)",
        "physical_findings": "Hiperpigmentasi kehitaman dengan tekstur menebal seperti beludru di lipatan leher belakang (Acanthosis Nigricans - tanda klasik resistensi insulin), obesitas abdominal sentral.",
        "dietary_recall": "Jarang sarapan (hanya es manis). Makan siang burger + kentang goreng besar + cola bersoda. Makan malam nasi goreng kambing porsi besar. Camilan tinggi garam + kopi susu kekinian manis 3-4 kali sehari.",
        "correct_diagnosis": "Obesitas Sentral dengan risiko tinggi Prediabetes dan Resistensi Insulin",
        "correct_therapy": "Membatasi asupan gula sederhana (karbohidrat simpleks, es kopi manis, teh kemasan, soda), mengganti camilan dengan buah berserat tinggi/sayuran hijau, meningkatkan aktivitas fisik aerobik sedang (seperti jalan cepat atau jogging) minimal 150 menit per minggu untuk meningkatkan sensitivitas insulin.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Obesitas Sentral** dengan risiko **Prediabetes & Resistensi Insulin** pada MR sangat tepat.\n\n"
            "**Evaluasi Terapi:** Luar biasa! Pengurangan asupan gula sederhana, peningkatan serat larut, serta aktivitas fisik teratur minimal 150 menit/minggu adalah pilar tatalaksana terbaik untuk membalikkan prediabetes pada remaja laki-laki ini."
        )
    },
    "remaja_hard": {
        "name": "Siswa NA (Remaja Perempuan - 15 Tahun)",
        "complaint": "Mulut saya sering sekali terasa perih, sudut bibir pecah-pecah meradang, dan saya akhir-akhir ini malas makan karena mengunyah rasanya sakit.",
        "status_gizi": "Gizi Kurang (Underweight) [Z-score IMT/U: -2.1 SD]",
        "lab": "Profil Darah: Normal, tidak ada anemia berat",
        "physical_findings": "Fisur/luka robek kemerahan di kedua sudut bibir (Angular Cheilitis), permukaan lidah memerah meradang (Glossitis), kulit ekstremitas kasar kering bersisik (xerosis kutis).",
        "dietary_recall": "Sarapan hanya air hangat lemon + 1/2 apel kecil. Makan siang nasi putih sangat sedikit + tahu kukus polos tanpa garam. Melewatkan makan malam atau hanya makan salad selada tanpa dressing. Tidak ada makanan selingan.",
        "correct_diagnosis": "Defisiensi Vitamin B Kompleks (khususnya Riboflavin/B2, Niasin/B3, dan B12) akibat diet pembatasan kalori ekstrim tanpa pengawasan klinis.",
        "correct_therapy": "Menghentikan diet penurunan berat badan ekstrim yang tidak seimbang, meningkatkan asupan zat gizi mikro kaya Vitamin B kompleks melalui peningkatan konsumsi protein hewani (daging, ikan, ayam), telur, susu, dan sayuran berdaun hijau, serta mengedukasi pola makan gizi seimbang.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mendeteksi **Defisiensi Vitamin B Kompleks (Riboflavin/B2 & B12)** secara klinis dari gejala **Angular Cheilitis** (luka sudut bibir) dan **Glossitis** pada NA.\n\n"
            "**Evaluasi Terapi:** Sangat tepat! Menghentikan diet pembatasan ekstrem dan meningkatkan konsumsi protein hewani, telur, susu, dan sayuran hijau akan memperbaiki defisiensi gizi mikro ini dengan sangat cepat."
        )
    },
    "remaja_extreme": {
        "name": "Siswa RS (Remaja Laki-Laki - 16 Tahun)",
        "complaint": "Saya merasa badan saya lebih pendek dan kecil sekali dibandingkan dengan teman-teman sekelas. Kalau pas pelajaran olahraga, fisik saya cepat capek sekali.",
        "status_gizi": "Tinggi Badan Sangat Pendek (Stunted) [Z-score TB/U: -2.8 SD], IMT/U Normal.",
        "lab": "Analisis Hormonal: Hormon pertumbuhan (GH) normal-rendah",
        "physical_findings": "Tinggi badan jauh di bawah rata-rata usianya, rambut kusam kasar (pudar), massa otot kurang (muscle wasting ringan), turgor kulit agak lambat kembali.",
        "dietary_recall": "Sering melewatkan sarapan. Makan siang mi instan rebus + nasi putih (tanpa lauk/sayur). Makan malam nasi putih + kuah sop bening (kol/wortel minimalis, tanpa protein). Camilan kerupuk asin dan es lilin manis.",
        "correct_diagnosis": "Gangguan Pertumbuhan Linear / Stunting Kronis (under-nutrition kronis sejak masa kecil) akibat asupan protein hewani yang sangat minim kualitasnya.",
        "correct_therapy": "Menerapkan diet Tinggi Energi Tinggi Protein (TETP), fokus pada asupan asam amino esensial tinggi melalui protein hewani bernilai biologis tinggi (susu, telur ayam minimal 1-2 butir sehari, ikan, daging), suplementasi kalsium, zinc, dan vitamin D untuk mendukung percepatan pertumbuhan tulang (catch-up growth) yang tersisa di akhir fase pubertas.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi **Gangguan Pertumbuhan / Tinggi Badan Sangat Pendek (Stunting Kronis)** pada RS berdasarkan Z-score TB/U (-2.8 SD).\n\n"
            "**Evaluasi Terapi:** Sempurna! RS membutuhkan asupan tinggi energi dan protein bernilai biologis tinggi (telur, susu, ikan) untuk mendukung catch-up growth (kejar tumbuh linear) pada fase remaja ini."
        )
    },
    "dewasa_easy": {
        "name": "Bp. Hendra (Dewasa - 42 Tahun)",
        "complaint": "Sering sakit kepala bagian belakang terutama setelah makan makanan bersantan/berdaging, tengkuk terasa kaku.",
        "status_gizi": "Gizi Lebih (Overweight) [IMT: 26.5 kg/m²]",
        "lab": "Kolesterol Total: 260 mg/dL (Tinggi), LDL: 175 mg/dL (Tinggi), HDL: 38 mg/dL (Rendah)",
        "physical_findings": "Tengkuk kaku, obesitas ringan abdominal, arcus senilis samar di kornea.",
        "dietary_recall": "Gemar mengonsumsi makanan bersantan (gulai, rendang), gorengan sore hari (3-4 potong), minum kopi manis kental, jarang makan buah dan sayur.",
        "correct_diagnosis": "Hiperkolesterolemia (Dislipidemia) dan Overweight",
        "correct_therapy": "Diet rendah lemak jenuh dan kolesterol, batasi gulai bersantan, gorengan, dan daging merah berlemak. Tingkatkan asupan serat larut (oatmeal, buah, sayur) serta olahraga kardio untuk meningkatkan HDL.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Hiperkolesterolemia** (Dislipidemia) dan Overweight sangat tepat berdasarkan data lab kolesterol tinggi.\n\n"
            "**Evaluasi Terapi:** Tepat sekali! Mengurangi lemak jenuh (santan/gorengan) dan meningkatkan asupan serat larut serta olahraga untuk meningkatkan HDL adalah pilar utama terapi gizi dislipidemia."
        )
    },
    "dewasa_medium": {
        "name": "Ibu Susi (Dewasa - 38 Tahun)",
        "complaint": "Sering buang air kecil di malam hari (poliuria), cepat haus (polidipsia), cepat lapar (polifagia), dan berat badan menurun drastis secara misterius dalam 1 bulan terakhir.",
        "status_gizi": "Gizi Lebih pada awal, turun menjadi Normal-Rendah [IMT: 19.8 kg/m²]",
        "lab": "Gula Darah Sewaktu (GDS): 280 mg/dL (Sangat Tinggi), HbA1c: 8.5%",
        "physical_findings": "Kulit terasa agak kering, penurunan turgor kulit, napas berbau buah manis samar.",
        "dietary_recall": "Senang mengonsumsi teh manis (5-6 gelas sehari), nasi porsi besar dengan lauk manis (seperti semur/bacem), ngemil kue basah tradisional manis siang hari.",
        "correct_diagnosis": "Diabetes Melitus Tipe 2",
        "correct_therapy": "Diet DM dengan prinsip 3J (Jumlah kalori sesuai kebutuhan, Jadwal makan teratur 3 kali utama 2 kali selingan, Jenis makanan indeks glikemik rendah), membatasi gula sederhana (teh manis/kue manis), ganti nasi putih dengan nasi merah/oat.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Diabetes Melitus Tipe 2** secara akurat berdasarkan keluhan klasik polifagia, polidipsia, poliuria, serta kadar GDS & HbA1c tinggi.\n\n"
            "**Evaluasi Terapi:** Luar biasa! Penerapan konsep diet 3J (Jumlah, Jadwal, Jenis) dan penggantian gula sederhana dengan karbohidrat kompleks indeks glikemik rendah adalah terapi gizi standar emas DMG/DM."
        )
    },
    "dewasa_hard": {
        "name": "Bp. Rian (Dewasa - 45 Tahun)",
        "complaint": "Nyeri jempol kaki kanan yang sangat hebat mendadak di malam hari, bengkak kemerahan, sampai tidak bisa berjalan atau memakai sepatu.",
        "status_gizi": "Obesitas Ringan [IMT: 28.2 kg/m²]",
        "lab": "Asam Urat Serum: 9.2 mg/dL (Sangat Tinggi)",
        "physical_findings": "Sendi jempol kaki (metatarsophalangeal-1) tampak bengkak, kemerahan, teraba panas, nyeri tekan ekstrem (artritis gout).",
        "dietary_recall": "Gemar mengonsumsi jeroan (babat, paru, usus), emping melinjo sebagai camilan harian, seafood (udang/kerang), dan minum bir/alkohol/minuman tinggi fruktosa manis.",
        "correct_diagnosis": "Artritis Gout Akut (Hiperurisemia)",
        "correct_therapy": "Diet rendah purin (hindari jeroan, seafood, emping, kaldu daging pekat), batasi minuman manis tinggi fruktosa (soda/jus kemasan) dan alkohol yang menghambat ekskresi asam urat, tingkatkan hidrasi (minum air putih minimal 2.5-3 liter/hari) untuk membilas asam urat lewat ginjal.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Artritis Gout Akut** (Hiperurisemia) sangat tepat berdasarkan data lab asam urat tinggi dan nyeri sendi khas gout.\n\n"
            "**Evaluasi Terapi:** Sempurna! Diet rendah purin (menghindari jeroan, emping, melinjo) dan meningkatkan asupan air putih untuk membantu pembuangan asam urat melalui urin adalah tatalaksana gizi terbaik."
        )
    },
    "dewasa_extreme": {
        "name": "Ibu Lilis (Dewasa - 50 Tahun)",
        "complaint": "Badan terasa lemas sekali, mual, muntah, sesak napas ringan, kencing terasa sedikit, kaki membengkak bengkak sembab.",
        "status_gizi": "Overweight dengan edema [IMT: 25.8 kg/m²]",
        "lab": "GFR: 14 mL/min/1.73m² (Stadium 5 / Gagal Ginjal), Ureum: 150 mg/dL (Tinggi), Kreatinin: 6.8 mg/dL (Tinggi), Kalium: 5.8 mEq/L (Hiperkalemia)",
        "physical_findings": "Edema pitting pada pergelangan kaki bilateral, kulit wajah pucat kekuningan (uremic frost samar), napas berbau uremik.",
        "dietary_recall": "Pola makan tidak teratur, sering mengonsumsi daging merah porsi besar, konsumsi garam tinggi dari ikan asin/asinan, suka minum minuman bersoda.",
        "correct_diagnosis": "Gagal Ginjal Kronis Stadium V (End-Stage Renal Disease) dengan Hiperkalemia",
        "correct_therapy": "Diet Rendah Protein (0.6-0.8 g/kgBB/hari jika belum hemodialisis, atau disesuaikan), Diet Rendah Kalium (batasi pisang, jeruk, kentang, air kelapa), Diet Rendah Natrium (batasi garam dan bahan pengawet), batasi asupan cairan untuk cegah edema paru/asites.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Gagal Ginjal Kronis Stadium 5** dengan komplikasi hiperkalemia secara tepat.\n\n"
            "**Evaluasi Terapi:** Tepat sekali! Restriksi protein untuk membatasi akumulasi ureum, pembatasan ketat natrium dan cairan untuk mengendalikan edema/cairan berlebih, serta pembatasan kalium adalah kunci terapi nutrisi renal."
        )
    },
    "lansia_easy": {
        "name": "Ibu Hartini (Lansia - 68 Tahun)",
        "complaint": "Punggung sering nyeri ngilu, badan terasa membungkuk, tinggi badan menyusut dibanding waktu muda, takut jatuh karena sendi terasa rapuh.",
        "status_gizi": "Kurang-Normal [IMT: 18.5 kg/m²]",
        "lab": "Kepadatan tulang (BMD) T-score: -2.8 (Osteoporosis)",
        "physical_findings": "Postur tubuh agak bungkuk (kifosis senilis / dowager's hump), nyeri tekan pada tulang belakang, langkah jalan lambat.",
        "dietary_recall": "Sangat jarang minum susu sejak usia 50 tahun karena diare (lactose intolerance). Jarang makan tahu/tempe/teri, jarang terpapar matahari karena hanya diam di kamar.",
        "correct_diagnosis": "Osteoporosis Senilis",
        "correct_therapy": "Suplementasi Kalsium dan Vitamin D3 tinggi, konsumsi makanan kaya kalsium non-susu (teri nasi, brokoli, susu bebas laktosa/susu kedelai fortifikasi), latihan beban ringan (seperti jalan santai) untuk merangsang remodeling tulang, paparan sinar matahari teratur.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Osteoporosis Senilis** dengan indikasi penurunan kepadatan tulang (T-score -2.8) sangat tepat.\n\n"
            "**Evaluasi Terapi:** Sangat bagus! Suplementasi kalsium, Vitamin D, konsumsi produk teri nasi, serta anjuran berjemur matahari dan latihan kekuatan sendi ringan (jalan kaki) adalah pilar tatalaksana gizi terbaik."
        )
    },
    "lansia_medium": {
        "name": "Bp. Djoko (Lansia - 72 Tahun)",
        "complaint": "Sering pusing berputar, tengkuk berat, kaki terasa lemah saat berjalan, otot paha dan lengan tampak sangat mengecil kendur.",
        "status_gizi": "Obesitas Sarkopenik [IMT: 27.2 kg/m², Lingkar Lengan Atas rendah]",
        "lab": "Tekanan Darah: 165/95 mmHg (Hipertensi Stadium 2)",
        "physical_findings": "Otot ekstremitas wasting (mengecil/sarkopenia) sementara lemak perut menumpuk tebal, kekuatan genggaman tangan lemah.",
        "dietary_recall": "Pola makan rendah protein (hanya makan bubur/nasi dengan kuah sayur bersantan tanpa lauk daging karena gigi ompong), suka camilan asin/keripik.",
        "correct_diagnosis": "Hipertensi Stadium 2 dan Obesitas Sarkopenik",
        "correct_therapy": "Diet DASH (Dietary Approaches to Stop Hypertension) rendah natrium (batasi garam/camilan asin), tingkatkan asupan protein berkualitas tinggi yang mudah dikunyah (telur rebus, ikan tim lunak, tahu sutra) untuk mengatasi kehilangan masa otot, batasi lemak jenuh/santan.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mendiagnosis **Hipertensi dan Obesitas Sarkopenik** secara klinis dari data penyusutan otot lengan disertai tekanan darah tinggi.\n\n"
            "**Evaluasi Terapi:** Sempurna! Diet rendah natrium (DASH) untuk hipertensi serta asupan protein tinggi yang mudah dikunyah (telur/ikan tim) untuk mempertahankan kekuatan otot adalah terapi yang ideal."
        )
    },
    "lansia_hard": {
        "name": "Ibu Maimunah (Lansia - 75 Tahun)",
        "complaint": "Badan lemas lunglai, sering lupa makan, napas terengah-engah jika berjalan dekat, gusi sering berdarah, gigi sudah habis (ompong total).",
        "status_gizi": "Malnutrisi Energi Protein (MEP) Kronis [IMT: 16.0 kg/m² (Sangat Kurus)]",
        "lab": "Hemoglobin: 8.8 g/dL (Anemia Sedang), Albumin: 2.5 g/dL",
        "physical_findings": "Kulit sangat keriput kering, muscle wasting hebat pada temporal (wajah cekung), konjungtiva pucat, atrofi gusi karena kehilangan gigi.",
        "dietary_recall": "Makan hanya 1-2 kali sehari bubur nasi saring dengan kuah sop bening encer. Tidak makan lauk hewani atau buah karena kesulitan mengunyah.",
        "correct_diagnosis": "Malnutrisi Energi Protein Kronis (Senile Marasmus) dan Anemia Senilis",
        "correct_therapy": "Terapi diet makanan lunak/saring Tinggi Energi Tinggi Protein (TETP) bertahap, suplementasi zat besi cair/tetes, modifikasi tekstur makanan agar mudah ditelan (puree/tim blender), tingkatkan frekuensi makan porsi kecil tapi sering (5-6 kali sehari).",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Malnutrisi Energi Protein (MEP) Kronis** dan Anemia Sedang pada lansia ini sangat tepat.\n\n"
            "**Evaluasi Terapi:** Bagus sekali! Pemberian diet Tinggi Energi Tinggi Protein (TETP) dengan penyesuaian tekstur makanan lunak/tim blender serta porsi kecil sering sangat krusial untuk mengatasi kaheksia/wasting lansia."
        )
    },
    "lansia_extreme": {
        "name": "Bp. Suwito (Lansia - 80 Tahun)",
        "complaint": "Sering tersedak saat makan atau minum air (disfagia), lupa arah jalan, tidak mau makan karena merasa makanan beracun, berat badan merosot tajam.",
        "status_gizi": "Gizi Buruk Lansia [IMT: 15.5 kg/m²]",
        "lab": "Albumin: 2.2 g/dL, Hb: 9.5 g/dL",
        "physical_findings": "Kehilangan memori berat (Demensia Alzheimer), refleks menelan lambat, batuk setelah minum cairan (tanda aspirasi), tubuh kurus kering.",
        "dietary_recall": "Menolak makan nasi, sering menyemburkan makanan, asupan cairan harian di bawah 800 ml karena takut tersedak.",
        "correct_diagnosis": "Gizi Buruk sekunder akibat Demensia Alzheimer Berat dan Disfagia (Gangguan Menelan)",
        "correct_therapy": "Modifikasi tekstur makanan menjadi saring kental (thickened fluids) untuk cegah pneumonia aspirasi (gunakan thickener pada air), diet padat gizi porsi kecil sering dengan sabar, atau pertimbangkan nutrisi enteral via pipa nasogastrik (NGT) jika asupan oral tidak aman.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi **Gizi Buruk sekunder akibat Demensia dan Disfagia** (kesulitan menelan) pada lansia.\n\n"
            "**Evaluasi Terapi:** Sangat tepat! Modifikasi kekentalan cairan (thickened liquid) untuk mencegah aspirasi paru-paru dan pendekatan nutrisi secara perlahan/NGT adalah kunci utama penanganan kasus disfagia parah."
        )
    },
    "bumil_easy": {
        "name": "Ny. Fitri (Ibu Hamil - 26 Tahun)",
        "complaint": "Hamil 20 minggu (Trimester 2), sering mengeluh pusing kliyengan, lesu, cepat capek, dan kadang jantung berdebar-debar saat aktivitas ringan.",
        "status_gizi": "Normal sebelum hamil, kenaikan berat badan lambat [IMT: 20.2 kg/m²]",
        "lab": "Hemoglobin: 9.8 g/dL (Anemia pada Ibu Hamil)",
        "physical_findings": "Konjungtiva pucat, sklera putih, perut tampak membesar sesuai usia kehamilan trimester 2.",
        "dietary_recall": "Mengalami mual (morning sickness) berkepanjangan pada trimester 1, jarang sarapan, hanya makan nasi dengan sayur bening bayam dan tempe. Jarang makan daging karena mual bau amis.",
        "correct_diagnosis": "Anemia Defisiensi Besi dalam Kehamilan Trimester 2",
        "correct_therapy": "Suplementasi Tablet Tambah Darah (Fe minimal 60 mg/hari + asam folat) rutin diminum malam hari bersama Vitamin C (jeruk) untuk kurangi mual, edukasi asupan protein hewani bebas amis (seperti telur rebus matang, ayam tanpa kulit), hindari teh/kopi setelah makan.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Anemia Defisiensi Besi pada Ibu Hamil Trimester 2** sangat tepat sesuai batas Hb ibu hamil (<11 g/dL).\n\n"
            "**Evaluasi Terapi:** Hebat! Rekomendasi suplementasi tablet tambah darah (TTD) bersama vitamin C pada malam hari untuk meminimalkan mual, serta edukasi protein hewani tanpa amis adalah langkah tatalaksana gizi bumil yang sangat tepat."
        )
    },
    "bumil_medium": {
        "name": "Ny. Rina (Ibu Hamil - 32 Tahun)",
        "complaint": "Hamil 26 minggu (Trimester 2 akhir), sering merasa haus berlebih, sering buang air kecil, kaki bengkak ringan, dan berat badan naik sangat pesat di trimester ini.",
        "status_gizi": "Gizi Lebih (Overweight) [IMT: 26.8 kg/m²]",
        "lab": "Tes Toleransi Glukosa Oral (TTGO) jam ke-2: 155 mg/dL (Diabetes Gestasional)",
        "physical_findings": "Edema pergelangan kaki ringan (fisiologis/patologis awal), tinggi fundus uteri lebih besar dari usia kehamilan.",
        "dietary_recall": "Ngidam minuman boba manis hampir setiap hari (2 gelas), suka makan roti manis, porsi nasi putih sangat besar ditambah lauk berlemak.",
        "correct_diagnosis": "Diabetes Melitus Gestasional (DMG) pada Kehamilan Trimester 2",
        "correct_therapy": "Diet DMG dengan pembatasan asupan gula sederhana (minuman manis/boba) secara ketat, kontrol porsi karbohidrat kompleks indeks glikemik rendah (nasi merah/oat), tingkatkan serat, bagi porsi makan menjadi 3 porsi besar dan 3 selingan kecil untuk menjaga kestabilan glukosa darah ibu dan janin.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Diabetes Melitus Gestasional** (DMG) pada ibu hamil sangat tepat berdasarkan tes beban glukosa TTGO yang tinggi.\n\n"
            "**Evaluasi Terapi:** Sangat bagus! Pembatasan ketat gula sederhana (menghindari minuman boba manis) dan pengaturan jadwal makan 3 porsi utama & 3 selingan adalah strategi diet terbaik untuk mencegah makrosomia pada janin."
        )
    },
    "busui_hard": {
        "name": "Ny. Wulan (Ibu Menyusui - 22 Tahun)",
        "complaint": "Menyusui bayi usia 3 bulan secara eksklusif. Ibu mengeluh lemas, ASI keluar sangat sedikit encer, pusing, dan bayi sering menangis rewel karena kurang kenyang.",
        "status_gizi": "Kurang Energi Kronis (KEK) [IMT: 17.2 kg/m², Lingkar Lengan Atas (LILA): 21.5 cm]",
        "lab": "Albumin: 3.0 g/dL, Hb: 10.5 g/dL",
        "physical_findings": "Ibu tampak sangat kurus, LILA < 23.5 cm (batas KEK), konjungtiva sedikit pucat, payudara tampak kurang terisi.",
        "dietary_recall": "Pola makan tidak teratur, makan hanya 2 kali sehari nasi dengan tempe/tahu bakar, menghindari konsumsi ikan/telur karena mitos lokal bahwa ASI akan bau amis.",
        "correct_diagnosis": "Kurang Energi Kronis (KEK) pada Ibu Menyusui",
        "correct_therapy": "Terapi diet gizi seimbang dengan penambahan kalori +500 kkal/hari (sesuai AKG ibu menyusui), PMT (Pemberian Makanan Tambahan) ibu hamil/menyusui, edukasi membantah mitos pantang makan ikan/telur, tingkatkan asupan cairan (minum air putih minimal 3 liter/hari) untuk produksi ASI.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Kurang Energi Kronis (KEK) pada Ibu Menyusui** secara akurat berdasarkan LILA < 23.5 cm.\n\n"
            "**Evaluasi Terapi:** Luar biasa! Tambahan energi +500 kkal/hari, anjuran hidrasi 3 liter air/hari untuk menunjang laktasi, serta edukasi menghilangkan mitos pantang lauk amis (ikan/telur) adalah tatalaksana gizi laktasi yang sangat tepat."
        )
    },
    "busui_extreme": {
        "name": "Ny. Devi (Ibu Menyusui - 28 Tahun)",
        "complaint": "Menyusui bayi usia 1 bulan. Payudara kanan terasa sangat nyeri melilit, bengkak mengeras, kulit memerah, badan demam menggigil, lesu, dan tidak bisa tidur.",
        "status_gizi": "Normal [IMT: 21.5 kg/m²]",
        "lab": "Tekanan Darah: 120/80 mmHg, Suhu Tubuh: 38.8 °C (Demam Tinggi), Leukosit Darah: 13.500/mm³ (Tinggi)",
        "physical_findings": "Payudara kanan membengkak mengeras (engorgement), kulit kemerahan hangat saat diraba, nyeri tekan ekstrem, puting lecet (fissure).",
        "dietary_recall": "Ibu takut menyusui bayi pada payudara kanan karena sangat sakit, sehingga ASI ditahan/tidak dikeluarkan. Makan porsi biasa namun kurang nafsu makan karena demam.",
        "correct_diagnosis": "Mastitis Akut (Infeksi Payudara) dan Bendungan ASI (Breast Engorgement) pada Ibu Menyusui",
        "correct_therapy": "Terapi klinis rujuk dokter untuk antibiotik, manajemen gizi/pangan tinggi protein dan antiinflamasi, edukasi pengeluaran ASI yang tersumbat (dengan kompres hangat sebelum memompa/menyusui, pijat laktasi lembut, pastikan payudara dikosongkan), tingkatkan asupan air dan vitamin C untuk pemulihan jaringan puting lecet.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Diagnosis **Mastitis Akut dan Bendungan ASI** sangat tepat berdasarkan demam tinggi, leukositosis, dan payudara kanan membengkak merah meradang.\n\n"
            "**Evaluasi Terapi:** Tepat sekali! Selain rujukan medis untuk antibiotik, pengosongan payudara secara berkala (kompres/pompa ASI) serta asupan tinggi vitamin C dan protein hewani untuk menyembuhkan infeksi jaringan adalah langkah terbaik."
        )
    }
}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "api_key_configured": api_key is not None,
        "mode": "Gemini-1.5-Flash" if api_key else "Local-Simulation-Mock"
    })

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field in request payload."}), 400
        
        journal_text = data['text'].strip()
        if not journal_text:
            return jsonify({"error": "Journal text cannot be empty."}), 400

        # Check if Gemini is configured, otherwise fallback to mock summary
        if model:
            system_prompt = (
                "Kamu adalah pakar gizi akademis dan peneliti jurnal ilmiah gizi. "
                "Tugasmu adalah meringkas teks artikel/jurnal ilmiah gizi yang diberikan di bawah ini secara profesional, terstruktur, dan ilmiah. "
                "Gunakan Bahasa Indonesia yang sangat baik.\n\n"
                "Format output harus dalam Markdown yang indah dan rapi dengan struktur berikut:\n"
                "1. **Ringkasan Eksekutif**: Tinjauan umum singkat tentang tujuan dan signifikansi riset (2-3 kalimat).\n"
                "2. **Poin-Poin Utama Temuan**: Buat daftar bullet untuk temuan ilmiah kunci, data spesifik, dan korelasi gizi.\n"
                "3. **Evaluasi Metodologi & Relevansi**: Berikan pendapat akademis singkat mengenai metode atau kegunaannya untuk praktik gizi.\n\n"
                "Jaga penjelasan tetap padat, faktual, bebas dari basa-basi umum, dan langsung ke substansi ilmiah."
            )
            
            try:
                reply_text, active_model = generate_with_fallback(
                    f"{system_prompt}\n\nJURNAL ILMIAH:\n{journal_text}"
                )
                return jsonify({"summary": reply_text})
            except Exception as e:
                # Jika kuota habis pada semua model, gunakan fallback pintar
                if any(w in str(e).lower() for w in ["quota", "exhausted", "429"]):
                    print("[MOCK FALLBACK] Kuota habis, beralih ke simulasi ringkasan jurnal.")
                else:
                    raise e
        else:
            # Smart Simulated/Mock summary fallback based on text matching
            text_lower = journal_text.lower()
            if "stunting" in text_lower or "pendek" in text_lower:
                summary = (
                    "**Ringkasan Eksekutif (MODE SIMULASI):**<br>"
                    "Artikel ini menganalisis prevalensi dan faktor risiko stunting kronis pada anak dan remaja di Indonesia. Penelitian menyoroti pentingnya asupan protein berkualitas tinggi untuk menstimulasi hormon pertumbuhan selama masa emas dan remaja.<br><br>"
                    "**Poin-Poin Utama Temuan:**<br>"
                    "• Korelasi erat antara defisiensi asam amino esensial hewani (seperti dari susu dan telur) dengan penurunan kecepatan pertumbuhan linier anak.<br>"
                    "• Remaja dengan Z-score TB/U di bawah -2 SD menunjukkan penurunan ketahanan fisik yang signifikan akibat penurunan massa otot (*muscle wasting*).<br>"
                    "• Intervensi diet Tinggi Energi Tinggi Protein (TETP) memperlihatkan peningkatan pertumbuhan linier sebesar 15% jika diterapkan sebelum lempeng epifisis tulang menutup.<br><br>"
                    "**Evaluasi Metodologi & Relevansi:**<br>"
                    "Metodologi yang digunakan berbasis kohort retrospektif. Hasil ini sangat relevan untuk menyusun panduan intervensi gizi nasional pada remaja guna mengatasi stunting susulan."
                )
            elif "anemia" in text_lower or "hemoglobin" in text_lower or "besi" in text_lower:
                summary = (
                    "**Ringkasan Eksekutif (MODE SIMULASI):**<br>"
                    "Riset ini membahas dampak anemia defisiensi besi terhadap konsentrasi belajar dan stamina fisik remaja perempuan. Fokus utama adalah efektivitas tablet tambah darah yang dikombinasikan dengan modulator absorpsi.<br><br>"
                    "**Poin-Poin Utama Temuan:**<br>"
                    "• Kadar hemoglobin di bawah 11.5 g/dL berkorelasi langsung dengan penurunan memori jangka pendek dan peningkatan indeks kelelahan fisik sebesar 40%.<br>"
                    "• Minum teh setelah makan menurunkan penyerapan zat besi non-heme sebanyak 60-70% karena ikatan kompleks tanin-besi.<br>"
                    "• Vitamin C (asam askorbat) bertindak sebagai agen pereduksi kuat yang meningkatkan keterlarutan dan penyerapan zat besi di usus halus hingga 3 kali lipat.<br><br>"
                    "**Evaluasi Metodologi & Relevansi:**<br>"
                    "Desain acak terkontrol (RCT) yang digunakan membuktikan dengan kuat bahwa intervensi diet besi harus menyertakan modifikasi perilaku konsumsi kafein/teh di sekolah."
                )
            else:
                summary = (
                    "**Ringkasan Eksekutif (MODE SIMULASI):**<br>"
                    "Teks jurnal yang Anda berikan telah dianalisis. Dokumen ini membahas pentingnya intervensi gizi berbasis bukti ilmiah (*evidence-based nutrition*) serta implikasi klinis dari asupan gizi makro dan mikro yang tidak seimbang.<br><br>"
                    "**Poin-Poin Utama Temuan:**<br>"
                    "• Korelasi signifikan antara pola makan tinggi karbohidrat olahan/gula sederhana dengan risiko prediabetes serta penurunan kesehatan metabolisme remaja.<br>"
                    "• Pembatasan kalori ekstrim tanpa bimbingan klinis memicu defisiensi mikronutrien kompleks (seperti B-kompleks) yang berdampak pada kesehatan membran mukosa mulut.<br>"
                    "• Edukasi nutrisi yang terencana memberikan kontribusi positif sebesar 75% dalam mengubah perilaku diet remaja secara berkelanjutan.<br><br>"
                    "**Evaluasi Metodologi & Relevansi:**<br>"
                    "Tinjauan komprehensif ini memberikan pondasi teori yang kuat untuk merancang sistem pendukung keputusan (DSS) klinis gizi yang terintegrasi di sekolah menengah."
                )
            return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/api/validate_diagnosis', methods=['POST'])
def validate_diagnosis():
    try:
        data = request.get_json()
        if not data or 'caseId' not in data or 'diagnosis_text' not in data:
            return jsonify({"error": "Missing 'caseId' or 'diagnosis_text' in payload."}), 400
        
        case_id = data['caseId']
        user_input = data['diagnosis_text'].strip()
        history = data.get('history', [])
        
        if case_id not in CASES:
            return jsonify({"error": f"Case ID '{case_id}' not found."}), 404
        
        case_data = CASES[case_id]
        
        # Smart keyword matching inside server backend as a base metric/fallback
        lower_input = user_input.lower()
        
        is_diag_correct = False
        is_therapy_correct = False
        
        if case_id == "balita_easy":
            is_diag_correct = "marasmus" in lower_input or "gizi buruk" in lower_input or "wasting" in lower_input
            is_therapy_correct = "f-75" in lower_input or "f75" in lower_input or "stabilisasi" in lower_input or "rutf" in lower_input
        elif case_id == "balita_medium":
            is_diag_correct = "vitamin a" in lower_input or "vit a" in lower_input or "xerophthalmia" in lower_input or "bitot" in lower_input
            is_therapy_correct = "kapsul" in lower_input or "dosis tinggi" in lower_input or "minyak" in lower_input or "lemak" in lower_input or "absorpsi" in lower_input or "absorb" in lower_input
        elif case_id == "balita_hard":
            is_diag_correct = "rakitis" in lower_input or "rickets" in lower_input or "tulang" in lower_input or "kaki o" in lower_input or "genu varum" in lower_input
            is_therapy_correct = "vitamin d" in lower_input or "vit d" in lower_input or "kalsium" in lower_input or "berjemur" in lower_input or "sinar matahari" in lower_input
        elif case_id == "balita_extreme":
            is_diag_correct = "kwashiorkor" in lower_input or "gizi buruk" in lower_input or "edema" in lower_input or "bengkak" in lower_input
            is_therapy_correct = "f-75" in lower_input or "f75" in lower_input or "protein hewani" in lower_input or "stabilisasi" in lower_input
        elif case_id in ("remaja_easy", "ap"):
            is_diag_correct = "anemia" in lower_input or "zat besi" in lower_input or "hb" in lower_input
            is_therapy_correct = "suplemen" in lower_input or "tambah darah" in lower_input or "vitamin c" in lower_input or "vit c" in lower_input or "teh" in lower_input
        elif case_id in ("remaja_medium", "mr"):
            is_diag_correct = "obesitas" in lower_input or "prediabetes" in lower_input or "insulin" in lower_input or "kegemukan" in lower_input or "acanthosis" in lower_input
            is_therapy_correct = "gula" in lower_input or "manis" in lower_input or "olahraga" in lower_input or "aktivitas" in lower_input or "serat" in lower_input
        elif case_id in ("remaja_hard", "na"):
            is_diag_correct = "b kompleks" in lower_input or "vitamin b" in lower_input or "cheilitis" in lower_input or "bibir pecah" in lower_input or "glossitis" in lower_input
            is_therapy_correct = "protein" in lower_input or "hewani" in lower_input or "susu" in lower_input or "telur" in lower_input or "diet seimbang" in lower_input
        elif case_id in ("remaja_extreme", "rs"):
            is_diag_correct = "stunting" in lower_input or "pendek" in lower_input or "stunted" in lower_input or "tumbuh" in lower_input
            is_therapy_correct = "energi" in lower_input or "protein" in lower_input or "tinggi" in lower_input or "telur" in lower_input or "susu" in lower_input or "ikan" in lower_input
        elif case_id == "dewasa_easy":
            is_diag_correct = "hiperkolesterol" in lower_input or "dislipidemia" in lower_input or "kolesterol" in lower_input or "lemak darah" in lower_input
            is_therapy_correct = "lemak jenuh" in lower_input or "santan" in lower_input or "gorengan" in lower_input or "serat larut" in lower_input or "oat" in lower_input or "kardio" in lower_input or "olahraga" in lower_input
        elif case_id == "dewasa_medium":
            is_diag_correct = "diabetes" in lower_input or "dm" in lower_input or "kencing manis" in lower_input
            is_therapy_correct = "3j" in lower_input or "indeks glikemik" in lower_input or "batasi gula" in lower_input or "nasi merah" in lower_input or "serat" in lower_input
        elif case_id == "dewasa_hard":
            is_diag_correct = "asam urat" in lower_input or "gout" in lower_input or "hiperurisemia" in lower_input
            is_therapy_correct = "purin" in lower_input or "jeroan" in lower_input or "seafood" in lower_input or "emping" in lower_input or "minum air" in lower_input or "hidrasi" in lower_input
        elif case_id == "dewasa_extreme":
            is_diag_correct = "gagal ginjal" in lower_input or "ginjal kronis" in lower_input or "ckd" in lower_input or "esrd" in lower_input
            is_therapy_correct = "rendah protein" in lower_input or "kalium" in lower_input or "natrium" in lower_input or "garam" in lower_input or "cairan" in lower_input or "hemodialisis" in lower_input
        elif case_id == "lansia_easy":
            is_diag_correct = "osteoporosis" in lower_input or "tulang keropos" in lower_input or "kepadatan tulang" in lower_input
            is_therapy_correct = "kalsium" in lower_input or "vitamin d" in lower_input or "vit d" in lower_input or "teri" in lower_input or "berjemur" in lower_input or "jalan santai" in lower_input
        elif case_id == "lansia_medium":
            is_diag_correct = "hipertensi" in lower_input or "darah tinggi" in lower_input or "sarkopenik" in lower_input or "sarkopenia" in lower_input
            is_therapy_correct = "dash" in lower_input or "rendah garam" in lower_input or "natrium" in lower_input or "protein" in lower_input or "lunak" in lower_input or "tim" in lower_input
        elif case_id == "lansia_hard":
            is_diag_correct = "malnutrisi" in lower_input or "mep" in lower_input or "anemia senilis" in lower_input or "kurus" in lower_input or "senile" in lower_input
            is_therapy_correct = "tetp" in lower_input or "lunak" in lower_input or "saring" in lower_input or "porsi kecil" in lower_input or "zat besi" in lower_input or "suplemen" in lower_input
        elif case_id == "lansia_extreme":
            is_diag_correct = "demensia" in lower_input or "alzheimer" in lower_input or "disfagia" in lower_input or "menelan" in lower_input
            is_therapy_correct = "kental" in lower_input or "thickener" in lower_input or "saring" in lower_input or "ngt" in lower_input or "aspirasi" in lower_input
        elif case_id == "bumil_easy":
            is_diag_correct = "anemia" in lower_input or "zat besi" in lower_input or "kehamilan" in lower_input or "ibu hamil" in lower_input or "bumil" in lower_input
            is_therapy_correct = "suplemen" in lower_input or "tambah darah" in lower_input or "ttd" in lower_input or "vitamin c" in lower_input or "zat besi" in lower_input or "malam hari" in lower_input
        elif case_id == "bumil_medium":
            is_diag_correct = "diabetes gestasional" in lower_input or "dmg" in lower_input or "diabetes kehamilan" in lower_input
            is_therapy_correct = "batasi manis" in lower_input or "boba" in lower_input or "gula" in lower_input or "serat" in lower_input or "porsi utama" in lower_input or "selingan" in lower_input
        elif case_id == "busui_hard":
            is_diag_correct = "kek" in lower_input or "energi kronis" in lower_input or "lila" in lower_input or "menyusui" in lower_input
            is_therapy_correct = "tambahan kalori" in lower_input or "pmt" in lower_input or "mitos" in lower_input or "pantang" in lower_input or "cairan" in lower_input or "air putih" in lower_input or "ikan" in lower_input
        elif case_id == "busui_extreme":
            is_diag_correct = "mastitis" in lower_input or "bendungan asi" in lower_input or "payudara bengkak" in lower_input or "infeksi" in lower_input
            is_therapy_correct = "antibiotik" in lower_input or "rujuk" in lower_input or "kompres hangat" in lower_input or "pijat" in lower_input or "kosongkan" in lower_input or "pompa" in lower_input or "vitamin c" in lower_input

        # Calculate base score based on keyword success
        base_score = 0
        if is_diag_correct: base_score += 50
        if is_therapy_correct: base_score += 50
        
        is_mock_key = api_key == "ISI_API_KEY_KAMU_DISINI" or not api_key
        
        # If Gemini model is available, let the real AI generate a professional clinical supervisor review!
        if model and not is_mock_key:
            chat_history = []
            for h in history[:-1]:
                role = 'user' if h['role'] == 'user' else 'model'
                chat_history.append({
                    'role': role,
                    'parts': [h['text']]
                })
            
            system_prompt = (
                f"Kamu adalah AI Clinical Supervisor gizi yang mendampingi Nutri Student (mahasiswa gizi) dalam praktik konsultasi gizi untuk kasus 3D AR Patient berikut:\n\n"
                f"=== DATA MEDIS ACUAN (GROUND TRUTH) ===\n"
                f"Nama Pasien: {case_data['name']}\n"
                f"Keluhan Utama: {case_data['complaint']}\n"
                f"Status Gizi (Antropometri): {case_data['status_gizi']}\n"
                f"Pemeriksaan Laboratorium: {case_data['lab']}\n"
                f"Pemeriksaan Fisik Klinis: {case_data['physical_findings']}\n"
                f"Kebiasaan & Recall 24 Jam: {case_data['dietary_recall']}\n"
                f"Diagnosis Medis Gizi yang Benar: {case_data['correct_diagnosis']}\n"
                f"Terapi Gizi & Tatalaksana yang Benar: {case_data['correct_therapy']}\n\n"
                f"=== INSTRUKSI EVALUASI & DIALOG ===\n"
                f"1. Bertindaklah sebagai pembimbing klinis/dosen pembimbing gizi yang ramah, berwibawa, profesional, dan mendidik.\n"
                f"2. Panggil pengguna dengan sebutan 'Nutri Student'.\n"
                f"3. Jika pengguna bertanya tentang data pasien atau meminta petunjuk, berikan bimbingan secara akademis dan bertahap berdasarkan data medis acuan di atas tanpa langsung membocorkan jawaban lengkap.\n"
                f"4. Pengguna diminta mencari dan menjawab 3 hal utama:\n"
                f"   a. Menganalisis nilai IMT pasien.\n"
                f"   b. Menentukan diagnosis gizi berdasarkan antropometri & hasil klinis.\n"
                f"   c. Menyusun rekomendasi terapi gizi/pangan yang tepat.\n"
                f"5. Jika pengguna memberikan jawaban analisis (meliputi diagnosis gizi DAN terapi pangan yang benar sesuai data acuan), kamu harus memuji mereka dan mengakhiri jawabanmu dengan menuliskan tag kelulusan secara presisi: '**[BERHASIL MENDIAGNOSIS]**'. Tag ini sangat penting untuk dibaca sistem agar meluluskan level pengguna!\n"
                f"6. Gunakan Bahasa Indonesia yang baik dan format Markdown yang rapi."
            )
            
            try:
                ai_reply, active_model = generate_with_fallback(
                    prompt=user_input,
                    system_instruction=system_prompt,
                    history=chat_history
                )
                
                passed = "[BERHASIL MENDIAGNOSIS]" in ai_reply or base_score >= 100
                
                # If keywords matched perfectly but AI forgot the tag, ensure we append it or set success to true
                if base_score >= 100 and not passed:
                    ai_reply += "\n\n**[BERHASIL MENDIAGNOSIS]**"
                    passed = True
                
                return jsonify({
                    "success": passed,
                    "score": 100 if passed else base_score,
                    "reply": ai_reply,
                    "diagnosis_correct": is_diag_correct,
                    "therapy_correct": is_therapy_correct
                })
            except Exception as e:
                if any(w in str(e).lower() for w in ["quota", "exhausted", "429"]):
                    # Fallback ke evaluasi simulasi jika kuota API habis
                    passed = base_score >= 100
                    reply_text = f"**[PERINGATAN: Kuota Google AI Studio Habis - Mode Simulasi Supervisor Aktif]**\n\n{case_data['mock_critique']}"
                    if not passed:
                        reply_text += "\n\n*Petunjuk: Pastikan diagnosis Anda mengandung unsur diagnosis utama dan tatalaksana spesifik untuk kasus ini!*"
                    return jsonify({
                        "success": passed,
                        "score": base_score,
                        "reply": reply_text,
                        "diagnosis_correct": is_diag_correct,
                        "therapy_correct": is_therapy_correct
                    })
                raise e
        else:
            # Backend Fallback (Simulation)
            passed = base_score >= 100
            reply_text = f"**[MODE SIMULASI BACKEND]**\n\n{case_data['mock_critique']}"
            if not passed:
                reply_text += "\n\n*Petunjuk: Pastikan diagnosis Anda mengandung unsur diagnosis utama dan tatalaksana spesifik untuk kasus ini agar dievaluasi sukses!*"
            return jsonify({
                "success": passed,
                "score": base_score,
                "reply": reply_text,
                "diagnosis_correct": is_diag_correct,
                "therapy_correct": is_therapy_correct
            })

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Missing 'message' in request payload."}), 400
        
        user_message = data['message'].strip()
        history = data.get('history', [])
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty."}), 400

        # Jika API Key terpasang (tidak menggunakan placeholder default)
        is_mock_key = api_key == "ISI_API_KEY_KAMU_DISINI" or not api_key
        
        if model and not is_mock_key:
            # Format history untuk SDK Gemini (harus memiliki role 'user' atau 'model')
            chat_history = []
            for h in history:
                role = 'user' if h['role'] == 'user' else 'model'
                chat_history.append({
                    'role': role,
                    'parts': [h['text']]
                })
            
            system_instruction = (
                "Kamu adalah NutriBot, asisten AI interaktif dan pakar gizi ramah dari NutriVerse.\n"
                "Tugasmu adalah membantu siswa, mahasiswa, dan masyarakat umum dalam belajar gizi, memahami asesmen antropometri (BB/U, TB/U, IMT/U, LILA), "
                "memahami gejala klinis defisiensi gizi (seperti anemia, angular cheilitis, obesitas, stunting), dan merancang diet sehat.\n"
                "Berikan jawaban yang ramah, ringkas, mudah dipahami, akurat secara medis, dan mendidik.\n"
                "Gunakan Bahasa Indonesia yang interaktif dan gunakan emoji gizi yang relevan (seperti 🍎, 🥦, 🥗, 🥛, 🥚, 🩺).\n"
                "Selalu berikan saran diet berbasis bahan pangan lokal Indonesia."
            )
            
            try:
                reply_text, active_model = generate_with_fallback(
                    prompt=user_message,
                    system_instruction=system_instruction,
                    history=chat_history
                )
                return jsonify({
                    "reply": reply_text,
                    "history": history + [
                        {"role": "user", "text": user_message},
                        {"role": "model", "text": reply_text}
                    ]
                })
            except Exception as e:
                # Jika terjadi error kuota habis (429) pada seluruh model, berikan pesan edukasi
                if any(w in str(e).lower() for w in ["quota", "exhausted", "429"]):
                    reply = (
                        "Aduh, sepertinya **kuota gratis harian Google AI Studio Anda hari ini sudah habis** (batas gratis adalah 20 kali tanya jawab). 📈\n\n"
                        "Jangan khawatir! Anda bisa mencoba kembali besok pagi saat kuota Anda disetel ulang oleh Google, atau Anda bisa menghubungkan penagihan berbayar di Google AI Studio.\n\n"
                        "Sementara itu, jika ada hal lain tentang materi gizi sekolah yang ingin Anda diskusikan, silakan tanyakan saja! Saya akan menjawab dalam *Mode Simulasi* pintar. 😊"
                    )
                    return jsonify({
                        "reply": reply,
                        "history": history + [
                            {"role": "user", "text": user_message},
                            {"role": "model", "text": reply}
                        ]
                    })
                raise e
        else:
            # Smart simulated/mock fallback jika berjalan tanpa API Key
            msg_lower = user_message.lower()
            reply = ""
            
            if any(w in msg_lower for w in ["halo", "hai", "pagi", "siang", "sore", "malam", "assalamualaikum"]):
                reply = "Halo! Saya **NutriBot**, asisten gizi pintar Anda di NutriVerse. 🍎🥦 Ada yang bisa saya bantu hari ini tentang pola makan sehat, berat badan, atau keluhan kesehatan?"
            elif any(w in msg_lower for w in ["stunting", "pendek", "tinggi"]):
                reply = "**Stunting** adalah masalah gizi kronis akibat kurangnya asupan gizi dalam jangka waktu lama (sejak janin hingga usia 2 tahun). Pada remaja stunted (seperti kasus RS di NutriSolve, TB/U < -2 SD), penanganan utamanya adalah menerapkan diet **Tinggi Energi Tinggi Protein (TETP)**. Prioritaskan protein hewani berkualitas tinggi seperti **telur** 🥚, **susu** 🥛, dan **ikan** 🐟 untuk mengejar tumbuh (*catch-up growth*) sebelum lempeng epifisis tulang menutup."
            elif any(w in msg_lower for w in ["anemia", "pusing", "darah", "lemas", "hb"]):
                reply = "**Anemia Defisiensi Besi** sering terjadi pada remaja putri (seperti AP dan DS). Gejalanya meliputi sering pusing, pucat, dan cepat lelah. \n\nTatalaksana yang tepat:\n1. Suplementasi **Tablet Tambah Darah** (zat besi & asam folat) 💊.\n2. Tingkatkan konsumsi **besi heme** (hati ayam 🥩, telur 🥚, daging).\n3. Kombinasikan dengan **Vitamin C** (jeruk 🍊, pepaya) agar zat besi diserap 3x lipat lebih baik.\n4. 🚫 **HINDARI minum teh atau kopi** setelah makan karena kandungan tanin dapat mengikat zat besi sehingga gagal diserap tubuh."
            elif any(w in msg_lower for w in ["obesitas", "gemuk", "insulin", "gula", "manis", "leher hitam"]):
                reply = "**Obesitas** (seperti kasus MR) memicu risiko prediabetes dan resistensi insulin. Tanda klinis khasnya adalah *Acanthosis Nigricans* (leher belakang menghitam dan menebal seperti beludru).\n\nLangkah tatalaksana gizi:\n- Batasi asupan gula sederhana (minuman manis, boba, soda) 🚫🥤.\n- Perbanyak konsumsi serat larut dari sayur hijau 🥦 dan buah segar 🍎.\n- Tingkatkan aktivitas fisik aerobik minimal 150 menit per minggu (jalan cepat, jogging, bersepeda) untuk mengembalikan sensitivitas insulin."
            elif any(w in msg_lower for w in ["angular", "cheilitis", "sariawan", "bibir pecah", "vitamin b"]):
                reply = "Luka robek di sudut bibir (**Angular Cheilitis**) dan lidah meradang (**Glossitis**) seperti kasus NA adalah tanda klinis klasik dari **Defisiensi Vitamin B Kompleks** (terutama B2/Riboflavin dan B12). Ini sering dipicu oleh diet ketat ekstrim yang tidak seimbang.\n\nSumber makanan kaya Vitamin B Kompleks:\n- Protein hewani (daging, ayam, ikan) 🐟🍗\n- Telur dan produk susu 🥚🥛\n- Sayuran berdaun hijau 🥬\n- Hindari diet ekstrem tanpa bimbingan klinis!"
            elif any(w in msg_lower for w in ["nutrisolve", "dss", "fitur"]):
                reply = "Di **NutriSolve**, Anda bisa mengakses empat simulasi pendukung keputusan (DSS) gizi:\n1. **Anthropometry**: Menghitung Z-Score BB/U, TB/U, dan IMT/U untuk balita/remaja, serta estimasi berat/tinggi badan pasien klinis.\n2. **Clinical**: Simulasi scan klinis tanda-tanda malnutrisi gizi.\n3. **Dietary**: Formulari asupan makanan harian dan recall 24 jam.\n4. **AR Patient**: Visualisasi 3D biometrik pasien terintegrasi AI.\n\nSemua fitur tersebut dirancang sangat interaktif untuk melatih pemahaman klinis Anda! 💻"
            elif any(w in msg_lower for w in ["terima kasih", "makasih", "thanks", "suwun", "nuhun"]):
                reply = "Sama-sama! Sangat menyenangkan bisa berdiskusi dengan Anda. Jaga kesehatan dan konsumsi makanan bergizi seimbang ya! 🍎🥗🥛 Jika ada pertanyaan lain, silakan tanyakan saja!"
            else:
                reply = "Pertanyaan Anda sangat menarik! Sebagai **NutriBot**, saya menyarankan Anda untuk selalu menerapkan prinsip **Gizi Seimbang** sesuai dengan panduan *Isi Piringku* (karbohidrat, protein 🍗, sayuran 🥦, dan buah 🍎 dalam porsi seimbang).\n\n*(Catatan: Saat ini NutriBot berjalan dalam **Mode Simulasi** karena Kunci API Gemini asli belum diaktifkan di file `.env`. Anda dapat memasukkan kunci API di file `.env` proyek Anda untuk mengaktifkan kecerdasan AI penuh!)*"
            
            return jsonify({
                "reply": reply,
                "history": history + [
                    {"role": "user", "text": user_message},
                    {"role": "model", "text": reply}
                ]
            })
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    # Run on port 5000 as specified in the guide
    app.run(debug=True, port=5000)
