// ==========================================================================
// NutriVerse AI Summary - API Client & Markdown Renderer Engine
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
    ? "http://localhost:5000"
    : window.location.origin;
  let isBackendOnline = false;

  const btnSummarize = document.getElementById("summarize-btn");
  const journalInput = document.getElementById("journal-input");
  const resultBox = document.getElementById("summary-result");
  const summaryText = document.getElementById("summary-text");



  // Simple Markdown to HTML parser
  function renderMarkdown(text) {
    let html = text;
    // Replace markdown bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Replace markdown italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Replace lists starting with * or -
    html = html.replace(/^(?:\*|-|•)\s*(.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc;">$1</li>');
    // Replace carriage returns with breaks
    html = html.replace(/\n/g, "<br>");
    
    // Post-process consecutive <li> into single blocks if needed, or rely on margin
    return html;
  }

  // Ping Flask server for health check
  async function checkConnection() {
    try {
      const response = await window["fetch"](`${BACKEND_URL}/api/health`);
      isBackendOnline = response.ok;
    } catch (e) {
      isBackendOnline = false;
    }
  }

  // Handle summarize submission
  btnSummarize?.addEventListener("click", async function() {
    const input = journalInput.value.strip ? journalInput.value.strip() : journalInput.value.trim();
    
    if (!input) {
      alert("Mohon masukkan teks jurnal terlebih dahulu!");
      return;
    }

    // Loading State
    btnSummarize.innerHTML = "✨ Memproses Analisis AI...";
    btnSummarize.style.opacity = "0.7";
    btnSummarize.disabled = true;
    resultBox.classList.remove("active");

    if (isBackendOnline) {
      try {
        const response = await window["fetch"](`${BACKEND_URL}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input })
        });
        
        if (response.ok) {
          const data = await response.json();
          summaryText.innerHTML = renderMarkdown(data.summary);
          resultBox.classList.add("active");
          await window.NutriVerseTracking?.trackFeatureEvent("nutriread", "ai_summary", "backend", {
            input_length: input.length,
            mode: "backend"
          });
        } else {
          throw new Error("HTTP Error from Flask backend");
        }
      } catch (err) {
        console.warn("Flask call failed, falling back to local simulation:", err);
        runLocalSimulation(input);
      } finally {
        btnSummarize.innerHTML = "✨ Summarize Jurnal";
        btnSummarize.style.opacity = "1";
        btnSummarize.disabled = false;
      }
    } else {
      // Offline Simulation Mode
      setTimeout(() => {
        runLocalSimulation(input);
        btnSummarize.innerHTML = "✨ Summarize Jurnal";
        btnSummarize.style.opacity = "1";
        btnSummarize.disabled = false;
      }, 1200);
    }
  });

  // Local Offline Simulation Response Generator
  function runLocalSimulation(input) {
    const textLower = input.toLowerCase();
    let responseText = "";

    if (textLower.includes("stunting") || textLower.includes("pendek")) {
      responseText = `
        <strong>Ringkasan Eksekutif (SIMULASI OFFLINE):</strong><br>
        Berdasarkan teks yang Anda berikan mengenai stunting, AI mendeteksi fokus pada prevalensi tinggi badan sangat pendek (stunting kronis) pada remaja.<br><br>
        <strong>Poin-Poin Utama Temuan:</strong>
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Adanya hubungan erat antara asupan gizi makro (terutama protein hewani) dengan pertumbuhan linear (TB/U).</li>
          <li style="margin-bottom: 6px;">Remaja dengan stunting berisiko mengalami penurunan kapasitas aerobik dan ketahanan kerja fisik secara signifikan.</li>
          <li style="margin-bottom: 6px;">Intervensi kejar tumbuh (catch-up growth) yang berfokus pada protein bernilai biologis tinggi (susu, telur) sangat direkomendasikan.</li>
        </ul>
        <br>
        <em>(Ini adalah hasil simulasi offline. Nyalakan server Flask di port 5000 untuk menghubungkan dengan Gemini AI)</em>
      `;
    } else if (textLower.includes("anemia") || textLower.includes("besi") || textLower.includes("hb")) {
      responseText = `
        <strong>Ringkasan Eksekutif (SIMULASI OFFLINE):</strong><br>
        AI mengidentifikasi topik riset anemia gizi besi pada remaja perempuan dengan gejala lesu, pusing, dan gangguan konsentrasi.<br><br>
        <strong>Poin-Poin Utama Temuan:</strong>
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Pemberian Tablet Tambah Darah (TTD) merupakan intervensi gizi mikro primer yang krusial.</li>
          <li style="margin-bottom: 6px;">Kebiasaan minum teh setelah makan berat terbukti mengikat zat besi non-heme sehingga menurunkan tingkat penyerapan zat besi.</li>
          <li style="margin-bottom: 6px;">Kombinasi zat besi dengan Vitamin C terbukti meningkatkan laju absorpsi besi di duodenum.</li>
        </ul>
        <br>
        <em>(Ini adalah hasil simulasi offline. Nyalakan server Flask di port 5000 untuk menghubungkan dengan Gemini AI)</em>
      `;
    } else {
      responseText = `
        <strong>Ringkasan Eksekutif (SIMULASI OFFLINE):</strong><br>
        AI telah menganalisis dokumen gizi Anda. Ringkasan ini berfokus pada pentingnya pola makan seimbang dan modifikasi gaya hidup sehat.<br><br>
        <strong>Poin-Poin Utama Temuan:</strong>
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Metode yang digunakan memiliki pendekatan komprehensif terhadap analisis diet harian remaja.</li>
          <li style="margin-bottom: 6px;">Terdapat korelasi signifikan antara asupan gizi tertentu dengan indikator kesehatan klinis fisik.</li>
          <li style="margin-bottom: 6px;">Kesimpulan menekankan pentingnya intervensi gizi berbasis bukti ilmiah (evidence-based).</li>
        </ul>
        <br>
        <em>(Ini adalah hasil simulasi offline. Nyalakan server Flask di port 5000 untuk menghubungkan dengan Gemini AI)</em>
      `;
    }

    summaryText.innerHTML = responseText;
    resultBox.classList.add("active");
    window.NutriVerseTracking?.trackFeatureEvent("nutriread", "ai_summary", "local_simulation", {
      input_length: input.length,
      mode: "local_simulation"
    });
  }

  // Run initial connection ping
  checkConnection();
});
