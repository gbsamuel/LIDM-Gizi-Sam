// ==========================================================================
// NutriVerse AR 3D Patient Visualization & AI Diagnostic Engine (Interactive)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Case Studies Database with spoken first-person narratives & full nutrition assessments
  const cases = {
    ap: {
      id: "ap",
      name: "Siswa AP (Remaja Perempuan - 16 Tahun)",
      complaint: "Saya akhir-akhir ini sering pusing dan cepat capek kalau di sekolah. Kalau naik tangga rasanya gampang lelah, dan kadang saya juga susah konsentrasi saat pelajaran.",
      spokenIntro: "Saya akhir-akhir ini sering pusing dan cepat capek kalau di sekolah. Kalau naik tangga rasanya gampang lelah, dan kadang saya juga susah konsentrasi saat pelajaran.",
      hotspotVoices: {
        hair: "Rambut saya agak kering dan kusam, Dok, tidak sehalus biasanya.",
        eyes: "Kelopak mata bawah saya pucat sekali Dok, berwarna keputihan dan pandangan saya kadang kabur kliyengan.",
        mouth: "Bibir saya terasa kering, pucat kebiruan, dan area lidah terasa agak hambar.",
        skin: "Kulit wajah saya kelihatan pucat pasi banget Dok, banyak teman sekolah yang menegur.",
        nails: "Kuku saya tipis, rapuh, dan kalau ditekan lama sekali kembali merahnya.",
        abdomen: "Perut saya normal Dok, tidak ada keluhan nyeri atau buncit di perut."
      },
      telemetry: {
        hr: "102 BPM (Takikardia Ringan)",
        temp: "36.2 °C (Normal)",
        zscore: "-1.8 SD (Risiko Gizi Kurang)"
      },
      hotspots: {
        hair: "Rambut teraba agak kering dan kasar, pertumbuhan folikel agak lambat karena sirkulasi oksigen berkurang.",
        eyes: "Konjungtiva palpebra sangat pucat akibat kadar hemoglobin yang rendah (10.2 g/dL). Sklera berwarna putih.",
        mouth: "Mukosa bibir tampak pucat kebiruan (cyanosis ringan). Lidah bersih namun agak pucat.",
        skin: "Wajah tampak pucat pasi (pallor) dengan ekspresi wajah lesu, lelah, dan mengantuk.",
        nails: "Bantalan kuku (nail bed) tampak pucat, kapiler lambat memerah (Capillary Refill Time > 2 detik).",
        abdomen: "Perut tampak rata, bising usus normal (8x/menit), tidak ada pembesaran hati/limpa."
      },
      anthropometry: {
        gender: "Remaja Perempuan",
        age: "16 Tahun (Kelas XI SMA)",
        bb: "43 kg",
        tb: "160 cm",
        imt: "16.8 kg/m²",
        status: "Gizi Kurang (Underweight)",
        details: "Z-score IMT/U berada pada kisaran -1.8 SD, menunjukkan status gizi kurang yang memerlukan intervensi gizi terencana."
      },
      clinical: {
        vitalSigns: { hr: "102 BPM", temp: "36.2 °C", lab: "Hemoglobin (Hb): 10.2 g/dL" },
        summary: "Konjungtiva pucat, rambut agak kering, pasien tampak lesu dan mudah lelah. Kadar Hb rendah menunjukkan anemia mikrositik hipokromik klasik.",
        organs: {
          hair: "Agak Kering & Kasar",
          eyes: "Konjungtiva Sangat Pucat",
          mouth: "Mukosa Bibir Pucat",
          skin: "Pucat Pasi & Lesu",
          nails: "Nail Bed Pucat & Rapuh",
          abdomen: "Dinding Rata (Normal)"
        }
      },
      dietary: {
        recall: {
          breakfast: "Teh manis hangat (1 gelas) dan roti tawar putih dengan sedikit margarin.",
          lunch: "Nasi putih (1.5 centong) dengan sedikit ayam goreng tepung. Jarang sekali mengonsumsi sayur.",
          dinner: "Nasi putih (1 centong) dengan telur dadar goreng.",
          snack: "Biskuit kemasan, keripik asin, dan minuman teh botol manis kemasan."
        },
        habits: "Sering melewatkan asupan sayuran dan buah-buahan. Memiliki kebiasaan minum teh manis hangat langsung setelah makan siang dan makan malam, yang menghambat penyerapan zat besi non-heme.",
        deficiencyAnalysis: "Rendah zat gizi mikro besi (Fe), asam folat, dan protein hewani berkualitas tinggi. Asupan zat penghambat besi (tanin dalam teh) sangat tinggi setelah makan berat."
      },
      visualState: {
        hairColor: "#22252a",
        skinColor: "#ece5d8", // Pale color
        abdomenScale: "scale(0.9)",
        eyeGlow: "rgba(255, 255, 255, 0.2)",
        paleFactor: 0.6, // Pale skin modifier
        modelScaleMultiplier: 0.98 // Regular height
      },
      correctDiagnosis: "anemia-gizi-kurang",
      correctTherapy: "iron-folate-diet"
    },
    mr: {
      id: "mr",
      name: "Siswa MR (Remaja Laki-Laki - 17 Tahun)",
      complaint: "Saya sering lapar terus walaupun baru saja makan kenyang. Kalau di kelas saya sering sekali mengantuk, gampang haus, dan sesekali perut saya rasanya tidak nyaman.",
      spokenIntro: "Saya sering lapar terus walaupun baru saja makan kenyang. Kalau di kelas saya sering sekali mengantuk, gampang haus, dan sesekali perut saya rasanya tidak nyaman.",
      hotspotVoices: {
        hair: "Rambut saya normal Dok, tebal dan tidak ada keluhan rontok.",
        eyes: "Mata saya kelihatan capek dan mengantuk sekali, Dok, karena sering menguap.",
        mouth: "Rongga mulut saya aman Dok, cuma gampang terasa kering dan haus.",
        skin: "Lipatan leher belakang saya berwarna kehitaman tebal dan kasar Dok, sulit hilang walaupun sudah digosok.",
        nails: "Kuku saya normal dan bersih Dok, tidak rapuh.",
        abdomen: "Perut saya buncit dan terasa begah, Dok, sesekali agak kembung setelah makan berminyak."
      },
      telemetry: {
        hr: "88 BPM (Normal)",
        temp: "36.8 °C (Normal)",
        zscore: "+2.6 SD (Obesitas)"
      },
      hotspots: {
        hair: "Rambut tampak sehat, tebal, hitam, berminyak di area kulit kepala karena sekresi sebum berlebih.",
        eyes: "Mata tampak lelah dan sayu akibat sering menguap (hipersomnia siang hari karena resistensi insulin).",
        mouth: "Rongga mulut normal, saliva agak kental karena kondisi dehidrasi ringan (gampang haus).",
        skin: "Adanya hiperpigmentasi kehitaman dengan tekstur menebal seperti beludru di lipatan leher belakang (Acanthosis Nigricans), tanda klasik resistensi insulin.",
        nails: "Kuku tangan normal, kuat, tidak ada kelainan bentuk.",
        abdomen: "Penumpukan jaringan adiposa berlebih di area abdomen (Obesitas Sentral), lingkar perut meningkat tajam."
      },
      anthropometry: {
        gender: "Remaja Laki-Laki",
        age: "17 Tahun (Kelas XII SMA)",
        bb: "88 kg",
        tb: "168 cm",
        imt: "31.2 kg/m²",
        status: "Obesitas",
        details: "Z-score IMT/U berada di atas +2 SD (yaitu +2.6 SD), menandakan status gizi obesitas signifikan pada usia remaja."
      },
      clinical: {
        vitalSigns: { hr: "88 BPM", temp: "36.8 °C", lab: "Glukosa Darah Puasa (GDP): 118 mg/dL" },
        summary: "Penumpukan lemak abdomen yang menonjol, adanya acanthosis nigricans pada leher, dan glukosa darah puasa prediabetes (118 mg/dL).",
        organs: {
          hair: "Normal & Berminyak",
          eyes: "Lelah / Mengantuk",
          mouth: "Mulut Kering (Polidipsia)",
          skin: "Acanthosis Nigricans Leher",
          nails: "Normal / Kuat",
          abdomen: "Penumpukan Lemak (Buncit)"
        }
      },
      dietary: {
        recall: {
          breakfast: "Sering melewatkan sarapan karena terburu-buru, hanya minum air es atau minuman botol manis.",
          lunch: "Makanan cepat saji berupa burger keju, kentang goreng ukuran besar, ayam goreng tepung, dan minuman bersoda (cola).",
          dinner: "Nasi goreng kambing porsi besar dengan telur mata sapi dan minum es teh manis.",
          snack: "Camilan tinggi garam (keripik kentang), kue manis, cokelat batangan, dan es kopi susu kekinian 3-4 kali sehari."
        },
        habits: "Pola makan tinggi kalori, lemak jenuh, dan gula sederhana (karbohidrat simpleks). Sangat jarang mengonsumsi buah segar maupun sayur-sayuran hijau.",
        deficiencyAnalysis: "Kelebihan asupan energi, lemak jenuh, dan gula sederhana secara ekstrem. Defisiensi serat makanan, vitamin C, kalsium, dan kalium."
      },
      visualState: {
        hairColor: "#111316",
        skinColor: "#dfbda7",
        abdomenScale: "scale(1.4) translate(-10px, -5px)", // Belly bulge
        eyeGlow: "rgba(242, 165, 26, 0.4)",
        paleFactor: 1.0,
        modelScaleMultiplier: 1.02 // Taller male representation
      },
      correctDiagnosis: "obesitas-prediabetes",
      correctTherapy: "limit-sugar-activity"
    },
    na: {
      id: "na",
      name: "Siswa NA (Remaja Perempuan - 15 Tahun)",
      complaint: "Mulut saya sering sekali terasa perih, sudut bibir pecah-pecah meradang, dan saya akhir-akhir ini malas makan karena mengunyah rasanya sakit.",
      spokenIntro: "Mulut saya sering sekali terasa perih, sudut bibir pecah-pecah meradang, dan saya akhir-akhir ini malas makan karena mengunyah rasanya sakit.",
      hotspotVoices: {
        hair: "Rambut saya kering kasar Dok, tapi tidak sampai merah rambut jagung.",
        eyes: "Mata saya normal Dok, cuma kelihatan kurang semangat.",
        mouth: "Sudut bibir saya pecah-pecah luka robek perih sekali, Dok, dan lidah saya rasanya panas merah meradang.",
        skin: "Kulit lengan dan kaki saya teraba sangat kering kasar bersisik.",
        nails: "Kuku saya normal Dok, tidak ada garis-garis atau cekungan.",
        abdomen: "Perut saya normal rata Dok, tidak buncit."
      },
      telemetry: {
        hr: "92 BPM",
        temp: "36.5 °C (Normal)",
        zscore: "-2.1 SD (Gizi Kurang)"
      },
      hotspots: {
        hair: "Rambut tampak kering, kusam, dan agak rapuh karena kekurangan mikronutrien pembentuk batang rambut.",
        eyes: "Mata normal, konjungtiva merah muda cerah, tidak ada xerosis kornea.",
        mouth: "Terdapat fisur kemerahan robek di kedua sudut bibir (Angular Cheilitis) dan permukaan lidah tampak memerah meradang (Glossitis ringan).",
        skin: "Kulit tampak sangat kering, kasar, bersisik halus di area ekstremitas akibat deplesi lipid kulit.",
        nails: "Kuku tangan normal, kuat, tidak ada kelainan koilonychia.",
        abdomen: "Dinding perut rata, normal, tidak ada asites atau pembesaran organ abdomen."
      },
      anthropometry: {
        gender: "Remaja Perempuan",
        age: "15 Tahun (Kelas X SMA)",
        bb: "40 kg",
        tb: "157 cm",
        imt: "16.2 kg/m²",
        status: "Gizi Kurang (Underweight)",
        details: "Z-score IMT/U berada pada kisaran -2.1 SD, mengindikasikan status gizi kurang akibat diet pembatasan kalori ekstrem tanpa pengawasan."
      },
      clinical: {
        vitalSigns: { hr: "92 BPM", temp: "36.5 °C", lab: "Profil Darah: Normal, tidak ada anemia berat" },
        summary: "Ditemukan angular cheilitis menonjol di sudut bibir, glossitis (lidah kemerahan), serta xerosis kutis (kulit sangat kering). Terlihat kurang bergairah.",
        organs: {
          hair: "Kering & Kusam",
          eyes: "Normal (Merah Muda)",
          mouth: "Angular Cheilitis & Lidah Merah",
          skin: "Kering Kasar & Bersisik",
          nails: "Normal / Rata",
          abdomen: "Dinding Rata (Normal)"
        }
      },
      dietary: {
        recall: {
          breakfast: "Hanya minum air hangat perasan lemon dan makan 1/2 apel merah kecil.",
          lunch: "Nasi putih sangat sedikit (1/2 centong) dengan tahu kukus polos tanpa bumbu garam.",
          dinner: "Sering melewatkan makan malam, atau hanya makan salad selada tanpa saus dressing.",
          snack: "Jarang mengonsumsi makanan selingan, sesekali teh hijau hangat tanpa gula."
        },
        habits: "Sedang menjalani diet mandiri yang sangat ketat untuk menurunkan berat badan dengan menghindari seluruh sumber protein hewani (daging, ayam, ikan, telur, susu) serta asupan karbohidrat kompleks.",
        deficiencyAnalysis: "Defisiensi berat vitamin B kompleks (B2/Riboflavin, B3/Niasin, B6, B12), zat besi, asam amino esensial, serta energi dan protein total."
      },
      visualState: {
        hairColor: "#1d1f24",
        skinColor: "#e0d3c5",
        abdomenScale: "scale(0.85)", // Underweight representation
        eyeGlow: "rgba(226, 87, 79, 0.35)",
        paleFactor: 0.85,
        modelScaleMultiplier: 0.96 // Standard teen girl
      },
      correctDiagnosis: "defisiensi-b-kompleks",
      correctTherapy: "balanced-diet-protein"
    },
    rs: {
      id: "rs",
      name: "Siswa RS (Remaja Laki-Laki - 16 Tahun)",
      complaint: "Saya merasa badan saya lebih pendek dan kecil sekali dibandingkan dengan teman-teman sekelas. Kalau pas pelajaran olahraga, fisik saya cepat capek sekali.",
      spokenIntro: "Saya merasa badan saya lebih pendek dan kecil sekali dibandingkan dengan teman-teman sekelas. Kalau pas pelajaran olahraga, fisik saya cepat capek sekali.",
      hotspotVoices: {
        hair: "Rambut saya agak kusam Dok, kasar dan warnanya hitam pudar.",
        eyes: "Mata saya normal Dok, cuma kelihatan sayu lesu.",
        mouth: "Rongga mulut saya normal Dok, tidak ada sariawan perih.",
        skin: "Kulit saya normal Dok, cuma terasa tipis dan kurang kenyal.",
        nails: "Kuku saya normal saja Dok, bersih.",
        abdomen: "Perut saya normal rata Dok, tidak buncit, tapi otot lengan saya kurus sekali."
      },
      telemetry: {
        hr: "96 BPM (Normal-Tinggi)",
        temp: "36.4 °C (Normal)",
        zscore: "-2.8 SD (Sangat Pendek / Stunted)"
      },
      hotspots: {
        hair: "Rambut tampak agak kusam, kasar, dan pigmen melanin tampak berkurang (hitam kecokelatan pudar).",
        eyes: "Mata tampak lesu dan sayu akibat kelelahan fisik saat beraktivitas berat.",
        mouth: "Mukosa rongga mulut normal, tidak ada kelainan angular cheilitis.",
        skin: "Turgor kulit agak lambat kembali, lapisan lemak subkutan tampak tipis sekali.",
        nails: "Kuku jari normal, tidak ada lekukan koilonychia.",
        abdomen: "Dinding abdomen rata, massa otot di perut dan ekstremitas (lengan/paha) sangat kurang (muscle wasting ringan)."
      },
      anthropometry: {
        gender: "Remaja Laki-Laki",
        age: "16 Tahun (Kelas XI SMA)",
        bb: "42 kg",
        tb: "148 cm",
        imt: "19.2 kg/m²",
        status: "Tinggi Badan Sangat Pendek (Stunted)",
        details: "Z-score TB/U berada di bawah -2 SD (yaitu -2.8 SD), menunjukkan gangguan linear growth (stunting kronis) meskipun IMT/U normal karena berat badan seimbang dengan tinggi badan yang pendek."
      },
      clinical: {
        vitalSigns: { hr: "96 BPM", temp: "36.4 °C", lab: "Analisis Hormonal: Hormon pertumbuhan (GH) normal-rendah" },
        summary: "Massa otot tampak kurang menonjol, tinggi badan tampak sangat pendek dibanding rata-rata usia 16 tahun, rambut agak kusam dan pasien tampak kurang aktif secara fisik.",
        organs: {
          hair: "Kusam & Kasar",
          eyes: "Lelah / Sayu",
          mouth: "Normal (Merah Muda)",
          skin: "Lemak Subkutan Tipis",
          nails: "Normal / Rata",
          abdomen: "Massa Otot Kurang"
        }
      },
      dietary: {
        recall: {
          breakfast: "Sering melewatkan sarapan pagi, langsung berangkat sekolah tanpa asupan kalori.",
          lunch: "Mi instan rebus (1 bungkus) ditambahkan sedikit nasi putih, tanpa sayur atau lauk protein seperti telur/daging.",
          dinner: "Nasi putih (1.5 centong) dengan kuah sayur sup bening (hanya kol dan wortel sedikit) tanpa lauk hewani.",
          snack: "Kerupuk asin gorengan, es lilin manis warna-warni di kantin sekolah."
        },
        habits: "Frekuensi makan tidak teratur (hanya makan 2 kali sehari siang dan malam). Sangat tinggi konsumsi karbohidrat olahan mi instan dan rendah konsumsi asam amino esensial hewani.",
        deficiencyAnalysis: "Defisiensi kronis energi dan protein total (kualitas protein hewani sangat buruk), defisiensi kalsium, zinc, dan vitamin D untuk pertumbuhan tulang linear."
      },
      visualState: {
        hairColor: "#2a2d34",
        skinColor: "#dccfb6",
        abdomenScale: "scale(0.95)",
        eyeGlow: "rgba(91, 134, 229, 0.25)",
        paleFactor: 0.9,
        modelScaleMultiplier: 0.88 // VISUALLY SHORTER model scale
      },
      correctDiagnosis: "gangguan-pertumbuhan",
      correctTherapy: "high-energy-protein"
    },
    ds: {
      id: "ds",
      name: "Siswa DS (Remaja Perempuan - 17 Tahun)",
      complaint: "Saya sering merasakan nyeri hebat di perut bawah saat menstruasi bulanan (dismenore). Nafsu makan saya kadang turun drastis, lesu, dan rasanya lemas.",
      spokenIntro: "Saya sering merasakan nyeri hebat di perut bawah saat menstruasi bulanan. Nafsu makan saya kadang turun drastis, lesu, dan rasanya lemas.",
      hotspotVoices: {
        hair: "Rambut saya normal Dok, bersih dan tidak ada ketombe.",
        eyes: "Kelopak mata bawah saya tampak sedikit pucat kalau ditarik, Dok.",
        mouth: "Bibir saya kering biasa Dok, tidak ada luka perih.",
        skin: "Kulit wajah saya kelihatan agak pucat terutama kalau lagi nyeri haid.",
        nails: "Kuku saya normal dan rata, Dok.",
        abdomen: "Perut bawah saya sering nyeri melilit seperti dicubit Dok saat menstruasi datang."
      },
      telemetry: {
        hr: "94 BPM",
        temp: "36.6 °C (Normal)",
        zscore: "-0.9 SD (Gizi Normal-Rendah)"
      },
      hotspots: {
        hair: "Rambut normal, bersih, berkilau alami, tidak rontok.",
        eyes: "Konjungtiva palpebra tampak sedikit pucat akibat deplesi simpanan besi (anemia ringan).",
        mouth: "Mukosa mulut normal merah muda cerah, tidak ada sariawan.",
        skin: "Kulit wajah tampak agak pucat kekuningan (mild pallor) dengan lingkaran hitam tipis di bawah mata.",
        nails: "Kuku normal, merah muda cerah, CRT normal (1.5 detik).",
        abdomen: "Perut tampak rata, teraba agak tegang di area suprapubik (nyeri kram perut haid / dismenore)."
      },
      anthropometry: {
        gender: "Remaja Perempuan",
        age: "17 Tahun (Kelas XII SMA)",
        bb: "47 kg",
        tb: "158 cm",
        imt: "18.8 kg/m²",
        status: "Status Gizi Normal (Normal-Rendah)",
        details: "Z-score IMT/U berada pada kisaran -0.9 SD, menunjukkan berat badan dalam rentang batas bawah normal yang masih aman namun berisiko."
      },
      clinical: {
        vitalSigns: { hr: "94 BPM", temp: "36.6 °C", lab: "Profil Hb: 11.4 g/dL (Anemia Ringan)" },
        summary: "Konjungtiva sedikit pucat, turgor kulit baik, keluhan nyeri kram perut bawah dominan pada masa menstruasi (dismenore) dengan lesu yang memicu penurunan asupan pangan.",
        organs: {
          hair: "Normal / Bersih",
          eyes: "Konjungtiva Sedikit Pucat",
          mouth: "Normal (Merah Muda)",
          skin: "Agak Pucat (Mild Pallor)",
          nails: "Normal / Rata",
          abdomen: "Nyeri Suprapubik (Tegang)"
        }
      },
      dietary: {
        recall: {
          breakfast: "Sering melewatkan sarapan karena mual di pagi hari, hanya minum air putih.",
          lunch: "Nasi putih (1 centong) dengan kerupuk, 1 buah tempe goreng, dan air mineral.",
          dinner: "Nasi putih (1 centong) dengan telur ceplok goreng dan sedikit kuah sayur bening bayam.",
          snack: "Cilok bumbu kacang, es teh manis, manis-manisan permen karet."
        },
        habits: "Sering melewatkan sarapan pagi, asupan makan saat haid sangat menurun drastis karena nyeri haid (dismenore). Kurang mengonsumsi pangan hewani kaya besi heme.",
        deficiencyAnalysis: "Asupan mikronutrien besi (Fe) heme dari daging/hati sangat tidak memadai. Kehilangan zat besi berkala saat menstruasi memicu anemia ringan."
      },
      visualState: {
        hairColor: "#1d1814",
        skinColor: "#ebdcc9",
        abdomenScale: "scale(1.0)",
        eyeGlow: "rgba(255, 255, 255, 0.3)",
        paleFactor: 0.75,
        modelScaleMultiplier: 0.99
      },
      correctDiagnosis: "anemia-ringan",
      correctTherapy: "iron-diet-monitoring"
    }
  };


  // State Management
  let currentCaseId = "ap";
  let activeHotspotId = null;
  let rotationAngle = 0;
  let zoomLevel = 1;
  let scannedHotspots = new Set();
  let verifiedStreak = 0;
  let casesDiagnosed = 0;

  // Three.js State Variables
  let scene, camera, renderer, controls, model;

  // Rigged Bones State
  let spineBone = null;
  let neckBone = null;
  let headBone = null;
  let leftShoulderBone = null;
  let rightShoulderBone = null;
  let leftArmBone = null;
  let rightArmBone = null;
  let leftForeArmBone = null;
  let rightForeArmBone = null;

  // Initial bind pose rotations stored from FBX load
  let initialSpineRot = new THREE.Euler();
  let initialNeckRot = new THREE.Euler();
  let initialHeadRot = new THREE.Euler();
  let initialLeftArmRot = new THREE.Euler();
  let initialRightArmRot = new THREE.Euler();
  let initialLeftForeArmRot = new THREE.Euler();
  let initialRightForeArmRot = new THREE.Euler();

  let animationState = "idle"; // "idle" | "speaking" | "focused"
  let voiceEnabled = true;
  let lastSpokenText = "";

  // Target bone angles for smooth trigonometry interpolation (Slerp-like)
  let targetSpineRotX = 0;
  let targetSpineRotY = 0;
  let targetSpineRotZ = 0;

  let targetNeckRotX = 0;
  let targetNeckRotY = 0;
  let targetNeckRotZ = 0;

  let targetHeadRotX = 0;
  let targetHeadRotY = 0;
  let targetHeadRotZ = 0;

  let targetLeftArmRotX = 0;
  let targetLeftArmRotY = 0;
  let targetLeftArmRotZ = 0;
  let targetRightArmRotX = 0;
  let targetRightArmRotY = 0;
  let targetRightArmRotZ = 0;

  // DOM Elements
  const caseButtons = document.querySelectorAll("[data-case]");
  const speechBubble = document.getElementById("patient-speech");
  const telemetryHr = document.getElementById("tele-hr");
  const telemetryTemp = document.getElementById("tele-temp");
  const telemetryZscore = document.getElementById("tele-zscore");
  const hotspots = document.querySelectorAll(".ar-hotspot");
  const targetReticle = document.getElementById("ar-reticle");
  const scanStatus = document.getElementById("scan-status-badge");
  const observationResults = document.getElementById("observation-results");
  const btnStartAR = document.getElementById("btn-start-ar-cam");
  const arCameraOverlay = document.getElementById("ar-cam-overlay");
  const cameraFeed = document.getElementById("camera-feed");
  const cameraPlaceholder = document.getElementById("camera-placeholder");
  
  // Custom speech synthesis controls
  const btnToggleVoice = document.getElementById("btn-toggle-voice");
  const btnReplaySpeech = document.getElementById("btn-replay-speech");

  // Quiz controls
  const diagSelect = document.getElementById("select-diagnosis");
  const therapySelect = document.getElementById("select-therapy");
  const btnVerify = document.getElementById("btn-verify-answer");
  const aiValidatorChat = document.getElementById("ai-chat-box");

  // Position Hotspots absolutely in front of the 3D canvas viewport
  const hotspotPositions = {
    hair: { top: "16%", left: "49%" },
    eyes: { top: "22%", left: "44%" },
    mouth: { top: "26%", left: "51%" },
    skin: { top: "40%", left: "37%" },
    abdomen: { top: "54%", left: "49%" },
    nails: { top: "56%", left: "62%" }
  };

  hotspots.forEach(hotspot => {
    const type = hotspot.dataset.hotspot;
    if (hotspotPositions[type]) {
      hotspot.style.position = "absolute";
      hotspot.style.top = hotspotPositions[type].top;
      hotspot.style.left = hotspotPositions[type].left;
    }
  });

  // Telemetry Heartbeat simulation
  let telemetryInterval = null;
  function startTelemetryPulse() {
    if (telemetryInterval) clearInterval(telemetryInterval);
    telemetryInterval = setInterval(() => {
      const activeCase = cases[currentCaseId];
      if (!activeCase) return;
      
      let baseHr = 80;
      let label = "BPM";
      if (currentCaseId === "ap") { baseHr = 100; label = "BPM (Takikardia Ringan)"; }
      else if (currentCaseId === "mr") { baseHr = 86; label = "BPM (Normal)"; }
      else if (currentCaseId === "na") { baseHr = 90; label = "BPM"; }
      else if (currentCaseId === "rs") { baseHr = 94; label = "BPM (Normal-Tinggi)"; }
      else if (currentCaseId === "ds") { baseHr = 92; label = "BPM"; }
      
      telemetryHr.textContent = (baseHr + Math.floor(Math.random() * 6)) + " " + label;
    }, 2000);
  }

  // Populate dynamic HUD tab views with case study telemetry & recall logs
  function populateHUDData(caseId) {
    const activeCase = cases[caseId];
    if (!activeCase) return;

    // 1. Tab Antropometri & Profil
    const anthroTab = document.getElementById("hud-content-profil");
    if (anthroTab) {
      anthroTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:4px;">PROFIL SISWA</div>
            <strong style="font-size:15px; color:var(--ink);">${activeCase.name}</strong>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">
              ${activeCase.anthropometry.gender} &bull; ${activeCase.anthropometry.age}
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="background:rgba(91,134,229,0.06); padding:10px; border-radius:10px; border:1px solid rgba(91,134,229,0.1); text-align:center;">
              <span style="font-size:9px; font-weight:800; color:#5b86e5; display:block;">BERAT BADAN</span>
              <strong style="font-size:20px; color:#5b86e5; font-family:monospace; display:block; margin:2px 0;">${activeCase.anthropometry.bb}</strong>
            </div>
            <div style="background:rgba(18,164,111,0.06); padding:10px; border-radius:10px; border:1px solid rgba(18,164,111,0.1); text-align:center;">
              <span style="font-size:9px; font-weight:800; color:#12a46f; display:block;">TINGGI BADAN</span>
              <strong style="font-size:20px; color:#12a46f; font-family:monospace; display:block; margin:2px 0;">${activeCase.anthropometry.tb}</strong>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-size:9px; font-weight:800; color:#64748b; font-family:monospace;">IMT / U</span>
                <strong style="font-size:14px; display:block; margin-top:2px; color:var(--ink);">${activeCase.anthropometry.imt}</strong>
              </div>
              <span style="font-size:11px; font-weight:900; background:rgba(226,87,79,0.12); color:#e2574f; border:1px solid rgba(226,87,79,0.25); padding:4px 10px; border-radius:99px; text-transform:uppercase; box-shadow:0 0 10px rgba(226,87,79,0.1);">
                ${activeCase.anthropometry.status}
              </span>
            </div>
            <p style="font-size:11.5px; color:var(--muted); margin:8px 0 0 0; line-height:1.45;">
              ${activeCase.anthropometry.details}
            </p>
          </div>
        </div>
      `;
    }

    // 2. Tab Pemeriksaan Klinis
    const clinicalTab = document.getElementById("hud-content-klinis");
    if (clinicalTab) {
      clinicalTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:6px;">TANDA VITAL & LAB</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <span style="font-size:9px; color:var(--muted); display:block;">PULSE RATE (NADI)</span>
                <strong id="tab-tele-hr" style="font-size:13px; color:var(--ink); font-family:monospace;">${activeCase.telemetry.hr}</strong>
              </div>
              <div>
                <span style="font-size:9px; color:var(--muted); display:block;">SUHU TUBUH</span>
                <strong style="font-size:13px; color:var(--ink); font-family:monospace;">${activeCase.clinical.vitalSigns.temp}</strong>
              </div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">
              <span style="font-size:9px; color:var(--muted); display:block;">HASIL PEMERIKSAAN LAB</span>
              <strong style="font-size:13.5px; color:#2ee59d; font-family:monospace;">${activeCase.clinical.vitalSigns.lab}</strong>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:6px;">RINGKASAN PEMERIKSAAN FISIK</div>
            <table style="width:100%; font-size:11.5px; border-collapse:collapse;" class="hud-clinical-table">
              <tbody>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 0; color:var(--muted); font-weight:600; width:95px;">💇 RAMBUT</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.hair}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 0; color:var(--muted); font-weight:600;">👁️ MATA</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.eyes}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 0; color:var(--muted); font-weight:600;">👄 MULUT / LIDAH</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.mouth}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 0; color:var(--muted); font-weight:600;">💪 KULIT (INTEG)</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.skin}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 0; color:var(--muted); font-weight:600;">💅 KUKU JARI</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.nails}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:var(--muted); font-weight:600;">🤰 ABDOMEN</td>
                  <td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${activeCase.clinical.organs.abdomen}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 3. Tab Dietary Recall
    const dietaryTab = document.getElementById("hud-content-dietary");
    if (dietaryTab) {
      dietaryTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:8px;">DIETARY RECALL 24-JAM</div>
            <div class="dietary-timeline" style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; gap:10px; font-size:11px; align-items:start;">
                <span style="color:#2ee59d; font-family:monospace; font-weight:900; background:rgba(46,229,157,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">SARAPAN</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${activeCase.dietary.recall.breakfast}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#5b86e5; font-family:monospace; font-weight:900; background:rgba(91,134,229,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">SIANG</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${activeCase.dietary.recall.lunch}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#f2a51a; font-family:monospace; font-weight:900; background:rgba(242,165,26,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">MALAM</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${activeCase.dietary.recall.dinner}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#e2574f; font-family:monospace; font-weight:900; background:rgba(226,87,79,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">SELINGAN</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${activeCase.dietary.recall.snack}</span>
              </div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:4px;">KEBIASAAN & DIAGNOSIS DIET</div>
            <div style="color:var(--muted); line-height:1.45; margin-bottom:8px;">
              <strong>Pola Kebiasaan:</strong> ${activeCase.dietary.habits}
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; color:#ffb732; font-weight:700;">
              ⚠️ Analisis Defisiensi: <span style="font-weight:600; color:var(--ink); font-size:11px;">${activeCase.dietary.deficiencyAnalysis}</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Load Case Details
  function loadCase(caseId, shouldSpeak = false) {
    currentCaseId = caseId;
    activeHotspotId = null;
    scannedHotspots.clear();
    resetBoneTargets();
    animationState = "idle";
    
    const activeCase = cases[caseId];
    if (!activeCase) return;
    
    // Update active tab styles
    caseButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.case === caseId);
    });

    // Update subjective speech bubble text
    speechBubble.querySelector("p").textContent = `"${activeCase.spokenIntro}"`;
    
    // Set lastSpokenText so the "Putar Suara" button works immediately even if silent on load
    lastSpokenText = activeCase.spokenIntro;
    
    // Play spoken intro narrative
    if (shouldSpeak) {
      speakText(activeCase.spokenIntro);
    }

    // Reset Observation hud
    observationResults.innerHTML = `
      <div class="ai-empty-state" style="padding: 1.5rem 0;">
        <i style="font-style: normal; font-size: 20px; font-weight: bold; color: var(--green);">◈</i>
        <span>Silakan klik hotspot sirkuler berkedip pada tubuh pasien untuk memicu pemindaian visual AR.</span>
      </div>
    `;

    // Reset AI panel
    aiValidatorChat.innerHTML = `
      <div class="ai-empty-state">
        <i style="font-style: normal; font-size: 20px; font-weight: bold; color: var(--green);">✦</i>
        <span>Pilihlah tebakan diagnosis penyakit dan tatalaksana di atas, lalu minta validasi AI untuk memeriksa ketepatan jawaban Anda.</span>
      </div>
    `;
    
    // Populate dynamic tab data
    populateHUDData(caseId);

    // Update fixed telemetry values
    telemetryTemp.textContent = activeCase.telemetry.temp;
    telemetryZscore.textContent = activeCase.telemetry.zscore;
    startTelemetryPulse();

    // Hide target reticle
    targetReticle.style.display = "none";

    // Set interactive hot spot warning colors
    hotspots.forEach(hotspot => {
      hotspot.classList.remove("active");
      const type = hotspot.dataset.hotspot;
      
      hotspot.className = "ar-hotspot"; // Reset
      if (activeCase.hotspots[type].toLowerCase().includes("normal")) {
        hotspot.classList.add("info-cyan");
      } else if (activeCase.hotspots[type].toLowerCase().includes("sedikit") || activeCase.hotspots[type].toLowerCase().includes("agak")) {
        hotspot.classList.add("warn-yellow");
      } else {
        hotspot.classList.add("warn-red");
      }
    });

    // Set visual state values on the 3D model (Skeletal transformations & height transformations)
    if (model) {
      // 1. Dynamic bone scaling for abdomen
      if (spineBone) {
        if (caseId === "mr") {
          // Obesity bulge
          spineBone.scale.set(1.15, 1.15, 1.35);
        } else if (caseId === "na" || caseId === "ap") {
          // Thin structure
          spineBone.scale.set(0.9, 0.9, 0.9);
        } else {
          // Standard
          spineBone.scale.set(1.0, 1.0, 1.0);
        }
      }
      
      // 2. Taller or shorter overall model scale
      if (model.baseScale) {
        const mult = activeCase.visualState.modelScaleMultiplier || 1.0;
        model.scale.setScalar(model.baseScale * mult);
      }
    }

    // Update the 3D model lighting colors for the medical case study
    updateCaseLights(caseId);

    // Reset dropdown values
    diagSelect.selectedIndex = 0;
    therapySelect.selectedIndex = 0;
    
    // Reset scanner badge
    if (renderer) {
      scanStatus.textContent = "STANDBY / HUD READY";
      scanStatus.className = "ar-status-badge";
    }
  }

  // Update Three.js holographic colors dynamically based on case study
  function updateCaseLights(caseId) {
    if (!scene) return;
    
    let accentColor = 0x5b86e5; // Soft clinical blue
    let emissiveColor = 0x0a101d;
    
    if (caseId === "ap") {
      accentColor = 0xa5f3fc;
      emissiveColor = 0x0a1d1f; // Pale blue / Anemic
    } else if (caseId === "mr") {
      accentColor = 0xf2a51a;
      emissiveColor = 0x1d150a; // Obese/ Prediabetes orange
    } else if (caseId === "na") {
      accentColor = 0xe2574f;
      emissiveColor = 0x1d0a0a; // Deficiency red
    } else if (caseId === "rs") {
      accentColor = 0x5b86e5;
      emissiveColor = 0x0a101d; // Growth blue
    } else if (caseId === "ds") {
      accentColor = 0x38bdf8;
      emissiveColor = 0x071e22; // Mild anemia soft cyan
    }
    
    if (model) {
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          try {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => {
                if (m && m.emissive && typeof m.emissive.setHex === 'function') {
                  m.emissive.setHex(emissiveColor);
                }
              });
            } else {
              if (child.material.emissive && typeof child.material.emissive.setHex === 'function') {
                child.material.emissive.setHex(emissiveColor);
              }
            }
          } catch (e) {
            console.warn("Could not set emissive color on mesh child:", e);
          }
          
          child.children.forEach(c => {
            if (c.isLineSegments && c.material) {
              c.material.color.setHex(accentColor);
            }
          });
        }
      });
    }
    
    scene.traverse((child) => {
      if (child.isDirectionalLight && child.position.z < 0) {
        child.color.setHex(accentColor);
      }
      if (child.isSpotLight) {
        child.color.setHex(accentColor);
      }
    });
  }


  // Initialize Three.js WebGL 3D Holographic Rendering Environment
  function init3D() {
    const container = document.getElementById("ar-3d-canvas-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    // Create Scene with futuristic hospital background texture
    scene = new THREE.Scene();
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("assets/img/hospital_background.png", (texture) => {
      scene.background = texture;
      scene.fog = new THREE.FogExp2(0x0a111e, 0.01);
    }, undefined, (err) => {
      console.error("Failed to load hospital background texture:", err);
      scene.background = new THREE.Color(0xf1f5f9);
      scene.fog = new THREE.FogExp2(0xf1f5f9, 0.015);
    });
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);
    
    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Interactive OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    
    // Ambient & Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const dirLightFront = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLightFront.position.set(2, 4, 5);
    scene.add(dirLightFront);
    
    const dirLightBack = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLightBack.position.set(-2, 2, -3);
    scene.add(dirLightBack);
    
    const spotLight = new THREE.SpotLight(0xffffff, 2.0);
    spotLight.position.set(0, 5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);
    
    // High-end medical room clean grid floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -1.4;
    scene.add(gridHelper);
    
    // Load the Rigged FBX model from RenderPeople
    const loader = new THREE.FBXLoader();
    scanStatus.textContent = "LOADING 3D PATIENT MODEL (0%)...";
    scanStatus.className = "ar-status-badge scanning";
    
    loader.load(
      "assets/models/rp_carla_rigged_001_yup_a.fbx",
      function (object) {
        model = object;
        
        // Auto-scale and center object using box dimensions
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.7 / maxDim;
        object.scale.setScalar(scale);
        object.baseScale = scale; // Save the base scale!
        
        object.position.x = -center.x * scale;
        object.position.y = -box.min.y * scale - 1.4;
        object.position.z = -center.z * scale;
        
        object.basePositionY = object.position.y; // Keep track of baseline Y coordinates
        
        // Resolve bones for skeletal rigging control using highly inclusive criteria
        window.allFBXNodes = [];
        object.traverse((child) => {
          window.allFBXNodes.push(`${child.name} (${child.type || 'Object3D'})`);
          
          // Use exact matching based on the last part of the node name (stripping colons/namespaces)
          const rawName = child.name;
          const cleanName = rawName.substring(rawName.lastIndexOf(':') + 1).toLowerCase();
          
          if (cleanName === "head" && !headBone) {
            headBone = child;
            initialHeadRot.copy(child.rotation);
          } else if (cleanName === "neck" && !neckBone) {
            neckBone = child;
            initialNeckRot.copy(child.rotation);
          } else if ((cleanName === "spine_01" || cleanName === "spine") && !spineBone) {
            spineBone = child;
            initialSpineRot.copy(child.rotation);
          } else if (cleanName === "shoulder_l" && !leftShoulderBone) {
            leftShoulderBone = child;
          } else if (cleanName === "shoulder_r" && !rightShoulderBone) {
            rightShoulderBone = child;
          } else if (cleanName === "upperarm_l" && !leftArmBone) {
            leftArmBone = child;
            initialLeftArmRot.copy(child.rotation);
          } else if (cleanName === "upperarm_r" && !rightArmBone) {
            rightArmBone = child;
            initialRightArmRot.copy(child.rotation);
          } else if (cleanName === "lowerarm_l" && !leftForeArmBone) {
            leftForeArmBone = child;
            initialLeftForeArmRot.copy(child.rotation);
          } else if (cleanName === "lowerarm_r" && !rightForeArmBone) {
            rightForeArmBone = child;
            initialRightForeArmRot.copy(child.rotation);
          }

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(object);
        
        scanStatus.textContent = "HOLOGRAPHIC MESH READY";
        scanStatus.className = "ar-status-badge";
        
        // VISUAL ON-SCREEN DEBUG LOGGER FOR USER DIAGNOSTICS - DISABLED
        window.updateDebugOverlay = () => {};

        console.log("NutriVerse AR - Resolved Bones:", {
          headBone: headBone ? headBone.name : "NOT FOUND",
          neckBone: neckBone ? neckBone.name : "NOT FOUND",
          spineBone: spineBone ? spineBone.name : "NOT FOUND",
          leftShoulderBone: leftShoulderBone ? leftShoulderBone.name : "NOT FOUND",
          rightShoulderBone: rightShoulderBone ? rightShoulderBone.name : "NOT FOUND",
          leftArmBone: leftArmBone ? leftArmBone.name : "NOT FOUND",
          rightArmBone: rightArmBone ? rightArmBone.name : "NOT FOUND",
          leftForeArmBone: leftForeArmBone ? leftForeArmBone.name : "NOT FOUND",
          rightForeArmBone: rightForeArmBone ? rightForeArmBone.name : "NOT FOUND",
        });
        
        updateCaseLights(currentCaseId);
        resetBoneTargets();
      },
      function (xhr) {
        if (xhr.total > 0) {
          const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
          scanStatus.textContent = `LOADING 3D PATIENT MODEL (${percentComplete}%)...`;
        } else {
          scanStatus.textContent = "LOADING 3D PATIENT MODEL...";
        }
      },
      function (error) {
        console.error("Error loading FBX model:", error);
        scanStatus.textContent = "3D MESH ERROR / FALLBACK LOADED";
        scanStatus.className = "ar-status-badge error";
        
        // Fallback volumetric grid shape
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0x12a46f, wireframe: true });
        const fallbackMesh = new THREE.Mesh(geometry, material);
        fallbackMesh.position.y = -0.15;
        fallbackMesh.isCylinderFallback = true; // Mark as fallback cylinder
        scene.add(fallbackMesh);
        model = fallbackMesh;
      }
    );
    
    // Renderer Render Tick loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      
      try {
        const delta = clock.getDelta();
        controls.update();
        
        const time = clock.getElapsedTime();
        
        // Dynamic game-like rigged skeletal animations
        if (model) {
          // Slow aesthetic backdrop rotation
          model.rotation.y += 0.08 * delta;

          // Realistic standing sway: no hovering/floating offset, feet firmly on grid
          const hoverOffsetY = 0; // Disable floating
          const swayAngleX = Math.sin(time * 1.0) * 0.015;   // Very subtle sway
          const swayAngleZ = Math.cos(time * 1.4) * 0.012;  // Very subtle sway

          if (model.isCylinderFallback) {
            model.position.y = -0.15;
            model.rotation.x = swayAngleX;
            model.rotation.z = swayAngleZ;
          } else {
            // Anchor standing Y position strictly to the calculated baseline basePositionY
            if (model.basePositionY !== undefined) {
              model.position.y = model.basePositionY;
            } else {
              model.position.y = -1.4;
            }
            // Add extremely subtle sway to make the patient feel alive
            model.rotation.x = swayAngleX * 0.6;
            model.rotation.z = swayAngleZ * 0.6;
          }

          // Apply dynamic bone rotations based on time, speech, or focus gestures
          if (spineBone || neckBone || headBone || leftArmBone || rightArmBone) {
            let breathCycle = Math.sin(time * 1.8);
            let breathCycleSlow = Math.cos(time * 0.9);
            
            if (animationState === "idle") {
              // Natural, visible deep-breathing idle sways
              targetSpineRotX = initialSpineRot.x + breathCycle * 0.04;    // ~2.3 degrees forward/back
              targetSpineRotY = initialSpineRot.y + breathCycleSlow * 0.03; // ~1.7 degrees twist
              targetSpineRotZ = initialSpineRot.z + breathCycle * 0.015;
              
              targetNeckRotX = initialNeckRot.x + breathCycle * -0.025;
              targetNeckRotY = initialNeckRot.y + breathCycleSlow * -0.02;
              
              targetHeadRotX = initialHeadRot.x + breathCycle * -0.02;
              targetHeadRotY = initialHeadRot.y + breathCycleSlow * 0.04;
              
              // Very subtle breathing sways for the arms: sways out and in
              targetLeftArmRotZ = initialLeftArmRot.z + breathCycle * 0.02;
              targetRightArmRotZ = initialRightArmRot.z - breathCycle * 0.02;
              targetLeftArmRotX = initialLeftArmRot.x + breathCycleSlow * 0.02;
              targetRightArmRotX = initialRightArmRot.x - breathCycleSlow * 0.02;
            } else if (animationState === "speaking") {
              // Active responsive nodding and natural hand movements to mimic speaking
              let speakCycleX = Math.sin(time * 9.0) * 0.06;
              let speakCycleY = Math.cos(time * 5.0) * 0.05;
              let handGesture = Math.sin(time * 2.8) * 0.15;
              
              targetSpineRotX = initialSpineRot.x + breathCycle * 0.03 + speakCycleX * 0.2;
              targetNeckRotX = initialNeckRot.x + breathCycle * -0.02 + speakCycleX * 0.3;
              targetHeadRotX = initialHeadRot.x + speakCycleX * 1.3;
              targetHeadRotY = initialHeadRot.y + speakCycleY * 1.0;
              
              // Symmetrical hand gestures raising up and forward slightly relative to initial A-pose
              targetLeftArmRotZ = initialLeftArmRot.z - 0.3 - handGesture * 0.15;
              targetRightArmRotZ = initialRightArmRot.z - 0.3 + handGesture * 0.15;
              targetLeftArmRotX = initialLeftArmRot.x + 0.15 + handGesture * 0.3;
              targetRightArmRotX = initialRightArmRot.x + 0.15 - handGesture * 0.3;
            }

            // Interpolate current bone angles to target rotations smoothly (Damped Lerp)
            if (spineBone && spineBone.rotation) {
              spineBone.rotation.x += (targetSpineRotX - spineBone.rotation.x) * 0.08;
              spineBone.rotation.y += (targetSpineRotY - spineBone.rotation.y) * 0.08;
              spineBone.rotation.z += (targetSpineRotZ - spineBone.rotation.z) * 0.08;
            }
            if (neckBone && neckBone.rotation) {
              neckBone.rotation.x += (targetNeckRotX - neckBone.rotation.x) * 0.08;
              neckBone.rotation.y += (targetNeckRotY - neckBone.rotation.y) * 0.08;
              neckBone.rotation.z += (targetNeckRotZ - neckBone.rotation.z) * 0.08;
            }
            if (headBone && headBone.rotation) {
              headBone.rotation.x += (targetHeadRotX - headBone.rotation.x) * 0.08;
              headBone.rotation.y += (targetHeadRotY - headBone.rotation.y) * 0.08;
              headBone.rotation.z += (targetHeadRotZ - headBone.rotation.z) * 0.08;
            }
            if (leftArmBone && leftArmBone.rotation) {
              leftArmBone.rotation.z += (targetLeftArmRotZ - leftArmBone.rotation.z) * 0.08;
              leftArmBone.rotation.x += (targetLeftArmRotX - leftArmBone.rotation.x) * 0.08;
              if (leftArmBone.rotation.y !== undefined) {
                leftArmBone.rotation.y += (targetLeftArmRotY - leftArmBone.rotation.y) * 0.08;
              }
            }
            if (rightArmBone && rightArmBone.rotation) {
              rightArmBone.rotation.z += (targetRightArmRotZ - rightArmBone.rotation.z) * 0.08;
              rightArmBone.rotation.x += (targetRightArmRotX - rightArmBone.rotation.x) * 0.08;
              if (rightArmBone.rotation.y !== undefined) {
                rightArmBone.rotation.y += (targetRightArmRotY - rightArmBone.rotation.y) * 0.08;
              }
            }
          }
        }
        
        if (typeof window.updateDebugOverlay === "function") {
          window.updateDebugOverlay();
        }
        
        renderer.render(scene, camera);
      } catch (err) {
        console.error("Three.js Animation loop error caught defensively:", err);
        const errSpan = document.getElementById("ar-debug-errors");
        if (errSpan) {
          errSpan.innerHTML = err.message || String(err);
        }
      }
    }
    animate();
    
    window.addEventListener("resize", onWindowResize);
  }
  
  function onWindowResize() {
    if (!camera || !renderer) return;
    const container = document.getElementById("ar-3d-canvas-container");
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Indonesian TTS Synthesis Engine (Web Speech API)
  const synth = window.speechSynthesis;
  let activeUtterance = null;

  function speakText(text) {
    if (!synth) return;
    
    synth.cancel();
    lastSpokenText = text;
    
    if (!voiceEnabled) {
      triggerSpeakingUI(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synth.getVoices();
    const indonesianVoice = voices.find(v => v.lang.includes("id-ID") || v.lang.includes("id_ID"));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }
    
    // Vocal styling fits kid/teen patient archetypes
    utterance.rate = 0.95; // highly clinical & readable pacing
    utterance.pitch = 1.06; // compassionate tone
    
    utterance.onstart = () => {
      triggerSpeakingUI(true);
    };
    
    utterance.onend = () => {
      triggerSpeakingUI(false);
    };
    
    utterance.onerror = () => {
      triggerSpeakingUI(false);
    };
    
    activeUtterance = utterance;
    synth.speak(utterance);
  }

  function triggerSpeakingUI(isSpeaking) {
    const speechBubble = document.getElementById("patient-speech");
    const waveform = document.getElementById("voice-waveform");
    
    if (isSpeaking) {
      speechBubble?.classList.add("speaking-pulse");
      if (waveform) waveform.style.display = "flex";
      animationState = "speaking";
    } else {
      speechBubble?.classList.remove("speaking-pulse");
      if (waveform) waveform.style.display = "none";
      animationState = "idle";
      resetBoneTargets();
    }
  }

  // Reset bone angles to neutral breathing pose
  function resetBoneTargets() {
    targetSpineRotX = initialSpineRot.x;
    targetSpineRotY = initialSpineRot.y;
    targetSpineRotZ = initialSpineRot.z;
    
    targetNeckRotX = initialNeckRot.x;
    targetNeckRotY = initialNeckRot.y;
    targetNeckRotZ = initialNeckRot.z;
    
    targetHeadRotX = initialHeadRot.x;
    targetHeadRotY = initialHeadRot.y;
    targetHeadRotZ = initialHeadRot.z;
    
    targetLeftArmRotX = initialLeftArmRot.x;
    targetLeftArmRotY = initialLeftArmRot.y;
    targetLeftArmRotZ = initialLeftArmRot.z;
    
    targetRightArmRotX = initialRightArmRot.x;
    targetRightArmRotY = initialRightArmRot.y;
    targetRightArmRotZ = initialRightArmRot.z;
  }

  // Rotate and gesture bones to point/draw attention to scanned clinical nodes
  function applyInteractiveGesture(type) {
    resetBoneTargets();
    animationState = "focused";
    
    if (type === "hair") {
      targetNeckRotX = initialNeckRot.x + 0.2;     // Tilt head down distinctly
      targetHeadRotX = initialHeadRot.x + 0.25;
      targetLeftArmRotZ = initialLeftArmRot.z + 0.05;  // Bring arms slightly closer to sides
      targetRightArmRotZ = initialRightArmRot.z - 0.05;
    } else if (type === "eyes") {
      targetNeckRotY = initialNeckRot.y - 0.18;   // Turn neck and head slightly to camera
      targetHeadRotY = initialHeadRot.y - 0.28;
      targetHeadRotX = initialHeadRot.x + 0.06;
    } else if (type === "mouth") {
      targetNeckRotX = initialNeckRot.x + 0.14;    // Tilt head up slightly to reveal mouth/tongue
      targetHeadRotX = initialHeadRot.x + 0.18;
      targetHeadRotY = initialHeadRot.y + 0.1;
    } else if (type === "abdomen") {
      targetSpineRotX = initialSpineRot.x + 0.35;   // Lean torso forward distinctly
      targetNeckRotX = initialNeckRot.x - 0.12;
      targetHeadRotX = initialHeadRot.x + 0.18;
      targetLeftArmRotZ = initialLeftArmRot.z - 0.2;  // Move left/right arms out of the way
      targetRightArmRotZ = initialRightArmRot.z - 0.2;
    } else if (type === "skin") {
      targetSpineRotY = initialSpineRot.y - 0.4;   // Rotate torso to reveal lateral thigh/skin
      targetNeckRotY = initialNeckRot.y + 0.18;
      targetLeftArmRotZ = initialLeftArmRot.z - 0.6;  // Lift left arm up slightly to display skin area, not too high
      targetLeftArmRotX = initialLeftArmRot.x + 0.25;
    } else if (type === "nails") {
      targetSpineRotY = initialSpineRot.y + 0.3;    // Twist torso slightly
      targetRightArmRotZ = initialRightArmRot.z - 0.6; // Lift right arm/hand up slightly to display fingernails, not too high
      targetRightArmRotX = initialRightArmRot.x + 0.25;
      targetRightArmRotY = initialRightArmRot.y + 0.15;
    }
  }

  // Futuristic Sub-Tab Switcher Event Listeners
  const tabButtons = document.querySelectorAll(".hud-tab-btn");
  const tabPanels = document.querySelectorAll(".hud-tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      forceSwitchTab(targetTab);
    });
  });

  function forceSwitchTab(targetTab) {
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === targetTab));
    tabPanels.forEach(p => {
      if (p.id === `hud-content-${targetTab}`) {
        p.style.display = "block";
      } else {
        p.style.display = "none";
      }
    });
  }

  // Hotspot Click Scanning Loop
  hotspots.forEach(hotspot => {
    hotspot.addEventListener("click", () => {
      const type = hotspot.dataset.hotspot;
      
      // Auto switch active tab to Scanner HUD so user sees scanning process
      forceSwitchTab("scanner");

      // Deactivate other hotspots
      hotspots.forEach(h => h.classList.remove("active"));
      hotspot.classList.add("active");
      activeHotspotId = type;

      // Position Glowing Reticle over hotspot
      const parentRect = hotspot.parentElement.getBoundingClientRect();
      const childRect = hotspot.getBoundingClientRect();
      
      const x = childRect.left - parentRect.left + (childRect.width / 2);
      const y = childRect.top - parentRect.top + (childRect.height / 2);

      targetReticle.style.left = `${x}px`;
      targetReticle.style.top = `${y}px`;
      targetReticle.style.display = "block";

      // Zoom model slightly towards the clicked hotspot area and trigger bone gestures immediately!
      applyInteractiveZoom(type);
      applyInteractiveGesture(type);

      // Trigger AR scanning HUD feedback
      scanStatus.textContent = "ANALYSIS IN PROGRESS...";
      scanStatus.className = "ar-status-badge scanning";

      // Mock scanning telemetry load
      observationResults.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.8rem; padding: 1rem 0;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #ffb732;">
            <span>AR BIO-SCANNER ACTIVE</span>
            <span id="scan-pct">0%</span>
          </div>
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow:hidden;">
            <div id="scan-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffb732, #2ee59d); transition: width 0.05s linear; box-shadow: 0 0 10px #2ee59d;"></div>
          </div>
          <span style="font-size: 11px; color: #64748b; text-align: center; font-family: monospace;">ANALYZING CELLULAR METABOLISM NODE...</span>
        </div>
      `;

      let pct = 0;
      const interval = setInterval(() => {
        pct += 5;
        const bar = document.getElementById("scan-bar");
        const pctText = document.getElementById("scan-pct");
        
        if (bar) bar.style.width = `${pct}%`;
        if (pctText) pctText.textContent = `${pct}%`;

        if (pct >= 100) {
          clearInterval(interval);
          scannedHotspots.add(type);
          
          scanStatus.textContent = "SCAN COMPLETE / DIAG DATA ACTIVE";
          scanStatus.className = "ar-status-badge";

          // Display visual clinical observation report
          const activeCase = cases[currentCaseId];
          const nodeName = hotspot.querySelector(".ar-hotspot-label").textContent;
          const observationContent = activeCase.hotspots[type];

          // Trigger Indonesian first-person speech and dialog bubble sync
          const symptomDialog = activeCase.hotspotVoices[type];
          speechBubble.querySelector("p").textContent = `"${symptomDialog}"`;
          speakText(symptomDialog);

          // Check if severe or normal warning color tag
          let tagClass = "tag";
          if (observationContent.toLowerCase().includes("normal")) {
            tagClass = "tag blue";
          } else if (observationContent.toLowerCase().includes("sedikit") || observationContent.toLowerCase().includes("agak")) {
            tagClass = "tag gold";
          } else {
            tagClass = "tag coral";
          }

          observationResults.innerHTML = `
            <div class="ai-critique-box">
              <div class="ai-critique-header success">
                <span class="ai-critique-badge success">NODE DETECTED</span>
                <strong>NODE PEMERIKSAAN: ${nodeName}</strong>
              </div>
              <p class="ai-critique-text" style="color: var(--ink); font-weight: 700; font-size: 13.5px;">
                ${observationContent}
              </p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
                <div class="tag-row" style="margin-top:0;">
                  <span class="${tagClass}">Skrining Visual AR</span>
                  <span class="tag">Node ${type.toUpperCase()}</span>
                </div>
                <span style="font-size: 11px; color:#64748b; font-family:monospace;">STREAK SCAN: ${scannedHotspots.size}/6</span>
              </div>
            </div>
          `;
        }
      }, 40);
    });
  });

  // Dynamic camera focus zooming based on scanned diagnostic hotspot coordinates in 3D Space
  function applyInteractiveZoom(type) {
    if (!camera || !controls) return;
    
    let targetY = 0;
    let targetZ = 4.5;
    let targetX = 0;
    
    if (type === "hair") {
      targetY = 0.9;
      targetZ = 2.0;
    } else if (type === "eyes") {
      targetY = 0.75;
      targetZ = 1.8;
      targetX = -0.15;
    } else if (type === "mouth") {
      targetY = 0.65;
      targetZ = 1.8;
      targetX = 0.05;
    } else if (type === "abdomen") {
      targetY = -0.15;
      targetZ = 2.2;
    } else if (type === "skin") {
      targetY = 0.15;
      targetZ = 2.3;
      targetX = -0.3;
    } else if (type === "nails") {
      targetY = -0.25;
      targetZ = 1.9;
      targetX = 0.45;
    }
    
    camera.position.set(targetX, targetY, targetZ);
    controls.target.set(targetX, targetY, 0);
  }

  // Interactive 3D Navigation Controls
  document.getElementById("btn-rotate-l")?.addEventListener("click", () => {
    if (model) model.rotation.y -= 0.25;
  });

  document.getElementById("btn-rotate-r")?.addEventListener("click", () => {
    if (model) model.rotation.y += 0.25;
  });

  document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
    if (camera) camera.position.z = Math.max(1.2, camera.position.z - 0.4);
  });

  document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
    if (camera) camera.position.z = Math.min(8.0, camera.position.z + 0.4);
  });

  document.getElementById("btn-reset-view")?.addEventListener("click", () => {
    if (model) {
      model.rotation.set(0, 0, 0);
      // Reset skeletal transformations
      if (spineBone) {
        if (currentCaseId === "mr") spineBone.scale.set(1.15, 1.15, 1.35);
        else if (currentCaseId === "na" || currentCaseId === "ap") spineBone.scale.set(0.9, 0.9, 0.9);
        else spineBone.scale.set(1.0, 1.0, 1.0);
      }
    }
    if (camera) camera.position.set(0, 0.5, 4.5);
    if (controls) controls.target.set(0, 0, 0);
    
    resetBoneTargets();
    animationState = "idle";
    activeHotspotId = null;
    targetReticle.style.display = "none";
    hotspots.forEach(h => h.classList.remove("active"));
    scanStatus.textContent = "VIEWPORT RESET / STANDBY";
    scanStatus.className = "ar-status-badge";
    forceSwitchTab("profil");
  });

  // Voice Controls Event Binding
  btnToggleVoice?.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    if (voiceEnabled) {
      btnToggleVoice.innerHTML = "🔊 SUARA: AKTIF";
      btnToggleVoice.style.background = "rgba(91, 134, 229, 0.15)";
      btnToggleVoice.style.color = "#5b86e5";
      btnToggleVoice.style.borderColor = "rgba(91, 134, 229, 0.3)";
      if (lastSpokenText) speakText(lastSpokenText);
    } else {
      btnToggleVoice.innerHTML = "🔇 SUARA: SENYAP";
      btnToggleVoice.style.background = "rgba(100, 116, 139, 0.15)";
      btnToggleVoice.style.color = "#64748b";
      btnToggleVoice.style.borderColor = "rgba(100, 116, 139, 0.3)";
      synth.cancel();
      triggerSpeakingUI(false);
    }
  });

  btnReplaySpeech?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (lastSpokenText) speakText(lastSpokenText);
  });

  // Support voice list updates asynchronously (Chrome bug prevention)
  if (synth) {
    synth.onvoiceschanged = () => {
      // Refresh voice profile silently
    };
  }

  // AI Validator Engine (Validasi Jawaban User untuk 5 Kasus Siswa SMA)
  btnVerify?.addEventListener("click", () => {
    const userDiag = diagSelect.value;
    const userTherapy = therapySelect.value;

    if (!userDiag) {
      alert("Silakan pilih Tebakan Penyakit / Diagnosis Anda terlebih dahulu.");
      return;
    }
    if (!userTherapy) {
      alert("Silakan tentukan Rekomendasi Tatalaksana Gizi terlebih dahulu.");
      return;
    }

    aiValidatorChat.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap: 8px; justify-content:center; padding: 2rem 0; color:#2ee59d;">
        <span class="ai-critique-badge success" style="animation: pulse-border 1s infinite alternate; background: rgba(18, 164, 111, 0.15); border: 1px solid rgba(18, 164, 111, 0.3); padding: 6px 12px; border-radius: 6px;">AI VALIDATOR PROCESSING...</span>
        <span style="font-size:12px; font-family:monospace; color:#64748b;">MENGANALISIS KECELASAN GEJALA & REKOMENDASI TERAPI...</span>
      </div>
    `;

    setTimeout(() => {
      const activeCase = cases[currentCaseId];
      const isDiagCorrect = userDiag === activeCase.correctDiagnosis;
      const isTherapyCorrect = userTherapy === activeCase.correctTherapy;

      let scoreMessage = "";
      let scoreClass = "error";
      let headerText = "VALIDASI AI: SALAH";
      let badgeText = "DIAGNOSIS INKOREK";
      let explanation = "";
      let advice = "";

      if (isDiagCorrect && isTherapyCorrect) {
        verifiedStreak++;
        casesDiagnosed++;
        scoreClass = "success";
        headerText = "VALIDASI AI: SEMPURNA (100%)";
        badgeText = "DIAGNOSIS & TERAPI TEPAT";
        scoreMessage = `Luar biasa! Diagnosis **${diagSelect.options[diagSelect.selectedIndex].text}** dan tatalaksana **${therapySelect.options[therapySelect.selectedIndex].text}** yang Anda berikan adalah **100% BENAR**!`;
        
        if (currentCaseId === "ap") {
          explanation = `**Analisis Medis**: Siswa AP mengalami anemia defisiensi besi disertai risiko gizi kurang. Hal ini didukung oleh data antropometri IMT 16.8 (Gizi Kurang) dan klinis berupa konjungtiva pucat, lemas, serta hasil lab Hb sebesar 10.2 g/dL. Dietary recall menunjukkan asupan yang kurang bervariasi, rendah sumber zat besi heme, dan kebiasaan minum teh segera setelah makan yang mengandung senyawa tanin yang mengikat zat besi sehingga menghambat penyerapannya.`;
          advice = `**Rekomendasi Terapi**: Sangat tepat! Peningkatan asupan zat besi heme (seperti hati ayam, daging, ikan) disertai vitamin C (untuk mempermudah absorpsi Fe3+ menjadi Fe2+) sangat penting. Edukasi untuk menghindari konsumsi teh segera setelah makan adalah kunci keberhasilan terapi anemia pada remaja putri ini.`;
        } else if (currentCaseId === "mr") {
          explanation = `**Analisis Medis**: Siswa MR mengalami obesitas sentral (BB 88 kg, IMT 31.2) dengan risiko prediabetes/resistensi insulin yang dibuktikan secara klinis melalui temuan Acanthosis Nigricans (bercak hitam menebal di leher belakang) dan peningkatan Glukosa Darah Puasa (118 mg/dL). Hal ini disebabkan dietary recall yang menunjukkan konsumsi karbohidrat simpleks (minuman manis botol 3-4x sehari) dan lemak jenuh yang sangat tinggi secara kronis.`;
          advice = `**Rekomendasi Terapi**: Sangat tepat! Edukasi pembatasan minuman manis berpemanas jenuh, peningkatan asupan serat dari sayur/buah untuk menghambat penyerapan glukosa, serta aktivitas fisik teratur minimal 150 menit per minggu sangat krusial untuk mencegah progresi menjadi Diabetes Melitus Tipe 2.`;
        } else if (currentCaseId === "na") {
          explanation = `**Analisis Medis**: Siswa NA mengalami risiko defisiensi Vitamin B Kompleks (khususnya vitamin B2/riboflavin, B3/niasin, dan B12) akibat pola diet tidak seimbang (diet ketat tanpa protein hewani). Manifestasi klinis patognomonis berupa Angular Cheilitis (luka sudut bibir pecah), lidah kemerahan meradang (glossitis), kulit kering, serta turgor lemak subkutan yang sangat tipis (IMT 16.2 - Gizi Kurang).`;
          advice = `**Rekomendasi Terapi**: Sangat tepat! Edukasi mengenai bahaya diet pembatasan ekstrem sangat penting. Peningkatan konsumsi protein hewani/nabati, susu, sayuran hijau, telur, dan asupan gizi makro seimbang mutlak diperlukan untuk meredakan gejala angular cheilitis dalam beberapa hari.`;
        } else if (currentCaseId === "rs") {
          explanation = `**Analisis Medis**: Siswa RS mengalami gangguan pertumbuhan remaja (stunting/pendek) dengan Z-score TB/U berada di bawah -2 SD (-2.8 SD) akibat asupan energi dan protein yang sangat rendah (kronis). Hal ini dikonfirmasi melalui dietary recall yang menunjukkan asupan protein yang sangat buruk (sering mi instan) dan hanya makan 2 kali sehari, memicu muscle wasting ringan (massa otot kurang) dan fisik mudah lelah.`;
          advice = `**Rekomendasi Terapi**: Sangat tepat! Peningkatan asupan energi total dan protein bernilai biologis tinggi (seperti telur, susu, ikan, ayam) secara konsisten sangat penting untuk memfasilitasi kejar tumbuh kembang linear (catch-up growth) pada fase remaja ini.`;
        } else if (currentCaseId === "ds") {
          explanation = `**Analisis Medis**: Siswa DS mengalami anemia ringan akibat asupan zat besi kurang adekuat yang dipicu oleh kebiasaan melewatkan sarapan pagi dan diperberat dengan kehilangan darah berkala saat menstruasi yang menimbulkan nyeri kram abdomen hebat (dismenore). Hasil pemeriksaan Hb menunjukkan 11.4 g/dL (anemia ringan untuk remaja putri).`;
          advice = `**Rekomendasi Terapi**: Sangat tepat! Pemberian sumber zat besi heme dikombinasikan dengan edukasi makanan tinggi vitamin C serta pengaturan pola makan teratur tiga kali sehari merupakan tatalaksana gizi terbaik untuk mengatasi anemia ringan dan dismenore pada siswa DS.`;
        }
      } else if (isDiagCorrect && !isTherapyCorrect) {
        scoreClass = "warning";
        headerText = "VALIDASI AI: EVALUASI KORSET";
        badgeText = "DIAGNOSIS BENAR, TERAPI SALAH";
        scoreMessage = `Diagnosis Anda tentang **${diagSelect.options[diagSelect.selectedIndex].text}** sudah **TEPAT**, tetapi rekomendasi tatalaksana gizi yang Anda pilih (**${therapySelect.options[therapySelect.selectedIndex].text}**) adalah **SALAH**.`;
        
        if (currentCaseId === "ap") {
          explanation = `Anda berhasil mengidentifikasi kasus anemia defisiensi besi pada AP, namun tatalaksana yang Anda rekomendasikan tidak tepat sasaran. Remaja AP memerlukan asupan zat besi tinggi dan edukasi tanin teh.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke opsi **Konsumsi Zat Besi & Vit C, Hindari Teh Segera Setelah Makan (AP)** untuk hasil optimal.`;
        } else if (currentCaseId === "mr") {
          explanation = `Diagnosis Obesitas & Prediabetes pada MR sudah benar. Namun terapi yang dipilih kurang efektif untuk menurunkan resistensi insulin dan mengurangi berat badan secara berkelanjutan.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke opsi **Batasi Gula/Lemak & Tingkatkan Aktivitas Fisik 150 Menit/Minggu (MR)** untuk memperbaiki sensitivitas insulin.`;
        } else if (currentCaseId === "na") {
          explanation = `Diagnosis Defisiensi B Kompleks pada NA sudah tepat. Namun terapi yang Anda pilih tidak menyelesaikan akar masalah diet pembatasan ekstrem protein hewani.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke opsi **Diet Seimbang, Peningkatan Protein Hewani/Nabati & Susu (NA)** untuk memenuhi deplesi zat gizi mikro.`;
        } else if (currentCaseId === "rs") {
          explanation = `Diagnosis gangguan pertumbuhan (stunting) pada RS benar. Namun pilihan terapi Anda kurang memadai dalam memberikan asupan gizi padat kalori tinggi protein untuk memulihkan massa otot.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke opsi **Peningkatan Asupan Energi & Protein Tinggi (RS)** untuk mendorong metabolisme kejar tumbuh linear.`;
        } else if (currentCaseId === "ds") {
          explanation = `Diagnosis anemia ringan pada DS benar. Namun terapi yang Anda pilih tidak dirancang untuk menangani asupan tidak adekuat dan kehilangan zat besi akibat dismenore menstruasi.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke opsi **Konsumsi Zat Besi & Vit C, Perbaikan Pola Makan & Monitoring Hb (DS)**.`;
        }
      } else {
        verifiedStreak = 0;
        scoreClass = "error";
        headerText = "VALIDASI AI: INKOREK";
        badgeText = "DIAGNOSIS KELIRU";
        scoreMessage = `Jawaban Diagnosis **${diagSelect.options[diagSelect.selectedIndex].text}** yang Anda pilih adalah **SALAH**.`;
        
        explanation = `Gejala klinis (seperti: "${activeCase.complaint.substring(0, 80)}...") serta data objektif yang Anda kumpulkan dari pemindaian visual AR tidak cocok dengan patofisiologi penyakit yang Anda pilih.`;
        advice = `**Instruksi AI**: Silakan reset pandangan Anda, klik sisa hotspot berkedip merah/kuning untuk mengumpulkan detail objektif (rambut, mata, perut, kuku, kulit) di tab Pemindai, pelajari data Antropometri & Dietary Recall, lalu analisis kembali hubungan gejala tersebut.`;
      }

      aiValidatorChat.innerHTML = `
        <div class="ai-critique-box">
          <div class="ai-critique-header ${scoreClass}">
            <span class="ai-critique-badge ${scoreClass}">${badgeText}</span>
            <strong>${headerText}</strong>
          </div>
          <p class="ai-critique-text" style="font-size: 13.5px;">
            ${scoreMessage}
          </p>
          ${explanation ? `<p class="ai-critique-text" style="background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: 8px; font-size:12.5px; border-left: 3px solid rgba(0,0,0,0.08);">${explanation}</p>` : ""}
          <p class="ai-critique-advice" style="color: ${scoreClass === 'success' ? '#2ee59d' : '#ffb732'}; font-size: 12.5px; font-weight: 700;">
            ${advice}
          </p>
          <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top: 8px; font-size: 11px; color:#64748b; text-align:right; font-family:monospace;">
            STREAK AKTIF: ${verifiedStreak} | DIAGNOSTIC LEVEL: ${verifiedStreak >= 3 ? 'SPESIALIS GIZI AR' : 'RESIDEN PEMBELAJAR'}
          </div>
        </div>
      `;
    }, 1500);
  });

  // Simulated Holographic Webcam AR Visor Cam
  let arCamStream = null;
  btnStartAR?.addEventListener("click", async () => {
    const isActive = arCameraOverlay.classList.toggle("active");
    
    if (isActive) {
      btnStartAR.textContent = "Matikan Kamera AR";
      btnStartAR.className = "button secondary";
      cameraPlaceholder.style.display = "none";
      cameraFeed.style.display = "block";
      
      try {
        arCamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        cameraFeed.srcObject = arCamStream;
        
        scanStatus.textContent = "CAMERA FEED / HOLO RETICLE ACTIVE";
        scanStatus.className = "ar-status-badge scanning";
      } catch (err) {
        console.error("Camera access failed:", err);
        cameraFeed.style.display = "none";
        cameraPlaceholder.style.display = "flex";
        cameraPlaceholder.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; gap: 8px; padding: 1.5rem; text-align:center;">
            <span style="color:#ffb732; font-weight:800; font-size: 13px;">[ HOLOGRAPHIC MESH FALLBACK ]</span>
            <span style="font-size:11px; color:#64748b;">Kamera tidak diizinkan. Memuat overlay grid pemindai diagnostik bawaan sistem.</span>
          </div>
        `;
      }
    } else {
      btnStartAR.textContent = "Aktifkan Kamera AR (Visor HUD)";
      btnStartAR.className = "button primary";
      cameraFeed.style.display = "none";
      cameraPlaceholder.style.display = "flex";
      cameraPlaceholder.innerHTML = `<span>Kamera Nonaktif</span>`;
      
      if (arCamStream) {
        arCamStream.getTracks().forEach(track => track.stop());
        arCamStream = null;
      }

      scanStatus.textContent = "STANDBY / HUD READY";
      scanStatus.className = "ar-status-badge";
    }
  });

  // Handle case button clicks
  caseButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      loadCase(btn.dataset.case);
    });
  });

  // Initialize 3D context & load model
  init3D();

  // Initialize page on load (Siswa AP as default)
  // Slight delay allows voices to load in browsers if needed
  setTimeout(() => {
    loadCase("ap", false);
  }, 100);
});

