// ==========================================================================
// NutriVerse AR 3D Patient Visualization & AI Diagnostic Engine (Interactive)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
    ? "http://localhost:5000"
    : window.location.origin;
  let isBackendOnline = false;

  // Case Studies Database with spoken first-person narratives & full nutrition assessments
  const cases = {
    ap: {
      id: "ap",
      name: "Siswa AP (Remaja Perempuan - 16 Tahun)",
      modelPath: "assets/models/valerie_harmon_school_girl_character.glb",
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
      modelPath: "assets/models/casual_stride.glb",
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
      modelPath: "assets/models/casual_confidence.glb",
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
      modelPath: "assets/models/casual_stride.glb",
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
      modelPath: "assets/models/casual_confidence_in_denim.glb",
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


  // Gamified Level State Management
  let activeCasesPool = ["ap", "mr", "na", "rs", "ds"];
  let randomizedLevels = [];
  let currentLevelIndex = 0;
  let currentCaseId = "ap";
  let verifiedStreak = 0;
  const completedCaseAttempts = new Set();

  let activeHotspotId = null;
  let rotationAngle = 0;
  let zoomLevel = 1;
  let scannedHotspots = new Set();
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
  let voiceEnabled = false;
  let lastSpokenText = "";
  let clinicalChatHistory = [];

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
  const telemetryHr = document.getElementById("tele-hr");
  const telemetryTemp = document.getElementById("tele-temp");
  const telemetryZscore = document.getElementById("tele-zscore");
  const targetReticle = document.getElementById("ar-reticle");
  const scanStatus = document.getElementById("scan-status-badge");
  
  // Custom speech synthesis controls
  const btnToggleVoice = document.getElementById("btn-toggle-voice");

  // New Gamified Chatbot DOM Elements
  const chatMessagesContainer = document.getElementById("chat-messages-container");
  const chatbotUserInput = document.getElementById("chatbot-user-input");
  const btnSubmitChat = document.getElementById("btn-submit-chat");
  const levelBadge = document.getElementById("level-badge");
  const streakHud = document.getElementById("streak-hud");


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

    // 2. Tab Pemeriksaan Klinis & Observasi
    const clinicalTab = document.getElementById("hud-content-klinis");
    if (clinicalTab) {
      clinicalTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0; max-height:360px; overflow-y:auto; padding-right:4px;">
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

          <div style="background:rgba(91,134,229,0.04); padding:10px 14px; border-radius:10px; border:1px solid rgba(91,134,229,0.1);">
            <div style="font-size:10px; font-weight:800; color:#5b86e5; font-family:monospace; text-transform:uppercase; margin-bottom:6px;">🔬 DETAIL TEMUAN OBSERVASI FISIK</div>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:11.5px; line-height:1.45; color:var(--ink);">
              <div><strong>💇 Rambut:</strong> <span style="color:var(--muted);">${activeCase.hotspots.hair}</span></div>
              <div style="border-top:1px solid rgba(0,0,0,0.03); padding-top:4px;"><strong>👁️ Mata:</strong> <span style="color:var(--muted);">${activeCase.hotspots.eyes}</span></div>
              <div style="border-top:1px solid rgba(0,0,0,0.03); padding-top:4px;"><strong>👄 Mulut & Lidah:</strong> <span style="color:var(--muted);">${activeCase.hotspots.mouth}</span></div>
              <div style="border-top:1px solid rgba(0,0,0,0.03); padding-top:4px;"><strong>💪 Kulit:</strong> <span style="color:var(--muted);">${activeCase.hotspots.skin}</span></div>
              <div style="border-top:1px solid rgba(0,0,0,0.03); padding-top:4px;"><strong>💅 Kuku:</strong> <span style="color:var(--muted);">${activeCase.hotspots.nails}</span></div>
              <div style="border-top:1px solid rgba(0,0,0,0.03); padding-top:4px;"><strong>🤰 Abdomen:</strong> <span style="color:var(--muted);">${activeCase.hotspots.abdomen}</span></div>
            </div>
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
    
    // Set lastSpokenText so the speak system works
    lastSpokenText = activeCase.spokenIntro;
    
    // Play spoken intro narrative
    if (shouldSpeak) {
      speakText(activeCase.spokenIntro);
    }
    
    // Populate dynamic tab data
    populateHUDData(caseId);

    // Update fixed telemetry values
    if (telemetryTemp) telemetryTemp.textContent = activeCase.telemetry.temp;
    if (telemetryZscore) telemetryZscore.textContent = activeCase.telemetry.zscore;
    startTelemetryPulse();

    // Hide target reticle
    if (targetReticle) targetReticle.style.display = "none";

    // Load the custom 3D GLB model for this specific case study!
    loadGLBModel(caseId);

    // Update the 3D model lighting colors for the medical case study
    updateCaseLights(caseId);
    
    // Reset scanner badge
    if (renderer && scanStatus) {
      scanStatus.textContent = "STANDBY / HUD READY";
      scanStatus.className = "ar-status-badge";
    }
  }

  // Load the specific 3D GLB model dynamically
  function loadGLBModel(caseId) {
    const activeCase = cases[caseId];
    if (!activeCase) return;

    // 1. Remove the existing 3D model if it exists
    if (model) {
      scene.remove(model);
      model = null;
    }

    // 2. Reset bone references to null
    headBone = null;
    neckBone = null;
    spineBone = null;
    leftShoulderBone = null;
    rightShoulderBone = null;
    leftArmBone = null;
    rightArmBone = null;
    leftForeArmBone = null;
    rightForeArmBone = null;

    // 3. Load the GLB file corresponding to the active case
    const loader = new THREE.GLTFLoader();
    scanStatus.textContent = `MEMUAT MODEL 3D ${activeCase.name} (0%)...`;
    scanStatus.className = "ar-status-badge scanning";

    loader.load(
      activeCase.modelPath,
      function (gltf) {
        model = gltf.scene;

        // Auto-scale and center object using bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.7 / maxDim;
        model.scale.setScalar(scale);
        model.baseScale = scale; // Save the base scale!

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale - 1.4;
        model.position.z = -center.z * scale;

        model.basePositionY = model.position.y; // Baseline coordinates

        // Resolve bones for skeletal rigging control
        model.traverse((child) => {
          const rawName = child.name;
          const cleanName = rawName.substring(rawName.lastIndexOf(':') + 1).toLowerCase();

          if (cleanName.includes("head") && !headBone) {
            headBone = child;
            initialHeadRot.copy(child.rotation);
          } else if (cleanName.includes("neck") && !neckBone) {
            neckBone = child;
            initialNeckRot.copy(child.rotation);
          } else if ((cleanName.includes("spine") || cleanName === "body") && !spineBone) {
            spineBone = child;
            initialSpineRot.copy(child.rotation);
          } else if ((cleanName.includes("upperarm_l") || cleanName.includes("shoulder_l")) && !leftArmBone) {
            leftArmBone = child;
            initialLeftArmRot.copy(child.rotation);
          } else if ((cleanName.includes("upperarm_r") || cleanName.includes("shoulder_r")) && !rightArmBone) {
            rightArmBone = child;
            initialRightArmRot.copy(child.rotation);
          }

          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            
            // Set up emissive color
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => {
                  if (m.emissive === undefined) m.emissive = new THREE.Color(0x000000);
                });
              } else {
                if (child.material.emissive === undefined) child.material.emissive = new THREE.Color(0x000000);
              }
            }
          }
        });

        scene.add(model);

        scanStatus.textContent = "HOLOGRAPHIC MESH READY";
        scanStatus.className = "ar-status-badge";

        updateCaseLights(caseId);
        resetBoneTargets();

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
        console.error("Error loading GLTF model:", error);
        scanStatus.textContent = "3D MESH ERROR / FALLBACK LOADED";
        scanStatus.className = "ar-status-badge error";

        // Fallback volumetric cylinder
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0x12a46f, wireframe: true });
        const fallbackMesh = new THREE.Mesh(geometry, material);
        fallbackMesh.position.y = -0.15;
        fallbackMesh.isCylinderFallback = true;
        scene.add(fallbackMesh);
        model = fallbackMesh;
      }
    );
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
    
    // Create Scene with clean white background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);
    
    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Cap at 1.25 to prevent lag on Retina/4K screens
    renderer.shadowMap.enabled = false; // Disable shadows for extreme smoothness
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
    
    // Renderer Render Tick loop
    const clock = new THREE.Clock();
    let lastFrameTime = 0;
    const fpsLimit = 30; // Cap to 30 FPS to save CPU/GPU and eliminate lag entirely
    const frameDuration = 1000 / fpsLimit;

    function animate(currentTime) {
      requestAnimationFrame(animate);
      
      // Throttle rendering loop to 30 FPS to resolve GPU/CPU thermal throttling and lag
      if (!currentTime) currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameDuration) {
        return;
      }
      lastFrameTime = currentTime - (elapsed % frameDuration);
      
      try {
        const delta = clock.getDelta();
        controls.update();
        
        const time = clock.getElapsedTime();
        
        // Dynamic game-like rigged skeletal animations
        if (model) {
          // Auto-rotation disabled for static patient view

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

  // Zoom and Camera controls
  document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
    if (camera) camera.position.z = Math.max(1.2, camera.position.z - 0.4);
  });

  document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
    if (camera) camera.position.z = Math.min(8.0, camera.position.z + 0.4);
  });

  document.getElementById("btn-reset-view")?.addEventListener("click", () => {
    if (model) {
      model.rotation.set(0, 0, 0);
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
    if (targetReticle) targetReticle.style.display = "none";
    if (scanStatus) {
      scanStatus.textContent = "VIEWPORT RESET / STANDBY";
      scanStatus.className = "ar-status-badge";
    }
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

  // Support voice list updates asynchronously (Chrome bug prevention)
  if (synth) {
    synth.onvoiceschanged = () => {
      // Refresh voice profile silently
    };
  }

  // Simulated Holographic Webcam AR Visor Cam (Disabled)

  // ================= GAMIFIED LEVEL CHATBOT CONTROLLER =================

  async function recordCaseAttempt(caseId, score, success, feedback) {
    if (!success || completedCaseAttempts.has(caseId)) return;
    const auth = window.NutriVerseAuth;
    if (!auth?.insertCaseAttempt) return;
    try {
      const user = await auth.getCurrentUser();
      if (!user) return;
      completedCaseAttempts.add(caseId);
      await auth.insertCaseAttempt({
        userId: user.id,
        caseId,
        caseName: cases[caseId]?.name || caseId,
        score,
        success,
        feedback
      });
      await window.NutriVerseTracking?.trackFeatureEvent("nutrisolve", "case_attempt", caseId, {
        case_name: cases[caseId]?.name || caseId,
        score,
        success
      });
    } catch (error) {
      console.warn("case_attempt tracking skipped:", error.message || error);
    }
  }
  
  // Shuffle cases helper
  function shuffleCases() {
    const pool = ["ap", "mr", "na", "rs", "ds"];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    randomizedLevels = pool;
    currentLevelIndex = 0;
  }

  // Add chat bubble
  function addChatMessage(sender, text) {
    if (!chatMessagesContainer) return;
    const wrapper = document.createElement("div");
    wrapper.className = `chat-bubble-wrapper ${sender}`;
    
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    
    if (sender === "ai") {
      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formattedText;
    } else if (sender === "user") {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = text;
    }
    
    wrapper.appendChild(bubble);
    chatMessagesContainer.appendChild(wrapper);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Simulated AI typing animations
  function showTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-bubble-wrapper ai temp-typing-indicator";
    
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble ai";
    bubble.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    wrapper.appendChild(bubble);
    chatMessagesContainer.appendChild(wrapper);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = chatMessagesContainer.querySelector(".temp-typing-indicator");
    if (indicator) indicator.remove();
  }

  // Load level active case and greet user
  function initiateLevel() {
    if (randomizedLevels.length === 0) {
      shuffleCases();
    }
    
    const caseId = randomizedLevels[currentLevelIndex];
    loadCase(caseId, false);
    
    if (levelBadge) {
      levelBadge.textContent = `LEVEL ${currentLevelIndex + 1}/5 - KASUS ACAK`;
    }
    if (streakHud) {
      streakHud.textContent = `STREAK: ${verifiedStreak}`;
    }
    
    const activeCase = cases[caseId];
    
    // Reset and seed clinical chat history for Gemini context
    clinicalChatHistory = [];
    
    const introText = `Halo Dokter! Selamat datang di **Level ${currentLevelIndex + 1}** dari simulasi gizi klinis. 🩺<br><br>` + 
      `Pasien kita saat ini adalah **${activeCase.name}**.<br>` +
      `Keluhan utama: *"${activeCase.complaint}"*<br><br>` +
      `Silakan periksa detail data di panel kanan (**Profil & Antro**, **Pemeriksaan Klinis**, dan **Dietary Recall**). ` + 
      `Ketikkan **Diagnosis Gizi** serta **Rekomendasi Terapi** Anda di kolom bawah ini, lalu kirimkan untuk dievaluasi oleh AI Supervisor.`;
      
    clinicalChatHistory.push({
      role: "model",
      text: `Halo Dokter! Selamat datang di Level ${currentLevelIndex + 1} dari simulasi gizi klinis. Pasien kita saat ini adalah ${activeCase.name}. Keluhan utama: "${activeCase.complaint}". Silakan periksa detail data di panel kanan dan berikan analisis diagnosis gizi serta tatalaksana terapi gizi.`
    });
      
    addChatMessage("ai", introText);
    speakText(`Halo Dokter! Selamat datang di Level ${currentLevelIndex + 1}. Pasien kita saat ini adalah ${activeCase.name}. Silakan periksa detail data pasien di panel kanan dan berikan analisis Anda.`);
  }

  // Ping Flask server for clinical chatbot connection status
  async function checkBackendStatus() {
    try {
      const response = await window["fetch"](`${BACKEND_URL}/api/health`);
      isBackendOnline = response.ok;
    } catch (e) {
      isBackendOnline = false;
    }
  }

  // Level Success Trigger
  function triggerLevelSuccess() {
    if (currentLevelIndex < 4) {
      const systemMsg = `<div class="chat-bubble system success" style="width: 100%; text-align: center;">` + 
        `◈ Level ${currentLevelIndex + 1} Selesai dengan Sempurna! ◈<br>` +
        `<button class="chatbot-next-level-btn" id="btn-next-level">Lanjut ke Level ${currentLevelIndex + 2} ➜</button>` +
        `</div>`;
      addChatMessage("system", systemMsg);
      
      const btnNext = document.getElementById("btn-next-level");
      if (btnNext) {
        btnNext.addEventListener("click", () => {
          currentLevelIndex++;
          chatMessagesContainer.innerHTML = "";
          initiateLevel();
        });
      }
    } else {
      // Final victory
      const winMsg = `<div class="chat-bubble system success" style="width: 100%; text-align: center;">` + 
        `🏆 CONGRATULATIONS! 🏆<br>` +
        `Anda telah berhasil menyelesaikan semua 5 Level Kasus Klinis Gizi dengan sempurna!<br>` +
        `Gelar Anda saat ini: **SPESIALIS GIZI AR NUTRIVERSE**.<br><br>` +
        `<button class="chatbot-next-level-btn" id="btn-restart-game">Mulai Ulang Simulasi ↺</button>` +
        `</div>`;
      addChatMessage("system", winMsg);
      
      const btnRestart = document.getElementById("btn-restart-game");
      if (btnRestart) {
        btnRestart.addEventListener("click", () => {
          verifiedStreak = 0;
          chatMessagesContainer.innerHTML = "";
          shuffleCases();
          initiateLevel();
        });
      }
    }
  }

  // Parse user text and evaluate keywords (supports Live Flask/Gemini and Offline Fallback)
  async function handleUserInput() {
    if (!chatbotUserInput) return;
    const userText = chatbotUserInput.value;
    if (!userText.trim()) return;
    
    addChatMessage("user", userText);
    chatbotUserInput.value = "";
    
    // Add user message to dialogue history
    clinicalChatHistory.push({ role: "user", text: userText });
    
    showTypingIndicator();
    
    const caseId = randomizedLevels[currentLevelIndex];
    const activeCase = cases[caseId];
    
    if (isBackendOnline) {
      try {
        const response = await window["fetch"](`${BACKEND_URL}/api/validate_diagnosis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId: caseId,
            diagnosis_text: userText,
            history: clinicalChatHistory
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          removeTypingIndicator();
          
          // Display the AI Supervisor critique in a chat bubble
          addChatMessage("ai", data.reply);
          
          // Add model reply to history
          clinicalChatHistory.push({ role: "model", text: data.reply });
          
          if (data.success) {
            verifiedStreak++;
            casesDiagnosed++;
            if (streakHud) streakHud.textContent = `STREAK: ${verifiedStreak}`;
            recordCaseAttempt(caseId, data.score || 100, true, data.reply || "Berhasil menyelesaikan kasus.");
            
            // Show next level button or win game
            setTimeout(() => {
              triggerLevelSuccess();
            }, 600);
          } else {
            // Did not pass yet, let the user continue talking
            verifiedStreak = 0;
            if (streakHud) streakHud.textContent = `STREAK: ${verifiedStreak}`;
          }
          return;
        } else {
          throw new Error("HTTP error validating diagnosis from server");
        }
      } catch (err) {
        console.warn("Backend validation failed, falling back to local simulation:", err);
      }
    }
    
    // Offline / Local Simulation Fallback (runs if Flask backend is down or errors)
    setTimeout(() => {
      removeTypingIndicator();
      
      const lowerText = userText.toLowerCase();
      let isDiagCorrect = false;
      let isTherapyCorrect = false;
      
      // Smart matching keywords for client-side evaluation
      if (caseId === "ap") {
        isDiagCorrect = lowerText.includes("anemia") || lowerText.includes("zat besi") || lowerText.includes("hb");
        isTherapyCorrect = lowerText.includes("suplemen") || lowerText.includes("tambah darah") || lowerText.includes("vitamin c") || lowerText.includes("vit c") || lowerText.includes("teh");
      } else if (caseId === "mr") {
        isDiagCorrect = lowerText.includes("obesitas") || lowerText.includes("prediabetes") || lowerText.includes("insulin") || lowerText.includes("kegemukan") || lowerText.includes("acanthosis");
        isTherapyCorrect = lowerText.includes("gula") || lowerText.includes("manis") || lowerText.includes("olahraga") || lowerText.includes("aktivitas") || lowerText.includes("serat") || lowerText.includes("menit");
      } else if (caseId === "na") {
        isDiagCorrect = lowerText.includes("b kompleks") || lowerText.includes("vitamin b") || lowerText.includes("cheilitis") || lowerText.includes("bibir pecah") || lowerText.includes("glossitis");
        isTherapyCorrect = lowerText.includes("protein") || lowerText.includes("hewani") || lowerText.includes("susu") || lowerText.includes("telur") || lowerText.includes("diet seimbang");
      } else if (caseId === "rs") {
        isDiagCorrect = lowerText.includes("stunting") || lowerText.includes("pendek") || lowerText.includes("stunted") || lowerText.includes("tumbuh");
        isTherapyCorrect = lowerText.includes("energi") || lowerText.includes("protein") || lowerText.includes("tinggi") || lowerText.includes("telur") || lowerText.includes("susu") || lowerText.includes("ikan");
      } else if (caseId === "ds") {
        isDiagCorrect = lowerText.includes("anemia") || lowerText.includes("dismenore") || lowerText.includes("haid") || lowerText.includes("menstruasi") || lowerText.includes("nyeri");
        isTherapyCorrect = lowerText.includes("zat besi") || lowerText.includes("suplemen") || lowerText.includes("sarapan") || lowerText.includes("makan teratur");
      }
      
      let replyText = "";
      
      if (isDiagCorrect && isTherapyCorrect) {
        verifiedStreak++;
        casesDiagnosed++;
        
        if (streakHud) streakHud.textContent = `STREAK: ${verifiedStreak}`;
        
        if (caseId === "ap") {
          replyText = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
            `**Diagnosis Tepat:** Anda berhasil mengidentifikasi kasus **Anemia Defisiensi Besi** dan status **Gizi Kurang** pada AP.<br><br>` +
            `**Evaluasi Terapi:** Sangat bagus! Penambahan asupan besi heme (seperti hati, daging), asupan vitamin C untuk memperlancar absorpsi zat besi, serta edukasi untuk **menghindari minum teh setelah makan** (karena senyawa tanin mengikat zat besi) adalah tatalaksana yang sempurna untuk AP.`;
        } else if (caseId === "mr") {
          replyText = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
            `**Diagnosis Tepat:** Diagnosis **Obesitas Sentral** dengan risiko **Prediabetes & Resistensi Insulin** pada MR sangat tepat.<br><br>` +
            `**Evaluasi Terapi:** Luar biasa! Pengurangan asupan gula sederhana, peningkatan serat larut, serta aktivitas fisik teratur minimal 150 menit/minggu adalah pilar tatalaksana terbaik untuk membalikkan prediabetes pada remaja laki-laki ini.`;
        } else if (caseId === "na") {
          replyText = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
            `**Diagnosis Tepat:** Anda mendeteksi **Defisiensi Vitamin B Kompleks (Riboflavin/B2 & B12)** secara klinis dari gejala **Angular Cheilitis** (luka sudut bibir) dan **Glossitis** pada NA.<br><br>` +
            `**Evaluasi Terapi:** Sangat tepat! Menghentikan diet pembatasan ekstrem dan meningkatkan konsumsi protein hewani, telur, susu, dan sayuran hijau akan memperbaiki defisiensi gizi mikro ini dengan sangat cepat.`;
        } else if (caseId === "rs") {
          replyText = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
            `**Diagnosis Tepat:** Anda mengidentifikasi **Gangguan Pertumbuhan / Tinggi Badan Sangat Pendek (Stunting Kronis)** pada RS berdasarkan Z-score TB/U (-2.8 SD).<br><br>` +
            `**Evaluasi Terapi:** Sempurna! RS membutuhkan asupan tinggi energi dan protein bernilai biologis tinggi (telur, susu, ikan) untuk mendukung catch-up growth (kejar tumbuh linear) pada fase remaja ini.`;
        } else if (caseId === "ds") {
          replyText = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
            `**Diagnosis Tepat:** Anda berhasil mendiagnosis **Anemia Ringan (Hb 11.4)** disertai gejala kram menstruasi berat (**Dismenore**) pada DS.<br><br>` +
            `**Evaluasi Terapi:** Hebat! Rekomendasi Anda mengenai pemantauan asupan zat besi heme, dikombinasikan dengan edukasi makan teratur dan **tidak melewatkan sarapan pagi** adalah langkah tatalaksana gizi yang sangat tepat.`;
        }
        
        addChatMessage("ai", replyText);
        clinicalChatHistory.push({ role: "model", text: replyText });
        recordCaseAttempt(caseId, 100, true, replyText);
        
        // Show next level button
        setTimeout(() => {
          triggerLevelSuccess();
        }, 600);
      } else if (isDiagCorrect && !isTherapyCorrect) {
        if (caseId === "ap") {
          replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
            `Diagnosis Anda tentang **Anemia** sudah tepat. Namun, tatalaksana gizi Anda belum lengkap. ` +
            `Ingat bahwa AP memiliki kebiasaan minum teh manis hangat langsung setelah makan siang dan malam. Teh mengandung senyawa tanin yang mengikat zat besi non-heme. ` + 
            `Silakan perbaiki terapi gizi Anda (sebutkan tentang vitamin C, asupan zat besi, atau menghindari teh setelah makan).`;
        } else if (caseId === "mr") {
          replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
            `Diagnosis Anda tentang **Obesitas / Prediabetes** sudah tepat. Namun, rekomendasi terapi gizi Anda belum menyentuh akar masalah. ` +
            `MR mengonsumsi karbohidrat olahan dan gula tinggi (3-4 es kopi/soda sehari). ` +
            `Silakan sebutkan rencana olahraga/aktivitas fisik, atau pembatasan asupan manis/gula.`;
        } else if (caseId === "na") {
          replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
            `Diagnosis Anda tentang **Defisiensi Vitamin B / Angular Cheilitis** sudah tepat. Namun, terapi gizi Anda kurang spesifik. ` +
            `NA sedang menjalani diet ekstrem tanpa mengonsumsi protein hewani sama sekali. ` +
            `Ia membutuhkan diet seimbang dengan makanan kaya protein hewani atau susu/telur. Silakan lengkapi jawaban Anda.`;
        } else if (caseId === "rs") {
          replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
            `Diagnosis Anda tentang **Gangguan Pertumbuhan / Stunting** sudah tepat. Namun, terapi gizi Anda belum memadai untuk kejar tumbuh. ` +
            `RS memerlukan asupan protein berkualitas biologis tinggi dan padat kalori (seperti susu, telur, ikan) untuk catch-up growth. Silakan lengkapi jawaban Anda.`;
        } else if (caseId === "ds") {
          replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
            `Diagnosis Anda tentang **Anemia / Dismenore** sudah tepat. Namun, terapi Anda belum menyentuh kebiasaan makannya. ` +
            `DS sering melewatkan sarapan pagi yang memperberat anemia ringannya saat haid. ` +
            `Silakan sebutkan tentang zat besi, sarapan pagi, atau makan teratur.`;
        }
        addChatMessage("ai", replyText);
        clinicalChatHistory.push({ role: "model", text: replyText });
      } else {
        verifiedStreak = 0;
        if (streakHud) streakHud.textContent = `STREAK: ${verifiedStreak}`;
        
        replyText = `**EVALUASI AI SUPERVISOR:**<br>` +
          `Diagnosis Anda belum tepat Dokter. Gejala klinis pasien dan dietary recall 24-jamnya tidak mendukung kesimpulan tersebut.<br><br>` +
          `**Petunjuk Supervisor:** Perhatikan tanda vital dan hasil laboratorium di panel kanan, lalu telaah kebiasaan makannya secara mendalam. Silakan coba analisis kembali!`;
        addChatMessage("ai", replyText);
        clinicalChatHistory.push({ role: "model", text: replyText });
      }
    }, 1500);
  }

  // Bind chatbot inputs
  btnSubmitChat?.addEventListener("click", () => {
    handleUserInput();
  });

  chatbotUserInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  });

  // Initialize 3D context & load model
  init3D();

  // Initialize level gamification and case on load
  setTimeout(() => {
    checkBackendStatus();
    shuffleCases();
    initiateLevel();
  }, 200);
});

