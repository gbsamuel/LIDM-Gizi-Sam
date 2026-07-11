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
        "name": "An. KA (Balita - Easy)",
        "complaint": "Anak saya susah makan sekali, maunya cuma biskuit dan susu. Badannya jadi kecil dibanding sepupunya.",
        "status_gizi": "Risiko Underweight [bb: 11 kg, tb: 92 cm, imt: 13.0 kg/m²]",
        "lab": "Normal",
        "physical_findings": "Tampak kurus, tidak ada edema, nafsu makan rendah, mudah terdistraksi, durasi makan >1 jam.",
        "dietary_recall": "Sarapan: Susu cokelat (1 gelas) & biskuit manis (2 keping); Makan siang: Nasi 3 sendok (menolak lauk hewani/nabati); Makan malam: Nasi 2 sendok + kuah sup + teh manis. Kebiasaan: Sering makan sambil menonton HP, tidak suka sayur, jarang protein hewani.",
        "correct_diagnosis": "Risiko Underweight dan Picky Eating (Gizi Kurang)",
        "correct_therapy": "Edukasi responsive feeding, buat jadwal makan teratur, batasi camilan/snack dan susu di luar jam makan, hindari makan sambil menonton HP (distraction), tingkatkan variasi makanan dan berikan protein hewani.",
        "keywords": {
            "diagnosis": ["picky", "underweight", "asupan", "gizi kurang", "kurus"],
            "intervention": ["jadwal", "batasi", "snack", "responsive", "hewan", "screen", "variasi", "hp"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Picky Eater dengan Risiko Underweight** pada An. KA.\n\n"
            "**Evaluasi Terapi:** Bagus sekali! Rekomendasi responsive feeding, pembatasan screen time saat makan, pembatasan snack di luar jam makan, serta peningkatan variasi protein hewani adalah tatalaksana yang tepat."
        )
    },
    "balita_medium": {
        "name": "An. RF (Balita - Medium)",
        "complaint": "Anak saya terlihat jauh lebih pendek dibandingkan teman-teman seusianya.",
        "status_gizi": "Stunting (TB/U Sangat Rendah) [bb: 15 kg, tb: 99 cm, imt: 15.3 kg/m²]",
        "lab": "Hemoglobin: 11.2 g/dL",
        "physical_findings": "Tidak aktif, massa otot kecil, riwayat sering sakit batuk pilek, rambut kering dan kusam.",
        "dietary_recall": "Sarapan: Teh manis hangat (1 gelas) & biskuit manis (2 keping); Makan siang: Nasi putih + kuah sup tanpa lauk; Makan malam: Nasi putih + kecap + tahu goreng kecil. Kebiasaan: Riwayat pemberian MPASI terlambat, jarang konsumsi protein hewani.",
        "correct_diagnosis": "Stunting (TB/U Sangat Rendah) akibat asupan gizi kronis tidak adekuat",
        "correct_therapy": "Peningkatan asupan makanan padat gizi (densitas zat gizi tinggi), prioritaskan protein hewani (telur, ayam, daging, ikan) dalam MPASI/makanan utama, monitoring tumbuh kembang secara berkala.",
        "keywords": {
            "diagnosis": ["stunting", "tb/u", "pendek", "stunt"],
            "intervention": ["protein", "mpasi", "practice", "monitoring", "densitas", "hewan"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Stunting (TB/U Sangat Rendah)** pada An. RF.\n\n"
            "**Evaluasi Terapi:** Hebat! Rekomendasi makanan padat gizi yang kaya protein hewani (seperti telur dan daging) untuk mendukung kejar tumbuh kembang anak stunting adalah tatalaksana gizi terbaik."
        )
    },
    "balita_hard": {
        "name": "An. CL (Balita - Hard)",
        "complaint": "Anak kami susah berhenti makan snack dan sekarang cepat ngos-ngosan saat bermain.",
        "status_gizi": "Obesitas (Z-score IMT/U > +3 SD) [bb: 27 kg, tb: 108 cm, imt: 23.1 kg/m²]",
        "lab": "GDP: 90 mg/dL",
        "physical_findings": "Lipatan lemak leher dan ketiak terlihat jelas, perut cembung penuh lemak, mudah lelah.",
        "dietary_recall": "Sarapan: Sereal manis dengan susu full cream; Makan siang: Nasi porsi besar (1.5 piring) + ayam goreng tepung + kentang goreng; Makan malam: Fast food burger + es krim + teh manis. Kebiasaan: Screen time >5 jam per hari, sangat jarang aktivitas fisik.",
        "correct_diagnosis": "Obesitas Balita akibat asupan kalori berlebih (excess calorie) dan gaya hidup kurang aktif (sedentary)",
        "correct_therapy": "Batasi konsumsi makanan manis/camilan ultra-proses, kurangi screen time, tingkatkan aktivitas fisik terstruktur/bermain aktif bersama keluarga, edukasi diet gizi seimbang.",
        "keywords": {
            "diagnosis": ["obes", "overweight", "gemuk", "gizi lebih", "imt/u"],
            "intervention": ["family", "sweetened", "manis", "aktivitas", "olahraga", "diet", "screen", "hp", "lingkungan"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Obesitas Balita** pada An. CL.\n\n"
            "**Evaluasi Terapi:** Sempurna! Pengurangan makanan ultra-proses, pembatasan screen time, peningkatan aktivitas fisik keluarga, serta penyeimbangan gizi makro adalah solusi tatalaksana obesitas anak terbaik."
        )
    },
    "remaja_easy": {
        "name": "Siswa AP (Remaja - Easy)",
        "complaint": "Saya sering pusing dan cepat capek kalau di sekolah. Naik tangga gampang lelah, susah konsentrasi.",
        "status_gizi": "Kurus / Risiko Gizi Kurang [bb: 43 kg, tb: 160 cm, imt: 16.8 kg/m²]",
        "lab": "Hemoglobin: 10.2 g/dL",
        "physical_findings": "Konjungtiva sangat pucat, kuku agak pucat, rambut kering kusam.",
        "dietary_recall": "Sarapan: Teh manis + roti mentega; Makan siang: Nasi + ayam goreng + kol; Makan malam: Nasi + telur ceplok + teh manis. Kebiasaan: Jarang makan buah/sayur kaya zat besi, minum teh setelah makan.",
        "correct_diagnosis": "Anemia Defisiensi Besi dan Status Gizi Kurang",
        "correct_therapy": "Pemberian tablet tambah darah, konsumsi makanan kaya zat besi (hati, daging, telur, sayuran hijau), konsumsi Vitamin C (jeruk) untuk penyerapan, hindari minum teh/kopi langsung setelah makan.",
        "keywords": {
            "diagnosis": ["anemi", "defisiensi besi", "gizi kurang", "hb"],
            "intervention": ["besi", "daging", "telur", "hati", "hijau", "vitamin c", "jeruk", "hindari teh", "teh setelah makan"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Anemia Defisiensi Besi** dan status **Gizi Kurang** pada Siswa AP.\n\n"
            "**Evaluasi Terapi:** Luar biasa! Edukasi menghindari konsumsi teh sesaat setelah makan (agar zat besi tidak terikat) serta peningkatan besi heme dan suplemen TTD sangatlah akurat."
        )
    },
    "remaja_medium": {
        "name": "Siswa MR (Remaja - Medium)",
        "complaint": "Sering lapar terus habis makan, sering ngantuk dan haus. Sering beli minuman manis dan fast food.",
        "status_gizi": "Obesitas [bb: 88 kg, tb: 168 cm, imt: 31.2 kg/m²]",
        "lab": "Glukosa Darah Puasa (GDP): 118 mg/dL",
        "physical_findings": "Acanthosis nigricans di lipatan leher belakang, lingkar perut berlebih (obesitas sentral).",
        "dietary_recall": "Sarapan: Es teh manis kemasan; Makan siang: Ayam geprek besar + nasi + es teh manis; Makan malam: Mie instan (2 bungkus) + telur dadar + soda. Kebiasaan: Sering minum manis (boba, soda, es teh) 3-4x sehari.",
        "correct_diagnosis": "Obesitas Sentral dengan Risiko Resistensi Insulin dan Prediabetes",
        "correct_therapy": "Batasi gula sederhana (minuman manis, boba, soda), tingkatkan serat dari sayur & buah, tingkatkan aktivitas fisik aerobik minimal 150 menit per minggu.",
        "keywords": {
            "diagnosis": ["obes", "resistensi insulin", "prediabet", "gdp", "acanthosis"],
            "intervention": ["manis", "boba", "buah", "olahraga", "serat", "seimbang", "aktivitas", "150"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mendiagnosis **Obesitas Sentral** dengan **Resistensi Insulin / Prediabetes** pada Siswa MR secara tepat.\n\n"
            "**Evaluasi Terapi:** Bagus sekali! Pembatasan gula sederhana (boba/soda) dan peningkatan serat pangan serta aktivitas fisik 150 menit per minggu adalah kunci memulihkan sensitivitas insulin."
        )
    },
    "remaja_hard": {
        "name": "Siswa NA (Remaja - Hard)",
        "complaint": "Mulut sering perih, sudut bibir pecah-pecah, malas makan.",
        "status_gizi": "Kurus / Gizi Kurang [bb: 40 kg, tb: 157 cm, imt: 16.2 kg/m²]",
        "lab": "Hemoglobin: 11.8 g/dL",
        "physical_findings": "Angular cheilitis di kedua sudut bibir, lidah agak merah meradang (glossitis), kulit sangat kering.",
        "dietary_recall": "Sarapan: Oatmeal instan polos (3 sendok); Makan siang: Salad selada & timun + tahu rebus; Makan malam: Apel. Kebiasaan: Diet ketat mandiri dengan membatasi makanan hewani sepenuhnya.",
        "correct_diagnosis": "Defisiensi Vitamin B Kompleks (Riboflavin/B2 & B12) akibat diet ekstrim / gizi kurang",
        "correct_therapy": "Hentikan diet ekstrim, edukasi diet gizi seimbang, tingkatkan konsumsi protein hewani (daging, susu, telur, ikan) dan sayuran berdaun hijau.",
        "keywords": {
            "diagnosis": ["defisiensi vitamin b", "vitamin b kompleks", "gizi mikro", "cheilitis", "diet ketat", "gizi kurang"],
            "intervention": ["seimbang", "hewan", "hijau", "susu", "daging", "telur", "vitamin b", "b kompleks"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi **Defisiensi Vitamin B Kompleks** (Angular Cheilitis) akibat diet ekstrim pada Siswa NA.\n\n"
            "**Evaluasi Terapi:** Hebat! Rekomendasi untuk menghentikan diet pembatasan kalori ekstrim serta meningkatkan konsumsi protein hewani dan sayuran hijau sangatlah tepat."
        )
    },
    "dewasa_easy": {
        "name": "Tn. AR (Dewasa - Easy)",
        "complaint": "Berat badan terus naik, cepat capek kalau naik tangga.",
        "status_gizi": "Obesitas Tingkat I [bb: 92 kg, tb: 168 cm, imt: 32.6 kg/m²]",
        "lab": "Kolesterol Total: 220 mg/dL",
        "physical_findings": "Abdomen membuncit (obesitas), pola kerja sedenter.",
        "dietary_recall": "Sarapan: Nasi uduk + telur dadar + bihun goreng + teh manis; Makan siang: Nasi piring penuh + rendang + sayur nangka bersantan; Makan malam: Nasi goreng + ayam goreng 2 potong + teh manis. Kebiasaan: Gorengan 3-4 biji, kopi susu manis, sering makan di luar.",
        "correct_diagnosis": "Obesitas Tingkat I dan Hiperkolesterolemia",
        "correct_therapy": "Terapkan diet defisit kalori seimbang, batasi makanan tinggi lemak jenuh (santan, gorengan), batasi minuman manis, perbanyak serat dari sayur & buah, olahraga kardio minimal 150 menit/minggu.",
        "keywords": {
            "diagnosis": ["obes", "imt 32", "gizi lebih", "sedenter"],
            "intervention": ["defisit", "sayur buah", "batasi manis", "lemak", "mindful", "olahraga", "aktivitas", "150"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mendiagnosis **Obesitas Tingkat I dan Hiperkolesterolemia** pada Tn. AR.\n\n"
            "**Evaluasi Terapi:** Tepat sekali! Restriksi kalori (defisit energi), pembatasan lemak jenuh (santan dan gorengan), and peningkatan serat pangan larut adalah pilar diet utama dislipidemia."
        )
    },
    "dewasa_medium": {
        "name": "Ny. DS (Dewasa - Medium)",
        "complaint": "Sering haus, bolak-balik kamar mandi, berat badan turun tanpa disengaja.",
        "status_gizi": "Overweight / Obesitas Ringan [bb: 74 kg, tb: 158 cm, imt: 29.6 kg/m², lingkar perut 94 cm]",
        "lab": "Glukosa Darah Puasa (GDP): 148 mg/dL",
        "physical_findings": "Mukosa mulut agak kering, pandangan kabur, gejala poliuria, polidipsia, polifagia.",
        "dietary_recall": "Sarapan: Nasi uduk + telur dadar + bakwan + teh manis; Makan siang: Ayam geprek + nasi + tempe; Makan malam: Nasi + sup bakso + teh manis. Kebiasaan: Menyukai makanan/minuman manis (donat, bolu, teh manis).",
        "correct_diagnosis": "Diabetes Melitus Tipe 2 dan Obesitas Ringan",
        "correct_therapy": "Diet DM dengan prinsip 3J, batasi asupan karbohidrat sederhana/gula jenuh, ganti dengan karbohidrat kompleks berserat tinggi (nasi merah/oat), tingkatkan konsumsi serat sayur dan buah, olahraga rutin.",
        "keywords": {
            "diagnosis": ["diabet", "dm", "hiperglikemi", "gdp"],
            "intervention": ["karbo", "manis", "gula", "serat", "buah", "olahraga", "glukosa", "monitoring"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Diabetes Melitus Tipe 2** pada Ny. DS.\n\n"
            "**Evaluasi Terapi:** Sempurna! Penerapan prinsip diet 3J (Jumlah, Jadwal, Jenis) serta pembatasan ketat karbohidrat sederhana (gula/teh manis) adalah standar manajemen terapi gizi medis DM."
        )
    },
    "dewasa_hard": {
        "name": "Tn. HP (Dewasa - Hard)",
        "complaint": "Sering pusing di belakang kepala, tengkuk sering pegal.",
        "status_gizi": "Overweight / Obesitas Ringan [bb: 82 kg, tb: 167 cm, imt: 29.4 kg/m²]",
        "lab": "Normal",
        "physical_findings": "Tekanan Darah: 156/96 mmHg (Hipertensi Grade 2).",
        "dietary_recall": "Sarapan: Nasi pecel + telur asin + rempeyek teri; Makan siang: Nasi + ikan asin + tahu tempe + es teh manis; Makan malam: Nasi + sup bakso kemasan + kerupuk asin. Kebiasaan: Menambahkan garam tambahan ke makanan, suka camilan asin.",
        "correct_diagnosis": "Hipertensi Grade 2 dan Overweight",
        "correct_therapy": "Diet DASH rendah natrium/sodium, batasi konsumsi garam (ikan asin, telur asin, kerupuk, makanan instan), tingkatkan asupan kalium dari sayur & buah, olahraga rutin.",
        "keywords": {
            "diagnosis": ["hiperten", "darah tinggi", "tensi"],
            "intervention": ["natrium", "garam", "asin", "kalium", "sayur", "buah", "serat", "label", "olahraga"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Hipertensi Grade 2** pada Tn. HP.\n\n"
            "**Evaluasi Terapi:** Bagus sekali! Pembatasan asupan natrium tinggi (dari telur asin, ikan asin, kerupuk) dan penerapan pola makan DASH kaya kalium adalah pilihan terapi yang sangat tepat."
        )
    },
    "lansia_easy": {
        "name": "Ny. SM (Lansia - Easy)",
        "complaint": "Kurang nafsu makan, porsi makan sedikit, baju terasa longgar.",
        "status_gizi": "Status gizi normal dengan penurunan berat badan drastis [bb: 48 kg, tb: 154 cm, imt: 20.2 kg/m²]",
        "lab": "Hemoglobin: 11.5 g/dL, Albumin: 3.2 g/dL",
        "physical_findings": "Gigi palsu longgar, mukosa agak kering, turgor agak lambat, temporal wasting.",
        "dietary_recall": "Sarapan: Teh manis + biskuit; Makan siang: Nasi lembek + kuah sup + tahu rebus; Makan malam: Bubur beras instan (1/2 porsi). Kebiasaan: Tinggal sendiri, tidak ada motivasi memasak.",
        "correct_diagnosis": "Risiko Malnutrisi (Asupan Energi & Protein Tidak Adekuat) dan Kehilangan Massa Otot (Sarkopenia) pada Lansia",
        "correct_therapy": "Tingkatkan frekuensi makan dengan porsi kecil tapi sering, modifikasi tekstur makanan lunak agar mudah dikunyah karena gigi palsu longgar, konsumsi makanan dengan kepadatan energi & protein tinggi, monitoring berat badan berkala.",
        "keywords": {
            "diagnosis": ["malnutri", "asupan", "energi", "protein", "kurang"],
            "intervention": ["frekuensi", "porsi kecil", "kepadatan", "kunyah", "tekstur", "gigi palsu", "gigi", "monitoring", "berat badan"]
        },
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda mengidentifikasi kasus **Risiko Malnutrisi pada Lansia** Ny. SM secara tepat.\n\n"
            "**Evaluasi Terapi:** Sempurna! Modifikasi tekstur makanan agar mudah dikunyah, peningkatan frekuensi porsi kecil tapi sering, serta makanan padat energi & protein (TETP) sangat sesuai untuk lansia."
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
        lower_input = user_input.lower()
        
        # Generic keyword matching using CASES dynamic keywords dictionary
        diag_keywords = case_data.get("keywords", {}).get("diagnosis", [])
        interv_keywords = case_data.get("keywords", {}).get("intervention", [])
        
        is_diag_correct = any(kw.lower() in lower_input for kw in diag_keywords)
        is_therapy_correct = any(kw.lower() in lower_input for kw in interv_keywords)
        
        base_score = 0
        if is_diag_correct: base_score += 50
        if is_therapy_correct: base_score += 50
        
        is_mock_key = api_key == "ISI_API_KEY_KAMU_DISINI" or not api_key
        
        if model and not is_mock_key:
            chat_history = []
            for h in history:
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
                f"3. Tugas utama Anda adalah mengevaluasi jawaban Nutri Student terhadap dua pertanyaan berikut:\n"
                f"   Poin 1: Apa diagnosis gizi/penyakit yang tepat berdasarkan data antropometri, klinis, dan recall gizi?\n"
                f"   Poin 2: Intervensi/terapi gizi apa yang sebaiknya diberikan kepada pasien, apa yang harus dilakukan pasien, dan seperti apa rekomendasinya?\n"
                f"4. Evaluasi jawaban pengguna secara cerdas dan fleksibel. Jangan mengharuskan kesamaan kata secara harfiah dengan Data Medis Acuan. Selama makna/intinya secara medis mirip, sama, atau setara, anggap BENAR.\n"
                f"5. Jika pengguna menjawab salah satu dari poin tersebut secara benar (artinya setara/mirip dengan diagnosis atau terapi acuan), hargai dan anggap poin tersebut benar. Minta pengguna melengkapi poin yang belum benar/belum dijawab.\n"
                f"   - Jika hanya Poin 1 (Diagnosis) yang benar, akhiri jawaban Anda dengan tag: **[DIAGNOSIS_BENAR]**\n"
                f"   - Jika hanya Poin 2 (Intervensi) yang benar, akhiri jawaban Anda dengan tag: **[INTERVENSI_BENAR]**\n"
                f"   - Jika kedua poin (Diagnosis DAN Intervensi) sudah benar (baik dijawab sekaligus, atau setelah melengkapi kekurangan sebelumnya), berikan pujian penuh dan akhiri jawaban Anda dengan tag kelulusan secara presisi: **[BERHASIL MENDIAGNOSIS]**\n"
                f"6. Gunakan Bahasa Indonesia yang baik dan format Markdown yang rapi."
            )
            
            try:
                ai_reply, active_model = generate_with_fallback(
                    prompt=user_input,
                    system_instruction=system_prompt,
                    history=chat_history
                )
                
                passed = "[BERHASIL MENDIAGNOSIS]" in ai_reply or base_score >= 100
                
                if base_score >= 100 and not passed:
                    ai_reply += "\n\n**[BERHASIL MENDIAGNOSIS]**"
                    passed = True
                elif is_diag_correct and not is_therapy_correct and "[DIAGNOSIS_BENAR]" not in ai_reply:
                    ai_reply += "\n\n**[DIAGNOSIS_BENAR]**"
                elif not is_diag_correct and is_therapy_correct and "[INTERVENSI_BENAR]" not in ai_reply:
                    ai_reply += "\n\n**[INTERVENSI_BENAR]**"
                
                return jsonify({
                    "success": passed,
                    "score": 100 if passed else base_score,
                    "reply": ai_reply,
                    "diagnosis_correct": is_diag_correct,
                    "therapy_correct": is_therapy_correct
                })
            except Exception as e:
                if any(w in str(e).lower() for w in ["quota", "exhausted", "429"]):
                    passed = base_score >= 100
                    if passed:
                        reply_text = f"**[PERINGATAN: Kuota Google AI Studio Habis - Mode Simulasi Supervisor Aktif]**\n\n{case_data['mock_critique']}\n\n**[BERHASIL MENDIAGNOSIS]**"
                    elif is_diag_correct:
                        reply_text = f"**[PERINGATAN: Kuota Google AI Studio Habis - Mode Simulasi Supervisor Aktif]**\n\nDiagnosis Anda sudah benar! Sekarang, mari lanjut ke poin kedua. Intervensi/terapi gizi apa yang sebaiknya diberikan kepada pasien? Apa yang harus dilakukan pasien, dan seperti apa rekomendasinya?\n\n**[DIAGNOSIS_BENAR]**"
                    elif is_therapy_correct:
                        reply_text = f"**[PERINGATAN: Kuota Google AI Studio Habis - Mode Simulasi Supervisor Aktif]**\n\nRencana intervensi Anda sudah benar! Sekarang, mari lanjut ke poin kesatu. Berdasarkan data antropometri, klinis, dan recall gizi, apakah diagnosis gizi/penyakit yang tepat untuk pasien ini?\n\n**[INTERVENSI_BENAR]**"
                    else:
                        reply_text = f"**[PERINGATAN: Kuota Google AI Studio Habis - Mode Simulasi Supervisor Aktif]**\n\n{case_data['mock_critique']}\n\n*Petunjuk: Pastikan diagnosis Anda mengandung unsur diagnosis utama dan tatalaksana spesifik untuk kasus ini!*"
                    
                    return jsonify({
                        "success": passed,
                        "score": base_score,
                        "reply": reply_text,
                        "diagnosis_correct": is_diag_correct,
                        "therapy_correct": is_therapy_correct
                    })
                raise e
        else:
            passed = base_score >= 100
            if passed:
                reply_text = f"**[MODE SIMULASI BACKEND]**\n\n{case_data['mock_critique']}\n\n**[BERHASIL MENDIAGNOSIS]**"
            elif is_diag_correct:
                reply_text = f"**[MODE SIMULASI BACKEND]**\n\nDiagnosis Anda sudah benar! Sekarang, mari lanjut ke poin kedua. Intervensi/terapi gizi apa yang sebaiknya diberikan kepada pasien? Apa yang harus dilakukan pasien, dan seperti apa rekomendasinya?\n\n**[DIAGNOSIS_BENAR]**"
            elif is_therapy_correct:
                reply_text = f"**[MODE SIMULASI BACKEND]**\n\nRencana intervensi Anda sudah benar! Sekarang, mari lanjut ke poin kesatu. Berdasarkan data antropometri, klinis, dan recall gizi, apakah diagnosis gizi/penyakit yang tepat untuk pasien ini?\n\n**[INTERVENSI_BENAR]**"
            else:
                reply_text = f"**[MODE SIMULASI BACKEND]**\n\n{case_data['mock_critique']}\n\n*Petunjuk: Harap hitung nilai IMT pasien, tentukan diagnosis berdasarkan antropometri/klinis, dan berikan terapi diet yang sesuai. Silakan coba lagi!*"
            
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
                "Kamu adalah NutriBot, asisten AI interaktif dan pakar gizi ramah dari NutriSphere.\n"
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
                reply = "Halo! Saya **NutriBot**, asisten gizi pintar Anda di NutriSphere. 🍎🥦 Ada yang bisa saya bantu hari ini tentang pola makan sehat, berat badan, atau keluhan kesehatan?"
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
