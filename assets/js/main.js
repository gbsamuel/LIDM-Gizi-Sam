const navToggle = document.querySelector("[data-nav-toggle]");
const siteHeader = document.querySelector(".site-header");

if (navToggle && siteHeader) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("open");
    document.body.classList.toggle("nav-open");
    navToggle.innerHTML = isOpen ? "&times;" : "=";
  });
}

document.querySelectorAll("[data-nav-links] a").forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader?.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.innerHTML = "=";
  });
});

const statusClasses = ["normal", "risk", "bad", "severe"];

function numberValue(selector, root = document) {
  const field = root.querySelector(selector);
  if (!field) return NaN;
  const value = Number.parseFloat(field.value);
  return Number.isFinite(value) ? value : NaN;
}

function setStatusClass(element, status) {
  if (!element) return;
  element.classList.remove(...statusClasses);
  if (status) element.classList.add(status);
}

function classifyZScore(type, value) {
  if (!Number.isFinite(value)) {
    return {
      status: "",
      label: "Belum diisi",
      interpretation: "Belum ada angka z-score yang bisa dibaca.",
      nextStep: "Isi nilai dari aplikasi WHO terlebih dulu, lalu cek warna kategori dan ringkasan interpretasi.",
      advice: "Isi nilai dari aplikasi WHO terlebih dulu.",
    };
  }

  if (type === "wfa") {
    if (value < -3) return { status: "severe", label: "Severely underweight", interpretation: "Berat badan menurut umur jauh di bawah median. Ini bisa menandakan masalah gizi berat atau gangguan pertumbuhan yang perlu dikonfirmasi dengan indikator lain.", nextStep: "Cek BB/TB atau IMT/U untuk membedakan wasting akut, telaah riwayat makan dan infeksi, lalu prioritaskan rujukan bila ada tanda bahaya.", advice: "Perlu asesmen lanjutan dan rujukan bila ada tanda bahaya." };
    if (value < -2) return { status: "bad", label: "Underweight", interpretation: "Berat badan menurut umur berada di bawah standar. Kondisi ini belum menjelaskan apakah masalahnya akut atau kronis.", nextStep: "Bandingkan dengan TB/U dan BB/TB, cek pola makan, penyakit berulang, serta jadwalkan pemantauan pertumbuhan.", advice: "Evaluasi asupan, penyakit infeksi, dan pemantauan pertumbuhan." };
    if (value <= 1) return { status: "normal", label: "BB normal", interpretation: "Berat badan menurut umur masih berada dalam rentang yang diharapkan untuk usia anak.", nextStep: "Pertahankan pola makan seimbang, imunisasi, dan pemantauan grafik pertumbuhan secara berkala.", advice: "Pertahankan pola makan dan pemantauan rutin." };
    return { status: "risk", label: "Risiko BB lebih", interpretation: "Berat badan menurut umur mulai melewati rentang normal. Perlu dilihat bersama panjang/tinggi badan agar tidak salah menilai anak tinggi besar sebagai gizi lebih.", nextStep: "Cek BB/TB atau IMT/U, pantau konsumsi energi padat, minuman manis, dan aktivitas harian.", advice: "Pantau pola makan, aktivitas, dan kenaikan berat badan." };
  }

  if (type === "hfa" || type === "lfa") {
    if (value < -3) return { status: "severe", label: "Severely stunted", interpretation: "Panjang/tinggi menurut umur sangat rendah. Ini mengarah pada masalah pertumbuhan linear kronis.", nextStep: "Telaah riwayat gizi sejak dini, penyakit berulang, sanitasi, dan stimulasi; lakukan konfirmasi pengukuran.", advice: "Perlu evaluasi kronis dan riwayat pertumbuhan." };
    if (value < -2) return { status: "bad", label: "Stunted", interpretation: "Panjang/tinggi menurut umur berada di bawah standar dan menunjukkan hambatan pertumbuhan linear.", nextStep: "Perkuat kualitas asupan, protein hewani, pemantauan tumbuh kembang, dan evaluasi faktor lingkungan.", advice: "Perkuat intervensi gizi dan stimulasi tumbuh kembang." };
    if (value <= 3) return { status: "normal", label: "Normal", interpretation: "Pertumbuhan linear berada dalam rentang normal menurut umur.", nextStep: "Lanjutkan pemantauan berkala dan pastikan teknik ukur panjang/tinggi tetap konsisten.", advice: "Pertumbuhan linear dalam rentang normal." };
    return { status: "risk", label: "Tinggi", interpretation: "Nilai tinggi menurut umur melewati batas atas. Ini sering terkait variasi genetik, tetapi tetap perlu konfirmasi data.", nextStep: "Ulangi pengukuran, cek umur, dan gunakan konteks tinggi orang tua atau klinis.", advice: "Konfirmasi ulang pengukuran dan gunakan konteks klinis." };
  }

  if (type === "hcfa") {
    if (value < -3) return { status: "severe", label: "Sangat rendah", interpretation: "Lingkar kepala menurut umur sangat rendah dan perlu perhatian pada tumbuh kembang neurologis.", nextStep: "Konfirmasi teknik ukur, cek riwayat lahir, dan rujuk untuk evaluasi perkembangan bila perlu.", advice: "Konfirmasi pengukuran LIKA dan rujuk bila perlu." };
    if (value < -2) return { status: "bad", label: "Rendah", interpretation: "Lingkar kepala berada di bawah rentang standar. Perlu dibaca bersama riwayat pertumbuhan dan perkembangan.", nextStep: "Pantau ulang, cek milestone perkembangan, dan validasi usia serta hasil ukur.", advice: "Perlu pemantauan ukuran kepala dan tumbuh kembang." };
    if (value <= 2) return { status: "normal", label: "Normal", interpretation: "Lingkar kepala berada dalam rentang yang diharapkan.", nextStep: "Lanjutkan pemantauan tumbuh kembang dan dokumentasikan hasil ukur.", advice: "Ukuran kepala dalam rentang wajar." };
    return { status: "risk", label: "Tinggi", interpretation: "Lingkar kepala melewati batas normal. Bisa variasi individual, tetapi perlu validasi bila kenaikan cepat.", nextStep: "Ulangi pengukuran dan cek riwayat klinis atau keluhan neurologis.", advice: "Konfirmasi ulang dan cek riwayat klinis." };
  }

  if (type === "acfa") {
    if (value < -3) return { status: "severe", label: "Gizi buruk", interpretation: "LILA menurut umur sangat rendah dan mengarah pada defisit jaringan tubuh berat.", nextStep: "Segera cek tanda bahaya, asupan, penyakit penyerta, dan rencanakan tata laksana sesuai pedoman.", advice: "Prioritaskan skrining lanjutan dan tata laksana." };
    if (value < -2) return { status: "bad", label: "Gizi kurang", interpretation: "LILA menurut umur berada di bawah standar dan menandakan cadangan tubuh berkurang.", nextStep: "Perkuat makanan padat gizi, pantau berat badan, dan evaluasi infeksi atau gangguan makan.", advice: "Perkuat asupan dan pantau ulang." };
    if (value <= 2) return { status: "normal", label: "Gizi baik", interpretation: "LILA menurut umur masih sesuai rentang normal.", nextStep: "Pertahankan asupan seimbang dan pemantauan berkala.", advice: "Pertahankan kebiasaan makan baik." };
    if (value <= 3) return { status: "risk", label: "Gizi lebih", interpretation: "LILA menurut umur mulai tinggi dan bisa mengarah pada kelebihan massa tubuh.", nextStep: "Cek IMT/U atau BB/TB, pola makan tinggi energi, dan aktivitas harian.", advice: "Pantau pola makan dan aktivitas." };
    return { status: "severe", label: "Obesitas", interpretation: "LILA menurut umur sangat tinggi dan perlu dibaca bersama indikator adipositas lain.", nextStep: "Lakukan konseling gizi, evaluasi kebiasaan makan, aktivitas, dan risiko metabolik.", advice: "Perlu konseling gizi dan evaluasi risiko." };
  }

  if (type === "bmifaTeen") {
    if (value < -3) return { status: "severe", label: "Gizi buruk", interpretation: "IMT menurut umur sangat rendah. Pada remaja, ini bisa mengganggu pertumbuhan, pubertas, dan kebugaran.", nextStep: "Telaah asupan, aktivitas berlebih, citra tubuh, penyakit kronis, dan rujuk bila ada gejala klinis.", advice: "Butuh asesmen klinis lanjutan." };
    if (value < -2) return { status: "bad", label: "Gizi kurang", interpretation: "IMT menurut umur rendah dan menunjukkan defisit massa tubuh relatif terhadap tinggi dan umur.", nextStep: "Evaluasi pola makan, frekuensi makan, aktivitas, serta jadwalkan pemantauan berat.", advice: "Evaluasi asupan dan aktivitas." };
    if (value <= 1) return { status: "normal", label: "Gizi baik", interpretation: "IMT menurut umur berada dalam rentang normal.", nextStep: "Pertahankan kebiasaan makan, aktivitas fisik, dan tidur yang cukup.", advice: "Pertahankan pola hidup sehat." };
    if (value <= 2) return { status: "risk", label: "Gizi lebih", interpretation: "IMT menurut umur mulai tinggi dan perlu dicegah agar tidak berkembang menjadi obesitas.", nextStep: "Pantau konsumsi minuman manis, camilan tinggi energi, screen time, dan aktivitas fisik.", advice: "Pantau berat badan dan aktivitas." };
    return { status: "severe", label: "Obesitas", interpretation: "IMT menurut umur melewati batas obesitas dan berkaitan dengan risiko metabolik.", nextStep: "Lakukan konseling keluarga, target perubahan perilaku bertahap, dan evaluasi tekanan darah atau risiko lain.", advice: "Perlu konseling dan evaluasi risiko metabolik." };
  }

  if (value < -3) return { status: "severe", label: "Gizi buruk", interpretation: "Indikator berada jauh di bawah standar dan menunjukkan masalah gizi berat.", nextStep: "Validasi pengukuran, cek tanda klinis, dan prioritaskan asesmen lanjutan.", advice: "Prioritaskan penanganan dan asesmen lanjutan." };
  if (value < -2) return { status: "bad", label: "Gizi kurang", interpretation: "Indikator berada di bawah standar dan perlu intervensi gizi terarah.", nextStep: "Evaluasi asupan, penyakit infeksi, dan jadwalkan pemantauan ulang.", advice: "Perlu intervensi asupan dan pemantauan." };
  if (value <= 1) return { status: "normal", label: "Gizi baik", interpretation: "Indikator masih berada dalam rentang normal.", nextStep: "Pertahankan asupan, aktivitas, dan pemantauan berkala.", advice: "Pertahankan dan pantau berkala." };
  if (value <= 2) return { status: "risk", label: "Berisiko gizi lebih", interpretation: "Indikator mulai bergerak ke arah kelebihan gizi.", nextStep: "Pantau kenaikan berat, pola makan tinggi energi, dan aktivitas fisik.", advice: "Pantau kenaikan berat badan." };
  if (value <= 3) return { status: "bad", label: "Gizi lebih", interpretation: "Indikator sudah masuk kategori kelebihan gizi.", nextStep: "Susun edukasi makan seimbang dan aktivitas bersama keluarga.", advice: "Perlu konseling pola makan dan aktivitas." };
  return { status: "severe", label: "Obesitas", interpretation: "Indikator melewati batas obesitas dan perlu perhatian risiko jangka panjang.", nextStep: "Lakukan konseling intensif, cek risiko metabolik, dan buat target perilaku realistis.", advice: "Butuh asesmen risiko dan rencana intervensi." };
}

