(function () {
  const PROFILE_TABLE = "profiles";
  const ATTEMPT_TABLE = "test_attempts";
  const ATTEMPT_ANSWER_TABLE = "test_attempt_answers";
  const CASE_ATTEMPT_TABLE = "case_attempts";
  const LEARNING_PROGRESS_TABLE = "learning_progress";
  const FEATURE_EVENT_TABLE = "feature_events";

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

  async function autoSignInAfterSignup({ email, password, fullName, nim }) {
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) {
      return {
        session: null,
        user: null,
        emailConfirmationRequired: /confirm|verified|not confirmed/i.test(error.message || ""),
        signInError: error
      };
    }
    if (data?.user) {
      await ensureStudentProfile(data.user, { fullName, nim, email });
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
      return data;
    }

    const signedIn = await autoSignInAfterSignup({ email, password, fullName, nim });
    if (signedIn?.session) {
      return signedIn;
    }
    return {
      ...data,
      emailConfirmationRequired: signedIn?.emailConfirmationRequired || true,
      signInError: signedIn?.signInError || null
    };
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

  async function insertTestAttemptAnswers({ attemptId, userId, answers }) {
    if (!client()) throw authError();
    if (!attemptId || !userId || !Array.isArray(answers) || !answers.length) return [];
    const payload = answers.map((answer) => ({
      attempt_id: attemptId,
      user_id: userId,
      question_id: answer.question_id,
      category: answer.category,
      selected_answer: answer.selected_answer,
      correct_answer: answer.correct_answer,
      is_correct: answer.is_correct
    }));
    const { data, error } = await client()
      .from(ATTEMPT_ANSWER_TABLE)
      .insert(payload)
      .select("id, attempt_id, question_id, category, selected_answer, correct_answer, is_correct");
    if (error) throw error;
    return data || [];
  }

  async function insertCaseAttempt({ userId, caseId, caseName, score = 0, success = false, feedback = "" }) {
    if (!client()) throw authError();
    const { data, error } = await client()
      .from(CASE_ATTEMPT_TABLE)
      .insert({
        user_id: userId,
        case_id: caseId,
        case_name: caseName,
        score,
        success,
        feedback
      })
      .select("id, user_id, case_id, case_name, score, success, feedback, submitted_at")
      .single();
    if (error) throw error;
    return data;
  }

  async function upsertLearningProgress({ userId, moduleId, status = "viewed", progressPercentage = 0 }) {
    if (!client()) throw authError();
    const { data, error } = await client()
      .from(LEARNING_PROGRESS_TABLE)
      .upsert({
        user_id: userId,
        module_id: moduleId,
        status,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,module_id" })
      .select("id, user_id, module_id, status, progress_percentage, updated_at")
      .single();
    if (error) throw error;
    return data;
  }

  async function trackFeatureEvent({ userId = null, feature, eventType, resourceId = null, metadata = {} }) {
    if (!client()) return null;
    const { data, error } = await client()
      .from(FEATURE_EVENT_TABLE)
      .insert({
        user_id: userId,
        feature,
        event_type: eventType,
        resource_id: resourceId,
        metadata
      })
      .select("id, user_id, feature, event_type, resource_id, metadata, created_at")
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
    insertTestAttemptAnswers,
    insertCaseAttempt,
    upsertLearningProgress,
    trackFeatureEvent,
    requireTeacher,
    fetchTeacherDashboardRows
  };
})();
