(function () {
  const ADMIN_PASSWORD = "nutriverse123";
  const ADMIN_UNLOCK_KEY = "nutriverse_admin_unlocked";

  const tableBody = document.querySelector("[data-dashboard-table]");
  const statusEl = document.querySelector("[data-dashboard-status]");
  const signOutBtn = document.querySelector("[data-signout]");

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

  function escapeHtml(value) {
    return String(value || "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function statusLabel(row) {
    if (row.pretest && row.posttest) return "Selesai";
    if (row.pretest) return "Belum posttest";
    return "Belum pretest";
  }

  function renderRows(rows) {
    if (!tableBody) return;
    if (!rows.length) {
      tableBody.innerHTML = `<tr><td colspan="9">Belum ada data mahasiswa.</td></tr>`;
      return;
    }

    tableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.profile.full_name)}</td>
        <td>${escapeHtml(row.profile.nim)}</td>
        <td>${escapeHtml(row.profile.email)}</td>
        <td>${formatScore(row.pretest)}</td>
        <td>${formatDate(row.pretest?.submitted_at)}</td>
        <td>${formatScore(row.posttest)}</td>
        <td>${formatDate(row.posttest?.submitted_at)}</td>
        <td>${row.improvement === null ? "-" : `${row.improvement.toFixed(1)} poin`}</td>
        <td>${statusLabel(row)}</td>
      </tr>
    `).join("");
  }

  function hasStaticAdminUnlock() {
    try {
      return window.sessionStorage.getItem(ADMIN_UNLOCK_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function rowFromRpc(record) {
    const pretest = record.pretest_score === null ? null : {
      score: record.pretest_score,
      total: record.pretest_total,
      percentage: record.pretest_percentage,
      submitted_at: record.pretest_submitted_at
    };
    const posttest = record.posttest_score === null ? null : {
      score: record.posttest_score,
      total: record.posttest_total,
      percentage: record.posttest_percentage,
      submitted_at: record.posttest_submitted_at
    };
    return {
      profile: {
        id: record.profile_id,
        full_name: record.full_name,
        nim: record.nim,
        email: record.email
      },
      pretest,
      posttest,
      improvement: record.improvement === null ? null : Number(record.improvement)
    };
  }

  async function fetchStaticAdminDashboardRows() {
    const client = window.NUTRIVERSE_SUPABASE;
    if (!client) throw new Error("Supabase belum dikonfigurasi. Dashboard belum bisa memuat data.");
    const { data, error } = await client.rpc("admin_dashboard_rows", {
      admin_password: ADMIN_PASSWORD
    });
    if (error) throw error;
    return (data || []).map(rowFromRpc);
  }

  async function initDashboard() {
    if (!hasStaticAdminUnlock()) {
      window.location.href = `login.html?next=${encodeURIComponent("dashboard-dosen.html")}`;
      return;
    }

    try {
      setStatus("Memuat rekap nilai admin...", "info");
      const rows = await fetchStaticAdminDashboardRows();
      renderRows(rows);
      setStatus(`Memuat ${rows.length} mahasiswa.`, "success");
    } catch (error) {
      setStatus(`${error.message}. Pastikan function admin_dashboard_rows sudah diterapkan di Supabase.`, "error");
    }
  }

  signOutBtn?.addEventListener("click", () => {
    try {
      window.sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
    } catch (error) {
      // Session cleanup is best-effort for this static demo gate.
    }
    window.location.href = "login.html";
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
  } else {
    initDashboard();
  }
})();