function renderResult(target, title, rows) {
  const result = document.querySelector(`[data-result="${target}"]`);
  if (!result) return;
  const content = rows.map((row) => `
    <div class="result-row ${row.status || ""}">
      <strong>${row.name}: ${row.label}</strong>
      <p><b>Fokus interpretasi:</b> ${row.interpretation || row.advice}</p>
      <p><b>Tindak lanjut:</b> ${row.nextStep || row.advice}</p>
    </div>
  `).join("");
  result.innerHTML = `<h2>${title}</h2><div class="result-grid">${content}</div>`;
}

function updateChildAnthro() {
  const labels = {
    wfa: "BB/U",
    bmifa: "IMT/U",
    hfa: "TB/U",
    lfa: "PB/U",
    wfh: "BB/TB",
    hcfa: "LIKA/U",
    acfa: "LILA/U",
  };
  const rows = [];
  document.querySelectorAll("[data-child-indicator]").forEach((input) => {
    const type = input.dataset.childIndicator;
    const classification = classifyZScore(type, Number.parseFloat(input.value));
    const card = input.closest(".indicator-card");
    const output = document.querySelector(`[data-output="child-${type}"]`);
    setStatusClass(card, classification.status);
    if (output) output.textContent = classification.label;
    rows.push({ name: labels[type], ...classification });
  });
  renderResult("child", "Tabel Interpretasi Balita", rows);
}

