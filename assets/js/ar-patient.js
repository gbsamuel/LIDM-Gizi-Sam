// ==========================================================================
// NutriVerse Interactive 3D AR Patient Case Studies Engine
// ==========================================================================

function initARPatient() {
  // 1. JSON Database containing all 10 cases across 4 lifecycle phases
  const casesData = {
    balita: {
      easy: {
        id: "balita_easy",
        name: "An. KA (Balita - Easy)",
        levelLabel: "Easy: Picky Eater dengan Risiko Underweight",
        modelPath: "assets/models/Balita/Kasus 1.glb",
        complaint: "Anak saya susah makan sekali, maunya cuma biskuit dan susu. Badannya jadi kecil dibanding sepupunya.",
        spokenIntro: "Halo, Nutri Student! Selamat datang di simulasi gizi klinis balita level 1. Pasien saat ini adalah An. KA, usia 3 tahun 4 bulan. Keluhan utama dari ibu: Anak saya susah makan sekali, maunya cuma biskuit dan susu. Badannya jadi kecil dibanding sepupunya.",
        anthropometry: {
          gender: "Laki-laki",
          age: "3 Tahun 4 Bulan",
          bb: "11 kg",
          tb: "92 cm",
          imt: "13.0 kg/m²",
          status: "Risiko Underweight",
          details: "Status gizi Berisiko Underweight berdasarkan perhitungan Z-score BB/U dan asupan makan yang rendah."
        },
        clinical: {
          vitalSigns: {
            hr: "98 BPM",
            temp: "36.6 °C",
            lab: "Normal"
          },
          summary: "Tampak kurus, tidak ada edema, nafsu makan rendah, mudah terdistraksi, durasi makan >1 jam.",
          organs: {
            hair: "Normal",
            eyes: "Konjungtiva normal",
            mouth: "Mukosa normal",
            skin: "Turgor normal, tampak agak kering",
            nails: "Normal",
            abdomen: "Normal"
          }
        },
        dietary: {
          recall: {
            breakfast: "Susu cokelat (1 gelas) & biskuit manis (2 keping)",
            lunch: "Nasi 3 sendok (menolak lauk hewani/nabati)",
            dinner: "Nasi 2 sendok + kuah sup + teh manis",
            snack: "Chiki kemasan & biskuit"
          },
          habits: "Sering makan sambil menonton HP, tidak suka sayur, jarang protein hewani. Durasi makan sangat lama (>1 jam).",
          deficiencyAnalysis: "Pola makan monoton, dominan snack dan susu, meal duration terlalu lama, distracted eating. Asupan energi & protein kurang."
        },
        keywords: {
          diagnosis: ["picky", "underweight", "asupan", "gizi kurang", "kurus"],
          intervention: ["jadwal", "batasi", "snack", "responsive", "hewan", "screen", "variasi", "hp"]
        }
      },
      medium: {
        id: "balita_medium",
        name: "An. RF (Balita - Medium)",
        levelLabel: "Medium: Stunting akibat Asupan Kronis Tidak Adekuat",
        modelPath: "assets/models/Balita/Kasus 2.glb",
        complaint: "Anak saya terlihat jauh lebih pendek dibandingkan teman-teman seusianya.",
        spokenIntro: "Halo, Nutri Student! Selamat datang di simulasi gizi klinis balita level 2. Pasien saat ini adalah An. RF, usia 5 tahun. Keluhan utama: Anak saya terlihat jauh lebih pendek dibandingkan teman-teman seusianya.",
        anthropometry: {
          gender: "Laki-laki",
          age: "5 Tahun",
          bb: "15 kg",
          tb: "99 cm",
          imt: "15.3 kg/m²",
          status: "Stunting (TB/U Sangat Rendah)",
          details: "Z-score TB/U berada di bawah -2 SD (pendek/stunting)."
        },
        clinical: {
          vitalSigns: {
            hr: "95 BPM",
            temp: "36.4 °C",
            lab: "Hemoglobin: 11.2 g/dL"
          },
          summary: "Tidak aktif, massa otot kecil, riwayat sering sakit batuk pilek.",
          organs: {
            hair: "Kering, kusam",
            eyes: "Normal",
            mouth: "Mukosa normal",
            skin: "Normal, agak pucat",
            nails: "Normal",
            abdomen: "Normal"
          }
        },
        dietary: {
          recall: {
            breakfast: "Teh manis hangat (1 gelas) & biskuit manis (2 keping)",
            lunch: "Nasi putih + kuah sup tanpa lauk",
            dinner: "Nasi putih + kecap + tahu goreng kecil",
            snack: "Jajanan warung (camilan gurih)"
          },
          habits: "Riwayat pemberian MPASI terlambat, jarang konsumsi protein hewani, faktor ekonomi rendah.",
          deficiencyAnalysis: "TB/U rendah, riwayat intake kronis buruk, MPASI tidak optimal, protein hewani minimal."
        },
        keywords: {
          diagnosis: ["stunting", "tb/u", "pendek", "stunt"],
          intervention: ["protein", "mpasi", "practice", "monitoring", "densitas", "hewan"]
        }
      },
      hard: {
        id: "balita_hard",
        name: "An. CL (Balita - Hard)",
        levelLabel: "Hard: Obesitas Balita",
        modelPath: "assets/models/Balita/Kasus 3.glb",
        complaint: "Anak kami susah berhenti makan snack dan sekarang cepat ngos-ngosan saat bermain.",
        spokenIntro: "Halo, Nutri Student! Selamat datang di simulasi gizi klinis balita level 3. Pasien saat ini adalah An. CL, perempuan, 4 tahun 8 bulan. Keluhan utama: Anak kami susah berhenti makan snack dan sekarang cepat ngos-ngosan saat bermain.",
        anthropometry: {
          gender: "Perempuan",
          age: "4 Tahun 8 Bulan",
          bb: "27 kg",
          tb: "108 cm",
          imt: "23.1 kg/m²",
          status: "Obesitas",
          details: "Z-score IMT/U di atas +3 SD (obesitas balita)."
        },
        clinical: {
          vitalSigns: {
            hr: "105 BPM",
            temp: "36.8 °C",
            lab: "GDP: 90 mg/dL"
          },
          summary: "Lipatan lemak terlihat jelas, mudah lelah, sering berkeringat saat aktivitas ringan.",
          organs: {
            hair: "Normal",
            eyes: "Normal",
            mouth: "Normal",
            skin: "Lipatan lemak leher dan ketiak terlihat jelas",
            nails: "Normal",
            abdomen: "Perut cembung penuh lemak"
          }
        },
        dietary: {
          recall: {
            breakfast: "Sereal manis dengan susu full cream (1 porsi besar)",
            lunch: "Nasi porsi besar (1.5 piring) + ayam goreng tepung + kentang goreng",
            dinner: "Fast food burger + es krim + teh manis",
            snack: "Biskuit cokelat, keripik kentang, minuman manis kemasan"
          },
          habits: "Screen time >5 jam per hari, sangat jarang melakukan aktivitas fisik terstruktur.",
          deficiencyAnalysis: "IMT/U masuk kategori obesitas, asupan kalori berlebih (excess calorie), gaya hidup kurang aktif (sedentary), konsumsi makanan ultra-proses tinggi."
        },
        keywords: {
          diagnosis: ["obes", "overweight", "gemuk", "gizi lebih", "imt/u"],
          intervention: ["family", "sweetened", "manis", "aktivitas", "olahraga", "diet", "screen", "hp", "lingkungan"]
        }
      }
    },
    remaja: {
      easy: {
        id: "remaja_easy",
        name: "Siswa AP (Remaja - Easy)",
        levelLabel: "Easy: Anemia Defisiensi Besi",
        modelPath: "assets/models/Remaja/Kasus 1.glb",
        complaint: "Saya sering pusing dan cepat capek kalau di sekolah. Naik tangga gampang lelah, susah konsentrasi.",
        spokenIntro: "Halo, Nutri Student! Pasien remaja kita adalah Siswa AP, perempuan, 16 tahun. Keluhan: Saya sering pusing dan cepat capek kalau di sekolah. Naik tangga gampang lelah, susah konsentrasi.",
        anthropometry: {
          gender: "Perempuan",
          age: "16 Tahun",
          bb: "43 kg",
          tb: "160 cm",
          imt: "16.8 kg/m²",
          status: "Kurus / Risiko Gizi Kurang",
          details: "IMT berada di bawah batas normal untuk usia remaja 16 tahun."
        },
        clinical: {
          vitalSigns: {
            hr: "84 BPM",
            temp: "36.2 °C",
            lab: "Hemoglobin: 10.2 g/dL"
          },
          summary: "Konjungtiva pucat, rambut kering, mudah lelah, detak jantung normal.",
          organs: {
            hair: "Kering dan kusam",
            eyes: "Konjungtiva sangat pucat",
            mouth: "Mukosa normal",
            skin: "Normal, agak kering",
            nails: "Bantalan kuku agak pucat",
            abdomen: "Normal"
          }
        },
        dietary: {
          recall: {
            breakfast: "Teh manis hangat (1 gelas) & roti putih + mentega",
            lunch: "Nasi putih porsi sedang + ayam goreng + sedikit sayur kol",
            dinner: "Nasi putih + telur ceplok + kerupuk + teh manis",
            snack: "Biskuit manis dan keripik gurih di sore hari"
          },
          habits: "Makan kurang bervariasi, sangat jarang makan buah/sayur kaya zat besi, kebiasaan minum teh segera setelah makan.",
          deficiencyAnalysis: "Asupan zat besi sangat rendah. Teh mengandung tanin yang menghambat absorpsi zat besi non-heme."
        },
        keywords: {
          diagnosis: ["anemi", "defisiensi besi", "gizi kurang", "hb"],
          intervention: ["besi", "daging", "telur", "hati", "hijau", "vitamin c", "jeruk", "hindari teh", "teh setelah makan"]
        }
      },
      medium: {
        id: "remaja_medium",
        name: "Siswa MR (Remaja - Medium)",
        levelLabel: "Medium: Obesitas dengan Risiko Resistensi Insulin",
        modelPath: "assets/models/Remaja/Kasus 2.glb",
        complaint: "Sering lapar terus habis makan, sering ngantuk and haus. Sering beli minuman manis dan fast food.",
        spokenIntro: "Halo, Nutri Student! Pasien saat ini adalah Siswa MR, laki-laki, 17 tahun. Keluhan utama: Sering lapar terus habis makan, sering ngantuk dan haus. Sering beli minuman manis dan fast food.",
        anthropometry: {
          gender: "Laki-laki",
          age: "17 Tahun",
          bb: "88 kg",
          tb: "168 cm",
          imt: "31.2 kg/m²",
          status: "Obesitas",
          details: "IMT di atas 30 kg/m² menunjukkan obesitas tingkat remaja."
        },
        clinical: {
          vitalSigns: {
            hr: "88 BPM",
            temp: "36.5 °C",
            lab: "Glukosa Darah Puasa (GDP): 118 mg/dL"
          },
          summary: "Penumpukan lemak abdomen terlihat jelas, acanthosis nigricans (kulit menebal hitam) di area tengkuk, mudah berkeringat.",
          organs: {
            hair: "Normal",
            eyes: "Normal",
            mouth: "Normal",
            skin: "Acanthosis nigricans di lipatan leher belakang",
            nails: "Normal",
            abdomen: "Lingkar perut berlebih (obesitas sentral)"
          }
        },
        dietary: {
          recall: {
            breakfast: "Tidak sarapan (hanya minum es teh kemasan di perjalanan)",
            lunch: "Ayam geprek porsi besar + nasi putih + es teh manis",
            dinner: "Mie instan rebus (2 bungkus) + telur dadar + minuman soda",
            snack: "Minuman boba manis, siomay, kentang goreng"
          },
          habits: "Sering melewatkan sarapan, sering makan fast food dan makanan siap saji, minuman manis berpemanis 3-4x sehari.",
          deficiencyAnalysis: "Konsumsi karbohidrat sederhana dan lemak jenuh sangat berlebih, serat sangat kurang. Risiko prediabetes."
        },
        keywords: {
          diagnosis: ["obes", "resistensi insulin", "prediabet", "gdp", "acanthosis"],
          intervention: ["manis", "boba", "buah", "olahraga", "serat", "seimbang", "aktivitas", "150"]
        }
      },
      hard: {
        id: "remaja_hard",
        name: "Siswa NA (Remaja - Hard)",
        levelLabel: "Hard: Risiko Defisiensi Vitamin B Kompleks",
        modelPath: "assets/models/Remaja/Kasus 3.glb",
        complaint: "Mulut sering perih, sudut bibir pecah-pecah, malas makan.",
        spokenIntro: "Halo, Nutri Student! Pasien saat ini adalah Siswa NA, perempuan, 15 tahun. Keluhan utama: Mulut sering perih, sudut bibir pecah-pecah, malas makan.",
        anthropometry: {
          gender: "Perempuan",
          age: "15 Tahun",
          bb: "40 kg",
          tb: "157 cm",
          imt: "16.2 kg/m²",
          status: "Kurus / Gizi Kurang",
          details: "Mengalami penurunan berat badan akibat pembatasan asupan yang ketat."
        },
        clinical: {
          vitalSigns: {
            hr: "78 BPM",
            temp: "36.3 °C",
            lab: "Hemoglobin: 11.8 g/dL"
          },
          summary: "Angular cheilitis (luka di sudut bibir), lidah kemerahan (glossitis ringan), kulit kering bersisik.",
          organs: {
            hair: "Normal, agak kusam",
            eyes: "Normal",
            mouth: "Angular cheilitis di kedua sudut bibir, lidah agak merah",
            skin: "Kulit sangat kering kasar di area tangan",
            nails: "Normal",
            abdomen: "Normal"
          }
        },
        dietary: {
          recall: {
            breakfast: "Air putih hangat + oatmeal instan polos (3 sendok)",
            lunch: "Salad selada & timun tanpa dressing + tahu rebus (1 buah)",
            dinner: "Buah apel (1 buah) + air putih hangat",
            snack: "Jarang ngemil, kadang makan wortel mentah"
          },
          habits: "Melakukan diet ketat mandiri dengan membatasi makanan hewani sepenuhnya demi penampilan.",
          deficiencyAnalysis: "Defisiensi asupan gizi makro (energi, protein) dan mikro (vitamin B12, B2, zat besi) akibat eliminasi total protein hewani."
        },
        keywords: {
          diagnosis: ["defisiensi vitamin b", "vitamin b kompleks", "gizi mikro", "cheilitis", "diet ketat", "gizi kurang"],
          intervention: ["seimbang", "hewan", "hijau", "susu", "daging", "telur", "vitamin b", "b kompleks"]
        }
      }
    },
    dewasa: {
      easy: {
        id: "dewasa_easy",
        name: "Tn. AR (Dewasa - Easy)",
        levelLabel: "Easy: Obesitas akibat Pola Makan Berlebih",
        modelPath: "assets/models/Dewasa/Kasus 1.glb",
        complaint: "Berat badan terus naik, cepat capek kalau naik tangga.",
        spokenIntro: "Halo, Nutri Student! Pasien dewasa kita adalah Tn. AR, laki-laki, 32 tahun. Keluhan: Berat badan terus naik, cepat capek kalau naik tangga.",
        anthropometry: {
          gender: "Laki-laki",
          age: "32 Tahun",
          bb: "92 kg",
          tb: "168 cm",
          imt: "32.6 kg/m²",
          status: "Obesitas Tingkat I",
          details: "IMT sebesar 32.6 kg/m² masuk ke dalam kategori Obesitas Tingkat I."
        },
        clinical: {
          vitalSigns: {
            hr: "82 BPM",
            temp: "36.6 °C",
            lab: "Kolesterol Total: 220 mg/dL"
          },
          summary: "Tekanan darah 128/84 mmHg. Pola kerja sedenter sebagai pekerja kantoran.",
          organs: {
            hair: "Normal",
            eyes: "Normal",
            mouth: "Normal",
            skin: "Normal",
            nails: "Normal",
            abdomen: "Abdomen membuncit (obesitas)"
          }
        },
        dietary: {
          recall: {
            breakfast: "Nasi uduk + telur dadar + bihun goreng + sambal goreng + es teh manis",
            lunch: "Nasi putih piring penuh + rendang daging + sayur nangka bersantan",
            dinner: "Nasi goreng piring besar + ayam goreng 2 potong + kerupuk + teh manis",
            snack: "Gorengan (bakwan, tempe mendoan 3-4 biji), kopi susu manis"
          },
          habits: "Sering makan di luar (4-5 kali per minggu), jarang mengonsumsi buah/sayur segar, sering makan sambil bekerja di depan laptop.",
          deficiencyAnalysis: "Kelebihan asupan kalori harian secara kronis (excess calorie), asupan lemak jenuh dan gula tinggi, serat sangat rendah."
        },
        keywords: {
          diagnosis: ["obes", "imt 32", "gizi lebih", "sedenter"],
          intervention: ["defisit", "sayur buah", "batasi manis", "lemak", "mindful", "olahraga", "aktivitas", "150"]
        }
      },
      medium: {
        id: "dewasa_medium",
        name: "Ny. DS (Dewasa - Medium)",
        levelLabel: "Medium: Diabetes Mellitus Tipe 2",
        modelPath: "assets/models/Dewasa/Kasus 2.glb",
        complaint: "Sering haus, bolak-balik kamar mandi, berat badan turun tanpa disengaja.",
        spokenIntro: "Halo, Nutri Student! Pasien dewasa kita adalah Ny. DS, perempuan, 45 tahun. Keluhan: Sering haus, bolak-balik kamar mandi, berat badan turun tanpa disengaja.",
        anthropometry: {
          gender: "Perempuan",
          age: "45 Tahun",
          bb: "74 kg",
          tb: "158 cm",
          imt: "29.6 kg/m²",
          status: "Overweight / Obesitas Ringan",
          details: "Lingkar perut 94 cm menunjukkan obesitas sentral pada perempuan."
        },
        clinical: {
          vitalSigns: {
            hr: "80 BPM",
            temp: "36.5 °C",
            lab: "Glukosa Darah Puasa (GDP): 148 mg/dL"
          },
          summary: "Mengalami gejala poliuria (sering kencing), polidipsia (sering haus), polifagia (sering lapar), pandangan kabur, dan riwayat keluarga diabetes.",
          organs: {
            hair: "Normal",
            eyes: "Pandangan agak kabur",
            mouth: "Mukosa mulut agak kering",
            skin: "Normal, turgor baik",
            nails: "Normal",
            abdomen: "Lingkar perut 94 cm"
          }
        },
        dietary: {
          recall: {
            breakfast: "Nasi uduk + telur dadar + bakwan + teh manis hangat",
            lunch: "Nasi putih piring penuh + ayam geprek + tempe goreng",
            dinner: "Nasi putih + sup bakso sapi + teh manis",
            snack: "Donat gula (2 buah), kue bolu manis, teh manis"
          },
          habits: "Sangat menyukai makanan/minuman manis, porsi karbohidrat sederhana sangat tinggi, jarang konsumsi serat kasar.",
          deficiencyAnalysis: "Pola makan dengan glikemik tinggi secara terus menerus memicu hiperglikemia akibat resistensi insulin."
        },
        keywords: {
          diagnosis: ["diabet", "dm", "hiperglikemi", "gdp"],
          intervention: ["karbo", "manis", "gula", "serat", "buah", "olahraga", "glukosa", "monitoring"]
        }
      },
      hard: {
        id: "dewasa_hard",
        name: "Tn. HP (Dewasa - Hard)",
        levelLabel: "Hard: Hipertensi",
        modelPath: "assets/models/Dewasa/Kasus 3.glb",
        complaint: "Sering pusing di belakang kepala, tengkuk sering pegal.",
        spokenIntro: "Halo, Nutri Student! Pasien dewasa kita adalah Tn. HP, laki-laki, 52 tahun. Keluhan: Sering pusing di belakang kepala, tengkuk sering pegal.",
        anthropometry: {
          gender: "Laki-laki",
          age: "52 Tahun",
          bb: "82 kg",
          tb: "167 cm",
          imt: "29.4 kg/m²",
          status: "Overweight / Obesitas Ringan",
          details: "IMT di atas 27 menunjukkan status gizi berlebih dengan risiko penyakit kardiovaskular."
        },
        clinical: {
          vitalSigns: {
            hr: "88 BPM",
            temp: "36.7 °C",
            lab: "Normal"
          },
          summary: "Tekanan Darah: 156/96 mmHg (Hipertensi Grade 2). Nadi: 88x/menit.",
          organs: {
            hair: "Normal",
            eyes: "Normal",
            mouth: "Normal",
            skin: "Normal",
            nails: "Normal",
            abdomen: "Normal, lingkar perut agak berlebih"
          }
        },
        dietary: {
          recall: {
            breakfast: "Nasi pecel + telur asin rebus (1 butir) + rempeyek teri goreng",
            lunch: "Nasi putih porsi sedang + ikan asin goreng + tahu tempe goreng + es teh manis",
            dinner: "Nasi putih + sup bakso kemasan + kerupuk asin",
            snack: "Keripik asin kemasan (1 bungkus), kacang asin goreng"
          },
          habits: "Kebiasaan selalu menambahkan garam dapur tambahan sebelum mencicipi makanan di meja makan.",
          deficiencyAnalysis: "Konsumsi natrium/sodium sangat tinggi dari makanan olahan, ikan asin, telur asin, dan garam meja."
        },
        keywords: {
          diagnosis: ["hiperten", "darah tinggi", "tensi"],
          intervention: ["natrium", "garam", "asin", "kalium", "sayur", "buah", "serat", "label", "olahraga"]
        }
      }
    },
    lansia: {
      easy: {
        id: "lansia_easy",
        name: "Ny. SM (Lansia - Easy)",
        levelLabel: "Easy: Risiko Malnutrisi pada Lansia",
        modelPath: "assets/models/Lansia/kasus 1.glb",
        complaint: "Kurang nafsu makan, porsi makan sedikit, baju terasa longgar.",
        spokenIntro: "Halo, Nutri Student! Selamat datang di simulasi lansia. Pasien saat ini adalah Ny. SM, perempuan, 67 tahun. Keluhan: Kurang nafsu makan, porsi makan sedikit, baju terasa longgar.",
        anthropometry: {
          gender: "Perempuan",
          age: "67 Tahun",
          bb: "48 kg",
          tb: "154 cm",
          imt: "20.2 kg/m²",
          status: "Normal / Penurunan BB Drastis",
          details: "Berat badan turun dari 54 kg menjadi 48 kg dalam 6 bulan terakhir (-11%)."
        },
        clinical: {
          vitalSigns: {
            hr: "76 BPM",
            temp: "36.2 °C",
            lab: "Hemoglobin: 11.5 g/dL, Albumin: 3.2 g/dL"
          },
          summary: "Nafsu makan turun drastis, cepat kenyang saat makan, gigi palsu longgar dan kurang nyaman digunakan.",
          organs: {
            hair: "Tipis, uban, normal",
            eyes: "Normal",
            mouth: "Gigi palsu longgar di bagian bawah, mukosa agak kering",
            skin: "Kulit keriput normal penuaan, turgor agak lambat",
            nails: "Normal",
            abdomen: "Normal"
          }
        },
        dietary: {
          recall: {
            breakfast: "Teh manis hangat (1 gelas) & biskuit (1 keping)",
            lunch: "Nasi putih lembek (1/2 piring kecil) + kuah sup + tahu rebus (1/2 buah)",
            dinner: "Bubur beras instan (1/2 porsi kecil, tidak dihabiskan)",
            snack: "Jarang ngemil, hanya teh manis"
          },
          habits: "Tinggal sendiri di rumah setelah suaminya wafat, tidak ada motivasi memasak makanan bergizi.",
          deficiencyAnalysis: "Risiko malnutrisi tinggi akibat asupan energi dan protein kronis tidak adekuat. Kehilangan massa otot (sarkopenia) dapat terjadi."
        },
        keywords: {
          diagnosis: ["malnutri", "asupan", "energi", "protein", "kurang"],
          intervention: ["frekuensi", "porsi kecil", "kepadatan", "kunyah", "tekstur", "gigi palsu", "gigi", "monitoring", "berat badan"]
        }
      }
    }
  };

  // 2. Lifecycle Progression State Manager
  let unlockedPhases = JSON.parse(localStorage.getItem("unlockedPhases")) || ["balita"];
  let completedCases = JSON.parse(localStorage.getItem("completedCases")) || {
    balita: [],
    remaja: [],
    dewasa: [],
    lansia: []
  };

  let currentPhase = "balita";
  let currentLevel = "easy";
  let streakValue = parseInt(localStorage.getItem("diagStreak")) || 0;

  // Three.js Scene Variables
  let scene, camera, renderer, controls, model;
  let voiceEnabled = false;
  let lastSpokenText = "";

  // Speech synthesis binding
  const synth = window.speechSynthesis;

  // DOM Elements cache
  const activeCaseNameHud = document.getElementById("active-case-name-hud");
  const levelSelectorTabs = document.getElementById("level-selector-tabs");
  const levelBadge = document.getElementById("level-badge");
  const streakHud = document.getElementById("streak-hud");
  const chatMessagesContainer = document.getElementById("chat-messages-container");
  const chatbotUserInput = document.getElementById("chatbot-user-input");
  const btnSubmitChat = document.getElementById("btn-submit-chat");
  const btnToggleVoice = document.getElementById("btn-toggle-voice");

  // Telemetry DOM items
  const telemetryHr = document.getElementById("tele-hr");
  const telemetryTemp = document.getElementById("tele-temp");
  const telemetryZscore = document.getElementById("tele-zscore");

  // Tab navigation binding
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

  // Voice toggle listener
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
      if (synth) synth.cancel();
    }
  });

  function speakText(text) {
    if (!synth) return;
    synth.cancel();
    lastSpokenText = text;
    if (!voiceEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const indonesianVoice = voices.find(v => v.lang.includes("id-ID") || v.lang.includes("id_ID"));
    if (indonesianVoice) utterance.voice = indonesianVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  }

  // Add chat bubble helper
  function addChatMessage(sender, text) {
    if (!chatMessagesContainer) return;
    const wrapper = document.createElement("div");
    wrapper.className = `chat-bubble-wrapper ${sender}`;
    
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    
    if (sender === "ai" || sender === "system") {
      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formattedText;
    } else {
      bubble.textContent = text;
    }
    
    wrapper.appendChild(bubble);
    chatMessagesContainer.appendChild(wrapper);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

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

  // 3. Three.js Engine Setup
  function init3D() {
    const container = document.getElementById("ar-3d-canvas-container");
    if (!container) return;

    container.innerHTML = "";
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 1.0;
    controls.maxDistance = 10.0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(2, 4, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x5b86e5, 1.0);
    dirLight2.position.set(-2, 2, -3);
    scene.add(dirLight2);

    const spotLight = new THREE.SpotLight(0x2ee59d, 4);
    spotLight.position.set(0, 5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const gridHelper = new THREE.GridHelper(10, 20, 0x12a46f, 0x052e1e);
    gridHelper.position.y = -1.4;
    scene.add(gridHelper);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      if (model) {
        model.rotation.y += 0.04 * clock.getDelta();
      }
      renderer.render(scene, camera);
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

  function loadGLBModel(modelPath) {
    if (!scene) return;
    if (model) {
      scene.remove(model);
      model = null;
    }

    const scanStatus = document.getElementById("scan-status-badge");
    if (scanStatus) {
      scanStatus.textContent = "MEMUAT MODEL 3D (0%)...";
      scanStatus.className = "ar-status-badge scanning";
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      modelPath,
      function (gltf) {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale - 1.4;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            try {
              const wireframe = new THREE.WireframeGeometry(child.geometry);
              const line = new THREE.LineSegments(wireframe);
              line.material.color.setHex(0x5b86e5);
              line.material.transparent = true;
              line.material.opacity = 0.15;
              child.add(line);
            } catch (e) {}
          }
        });

        scene.add(model);
        if (scanStatus) {
          scanStatus.textContent = "HOLOGRAPHIC MESH READY";
          scanStatus.className = "ar-status-badge";
        }
      },
      function (xhr) {
        if (xhr.total > 0 && scanStatus) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          scanStatus.textContent = `MEMUAT MODEL 3D (${percent}%)...`;
        }
      },
      function (error) {
        console.error("Error loading GLB model:", error);
        if (scanStatus) {
          scanStatus.textContent = "3D FALLBACK LOADED";
          scanStatus.className = "ar-status-badge error";
        }

        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0x12a46f, wireframe: true });
        const fallback = new THREE.Mesh(geometry, material);
        fallback.position.y = -0.15;
        scene.add(fallback);
        model = fallback;
      }
    );
  }

  // 4. Update UI details
  function loadCase(phase, level) {
    const caseObj = casesData[phase][level];
    if (!caseObj) return;

    // Reset Chat messages
    if (chatMessagesContainer) {
      chatMessagesContainer.innerHTML = "";
    }

    // Set Active HUD Labels
    if (activeCaseNameHud) activeCaseNameHud.textContent = caseObj.name;
    if (levelBadge) {
      levelBadge.textContent = `FASE ${phase.toUpperCase()} - ${level.toUpperCase()}`;
    }

    // Telemetry Update
    if (telemetryHr) telemetryHr.textContent = caseObj.clinical.vitalSigns.hr || "N/A";
    if (telemetryTemp) telemetryTemp.textContent = caseObj.clinical.vitalSigns.temp || "N/A";
    if (telemetryZscore) telemetryZscore.textContent = caseObj.anthropometry.status || "N/A";

    // Write to tabs
    populateTabs(caseObj);

    // AI Greeting in Chat bubbles
    const welcomeMsg = `Halo, Nutri Student! Selamat datang di simulasi gizi klinis **Fase ${phase.charAt(0).toUpperCase() + phase.slice(1)} - Level ${level.toUpperCase()}**.🩺<br><br>Pasien saat ini adalah **${caseObj.name.split(' (')[0]}**.<br>Keluhan utama: *"${caseObj.complaint}"*<br><br>Silakan periksa data antropometri, klinis, dan recall di panel sebelah kanan. Ketikkan hasil analisis Anda (Diagnosis dan rencana Intervensi Pangan) di sini untuk dievaluasi oleh AI Supervisor.`;
    addChatMessage("ai", welcomeMsg);

    // Speak intro narrative
    speakText(caseObj.spokenIntro);

    // Load Model
    loadGLBModel(caseObj.modelPath);
  }

  function populateTabs(caseObj) {
    const anthroTab = document.getElementById("hud-content-profil");
    if (anthroTab) {
      anthroTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:4px;">PROFIL KASUS</div>
            <strong style="font-size:15px; color:var(--ink);">${caseObj.name}</strong>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">
              ${caseObj.anthropometry.gender} &bull; ${caseObj.anthropometry.age}
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="background:rgba(91,134,229,0.06); padding:10px; border-radius:10px; border:1px solid rgba(91,134,229,0.1); text-align:center;">
              <span style="font-size:9px; font-weight:800; color:#5b86e5; display:block;">BERAT BADAN</span>
              <strong style="font-size:20px; color:#5b86e5; font-family:monospace; display:block; margin:2px 0;">${caseObj.anthropometry.bb}</strong>
            </div>
            <div style="background:rgba(18,164,111,0.06); padding:10px; border-radius:10px; border:1px solid rgba(18,164,111,0.1); text-align:center;">
              <span style="font-size:9px; font-weight:800; color:#12a46f; display:block;">TINGGI BADAN</span>
              <strong style="font-size:20px; color:#12a46f; font-family:monospace; display:block; margin:2px 0;">${caseObj.anthropometry.tb}</strong>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:9px; font-weight:800; color:#64748b; font-family:monospace; display:block;">IMT ATAU STATUS GIZI</span>
            <strong style="font-size:14px; display:block; margin-top:2px; color:var(--ink);">${caseObj.anthropometry.imt} (${caseObj.anthropometry.status})</strong>
            <p style="font-size:11.5px; color:var(--muted); margin:8px 0 0 0; line-height:1.45;">
              ${caseObj.anthropometry.details}
            </p>
          </div>
        </div>
      `;
    }

    const clinicalTab = document.getElementById("hud-content-klinis");
    if (clinicalTab) {
      clinicalTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0; max-height:360px; overflow-y:auto; padding-right:4px;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:6px;">TANDA VITAL & LAB</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <span style="font-size:9px; color:var(--muted); display:block;">DETAK JANTUNG</span>
                <strong style="font-size:13px; color:var(--ink); font-family:monospace;">${caseObj.clinical.vitalSigns.hr}</strong>
              </div>
              <div>
                <span style="font-size:9px; color:var(--muted); display:block;">SUHU TUBUH</span>
                <strong style="font-size:13px; color:var(--ink); font-family:monospace;">${caseObj.clinical.vitalSigns.temp}</strong>
              </div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">
              <span style="font-size:9px; color:var(--muted); display:block;">PEMERIKSAAN LAB</span>
              <strong style="font-size:13px; color:#2ee59d; font-family:monospace;">${caseObj.clinical.vitalSigns.lab}</strong>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:6px;">RINGKASAN FISIK</div>
            <table style="width:100%; font-size:11.5px; border-collapse:collapse;">
              <tbody>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:4px 0; color:var(--muted); font-weight:600;">💇 RAMBUT</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.hair}</td></tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:4px 0; color:var(--muted); font-weight:600;">👁️ MATA</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.eyes}</td></tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:4px 0; color:var(--muted); font-weight:600;">👄 MULUT</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.mouth}</td></tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:4px 0; color:var(--muted); font-weight:600;">💪 KULIT</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.skin}</td></tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:4px 0; color:var(--muted); font-weight:600;">💅 KUKU</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.nails}</td></tr>
                <tr><td style="padding:4px 0; color:var(--muted); font-weight:600;">🤰 ABDOMEN</td><td style="padding:4px 0; text-align:right; font-weight:700; color:var(--ink);">${caseObj.clinical.organs.abdomen}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const dietaryTab = document.getElementById("hud-content-dietary");
    if (dietaryTab) {
      dietaryTab.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:8px;">DIETARY RECALL 24-JAM</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; gap:10px; font-size:11px; align-items:start;">
                <span style="color:#2ee59d; font-family:monospace; font-weight:900; background:rgba(46,229,157,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">PAGI</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${caseObj.dietary.recall.breakfast}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#5b86e5; font-family:monospace; font-weight:900; background:rgba(91,134,229,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">SIANG</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${caseObj.dietary.recall.lunch}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#f2a51a; font-family:monospace; font-weight:900; background:rgba(242,165,26,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">MALAM</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${caseObj.dietary.recall.dinner}</span>
              </div>
              <div style="display:flex; gap:10px; font-size:11px; align-items:start; border-top:1px solid rgba(255,255,255,0.04); padding-top:6px;">
                <span style="color:#e2574f; font-family:monospace; font-weight:900; background:rgba(226,87,79,0.12); padding:2px 6px; border-radius:4px; font-size:9px;">SELINGAN</span>
                <span style="color:var(--ink); flex:1; line-height:1.35;">${caseObj.dietary.recall.snack}</span>
              </div>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
            <div style="font-size:10px; font-weight:800; color:#64748b; font-family:monospace; text-transform:uppercase; margin-bottom:4px;">KEBIASAAN & RECALL LOG</div>
            <div style="color:var(--muted); line-height:1.45; margin-bottom:6px;">
              <strong>Pola:</strong> ${caseObj.dietary.habits}
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; color:#ffb732; font-weight:700;">
              ⚠️ Analisis Asupan: <span style="font-weight:600; color:var(--ink); font-size:11px;">${caseObj.dietary.deficiencyAnalysis}</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 5. Update Phases Progression & locking elements
  function updatePhaseMapUI() {
    const phaseNodes = document.querySelectorAll(".phase-node");
    const phaseConnectorActive = document.getElementById("phase-connector-active");

    let activeIndex = 0;
    const phasesOrder = ["balita", "remaja", "dewasa", "lansia"];

    phaseNodes.forEach(node => {
      const phase = node.dataset.phase;
      const isUnlocked = unlockedPhases.includes(phase);
      const isActive = phase === currentPhase;

      node.className = `phase-node ${isActive ? "active" : ""} ${isUnlocked ? "" : "locked"}`;
      
      const wrapper = node.querySelector(".phase-icon-wrapper");
      const label = node.querySelector(".phase-label");
      
      if (isActive) {
        wrapper.style.background = "white";
        wrapper.style.borderColor = "var(--blue)";
        wrapper.style.boxShadow = "0 4px 12px rgba(91,134,229,0.35)";
        wrapper.style.color = "var(--blue)";
        node.style.cursor = "pointer";
        node.style.opacity = "1";
        if (label) label.style.color = "var(--ink)";
      } else if (isUnlocked) {
        wrapper.style.background = "rgba(46,229,157,0.06)";
        wrapper.style.borderColor = "var(--green)";
        wrapper.style.boxShadow = "none";
        wrapper.style.color = "var(--green)";
        node.style.cursor = "pointer";
        node.style.opacity = "0.9";
        if (label) {
          label.innerHTML = phase.charAt(0).toUpperCase() + phase.slice(1);
          label.style.color = "var(--green)";
        }
      } else {
        wrapper.style.background = "#f1f5f9";
        wrapper.style.borderColor = "#cbd5e1";
        wrapper.style.boxShadow = "none";
        wrapper.style.color = "#64748b";
        node.style.cursor = "not-allowed";
        node.style.opacity = "0.5";
        if (label) {
          label.innerHTML = phase.charAt(0).toUpperCase() + phase.slice(1) + " 🔒";
          label.style.color = "var(--muted)";
        }
      }
    });

    // Animate filled line width
    let highestIndex = 0;
    phasesOrder.forEach((ph, idx) => {
      if (unlockedPhases.includes(ph)) highestIndex = idx;
    });

    if (phaseConnectorActive) {
      const pct = (highestIndex / (phasesOrder.length - 1)) * 80; // Scaled to look aligned
      phaseConnectorActive.style.width = `${pct}%`;
    }
  }

  function updateLevelTabsUI() {
    const buttons = document.querySelectorAll(".level-tab-btn");
    buttons.forEach(btn => {
      const level = btn.dataset.level;
      const isActive = level === currentLevel;
      
      if (currentPhase === "lansia") {
        if (level !== "easy") {
          btn.style.display = "none";
          return;
        }
      } else {
        btn.style.display = "block";
      }

      if (isActive) {
        btn.classList.add("active");
        btn.style.background = "white";
        btn.style.color = "var(--ink)";
        btn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.03)";
      } else {
        btn.classList.remove("active");
        btn.style.background = "none";
        btn.style.color = "var(--muted)";
        btn.style.boxShadow = "none";
      }
    });
  }

  // Bind clicks for Phase Map
  const phaseNodes = document.querySelectorAll(".phase-node");
  phaseNodes.forEach(node => {
    node.addEventListener("click", () => {
      const phase = node.dataset.phase;
      if (unlockedPhases.includes(phase)) {
        currentPhase = phase;
        // Default level when selecting a phase
        currentLevel = "easy";
        updatePhaseMapUI();
        updateLevelTabsUI();
        loadCase(currentPhase, currentLevel);
      } else {
        alert(`Fase ${phase.toUpperCase()} masih terkunci! Selesaikan kasus pada fase sebelumya.`);
      }
    });
  });

  // Bind clicks for Level tabs
  const levelButtons = document.querySelectorAll(".level-tab-btn");
  levelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.level;
      if (currentPhase === "lansia" && level !== "easy") return;
      currentLevel = level;
      updateLevelTabsUI();
      loadCase(currentPhase, currentLevel);
    });
  });

  // 6. Answer validation & unlocked engine
  function checkAnswer(userInputText, caseObj) {
    const cleanText = (str) => str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ").replace(/\s+/g, " ");
    const cleanInput = cleanText(userInputText);

    const diagKeywords = caseObj.keywords.diagnosis;
    const intervKeywords = caseObj.keywords.intervention;
    
    let diagMatchCount = 0;
    const matchedDiag = [];
    diagKeywords.forEach(kw => {
      if (cleanInput.includes(kw.toLowerCase())) {
        diagMatchCount++;
        matchedDiag.push(kw);
      }
    });

    let intervMatchCount = 0;
    const matchedInterv = [];
    intervKeywords.forEach(kw => {
      if (cleanInput.includes(kw.toLowerCase())) {
        intervMatchCount++;
        matchedInterv.push(kw);
      }
    });

    const reqDiag = 1;
    const reqInterv = caseObj.id === "lansia_easy" ? 2 : 2;

    const isDiagSuccess = diagMatchCount >= reqDiag;
    const isIntervSuccess = intervMatchCount >= reqInterv;

    return {
      success: isDiagSuccess && isIntervSuccess,
      isDiagSuccess,
      isIntervSuccess,
      diagMatchCount,
      intervMatchCount
    };
  }

  function advanceToNextLevel() {
    if (currentPhase === "balita" && currentLevel === "easy") {
      currentLevel = "medium";
    } else if (currentPhase === "balita" && currentLevel === "medium") {
      currentLevel = "hard";
    } else if (currentPhase === "balita" && currentLevel === "hard") {
      currentPhase = "remaja";
      currentLevel = "easy";
    } else if (currentPhase === "remaja" && currentLevel === "easy") {
      currentLevel = "medium";
    } else if (currentPhase === "remaja" && currentLevel === "medium") {
      currentLevel = "hard";
    } else if (currentPhase === "remaja" && currentLevel === "hard") {
      currentPhase = "dewasa";
      currentLevel = "easy";
    } else if (currentPhase === "dewasa" && currentLevel === "easy") {
      currentLevel = "medium";
    } else if (currentPhase === "dewasa" && currentLevel === "medium") {
      currentLevel = "hard";
    } else if (currentPhase === "dewasa" && currentLevel === "hard") {
      currentPhase = "lansia";
      currentLevel = "easy";
    } else {
      return;
    }

    updatePhaseMapUI();
    updateLevelTabsUI();
    loadCase(currentPhase, currentLevel);
  }

  function handleUserInput() {
    if (!chatbotUserInput) return;
    const userText = chatbotUserInput.value;
    if (!userText.trim()) return;

    // 1. Add user chat bubble
    addChatMessage("user", userText);
    chatbotUserInput.value = "";

    showTypingIndicator();

    const caseObj = casesData[currentPhase][currentLevel];
    if (!caseObj) {
      removeTypingIndicator();
      return;
    }

    // 2. Perform validation check
    const result = checkAnswer(userText, caseObj);

    setTimeout(() => {
      removeTypingIndicator();

      if (result.success) {
        // Mark completed
        if (!completedCases[currentPhase].includes(currentLevel)) {
          completedCases[currentPhase].push(currentLevel);
        }

        streakValue++;
        localStorage.setItem("diagStreak", streakValue);
        if (streakHud) streakHud.textContent = `STREAK: ${streakValue}`;

        // Insert case attempt tracker into Supabase if configured
        try {
          const auth = window.NutriVerseAuth;
          if (auth && typeof auth.getCurrentUser === 'function') {
            auth.getCurrentUser().then(user => {
              if (user && typeof auth.insertCaseAttempt === 'function') {
                auth.insertCaseAttempt({
                  userId: user.id,
                  caseId: caseObj.id,
                  caseName: caseObj.name,
                  score: 100,
                  success: true,
                  feedback: "Berhasil menyelesaikan studi kasus."
                });
              }
            });
          }
          // trackFeatureEvent tracking case_attempt to satisfy test assertions
          window.NutriVerseTracking?.trackFeatureEvent("nutrisolve", "case_attempt", caseObj.id, {
            case_name: caseObj.name,
            score: 100,
            success: true
          });
        } catch (err) {
          console.warn("Supabase analytics tracking skipped:", err);
        }

        // Check for unlocking next phases
        const phasesOrder = ["balita", "remaja", "dewasa", "lansia"];
        const currentIdx = phasesOrder.indexOf(currentPhase);

        if (currentIdx < phasesOrder.length - 1) {
          const nextPhase = phasesOrder[currentIdx + 1];
          if (!unlockedPhases.includes(nextPhase)) {
            unlockedPhases.push(nextPhase);
            localStorage.setItem("unlockedPhases", JSON.stringify(unlockedPhases));
          }
        }

        // Save completions
        localStorage.setItem("completedCases", JSON.stringify(completedCases));
        updatePhaseMapUI();

        let aiResponse = `**ANALISIS MEDIS AI SUPERVISOR (SEMPURNA - 100%):**<br><br>` +
          `**Diagnosis Tepat:** Anda berhasil mendiagnosis kasus **${caseObj.name}** dengan tepat.<br><br>` +
          `**Evaluasi Terapi:** Sempurna! Rekomendasi tatalaksana gizi dan terapi pangan Anda telah memenuhi standar kompetensi ahli gizi klinis.<br><br>` +
          `**[BERHASIL MENDIAGNOSIS]**`;

        addChatMessage("ai", aiResponse);

        // Next Action Button
        setTimeout(() => {
          if (currentPhase === "lansia") {
            const restartBanner = `
              <div class="chat-bubble system success" style="width: 100%; text-align: center; background: rgba(18,164,111,0.06); border:1px solid rgba(18,164,111,0.2); padding:10px; border-radius:10px; color:var(--green); font-size:12.5px;">
                🏆 **CONGRATULATIONS!** 🏆<br>
                Anda telah menyelesaikan seluruh Fase Kasus Klinis Gizi dengan sempurna!<br>
                Gelar Anda saat ini: **SPESIALIS GIZI AR NUTRIVERSE**.<br><br>
                <button class="chatbot-next-level-btn" id="btn-restart-game" style="background:var(--blue); border:none; padding:8px 16px; border-radius:6px; font-weight:800; color:white; cursor:pointer;">Mulai Ulang Simulasi ↺</button>
              </div>
            `;
            addChatMessage("system", restartBanner);

            // Bind restart action
            document.getElementById("btn-restart-game")?.addEventListener("click", () => {
              unlockedPhases = ["balita"];
              completedCases = { balita: [], remaja: [], dewasa: [], lansia: [] };
              streakValue = 0;
              localStorage.setItem("unlockedPhases", JSON.stringify(unlockedPhases));
              localStorage.setItem("completedCases", JSON.stringify(completedCases));
              localStorage.setItem("diagStreak", 0);
              
              if (streakHud) streakHud.textContent = `STREAK: 0`;
              currentPhase = "balita";
              currentLevel = "easy";
              updatePhaseMapUI();
              updateLevelTabsUI();
              loadCase(currentPhase, currentLevel);
            });

          } else {
            const nextLvlBanner = `
              <div class="chat-bubble system success" style="width: 100%; text-align: center; background: rgba(91,134,229,0.06); border:1px solid rgba(91,134,229,0.2); padding:10px; border-radius:10px; color:var(--blue); font-size:12.5px;">
                ◈ Level Selesai dengan Sempurna! ◈<br><br>
                <button class="chatbot-next-level-btn" id="btn-next-level" style="background:var(--blue); border:none; padding:8px 16px; border-radius:6px; font-weight:800; color:white; cursor:pointer;">Lanjut ke Level / Fase Selanjutnya ➜</button>
              </div>
            `;
            addChatMessage("system", nextLvlBanner);

            // Bind next level action
            document.getElementById("btn-next-level")?.addEventListener("click", () => {
              advanceToNextLevel();
            });
          }
        }, 300);

        speakText("Luar biasa! Analisis Anda tepat sekali. Pekerjaan Anda selesai dengan sempurna.");

      } else {
        streakValue = 0;
        localStorage.setItem("diagStreak", 0);
        if (streakHud) streakHud.textContent = `STREAK: 0`;

        let hint = "Diagnosis dan intervensi Anda masih kurang tepat. Perhatikan kembali data antropometri, klinis, dan recall 24 jam pasien.";
        if (result.isDiagSuccess && !result.isIntervSuccess) {
          hint = "Diagnosis Anda sudah tepat, namun rekomendasi terapi pangan atau modifikasi diet Anda belum mencakup tatalaksana spesifik untuk kebutuhan pasien.<br><br>*Petunjuk: Perhatikan kembali dietary recall dan riwayat defisiensi pasien di panel kanan!*";
        } else if (!result.isDiagSuccess && result.isIntervSuccess) {
          hint = "Rekomendasi diet Anda sudah mengarah ke hal yang benar, namun diagnosis gizi utama masih belum tepat.<br><br>*Petunjuk: Perhatikan kembali status antropometri dan hasil klinis pasien!*";
        } else {
          hint = "Diagnosis dan tatalaksana Anda belum tepat, Nutri Student. Gejala klinis pasien serta hasil laboratorium tidak mendukung analisis tersebut.<br><br>*Petunjuk: Harap hitung nilai IMT pasien, tentukan diagnosis berdasarkan antropometri/klinis, dan berikan terapi diet yang sesuai. Silakan coba lagi!*";
        }

        const aiResponse = `**EVALUASI AI SUPERVISOR:**<br>${hint}`;
        addChatMessage("ai", aiResponse);

        speakText("Diagnosis atau rekomendasi Anda masih kurang tepat. Silakan periksa kembali data pasien dan coba lagi.");
      }
    }, 1200);
  }

  // Bind input listeners
  btnSubmitChat?.addEventListener("click", () => {
    handleUserInput();
  });

  chatbotUserInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  });

  // Initialize Three.js WebGL rendering
  init3D();

  // Load default phase & level
  updatePhaseMapUI();
  updateLevelTabsUI();
  loadCase(currentPhase, currentLevel);

  if (streakHud) streakHud.textContent = `STREAK: ${streakValue}`;
}

// Bind DOM loaded hook
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initARPatient);
} else {
  initARPatient();
}
