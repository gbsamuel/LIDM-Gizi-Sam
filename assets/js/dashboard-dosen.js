(function () {
  const tableBody = document.querySelector("[data-dashboard-table]");
  const statusEl = document.querySelector("[data-dashboard-status]");
  const signOutBtn = document.querySelector("[data-signout]");
  const PROFILE_TABLE = "profiles";
  const ATTEMPT_TABLE = "test_attempts";

  function setStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.status = type;
    statusEl.classList.toggle("active", Boolean(message));
  }

  function formatDate(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatScore(attempt) {
    if (!attempt) return "-";
    return `${attempt.score}/${attempt.total} (${Number(attempt.percentage).toFixed(1)}%)`;
  }

  function statusLabel(row) {
    if (row.pretest && row.posttest) return "Selesai";
    if (row.pretest) return "Belum posttest";
    return "Belum pretest";
  }

  function renderRows(rows) {
    if (!tableBody) return;
    if (!rows.length) {
      tableBody.innerHTML = `<tr><td colspan="8">Belum ada data mahasiswa.</td></tr>`;
      return;
    }

    tableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.profile.full_name || "-"}</td>
        <td>${row.profile.nim || "-"}</td>
        <td>${row.profile.email || "-"}</td>
        <td>${formatScore(row.pretest)}</td>
        <td>${formatDate(row.pretest?.submitted_at)}</td>
        <td>${formatScore(row.posttest)}</td>
        <td>${formatDate(row.posttest?.submitted_at)}</td>
        <td>${row.improvement === null ? "-" : `${row.improvement.toFixed(1)} poin`}</td>
        <td>${statusLabel(row)}</td>
      </tr>
    `).join("");
  }

  async function initDashboard() {
    const auth = window.NutriVerseAuth;
    if (!auth?.isConfigured()) {
      setStatus("Supabase belum dikonfigurasi. Dashboard belum bisa memuat data.", "error");
      return;
    }

    try {
      setStatus("Memeriksa akses dosen...", "info");
      const session = await auth.requireTeacher();
      if (!session) return;
      setStatus(`Memuat rekap nilai dari ${PROFILE_TABLE} dan ${ATTEMPT_TABLE}...`, "info");
      const rows = await auth.fetchTeacherDashboardRows();
      renderRows(rows);
      setStatus(`Memuat ${rows.length} mahasiswa.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  signOutBtn?.addEventListener("click", async () => {
    await window.NutriVerseAuth?.signOut();
    window.location.href = "login.html";
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
  } else {
    initDashboard();
  }
})();