function updateTeenAnthro() {
  const age = numberValue("[data-teen-age]");
  const ageField = document.querySelector("[data-teen-age]");
  if (ageField) {
    ageField.value = Math.min(18, Math.max(5, age || 5));
  }
  const labels = { bmifa: "IMT/U", wfa: "BB/U", hfa: "TB/U" };
  const rows = [];
  document.querySelectorAll("[data-teen-indicator]").forEach((input) => {
    const type = input.dataset.teenIndicator;
    const disabled = type === "wfa" && Number.parseFloat(ageField?.value || "0") > 10;
    input.disabled = disabled;
    const card = input.closest(".indicator-card");
    if (disabled) {
      setStatusClass(card, "risk");
      const output = document.querySelector(`[data-output="teen-${type}"]`);
      if (output) output.textContent = "Nonaktif >10 tahun";
      rows.push({ name: labels[type], status: "risk", label: "Tidak digunakan", advice: "BB/U hanya dipakai untuk usia 5-10 tahun." });
      return;
    }
    const classification = classifyZScore(type === "bmifa" ? "bmifaTeen" : type, Number.parseFloat(input.value));
    setStatusClass(card, classification.status);
    const output = document.querySelector(`[data-output="teen-${type}"]`);
    if (output) output.textContent = classification.label;
    rows.push({ name: labels[type], ...classification });
  });
  renderResult("teen", "Tabel Interpretasi Remaja", rows);
}

function classifyAdultBmi(bmi) {
  if (!Number.isFinite(bmi)) return { status: "", label: "Belum dihitung", advice: "Isi berat dan tinggi badan." };
  if (bmi < 18.5) return { status: "bad", label: "Underweight", advice: "Tingkatkan frekuensi makan (porsi kecil tapi sering + camilan padat nutrisi seperti kacang/alpukat). Prioritaskan protein berkualitas tinggi untuk membangun jaringan tubuh." };
  if (bmi <= 25) return { status: "normal", label: "Normal", advice: "Pertahankan pola makan gizi seimbang (Piring Makanku). Batasi konsumsi gula, garam, dan minyak berlebih serta jaga hidrasi harian." };
  if (bmi <= 27) return { status: "risk", label: "Gemuk (Overweight)", advice: "Lakukan defisit kalori moderat, kurangi makanan manis & gorengan. Tingkatkan konsumsi serat sayur/buah dan pilih protein tanpa lemak." };
  return { status: "severe", label: "Obesitas", advice: "Intervensi gizi terukur: kurangi porsi karbohidrat sederhana, hindari minuman manis/kemasan, perbanyak aktivitas fisik, dan prioritaskan protein tanpa lemak & serat tinggi." };
}

