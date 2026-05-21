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
  if (bmi < 18.5) return { status: "bad", label: "Underweight", advice: "Evaluasi asupan energi dan kondisi klinis." };
  if (bmi <= 25) return { status: "normal", label: "Normal", advice: "Pertahankan pola makan dan aktivitas." };
  if (bmi <= 27) return { status: "risk", label: "Gemuk", advice: "Pantau lingkar perut dan pola makan." };
  return { status: "severe", label: "Obesitas", advice: "Perlu rencana intervensi gizi dan aktivitas." };
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
  
  const btnStart = document.getElementById('btn-start-camera');
  const btnTake = document.getElementById('btn-take-picture');
  const btnRetake = document.getElementById('btn-retake-picture');
  
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
  }

  function retakePicture() {
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
