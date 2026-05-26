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
    # Use gemini-1.5-flash as it is efficient and recommended in the guide
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    print("[WARNING] GEMINI_API_KEY tidak ditemukan. Aplikasi berjalan dalam MODE SIMULASI BACKEND.")

# Grounding Database untuk Kasus Gizi (Reference Ground Truth)
CASES = {
    "ap": {
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
    "mr": {
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
    "na": {
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
    "rs": {
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
    "ds": {
        "name": "Siswa DS (Remaja Perempuan - 17 Tahun)",
        "complaint": "Saya sering merasakan nyeri hebat di perut bawah saat menstruasi bulanan (dismenore). Nafsu makan saya kadang turun drastis, lesu, dan rasanya lemas.",
        "status_gizi": "Gizi Normal-Rendah [Z-score IMT/U: -0.9 SD]",
        "lab": "Hemoglobin (Hb): 11.4 g/dL (Anemia Ringan)",
        "physical_findings": "Konjungtiva sedikit pucat, turgor kulit baik, kulit wajah tampak agak pucat (mild pallor), perut bawah terasa tegang/kram (nyeri menstruasi).",
        "dietary_recall": "Sering melewatkan sarapan pagi karena mual. Makan siang nasi + kerupuk + tempe goreng. Makan malam nasi + telur ceplok + kuah sup bayam sedikit. Camilan cilok bumbu kacang dan permen manis.",
        "correct_diagnosis": "Anemia Gizi Besi Ringan yang diperberat oleh kehilangan zat besi periodik selama menstruasi disertai nyeri kram abdomen bawah (Dismenore Primer).",
        "correct_therapy": "Suplementasi zat besi berkala (tablet tambah darah) khususnya selama masa menstruasi, meningkatkan asupan zat besi heme dari daging merah/hati, membiasakan sarapan pagi yang teratur guna mencegah lemas dan hipoglikemia, serta memberikan edukasi manajemen nyeri dismenore ringan.",
        "mock_critique": (
            "**ANALISIS MEDIS AI SUPERVISOR (MODE SIMULASI BACKEND - 100%):**\n\n"
            "**Diagnosis Tepat:** Anda berhasil mendiagnosis **Anemia Ringan (Hb 11.4)** disertai gejala kram menstruasi berat (**Dismenore**) pada DS.\n\n"
            "**Evaluasi Terapi:** Hebat! Rekomendasi Anda mengenai pemantauan asupan zat besi heme, dikombinasikan dengan edukasi makan teratur dan **tidak melewatkan sarapan pagi** adalah langkah tatalaksana gizi yang sangat tepat."
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
            
            response = model.generate_content(
                f"{system_prompt}\n\nJURNAL ILMIAH:\n{journal_text}"
            )
            return jsonify({"summary": response.text})
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
        
        if case_id not in CASES:
            return jsonify({"error": f"Case ID '{case_id}' not found."}), 404
        
        case_data = CASES[case_id]
        
        # Smart keyword matching inside server backend as a base metric
        lower_input = user_input.lower()
        
        # Evaluate keywords to determine success status
        is_diag_correct = False
        is_therapy_correct = False
        
        if case_id == "ap":
            is_diag_correct = "anemia" in lower_input or "zat besi" in lower_input or "hb" in lower_input
            is_therapy_correct = "suplemen" in lower_input or "tambah darah" in lower_input or "vitamin c" in lower_input or "vit c" in lower_input or "teh" in lower_input
        elif case_id == "mr":
            is_diag_correct = "obesitas" in lower_input or "prediabetes" in lower_input or "insulin" in lower_input or "kegemukan" in lower_input or "acanthosis" in lower_input
            is_therapy_correct = "gula" in lower_input or "manis" in lower_input or "olahraga" in lower_input or "aktivitas" in lower_input or "serat" in lower_input
        elif case_id == "na":
            is_diag_correct = "b kompleks" in lower_input or "vitamin b" in lower_input or "cheilitis" in lower_input or "bibir pecah" in lower_input or "glossitis" in lower_input
            is_therapy_correct = "protein" in lower_input or "hewani" in lower_input or "susu" in lower_input or "telur" in lower_input or "diet seimbang" in lower_input
        elif case_id == "rs":
            is_diag_correct = "stunting" in lower_input or "pendek" in lower_input or "stunted" in lower_input or "tumbuh" in lower_input
            is_therapy_correct = "energi" in lower_input or "protein" in lower_input or "tinggi" in lower_input or "telur" in lower_input or "susu" in lower_input or "ikan" in lower_input
        elif case_id == "ds":
            is_diag_correct = "anemia" in lower_input or "dismenore" in lower_input or "haid" in lower_input or "menstruasi" in lower_input or "nyeri" in lower_input
            is_therapy_correct = "zat besi" in lower_input or "suplemen" in lower_input or "sarapan" in lower_input or "makan teratur" in lower_input

        # Calculate base score based on keyword success
        base_score = 0
        if is_diag_correct: base_score += 50
        if is_therapy_correct: base_score += 50
        
        # If Gemini model is available, let the real AI generate a professional clinical supervisor review!
        if model:
            system_prompt = (
                f"Kamu adalah AI Clinical Supervisor gizi yang mendampingi mahasiswa/dokter dalam praktik konsultasi gizi.\n"
                f"Tugasmu adalah menganalisis dan mengevaluasi secara kritis serta ramah terhadap jawaban diagnosis gizi dan rekomendasi terapi pangan dari pengguna untuk kasus berikut:\n\n"
                f"=== DATA MEDIS ACUAN (GROUND TRUTH) ===\n"
                f"Nama Pasien: {case_data['name']}\n"
                f"Keluhan Utama: {case_data['complaint']}\n"
                f"Status Gizi (Antropometri): {case_data['status_gizi']}\n"
                f"Pemeriksaan Laboratorium: {case_data['lab']}\n"
                f"Pemeriksaan Fisik Klinis: {case_data['physical_findings']}\n"
                f"Kebiasaan & Recall 24 Jam: {case_data['dietary_recall']}\n"
                f"Diagnosis Medis Gizi yang Benar: {case_data['correct_diagnosis']}\n"
                f"Terapi Gizi & Tatalaksana yang Benar: {case_data['correct_therapy']}\n\n"
                f"=== INSTRUKSI EVALUASI ===\n"
                f"Jawablah dalam format Markdown yang terstruktur dan indah dengan poin-poin berikut:\n"
                f"1. Tuliskan header tebal berwarna hijau atau biru: '**ANALISIS MEDIS AI SUPERVISOR (SKOR: X%)**' (di mana X adalah nilai evaluasi yang kamu berikan dari 0 sampai 100 berdasarkan ketepatan medis jawaban pengguna dibandingkan dengan Data Acuan).\n"
                f"2. **Diagnosis Tepat/Evaluasi**: Berikan ulasan apakah diagnosis pengguna sudah tepat. Jelaskan relevansinya dengan data lab/klinis pasien.\n"
                f"3. **Evaluasi Terapi**: Berikan ulasan kritis tentang terapi yang mereka usulkan. Apabila mereka melupakan poin kritis (misalnya: pada AP adalah larangan minum teh setelah makan; pada MR adalah membatasi kopi susu manis/gula sederhana; pada NA adalah diet ekstrim vegetarian tanpa protein hewani), ingatkan mereka dengan jelas dan beri edukasi akademis.\n\n"
                f"Jawab dengan bahasa Indonesia yang santun, profesional, dan bernada mendidik layaknya dosen pembimbing klinik gizi."
            )
            
            prompt = f"JAWABAN DIAGNOSIS DAN TERAPI PENGGUNA:\n{user_input}"
            response = model.generate_content(f"{system_prompt}\n\n{prompt}")
            
            ai_reply = response.text
            
            # Extract score from response if written as "SKOR: X%" or similar, otherwise fallback to base_score
            score_match = re.search(r'SKOR:\s*(\d+)%', ai_reply, re.IGNORECASE)
            if score_match:
                extracted_score = int(score_match.group(1))
            else:
                extracted_score = base_score
                
            # A score >= 80% is considered a passing grade
            passed = extracted_score >= 80
            
            return jsonify({
                "success": passed,
                "score": extracted_score,
                "reply": ai_reply,
                "diagnosis_correct": is_diag_correct,
                "therapy_correct": is_therapy_correct
            })
        else:
            # Backend Fallback (Simulation)
            return jsonify({
                "success": base_score >= 80,
                "score": base_score,
                "reply": case_data['mock_critique'],
                "diagnosis_correct": is_diag_correct,
                "therapy_correct": is_therapy_correct
            })

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    # Run on port 5000 as specified in the guide
    app.run(debug=True, port=5000)