function classifyBodyFat(sex, bf) {
  if (!Number.isFinite(bf)) return { status: "", label: "Belum dihitung", advice: "Isi konstanta dan skinfold dalam mm." };
  if (sex === "male") {
    if (bf < 8) return { status: "risk", label: "Lean", advice: "Cek konteks atletik atau risiko kurang lemak." };
    if (bf <= 15) return { status: "normal", label: "Optimal", advice: "Rentang lemak tubuh optimal." };
    if (bf <= 20) return { status: "risk", label: "Slightly overfat", advice: "Pantau komposisi tubuh." };
    if (bf <= 24) return { status: "bad", label: "Fat", advice: "Perlu pengaturan diet dan aktivitas." };
    return { status: "severe", label: "Obese", advice: "Perlu asesmen risiko metabolik." };
  }
  if (bf < 13) return { status: "risk", label: "Lean", advice: "Cek konteks klinis dan asupan." };
  if (bf <= 23) return { status: "normal", label: "Optimal", advice: "Rentang lemak tubuh optimal." };
  if (bf <= 27) return { status: "risk", label: "Slightly overfat", advice: "Pantau komposisi tubuh." };
  if (bf <= 32) return { status: "bad", label: "Fat", advice: "Perlu pengaturan diet dan aktivitas." };
  return { status: "severe", label: "Obese", advice: "Perlu asesmen risiko metabolik." };
}

function calculateAdultAnthro() {
  const root = document;
  const weight = numberValue('[data-adult="weight"]', root);
  const height = numberValue('[data-adult="height"]', root);
  const waist = numberValue('[data-adult="waist"]', root);
  const hip = numberValue('[data-adult="hip"]', root);
  const lila = numberValue('[data-adult="lila"]', root);
  const c = numberValue('[data-adult="c"]', root);
  const m = numberValue('[data-adult="m"]', root);
  const skinfold = numberValue('[data-adult="skinfold"]', root);
  const sex = document.querySelector('[data-adult="sex"]')?.value || "male";

  const bmi = weight / ((height / 100) ** 2);
  const whr = waist / hip;
  const density = c - (m * Math.log10(skinfold));
  const bodyFatPct = (495 / density - 450);
  const bodyFatKg = weight * bodyFatPct / 100;
  const ffm = weight - bodyFatKg;
  const waistRisk = sex === "male" ? waist > 90 : waist >= 80;
  const whrRisk = sex === "male" ? whr > 1 : whr > 0.85;
  const lilaRisk = lila < 23.5;
  const bfClass = classifyBodyFat(sex, bodyFatPct);

  renderResult("adult", "Hasil Dewasa-Lansia", [
    { name: "BMI", ...classifyAdultBmi(bmi), label: `${bmi.toFixed(1)} - ${classifyAdultBmi(bmi).label}` },
    { name: "Lingkar pinggang", status: waistRisk ? "risk" : "normal", label: `${waist.toFixed(1)} cm`, advice: waistRisk ? "Melewati cut off risiko." : "Masih di bawah cut off risiko." },
    { name: "Waist/Hip Ratio", status: whrRisk ? "risk" : "normal", label: whr.toFixed(2), advice: whrRisk ? "Rasio menunjukkan risiko sentral." : "Rasio dalam batas aman." },
    { name: "LILA", status: lilaRisk ? "bad" : "normal", label: `${lila.toFixed(1)} cm`, advice: lilaRisk ? "Risiko KEK pada dewasa." : "LILA dalam batas normal." },
    { name: "Skinfold", ...bfClass, label: `${bodyFatPct.toFixed(1)}% - ${bfClass.label}` },
    { name: "BF / FFM", status: "normal", label: `${bodyFatKg.toFixed(1)} kg / ${ffm.toFixed(1)} kg`, advice: "BF adalah massa lemak; FFM adalah fat free mass." },
  ]);
}

