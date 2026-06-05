(function () {
  const PROFILE_TABLE = "profiles";
  const ATTEMPT_TABLE = "test_attempts";

  function client() {
    return window.NUTRIVERSE_SUPABASE || null;
  }

  function authError() {
    return new Error("Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di assets/js/supabase-config.js.");
  }

  function isConfigured() {
    return Boolean(client());
  }

  async function getCurrentUser() {
    if (!client()) return null;
    const { data, error } = await client().auth.getUser();
    if (error) return null;
    return data?.user || null;
  }

  async function getCurrentSession() {
    if (!client()) return null;
    const { data, error } = await client().auth.getSession();
    if (error) return null;
    return data?.session || null;
  }

  async function getProfile(userId) {
    if (!client()) throw authError();
    const { data, error } = await client()
      .from(PROFILE_TABLE)
      .select("id, full_name, nim, email, role, created_at")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  }

  async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    return getProfile(user.id);
  }

  async function signIn(email, password) {
    if (!client()) throw authError();
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      await ensureStudentProfile(data.user);
    }
    return data;
  }

  function studentProfilePayload(user, fallback = {}) {
    const metadata = user?.user_metadata || {};
    return {
      id: user.id,
      full_name: fallback.fullName || metadata.full_name || user.email?.split("@")[0] || "Mahasiswa",
      nim: fallback.nim || metadata.nim || null,
      email: fallback.email || user.email || null,
      role: "student"
    };
  }

  async function ensureStudentProfile(user, fallback = {}) {
    if (!client() || !user?.id) return null;
    const { data: existing, error: existingError } = await client()
      .from(PROFILE_TABLE)
      .select("id, full_name, nim, email, role, created_at")
      .eq("id", user.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return existing;

    const { data, error } = await client()
      .from(PROFILE_TABLE)
      .insert(studentProfilePayload(user, fallback))
      .select("id, full_name, nim, email, role, created_at")
      .single();
    if (error) throw error;
    return data;
  }

  async function signUpStudent({ fullName, nim, email, password }) {
    if (!client()) throw authError();
    const { data, error } = await client().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          nim
        }
      }
    });
    if (error) throw error;
    if (data?.session && data?.user) {
      await ensureStudentProfile(data.user, { fullName, nim, email });
    }
    return data;
  }

  async function signOut() {
    if (!client()) return;
    await client().auth.signOut();
  }

  async function hasCompletedAttempt(userId, testType) {
    if (!client() || !userId) return false;
    const { data, error } = await client()
      .from(ATTEMPT_TABLE)
      .select("id")
      .eq("user_id", userId)
      .eq("test_type", testType)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async function getAttempt(userId, testType) {
    if (!client() || !userId) return null;
    const { data, error } = await client()
      .from(ATTEMPT_TABLE)
      .select("id, user_id, test_type, score, total, percentage, submitted_at")
      .eq("user_id", userId)
      .eq("test_type", testType)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function insertTestAttempt({ userId, testType, score, total }) {
    if (!client()) throw authError();
    const percentage = total > 0 ? Number(((score / total) * 100).toFixed(2)) : 0;
    const { data, error } = await client()
      .from(ATTEMPT_TABLE)
      .insert({
        user_id: userId,
        test_type: testType,
        score,
        total,
        percentage
      })
      .select("id, user_id, test_type, score, total, percentage, submitted_at")
      .single();
    if (error) throw error;
    return data;
  }

  async function requireTeacher() {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = `login.html?next=${encodeURIComponent("dashboard-dosen.html")}`;
      return null;
    }
    const profile = await getProfile(user.id);
    if (profile.role !== "teacher") {
      window.location.href = "index.html";
      return null;
    }
    return { user, profile };
  }

  async function fetchTeacherDashboardRows() {
    if (!client()) throw authError();
    const { data: profiles, error: profilesError } = await client()
      .from(PROFILE_TABLE)
      .select("id, full_name, nim, email, role, created_at")
      .eq("role", "student")
      .order("full_name", { ascending: true });
    if (profilesError) throw profilesError;

    const { data: attempts, error: attemptsError } = await client()
      .from(ATTEMPT_TABLE)
      .select("user_id, test_type, score, total, percentage, submitted_at");
    if (attemptsError) throw attemptsError;

    const attemptsByUser = new Map();
    for (const attempt of attempts || []) {
      if (!attemptsByUser.has(attempt.user_id)) attemptsByUser.set(attempt.user_id, {});
      attemptsByUser.get(attempt.user_id)[attempt.test_type] = attempt;
    }

    return (profiles || []).map((profile) => {
      const userAttempts = attemptsByUser.get(profile.id) || {};
      const pretest = userAttempts.pretest || null;
      const posttest = userAttempts.posttest || null;
      const improvement = pretest && posttest
        ? Number((posttest.percentage - pretest.percentage).toFixed(2))
        : null;
      return { profile, pretest, posttest, improvement };
    });
  }

  window.NutriVerseAuth = {
    isConfigured,
    getCurrentSession,
    getCurrentUser,
    getCurrentProfile,
    getProfile,
    signIn,
    signUpStudent,
    ensureStudentProfile,
    signOut,
    hasCompletedAttempt,
    getAttempt,
    insertTestAttempt,
    requireTeacher,
    fetchTeacherDashboardRows
  };
})();
