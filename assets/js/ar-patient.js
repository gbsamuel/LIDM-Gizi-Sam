// ==========================================================================
// NutriVerse AR 3D Patient Visualization & AI Diagnostic Engine (Interactive)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Case Studies Database with spoken first-person narratives
  const cases = {
    kwashiorkor: {
      id: "kwashiorkor",
      name: "Balita Laki-Laki (3 Tahun) - KEP Berat (Kwashiorkor)",
      complaint: "Dokter, anak saya ini lemas sekali sejak sebulan terakhir. Kakinya bengkak gembung air, rambutnya berubah kemerahan kasar mirip rambut jagung dan gampang sekali rontok kalau disisir. Dia juga tidak nafsu makan sama sekali...",
      spokenIntro: "Dokter, anak saya ini lemas sekali sejak sebulan terakhir. Kakinya bengkak gembung air, rambutnya berubah kemerahan kasar mirip rambut jagung dan gampang sekali rontok kalau disisir. Dia juga tidak nafsu makan sama sekali...",
      hotspotVoices: {
        hair: "Rambut anak saya kok kering kusam dan berubah kemerahan kayak rambut jagung ya, Dok? Tipis banget dan gampang rontok kalau disisir.",
        eyes: "Matanya terlihat sayu banget, Dok. Terus kelopak matanya juga bengkak sembab, tatapannya lemas dan apatis.",
        mouth: "Bibirnya kering pecah-pecah sekali, Dok, terus di sudut bibirnya ada luka retak meradang yang perih.",
        skin: "Di paha sama bokongnya ada bercak gelap bersisik yang terkelupas lebar-lebar, perih sekali mirip cat dinding mengelupas.",
        nails: "Kuku jarinya tipis sekali, rapuh, dan ada garis-garis putih mendatar di atas permukaannya.",
        abdomen: "Perut anak saya buncit besar sekali kayak kembung air karena bengkak gizi, Dok. Padahal tangannya kurus banget."
      },
      telemetry: {
        hr: "108 BPM",
        temp: "35.8 °C (Hipotermia)",
        zscore: "-3.4 SD (Gizi Buruk Akut)"
      },
      hotspots: {
        hair: "Rambut kering kusam, berwarna kemerahan jingga (Flag Sign), sangat tipis dan rapuh, serta mudah dicabut tanpa menimbulkan rasa sakit.",
        eyes: "Mata sayu, kelopak mata agak sembap (edema palpebra), sklera bersih tetapi tatapan sangat apatis.",
        mouth: "Bibir kering pecah-pecah (Cheilosis) dan sudut bibir luka retak meradang (Angular Stomatitis).",
        skin: "Bercak-bercak pigmentasi gelap bersisik yang mengelupas lebar di paha dan bokong, menyerupai cat mengelupas (Crazy Pavement Dermatosis).",
        nails: "Kuku jari tipis, rapuh, dengan guratan horizontal putih (Muehrcke's lines).",
        abdomen: "Perut sangat buncit tegang (Ascites / Busung Air) akibat penimbunan cairan interstitial dari hipoalbuminemia berat, hati membesar (Hepatomegali)."
      },
      visualState: {
        hairColor: "#f39c12", // Amber/Reddish
        skinColor: "#dfbda7",
        abdomenScale: "scale(1.2) translate(-15px, -15px)",
        eyeGlow: "rgba(226, 87, 79, 0.4)",
        paleFactor: 0.8
      },
      correctDiagnosis: "kwashiorkor",
      correctTherapy: "f75-f100"
    },
    vad: {
      id: "vad",
      name: "Anak Perempuan (4 Tahun) - Defisiensi Vitamin A",
      complaint: "Mata anak saya akhir-akhir ini sering berair merah, dan dia selalu mengeluh perih kalau melihat cahaya silau. Tapi yang paling saya khawatirkan, kalau sore hari menjelang maghrib dia sering menabrak barang dan tersandung karena tidak jelas melihat...",
      spokenIntro: "Mata anak saya akhir-akhir ini sering berair merah, dan dia selalu mengeluh perih kalau melihat cahaya silau. Tapi yang paling saya khawatirkan, kalau sore hari menjelang maghrib dia sering menabrak barang dan tersandung karena tidak jelas melihat...",
      hotspotVoices: {
        hair: "Rambut anak saya normal saja Dok, cuma agak sedikit kasar tapi tidak rapuh atau rontok.",
        eyes: "Matanya kering merah, dan ada plak putih keabuan berbentuk segitiga di pinggir hitam matanya, Dok. Korneanya kusam.",
        mouth: "Rongga mulut anak saya normal-normal saja kok, Dok, tidak ada sariawan.",
        skin: "Kulit lengan dan pahanya sangat kering bersisik kasar, dan bruntusan keras kayak duri mirip kulit katak, Dok.",
        nails: "Kuku jarinya normal dan rata, tidak ada masalah apa-apa.",
        abdomen: "Perutnya rata dan normal saja Dok, tidak buncit atau bengkak."
      },
      telemetry: {
        hr: "84 BPM",
        temp: "36.6 °C (Normal)",
        zscore: "-1.1 SD (Gizi Kurang Ringan)"
      },
      hotspots: {
        hair: "Rambut normal, agak kasar tetapi tidak mudah rontok atau berubah warna.",
        eyes: "Konjungtiva kering (Xerosis) dengan plak berbusa putih keabuan berbentuk segitiga di tepi luar hitam mata (Bercak Bitot / Bitot's Spots). Kornea tampak kusam.",
        mouth: "Rongga mulut normal, tidak ada sariawan.",
        skin: "Kulit sangat kering berbenjol-benjol keras seperti duri di sekitar folikel rambut lengan bawah dan paha, mirip kulit katak (Follicular Hyperkeratosis / Phrynoderma).",
        nails: "Kuku normal, permukaan datar tanpa kelainan bentuk.",
        abdomen: "Dinding perut rata normal, tidak buncit ataupun edema."
      },
      visualState: {
        hairColor: "#22252a",
        skinColor: "#c9a0dc",
        abdomenScale: "scale(1)",
        eyeGlow: "rgba(242, 165, 26, 0.8)", // Golden glow
        paleFactor: 1
      },
      correctDiagnosis: "vad",
      correctTherapy: "vita"
    },
    anemia: {
      id: "anemia",
      name: "Remaja Putri (15 Tahun) - Anemia Defisiensi Besi",
      complaint: "Saya gampang sekali lelah, lesu, dan selalu mengantuk saat mendengarkan penjelasan guru di kelas. Konsentrasi saya turun drastis, kepala saya sering terasa kliyengan pusing berputar, dan jantung saya kadang berdebar kencang saat naik tangga...",
      spokenIntro: "Saya gampang sekali lelah, lesu, dan selalu mengantuk saat mendengarkan penjelasan guru di kelas. Konsentrasi saya turun drastis, kepala saya sering terasa kliyengan pusing berputar, dan jantung saya kadang berdebar kencang saat naik tangga...",
      hotspotVoices: {
        hair: "Rambut saya kering, kusam, dan ujung-ujungnya gampang sekali bercabang, Dok.",
        eyes: "Kalau kelopak mata bawah saya ditarik, bagian dalamnya terlihat sangat pucat, hampir berwarna putih susu.",
        mouth: "Bibir saya pucat banget Dok, dan permukaan lidah saya terasa licin mengkilap karena kehilangan papila.",
        skin: "Kulit wajah dan telapak tangan saya kelihatan pucat pasi kekuningan, Dok.",
        nails: "Kuku jari saya tipis, rapuh, dan melengkung ke atas membentuk cekungan di pinggirnya seperti sendok.",
        abdomen: "Perut saya normal-normal saja Dok, tidak ada kembung atau rasa sakit."
      },
      telemetry: {
        hr: "115 BPM (Takikardia)",
        temp: "36.2 °C (Normal)",
        zscore: "-0.8 SD (Normal)"
      },
      hotspots: {
        hair: "Rambut kering, kusam, dan ujungnya mudah bercabang akibat kurangnya pasokan oksigen ke folikel.",
        eyes: "Kelopak mata bagian dalam (Konjungtiva Palpebra) terlihat sangat pucat, hampir berwarna putih susu.",
        mouth: "Bibir tampak sangat pucat kebiruan, lidah licin mengkilap kehilangan papila (Atrophic Glossitis).",
        skin: "Kulit wajah dan telapak tangan terlihat pucat pasi kekuningan (Pallor).",
        nails: "Kuku jari sangat tipis, rapuh, mendatar, dan melengkung ke atas di bagian pinggirnya membentuk cekungan seperti sendok (Spoon Nails / Koilonychia).",
        abdomen: "Perut normal rata, bising usus normal."
      },
      visualState: {
        hairColor: "#1a1c20",
        skinColor: "#e5e0d8", // Pale skin
        abdomenScale: "scale(1)",
        eyeGlow: "rgba(255, 255, 255, 0.2)",
        paleFactor: 0.6 // Extreme pale
      },
      correctDiagnosis: "anemia",
      correctTherapy: "iron-folate"
    },
    pellagra: {
      id: "pellagra",
      name: "Orang Dewasa (32 Tahun) - Pellagra (Defisiensi Vitamin B3)",
      complaint: "Kulit leher dan punggung tangan saya rasanya panas perih menyengat. Awalnya merah mirip luka bakar setelah kena matahari, sekarang tebal bersisik gelap terkelupas simetris kiri-kanan. Saya juga sering mencret hebat, lemas sekali, dan sulit tidur karena cemas...",
      spokenIntro: "Kulit leher dan punggung tangan saya rasanya panas perih menyengat. Awalnya merah mirip luka bakar setelah kena matahari, sekarang tebal bersisik gelap terkelupas simetris kiri-kanan. Saya juga sering mencret hebat, lemas sekali, dan sulit tidur karena cemas...",
      hotspotVoices: {
        hair: "Rambut saya normal dan sehat Dok, tidak ada masalah rontok.",
        eyes: "Mata saya rasanya lelah dan sayu sekali, Dok, karena saya susah tidur nyenyak akhir-akhir ini.",
        mouth: "Lidah saya merah menyala bengkak, Dok, perih sekali dan penuh sariawan di seluruh rongga mulut.",
        skin: "Muncul ruam kulit merah tebal bersisik gelap melingkari leher berbentuk kalung dan di punggung tangan-kaki secara simetris, rasanya perih terbakar.",
        nails: "Kuku saya normal dan bersih, tidak ada kelainan bentuk.",
        abdomen: "Perut saya rasanya kembung begah Dok, dan saya sering mencret hebat beberapa hari ini."
      },
      telemetry: {
        hr: "92 BPM",
        temp: "37.1 °C (Normal)",
        zscore: "-1.8 SD (Kurus)"
      },
      hotspots: {
        hair: "Rambut normal, tidak rapuh.",
        eyes: "Mata tampak lelah dan sayu akibat insomnia berat (efek neurologis kekurangan niasin).",
        mouth: "Lidah berwarna merah menyala terang (Scarlet Glossitis) membengkak hebat, terdapat sariawan menyakitkan di seluruh mukosa pipi.",
        skin: "Lesi dermatitis khas tebal, bersisik, berpigmentasi cokelat gelap melingkari leher berbentuk kalung (Casal's Necklace) dan di punggung tangan-kaki secara simetris.",
        nails: "Kuku normal tanpa kelainan.",
        abdomen: "Perut agak kembung, sering terasa kram akibat gangguan gastrointestinal (Diare kronis)."
      },
      visualState: {
        hairColor: "#111316",
        skinColor: "#a28a7e",
        abdomenScale: "scale(1.05)",
        eyeGlow: "rgba(226, 87, 79, 0.3)",
        paleFactor: 0.95
      },
      correctDiagnosis: "pellagra",
      correctTherapy: "niacin"
    }
  };

  // State Management
  let currentCaseId = "kwashiorkor";
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

  let targetLeftArmRotZ = 1.3;
  let targetRightArmRotZ = -1.3;
  let targetLeftArmRotX = 0;
  let targetRightArmRotX = 0;
  let targetLeftArmRotY = 0;
  let targetRightArmRotY = 0;

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
      if (currentCaseId === "anemia") {
        telemetryHr.textContent = (110 + Math.floor(Math.random() * 8)) + " BPM";
      } else if (currentCaseId === "kwashiorkor") {
        telemetryHr.textContent = (104 + Math.floor(Math.random() * 6)) + " BPM";
      } else {
        telemetryHr.textContent = (78 + Math.floor(Math.random() * 8)) + " BPM";
      }
    }, 2000);
  }

  // Load Case Details
  function loadCase(caseId) {
    currentCaseId = caseId;
    activeHotspotId = null;
    scannedHotspots.clear();
    resetBoneTargets();
    animationState = "idle";
    
    const activeCase = cases[caseId];
    
    // Update active tab styles
    caseButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.case === caseId);
    });

    // Update subjective speech bubble text
    speechBubble.querySelector("p").textContent = `"${activeCase.spokenIntro}"`;
    
    // Play spoken intro narrative
    speakText(activeCase.spokenIntro);

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
      if (activeCase.hotspots[type].includes("normal") || activeCase.hotspots[type].includes("Normal")) {
        hotspot.classList.add("info-cyan");
      } else if (activeCase.hotspots[type].includes("sedikit") || activeCase.hotspots[type].includes("agak")) {
        hotspot.classList.add("warn-yellow");
      } else {
        hotspot.classList.add("warn-red");
      }
    });

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
    
    if (caseId === "kwashiorkor") {
      accentColor = 0xf39c12;
      emissiveColor = 0x1d150a;
    } else if (caseId === "vad") {
      accentColor = 0xf2a51a;
      emissiveColor = 0x1d150a;
    } else if (caseId === "anemia") {
      accentColor = 0xa5f3fc;
      emissiveColor = 0x0a1d1f;
    } else if (caseId === "pellagra") {
      accentColor = 0xe2574f;
      emissiveColor = 0x1d0a0a;
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
    
    // Create Scene with bright clinical fog and clean medical room background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.015);
    
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
          } else if (cleanName === "neck" && !neckBone) {
            neckBone = child;
          } else if ((cleanName === "spine_01" || cleanName === "spine") && !spineBone) {
            spineBone = child;
          } else if (cleanName === "shoulder_l" && !leftShoulderBone) {
            leftShoulderBone = child;
          } else if (cleanName === "shoulder_r" && !rightShoulderBone) {
            rightShoulderBone = child;
          } else if (cleanName === "upperarm_l" && !leftArmBone) {
            leftArmBone = child;
          } else if (cleanName === "upperarm_r" && !rightArmBone) {
            rightArmBone = child;
          } else if (cleanName === "lowerarm_l" && !leftForeArmBone) {
            leftForeArmBone = child;
          } else if (cleanName === "lowerarm_r" && !rightForeArmBone) {
            rightForeArmBone = child;
          }

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(object);
        
        scanStatus.textContent = "HOLOGRAPHIC MESH READY";
        scanStatus.className = "ar-status-badge";
        
        // VISUAL ON-SCREEN DEBUG LOGGER FOR USER DIAGNOSTICS
        const debugOverlay = document.createElement("div");
        debugOverlay.id = "ar-debug-console";
        debugOverlay.style.position = "absolute";
        debugOverlay.style.top = "10px";
        debugOverlay.style.left = "10px";
        debugOverlay.style.background = "rgba(0,0,0,0.85)";
        debugOverlay.style.color = "#00ff66";
        debugOverlay.style.padding = "12px";
        debugOverlay.style.fontFamily = "monospace";
        debugOverlay.style.fontSize = "11px";
        debugOverlay.style.zIndex = "99999";
        debugOverlay.style.borderRadius = "8px";
        debugOverlay.style.border = "2px solid #00ff66";
        debugOverlay.style.boxShadow = "0 0 15px rgba(0,255,102,0.4)";
        debugOverlay.style.pointerEvents = "auto";
        debugOverlay.style.maxHeight = "300px";
        debugOverlay.style.overflowY = "auto";
        
        window.updateDebugOverlay = () => {
          const firstNodes = (window.allFBXNodes || []).slice(0, 25).join(", ");
          debugOverlay.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
              <b>[AR PATIENT RIG DIAGNOSTICS]</b>
              <button onclick="this.parentElement.parentElement.remove()" style="background:#ff3333; color:white; border:none; padding:2px 6px; cursor:pointer; font-size:9px; border-radius:3px;">CLOSE</button>
            </div>
            Model Object: ${model ? "LOADED" : "NULL"}<br>
            Mesh Center (X, Y, Z): ${model ? `${model.position.x.toFixed(2)}, ${model.position.y.toFixed(2)}, ${model.position.z.toFixed(2)}` : "N/A"}<br>
            Bones Found:<br>
            - Spine: ${spineBone ? `<font color=#00ff66>${spineBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Neck: ${neckBone ? `<font color=#00ff66>${neckBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Head: ${headBone ? `<font color=#00ff66>${headBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Left Arm: ${leftArmBone ? `<font color=#00ff66>${leftArmBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Right Arm: ${rightArmBone ? `<font color=#00ff66>${rightArmBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Left Forearm: ${leftForeArmBone ? `<font color=#00ff66>${leftForeArmBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            - Right Forearm: ${rightForeArmBone ? `<font color=#00ff66>${rightForeArmBone.name}</font>` : "<font color=red>NOT FOUND</font>"}<br>
            Last Rotation Z: ${leftArmBone ? leftArmBone.rotation.z.toFixed(2) : "N/A"}<br>
            Error Logs: <span id="ar-debug-errors" style="color:#ff3333;">None</span><br>
            <div style="font-size: 9px; color: #888; max-width: 320px; word-wrap: break-word; margin-top: 4px;">
              <b>First 25 FBX Nodes Traversed:</b><br>
              ${firstNodes || "None"}
            </div>
          `;
        };
        
        window.updateDebugOverlay();
        document.body.appendChild(debugOverlay);
        
        window.addEventListener("error", (e) => {
          const errSpan = document.getElementById("ar-debug-errors");
          if (errSpan) {
            errSpan.innerHTML = `${e.message} at ${e.filename}:${e.lineno}`;
          }
        });

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
              targetSpineRotX = breathCycle * 0.04;    // ~2.3 degrees forward/back
              targetSpineRotY = breathCycleSlow * 0.03; // ~1.7 degrees twist
              targetSpineRotZ = breathCycle * 0.015;
              
              targetNeckRotX = breathCycle * -0.025;
              targetNeckRotY = breathCycleSlow * -0.02;
              
              targetHeadRotX = breathCycle * -0.02;
              targetHeadRotY = breathCycleSlow * 0.04;
              
              // Visible breathing sways for the arms: sways out and in
              targetLeftArmRotZ = 1.3 - breathCycle * 0.04;
              targetRightArmRotZ = -1.3 + breathCycle * 0.04;
              targetLeftArmRotX = breathCycleSlow * 0.03;
              targetRightArmRotX = -breathCycleSlow * 0.03;
            } else if (animationState === "speaking") {
              // Active responsive nodding and natural hand movements to mimic speaking
              let speakCycleX = Math.sin(time * 9.0) * 0.06;
              let speakCycleY = Math.cos(time * 5.0) * 0.05;
              let handGesture = Math.sin(time * 2.8) * 0.15;
              
              targetSpineRotX = breathCycle * 0.03 + speakCycleX * 0.2;
              targetNeckRotX = breathCycle * -0.02 + speakCycleX * 0.3;
              targetHeadRotX = speakCycleX * 1.3;
              targetHeadRotY = speakCycleY * 1.0;
              
              // Arm gesturing while speaking
              targetLeftArmRotZ = 1.3 - handGesture * 0.2;
              targetRightArmRotZ = -1.3 + handGesture * 0.2;
              targetLeftArmRotX = 0.12 + handGesture * 0.6;
              targetRightArmRotX = 0.12 - handGesture * 0.6;
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
    targetSpineRotX = 0;
    targetSpineRotY = 0;
    targetSpineRotZ = 0;
    targetNeckRotX = 0;
    targetNeckRotY = 0;
    targetNeckRotZ = 0;
    targetHeadRotX = 0;
    targetHeadRotY = 0;
    targetHeadRotZ = 0;
    targetLeftArmRotZ = 1.3;
    targetRightArmRotZ = -1.3;
    targetLeftArmRotX = 0;
    targetRightArmRotX = 0;
    targetLeftArmRotY = 0;
    targetRightArmRotY = 0;
  }

  // Rotate and gesture bones to point/draw attention to scanned clinical nodes
  function applyInteractiveGesture(type) {
    resetBoneTargets();
    animationState = "focused";
    
    if (type === "hair") {
      targetNeckRotX = 0.2;     // Tilt head down distinctly
      targetHeadRotX = 0.25;
      targetLeftArmRotZ = 1.35;  // Bring arms slightly closer to sides
      targetRightArmRotZ = -1.35;
    } else if (type === "eyes") {
      targetNeckRotY = -0.18;   // Turn neck and head slightly to camera
      targetHeadRotY = -0.28;
      targetHeadRotX = 0.06;
      targetLeftArmRotZ = 1.3;
      targetRightArmRotZ = -1.3;
    } else if (type === "mouth") {
      targetNeckRotX = 0.14;    // Tilt head up slightly to reveal mouth/tongue
      targetHeadRotX = 0.18;
      targetHeadRotY = 0.1;
      targetLeftArmRotZ = 1.3;
      targetRightArmRotZ = -1.3;
    } else if (type === "abdomen") {
      targetSpineRotX = 0.35;   // Lean torso forward distinctly
      targetNeckRotX = -0.12;
      targetHeadRotX = 0.18;
      targetLeftArmRotZ = 1.4; // Move left/right arms out of the way
      targetRightArmRotZ = -1.4;
    } else if (type === "skin") {
      targetSpineRotY = -0.4;   // Rotate torso to reveal lateral thigh/skin
      targetNeckRotY = 0.18;
      targetLeftArmRotZ = 0.8; // Lift left arm up slightly to display skin area, not too high
      targetLeftArmRotX = 0.25;
      targetRightArmRotZ = -1.3;
    } else if (type === "nails") {
      targetSpineRotY = 0.3;    // Twist torso slightly
      targetRightArmRotZ = -0.8; // Lift right arm/hand up slightly to display fingernails, not too high
      targetRightArmRotX = 0.25;
      targetRightArmRotY = 0.15;
      targetLeftArmRotZ = 1.3;
    }
  }

  // Hotspot Click Scanning Loop
  hotspots.forEach(hotspot => {
    hotspot.addEventListener("click", () => {
      const type = hotspot.dataset.hotspot;
      
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
          if (observationContent.includes("normal") || observationContent.includes("Normal")) {
            tagClass = "tag blue";
          } else if (observationContent.includes("sedikit") || observationContent.includes("agak")) {
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
              <p class="ai-critique-text" style="color: var(--ink); font-weight: 700; font-size: 14px;">
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
    if (model) model.rotation.set(0, 0, 0);
    if (camera) camera.position.set(0, 0.5, 4.5);
    if (controls) controls.target.set(0, 0, 0);
    
    resetBoneTargets();
    animationState = "idle";
    activeHotspotId = null;
    targetReticle.style.display = "none";
    hotspots.forEach(h => h.classList.remove("active"));
    scanStatus.textContent = "VIEWPORT RESET / STANDBY";
    scanStatus.className = "ar-status-badge";
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

  // AI Validator Engine (Validasi Jawaban User)
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
        
        if (currentCaseId === "kwashiorkor") {
          explanation = `Kwashiorkor terjadi akibat defisiensi energi protein (KEP) berat yang ditandai dengan **edema pitting bilateral** (kaki bengkak air) dan perut buncit (ascites) karena penurunan drastis tekanan osmotik koloid plasma akibat **hipoalbuminemia berat**. Rambut kemerahan jagung (*Flag Sign*) disebabkan kerusakan biosintesis keratin rambut.`;
          advice = `**Tatalaksana WHO Terapi Stabilisasi**: Sangat tepat menggunakan susu formula khusus **F-75** pada fase stabilisasi. Pemberian makanan padat tinggi protein secara langsung harus DILINDUNGI untuk mencegah **Refeeding Syndrome** (gangguan elektrolit fatal akibat lonjakan insulin mendadak).`;
        } else if (currentCaseId === "vad") {
          explanation = `Bercak Bitot (*Bitot's Spots*) pada konjungtiva mata adalah akumulasi keratin bercampur bakteri Corynebacterium xerosis, yang merupakan manifestasi patognomonis **Defisiensi Vitamin A kronis**. Keluhan rabun senja (*Hemeralopia*) terjadi karena retinol tidak mencukupi untuk mensintesis rhodopsin di sel batang retina. Kulit kasar seperti duri (*Phrynoderma*) melengkapi tanda hiperkeratosis folikular.`;
          advice = `**Terapi Vitamin A**: Rekomendasi pemberian **Kapsul Vitamin A dosis tinggi** (misal 200.000 IU untuk anak 1-5 tahun) secara megadose pada hari ke-1, 2, dan 14 sangat krusial untuk mencegah kerusakan permanen kornea (*Keratomalacia*) yang menyebabkan kebutaan total.`;
        } else if (currentCaseId === "anemia") {
          explanation = `Gejala pucat (*pallor*) pada konjungtiva dan kuku cekung sendok (*Koilonychia*) adalah tanda klasik **Anemia Defisiensi Besi berat**. Kurangnya mikronutrien besi (Fe) mengganggu proses eritropoiesis, menghambat sintesis hemoglobin, sehingga menurunkan kapasitas pengikatan oksigen darah yang memicu hipoksia jaringan (membuat lemas, pusing, dan takikardia).`;
          advice = `**Terapi Anemia**: Pemberian **Tablet Tambah Darah (Zat Besi & Asam Folat)** secara konsisten disertai anjuran konsumsi pangan kaya zat besi hewani (*heme iron* seperti daging merah, hati) bersama Vitamin C (untuk melarutkan Fe3+ menjadi Fe2+ agar mudah diserap usus) adalah tatalaksana terbaik.`;
        } else if (currentCaseId === "pellagra") {
          explanation = `Pellagra ditandai dengan trias klasik **3D**: *Dermatitis* (lesi simetris Casal's Necklace leher akibat fotosensitivitas), *Diarrhea* (diare kronis karena atrofi mukosa usus), dan *Dementia* (insomnia, depresi, kecemasan). Ini disebabkan kekurangan **Niasin / Vitamin B3** kronis.`;
          advice = `**Terapi Pellagra**: Pemberian **suplemen Niasin/Nikotinamida** dosis tinggi disertai diet kaya protein tinggi triptofan (asam amino prekursor niasin di tubuh, seperti telur, susu, unggas) akan memulihkan metabolisme seluler dalam 48-72 jam.`;
        }
      } else if (isDiagCorrect && !isTherapyCorrect) {
        scoreClass = "warning";
        headerText = "VALIDASI AI: EVALUASI KORSET";
        badgeText = "DIAGNOSIS BENAR, TERAPI SALAH";
        scoreMessage = `Diagnosis Anda tentang **${diagSelect.options[diagSelect.selectedIndex].text}** sudah **TEPAT**, tetapi rekomendasi tatalaksana gizi yang Anda pilih (**${therapySelect.options[therapySelect.selectedIndex].text}**) adalah **SALAH**.`;
        
        if (currentCaseId === "kwashiorkor") {
          explanation = `Meskipun Anda mengenali Kwashiorkor dengan tepat, pilihan terapi Anda tidak pas. Pasien gizi buruk akut dengan gangguan cairan (edema edema) berada dalam status metabolik tidak stabil.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke **Susu F-75 fase stabilisasi**. Jangan memberikan zat besi atau makanan tinggi protein padat di awal stabilisasi karena organ tubuh anak tidak sanggup memprosesnya dan berisiko mematikan.`;
        } else if (currentCaseId === "anemia") {
          explanation = `Anda mengidentifikasi Anemia Defisiensi Besi dengan benar, namun terapi yang Anda pilih tidak akan meningkatkan pembentukan hemoglobin di sumsum tulang belakang.`;
          advice = `**Instruksi AI**: Gantilah tatalaksana ke **Tablet Tambah Darah (Zat Besi & Asam Folat)**. Suplementasi lain tidak akan mengobati defisiensi zat besi secara signifikan.`;
        } else if (currentCaseId === "vad") {
          explanation = `Diagnosis Defisiensi Vitamin A Anda benar, namun terapi yang Anda anjurkan tidak cukup kuat untuk menyelamatkan mata anak dari ancaman kebutaan permanen.`;
          advice = `**Instruksi AI**: Pilihlah **Kapsul Vitamin A Megadosis** (100.000 / 200.000 IU) untuk penanganan medis darurat.`;
        } else if (currentCaseId === "pellagra") {
          explanation = `Diagnosis Pellagra Anda tepat, namun terapi yang Anda rekomendasikan tidak akan menyembuhkan lesi dermatitis bersisik di leher dan diare yang melemahkan selaput usus.`;
          advice = `**Instruksi AI**: Pilihlah **Suplementasi Niasin (B3) & Diet Triptofan** untuk memulihkan sintesis energi seluler NAD/NADP.`;
        }
      } else {
        verifiedStreak = 0;
        scoreClass = "error";
        headerText = "VALIDASI AI: INKOREK";
        badgeText = "DIAGNOSIS KELIRU";
        scoreMessage = `Jawaban Diagnosis **${diagSelect.options[diagSelect.selectedIndex].text}** yang Anda pilih adalah **SALAH**.`;
        
        explanation = `Gejala fisik subjektif pasien (misal: "${activeCase.complaint.substring(0, 80)}...") serta data objektif yang Anda kumpulkan dari pemindaian visual AR tidak cocok dengan patofisiologi penyakit yang Anda tebak.`;
        advice = `**Instruksi AI**: Silakan reset pandangan Anda, klik ulang sisa hotspot berkedip merah/kuning untuk mengumpulkan detail objektif (rambut, mata, perut, kuku, kulit), lalu analisis kembali hubungan gejala tersebut dengan referensi NutriBase.`;
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
          ${explanation ? `<p class="ai-critique-text" style="background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: 8px; font-size:13px; border-left: 3px solid rgba(0,0,0,0.08);">${explanation}</p>` : ""}
          <p class="ai-critique-advice" style="color: ${scoreClass === 'success' ? '#2ee59d' : '#ffb732'};">
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

  // Initialize page on load (Kwashiorkor as default)
  // Slight delay allows voices to load in browsers if needed
  setTimeout(() => {
    loadCase("kwashiorkor");
  }, 100);
});