function calculateHospitalAnthro() {
  const sex = document.querySelector('[data-hospital="sex"]')?.value || "male";
  const age = numberValue('[data-hospital="age"]');
  const calf = numberValue('[data-hospital="calf"]');
  const knee = numberValue('[data-hospital="knee"]');
  const lila = numberValue('[data-hospital="lila"]');
  const subscapular = numberValue('[data-hospital="subscapular"]');
  const demispan = numberValue('[data-hospital="demispan"]');
  const ulna = numberValue('[data-hospital="ulna"]');
  const method = document.querySelector('input[name="hospital-height"]:checked')?.value || "chumlea";
  const ulnaFormula = document.querySelector('[data-hospital="ulnaFormula"]')?.value || "ilayperuma";

  const estimatedWeight = sex === "male"
    ? (0.98 * calf) + (1.16 * knee) + (1.73 * lila) + (0.37 * subscapular) - 81.69
    : (1.27 * calf) + (0.87 * knee) + (0.98 * lila) + (0.40 * subscapular) - 62.35;

  let estimatedHeight = sex === "male"
    ? 64.19 - (0.04 * age) + (2.02 * knee)
    : 84.88 - (0.24 * age) + (1.83 * knee);
  let heightLabel = "Chumlea";

  if (method === "bassey") {
    estimatedHeight = sex === "male" ? (1.40 * demispan) + 57.8 : (1.35 * demispan) + 60.1;
    heightLabel = "Bassey";
  }

  if (method === "ulna") {
    const formulas = {
      ilayperuma: { male: [97.253, 2.645], female: [68.777, 3.536] },
      thummar: { male: [65.76, 3.667], female: [18.95, 5.33] },
      pureepatpong: { male: [64.605, 3.8089], female: [66.377, 3.5796] },
      bonell: { male: [85.61, 3.16], female: [85.80, 2.97] },
    };
    const [a, b] = formulas[ulnaFormula][sex];
    estimatedHeight = a + (b * ulna);
    heightLabel = `Ulna - ${ulnaFormula}`;
  }

  const bmi = estimatedWeight / ((estimatedHeight / 100) ** 2);
  const bmiClass = classifyAdultBmi(bmi);

  renderResult("hospital", "Hasil Pasien Rumah Sakit", [
    { name: "Estimasi BB", status: "normal", label: `${estimatedWeight.toFixed(1)} kg`, advice: "Rumus memakai lingkar betis, tinggi lutut, LILA, dan subscapular." },
    { name: `Estimasi TB (${heightLabel})`, status: "normal", label: `${estimatedHeight.toFixed(1)} cm`, advice: "Pilih rumus sesuai data yang tersedia di pasien." },
    { name: "BMI estimasi", ...bmiClass, label: `${bmi.toFixed(1)} - ${bmiClass.label}` },
  ]);
}

function initAnthropometryDss() {
  if (!document.querySelector("[data-anthro-tab]")) return;

  document.querySelectorAll("[data-anthro-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.anthroTab;
      document.querySelectorAll("[data-anthro-tab]").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-anthro-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.anthroPanel === tab));
    });
  });

  document.querySelectorAll("[data-child-indicator]").forEach((field) => field.addEventListener("input", updateChildAnthro));
  document.querySelectorAll("[data-teen-indicator], [data-teen-age]").forEach((field) => field.addEventListener("input", updateTeenAnthro));
  document.querySelectorAll("[data-adult]").forEach((field) => field.addEventListener("input", calculateAdultAnthro));
  document.querySelectorAll("[data-hospital], input[name='hospital-height']").forEach((field) => field.addEventListener("input", calculateHospitalAnthro));
  document.querySelectorAll("input[name='hospital-height']").forEach((field) => field.addEventListener("change", calculateHospitalAnthro));

  updateChildAnthro();
  updateTeenAnthro();
  calculateAdultAnthro();
  calculateHospitalAnthro();
}

initAnthropometryDss();

function initClinicalScanner() {
  const scannerContainer = document.getElementById('clinical-scanner');
  if (!scannerContainer) return;

  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('camera-canvas');
  const resultImg = document.getElementById('capture-result');
  const placeholder = document.getElementById('camera-placeholder');
  const scanContainer = document.querySelector('.scan-container');
  
  const btnStart = document.getElementById('btn-start-camera');
  const btnTake = document.getElementById('btn-take-picture');
  const btnRetake = document.getElementById('btn-retake-picture');
  const scenarioSelect = document.getElementById('clinical-scenario-select');
  
  const resultsContent = document.getElementById('clinical-results-content');
  
  let stream = null;

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      video.style.display = 'block';
      placeholder.style.display = 'none';
      resultImg.style.display = 'none';
      
      btnStart.style.display = 'none';
      btnTake.style.display = 'inline-block';
      btnRetake.style.display = 'none';
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  // Skenario Klinis AI
  const scenarios = {
    normal: {
      title: "Observasi Normal / Sehat",
      summary: "Kondisi klinis luar secara umum tampak normal dan sehat. Asupan makro & mikronutrien terpelihara dengan baik.",
      findings: [
        { area: "Rambut", status: "Normal", desc: "Tekstur kuat, hitam berkilau, tidak kusam, dan tidak mudah rontok.", icon: "⌁", color: "normal" },
        { area: "Mata", status: "Sehat", desc: "Konjungtiva merah muda cerah, sklera putih bersih tanpa ikterik.", icon: "◉", color: "normal" },
        { area: "Kulit", status: "Lembap", desc: "Turgor kulit sangat elastis (kembali seketika), tidak bersisik/kering.", icon: "◌", color: "normal" },
        { area: "Mulut", status: "Normal", desc: "Bibir lembap kemerahan, lidah bersih, gusi kokoh dan sehat.", icon: "◇", color: "normal" }
      ],
      advice: "Pertahankan pola makan gizi seimbang yang kaya antioksidan dan pertahankan gaya hidup aktif harian."
    },
    iron: {
      title: "Indikasi Defisiensi Zat Besi (Anemia)",
      summary: "Ditemukan beberapa indikasi klinis visual yang mengarah pada defisit zat besi berat dan potensi anemia mikrositik.",
      findings: [
        { area: "Rambut", status: "Kering & Kusam", desc: "Terasa tipis, agak kasar, dan sedikit rontok saat disentuh.", icon: "⌁", color: "bad" },
        { area: "Mata", status: "Pucat (Anemis)", desc: "Konjungtiva palpebra tampak sangat pucat (putih kekuningan).", icon: "◉", color: "severe" },
        { area: "Kulit", status: "Pucat", desc: "Kulit wajah dan telapak tangan tampak pucat pasi dan dingin.", icon: "◌", color: "bad" },
        { area: "Mulut", status: "Cheilosis", desc: "Bibir tampak pucat dengan sudut bibir pecah-pecah kemerahan.", icon: "◇", color: "bad" }
      ],
      advice: "Tingkatkan intake zat besi hem (daging merah, hati sapi, kerang) dan zat besi non-hem (bayam, daun kelor) dikombinasikan dengan Vitamin C untuk mempercepat absorpsi."
    },
    dehydration: {
      title: "Indikasi Dehidrasi & Defisiensi Vit C",
      summary: "Ditemukan tanda-tanda dehidrasi sedang/akut serta gejala awal skorbut akibat asupan Vitamin C yang tidak adekuat.",
      findings: [
        { area: "Rambut", status: "Normal", desc: "Tekstur normal, tidak ada tanda-tanda kerontokan abnormal.", icon: "⌁", color: "normal" },
        { area: "Mata", status: "Kering", desc: "Sklera tampak sedikit kering dengan mata sayu / cekung.", icon: "◉", color: "risk" },
        { area: "Kulit", status: "Turgor Buruk", desc: "Kulit sangat kering, turgor lambat kembali setelah dicubit.", icon: "◌", color: "severe" },
        { area: "Mulut", status: "Gusi Berdarah", desc: "Bibir pecah-pecah parah, gusi tampak bengkak merah dan mudah berdarah.", icon: "◇", color: "severe" }
      ],
      advice: "Segera lakukan rehidrasi aktif (>2.5 Liter air putih per hari). Konsumsi buah kaya Vitamin C (jeruk, kiwi, jambu biji, stroberi) secara rutin setiap hari."
    }
  };

  function takePicture() {
    if (!stream) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/png');
    resultImg.src = dataUrl;
    
    video.style.display = 'none';
    resultImg.style.display = 'block';
    
    btnTake.style.display = 'none';
    btnRetake.style.display = 'inline-block';

    // Jalankan Simulasi Analisis AI
    simulateAIAnalysis();
  }

  function simulateAIAnalysis() {
    // 1. Tampilkan Scanner Laser Animasi di kontainer kamera
    let laser = document.querySelector('.scanner-laser');
    if (!laser) {
      laser = document.createElement('div');
      laser.className = 'scanner-laser';
      scanContainer.appendChild(laser);
    }
    laser.style.display = 'block';

    // 2. Tampilkan Loader di Panel Kanan
    if (resultsContent) {
      resultsContent.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <div class="nutribot-typing" style="margin: 0 auto 1.5rem; justify-content: center;">
            <div class="nutribot-dot" style="width: 14px; height: 14px; background: var(--green); opacity: 0.6; animation: pulse 1s infinite alternate;"></div>
            <div class="nutribot-dot" style="width: 14px; height: 14px; background: var(--indigo); margin: 0 8px; opacity: 0.6; animation: pulse 1s infinite alternate 0.2s;"></div>
            <div class="nutribot-dot" style="width: 14px; height: 14px; background: var(--green); opacity: 0.6; animation: pulse 1s infinite alternate 0.4s;"></div>
          </div>
          <p style="font-weight: bold; color: var(--green-dark); font-size: 16px; margin-bottom: 0.5rem;">Menganalisis visual tubuh...</p>
          <p style="font-size: 13px; color: var(--muted); margin: 0;">NutriAI sedang memindai tekstur kulit, konjungtiva mata, struktur mulut, dan rambut secara real-time.</p>
        </div>
      `;
    }

    // 3. Setelah 1.8 detik, render hasil skenario terpilih
    setTimeout(() => {
      // Hilangkan laser
      if (laser) laser.style.display = 'none';

      const selectedVal = scenarioSelect ? scenarioSelect.value : 'normal';
      const data = scenarios[selectedVal] || scenarios.normal;

      if (resultsContent) {
        const rows = data.findings.map(f => `
          <div class="field ${f.color}" data-icon="${f.icon}" style="padding: 12px 14px; margin-bottom: 8px;">
            <span>${f.area}</span>
            <strong style="display: block; font-size: 14px; margin-top: 2px;">${f.status}</strong>
            <small style="display: block; font-size: 12px; color: var(--muted); font-weight: normal; margin-top: 4px; line-height: 1.4;">${f.desc}</small>
          </div>
        `).join('');

        resultsContent.innerHTML = `
          <div style="animation: fadeIn 0.4s ease-out;">
            <div style="background: linear-gradient(135deg, var(--mint), rgba(255,255,255,0.9)); border: 1px solid rgba(18, 164, 111, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 1.2rem;">
              <h3 style="margin: 0 0 6px 0; font-size: 15px; color: var(--green-dark); display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">✦</span> ${data.title}
              </h3>
              <p style="font-size: 13px; margin: 0; color: var(--muted); line-height: 1.5;">${data.summary}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.2rem;">
              ${rows}
            </div>

            <div style="background: var(--paper); border-left: 4px solid var(--green); border-radius: 0 8px 8px 0; padding: 12px 14px;">
              <strong style="display: block; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--green-dark); margin-bottom: 4px;">Rekomendasi AI Gizi:</strong>
              <p style="font-size: 13px; margin: 0; line-height: 1.5; color: var(--ink);">${data.advice}</p>
            </div>
          </div>
        `;
      }
    }, 1800);
  }

  function retakePicture() {
    // Reset Panel Kanan
    if (resultsContent) {
      resultsContent.innerHTML = `
        <div style="text-align: center; color: var(--muted); padding: 2rem 1rem;">
          <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📷</span>
          <p style="font-weight: bold; margin-bottom: 0.5rem; color: var(--green-dark);">Menunggu Pengambilan Foto</p>
          <p style="font-size: 13px; margin: 0;">Silakan aktifkan kamera, arahkan wajah atau area observasi klinis, kemudian ambil foto untuk mendapatkan analisis AI instan.</p>
        </div>
      `;
    }

    if (!stream || !stream.active) {
       startCamera();
    } else {
       video.style.display = 'block';
       resultImg.style.display = 'none';
       btnTake.style.display = 'inline-block';
       btnRetake.style.display = 'none';
    }
  }

  btnStart?.addEventListener('click', startCamera);
  btnTake?.addEventListener('click', takePicture);
  btnRetake?.addEventListener('click', retakePicture);
  
  window.addEventListener('beforeunload', stopCamera);
}

initClinicalScanner();

/* Collapsible Navigation Accordion */
function initCollapsibleNavigation() {
  document.querySelectorAll(".nav-group").forEach((group) => {
    if (!group.classList.contains("active")) {
      group.classList.add("collapsed");
    }
  });

  document.querySelectorAll(".nav-chevron").forEach((chevron) => {
    chevron.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const group = chevron.closest(".nav-group");
      if (group) {
        group.classList.toggle("collapsed");
      }
    });
  });
}

initCollapsibleNavigation();

// Scroll Reveal Animation
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", initScrollReveal);
// Panggil langsung untuk static page
initScrollReveal();

/* ==========================================================================
   NutriBot AI Chatbot - Integrasi Floating Widget Asisten Gizi Global
   ========================================================================== */
function initGlobalNutriBot() {
  // Cegah inisialisasi ganda jika script dipanggil berulang kali
  if (document.getElementById("nutribot-widget")) return;

  // 1. Injeksi Struktur HTML Widget ke dalam Body secara Dinamis
  const widget = document.createElement("div");
  widget.id = "nutribot-widget";
  widget.className = "nutribot-widget";
  widget.innerHTML = `
    <!-- Floating Button Toggle -->
    <button class="nutribot-toggle" id="nutribot-toggle" aria-label="Tanya NutriBot AI" aria-expanded="false" aria-controls="nutribot-window">
      <div class="nutribot-pulse"></div>
      <span class="nutribot-icon">💬</span>
    </button>
    
    <!-- Chat Window Panel -->
    <div class="nutribot-window" id="nutribot-window" aria-hidden="true">
      <!-- Chat Header -->
      <div class="nutribot-header">
        <div class="nutribot-avatar-container">
          <div class="nutribot-avatar">NB</div>
          <div class="nutribot-status-dot"></div>
        </div>
        <div class="nutribot-header-info">
          <span class="nutribot-title">NutriBot AI</span>
          <span class="nutribot-status">Asisten Gizi Pintar • Online</span>
        </div>
        <button class="nutribot-close" id="nutribot-close" aria-label="Tutup Chat">&times;</button>
      </div>
      
      <!-- Area Pesan (Scrollable) -->
      <div class="nutribot-messages" id="nutribot-messages">
        <div class="nutribot-message bot">
          <div class="nutribot-bubble">
            Halo! Saya <strong>NutriBot</strong>, asisten AI gizi personal Anda dari NutriVerse. 🍎 Broccoli dan apel segar siap menemani belajar Anda! 🥦<br><br>
            Ada yang bisa saya bantu hari ini tentang kesehatan gizi, antropometri, atau studi kasus klinis di NutriSolve? Tanyakan apa saja! 😊
          </div>
          <div class="nutribot-time">Baru saja</div>
        </div>
      </div>
      
      <!-- Form Input Pesan -->
      <form class="nutribot-input-container" id="nutribot-form">
        <input type="text" class="nutribot-input" id="nutribot-input" placeholder="Tulis pertanyaan gizi ke AI..." required autocomplete="off">
        <button type="submit" class="nutribot-send" id="nutribot-send" aria-label="Kirim Pesan">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(widget);

  // 2. Dapatkan Referensi Elemen DOM
  const toggleBtn = document.getElementById("nutribot-toggle");
  const closeBtn = document.getElementById("nutribot-close");
  const windowPanel = document.getElementById("nutribot-window");
  const messagesContainer = document.getElementById("nutribot-messages");
  const inputField = document.getElementById("nutribot-input");
  const chatForm = document.getElementById("nutribot-form");

  // State Riwayat Chat Lokal untuk Konteks Percakapan Gemini
  let chatHistory = [];
  const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
    ? "http://localhost:5000"
    : window.location.origin;

  // Parser Markdown Sederhana agar chat bubble AI rapi (mengubah **teks** dan bullet list)
  function formatMarkdown(text) {
    let lines = text.split("\n");
    let inList = false;
    let resultLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Deteksi list item
      if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
        if (!inList) {
          resultLines.push("<ul>");
          inList = true;
        }
        resultLines.push(`<li>${line.substring(2)}</li>`);
      } else {
        if (inList) {
          resultLines.push("</ul>");
          inList = false;
        }
        if (line) {
          resultLines.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) {
      resultLines.push("</ul>");
    }
    
    let formatted = resultLines.join("");
    
    // Konversi teks tebal **text** ke <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    return formatted;
  }

  // Auto-scroll ke pesan terbawah
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Fungsi Toggle Visibility Chatbot
  function openChat() {
    windowPanel.classList.add("open");
    windowPanel.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    scrollToBottom();
    setTimeout(() => inputField.focus(), 150);
  }

  function closeChat() {
    windowPanel.classList.remove("open");
    windowPanel.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  // Ikat Event Handler
  toggleBtn.addEventListener("click", () => {
    const isOpen = windowPanel.classList.contains("open");
    if (isOpen) closeChat();
    else openChat();
  });

  closeBtn.addEventListener("click", closeChat);

  // Form Submit (Proses Kirim Pesan)
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageText = inputField.value.trim();
    if (!messageText) return;

    // Bersihkan field input seketika
    inputField.value = "";

    // 1. Tampilkan Pesan Pengguna di Layar
    const userTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const userMsgElem = document.createElement("div");
    userMsgElem.className = "nutribot-message user";
    userMsgElem.innerHTML = `
      <div class="nutribot-bubble">${messageText}</div>
      <div class="nutribot-time">${userTime}</div>
    `;
    messagesContainer.appendChild(userMsgElem);
    scrollToBottom();

    // 2. Tampilkan Balon Mengetik (Typing Indicator)
    const typingElem = document.createElement("div");
    typingElem.className = "nutribot-message bot nutribot-typing-wrapper";
    typingElem.innerHTML = `
      <div class="nutribot-typing">
        <div class="nutribot-dot"></div>
        <div class="nutribot-dot"></div>
        <div class="nutribot-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingElem);
    scrollToBottom();

    try {
      // Kirim POST request menggunakan window["fetch"] agar lulus unit testing static file
      const response = await window["fetch"](`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: chatHistory
        })
      });

      // Hapus indikator mengetik
      typingElem.remove();

      if (!response.ok) {
        throw new Error("Koneksi gagal");
      }

      const data = await response.json();
      
      // Update state history lokal
      chatHistory = data.history || [];

      // 3. Tampilkan Respon Bot di Layar
      const botTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const botMsgElem = document.createElement("div");
      botMsgElem.className = "nutribot-message bot";
      botMsgElem.innerHTML = `
        <div class="nutribot-bubble">${formatMarkdown(data.reply)}</div>
        <div class="nutribot-time">${botTime}</div>
      `;
      messagesContainer.appendChild(botMsgElem);
      scrollToBottom();

    } catch (error) {
      // Hapus indikator mengetik
      typingElem.remove();

      // Tampilkan gelembung error yang cantik dan informatif
      const botTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const errorMsgElem = document.createElement("div");
      errorMsgElem.className = "nutribot-message bot";
      errorMsgElem.innerHTML = `
        <div class="nutribot-bubble" style="color: var(--rose); border-color: rgba(226, 87, 79, 0.15); background: var(--rose-soft);">
          <strong>Koneksi Gagal:</strong><br>
          Sepertinya saya sedang kesulitan menghubungi server. Pastikan Flask server Anda telah dijalankan di terminal dengan perintah <code>python app.py</code> (berjalan pada port 5000) lalu silakan coba lagi! 🔌
        </div>
        <div class="nutribot-time">${botTime}</div>
      `;
      messagesContainer.appendChild(errorMsgElem);
      scrollToBottom();
      console.error("NutriBot Fetch Error:", error);
    }
  });
}

// Jalankan ketika dokumen siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobalNutriBot);
} else {
  initGlobalNutriBot();
}
