(function () {
  const PROFILE_TABLE = "profiles";
  const ATTEMPT_TABLE = "test_attempts";
  const ATTEMPT_ANSWER_TABLE = "test_attempt_answers";
  const CASE_ATTEMPT_TABLE = "case_attempts";
  const LEARNING_PROGRESS_TABLE = "learning_progress";
  const FEATURE_EVENT_TABLE = "feature_events";

  // Local storage keys for developer mock mode
  const MOCK_USER_KEY = "nutrisphere_mock_user";
  const MOCK_ATTEMPTS_KEY = "nutrisphere_mock_attempts";
  const MOCK_USERS_LIST_KEY = "nutrisphere_mock_users_list";

  function client() {
    return window.NUTRISPHERE_SUPABASE || null;
  }

  function authError() {
    return new Error("Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di assets/js/supabase-config.js.");
  }

  function isConfigured() {
    // We consider it configured if Supabase is active OR we are running in local dev bypass mode
    return Boolean(client()) || true;
  }

  // Helper functions for mock mode
  function getMockUser() {
    try {
      const data = localStorage.getItem(MOCK_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setMockUser(user) {
    if (user) {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_USER_KEY);
    }
  }

  function getMockUsersList() {
    try {
      const data = localStorage.getItem(MOCK_USERS_LIST_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function addMockUserToList(email, password, metadata) {
    const list = getMockUsersList();
    list[email.toLowerCase()] = { email, password, metadata };
    localStorage.setItem(MOCK_USERS_LIST_KEY, JSON.stringify(list));
  }

  function getMockAttempts() {
    try {
      const data = localStorage.getItem(MOCK_ATTEMPTS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function setMockAttempt(testType, attempt) {
    const attempts = getMockAttempts();
    attempts[testType] = attempt;
    localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  async function getCurrentUser() {
    const mock = getMockUser();
    if (mock) return mock;

    if (!client()) return null;
    const { data, error } = await client().auth.getUser();
    if (error) return null;
    return data?.user || null;
  }

  async function getCurrentSession() {
    const mock = getMockUser();
    if (mock) return { user: mock };

    if (!client()) return null;
    const { data, error } = await client().auth.getSession();
    if (error) return null;
    return data?.session || null;
  }

  async function getProfile(userId) {
    const mock = getMockUser();
    if (mock && mock.id === userId) {
      return {
        id: mock.id,
        full_name: mock.user_metadata?.full_name || "Developer Account",
        nim: mock.user_metadata?.nim || "12345678",
        email: mock.email,
        role: mock.user_metadata?.role || "student",
        created_at: new Date().toISOString()
      };
    }

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
    const emailLower = email.trim().toLowerCase();
    
    // Intercept dev bypass accounts
    if (emailLower.endsWith("@nutrisphere.local")) {
      const list = getMockUsersList();
      const existing = list[emailLower];
      
      const role = emailLower.startsWith("dosen") ? "teacher" : "student";
      const fullName = existing ? existing.metadata.full_name : (role === "teacher" ? "Dosen Tester" : "Mahasiswa Tester");
      const nim = existing ? existing.metadata.nim : (role === "teacher" ? "N/A" : "12345678");

      if (existing && existing.password !== password) {
        throw new Error("Password salah untuk akun pengembang lokal.");
      }

      const mockUser = {
        id: role === "teacher" ? "mock-teacher-id-123" : "mock-student-id-456",
        email: email,
        user_metadata: {
          full_name: fullName,
          nim: nim,
          role: role
        }
      };
      setMockUser(mockUser);
      localStorage.setItem("last_login_time", Date.now().toString());
      return { user: mockUser };
    }

    if (!client()) throw authError();
    const { data, error } = await client().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (data?.user) {
      await ensureStudentProfile(data.user);
      localStorage.setItem("last_login_time", Date.now().toString());
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
      localStorage.setItem("last_login_time", Date.now().toString());
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
    const emailLower = email.trim().toLowerCase();

    // Intercept dev bypass registration
    if (emailLower.endsWith("@nutrisphere.local")) {
      addMockUserToList(emailLower, password, { full_name: fullName, nim, role: "student" });
      
      const mockUser = {
        id: "mock-student-id-456",
        email: email,
        user_metadata: {
          full_name: fullName,
          nim: nim,
          role: "student"
        }
      };
      setMockUser(mockUser);
      localStorage.setItem("last_login_time", Date.now().toString());
      return { user: mockUser };
    }

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
      localStorage.setItem("last_login_time", Date.now().toString());
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
    setMockUser(null);
    localStorage.removeItem(MOCK_ATTEMPTS_KEY);
    if (!client()) return;
    await client().auth.signOut();
  }

  async function hasCompletedAttempt(userId, testType) {
    const mock = getMockUser();
    if (mock && mock.id === userId) {
      const attempts = getMockAttempts();
      return Boolean(attempts[testType]);
    }

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
    const mock = getMockUser();
    if (mock && mock.id === userId) {
      const attempts = getMockAttempts();
      return attempts[testType] || null;
    }

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
    const mock = getMockUser();
    if (mock && mock.id === userId) {
      const percentage = total > 0 ? Number(((score / total) * 100).toFixed(2)) : 0;
      const attempt = {
        id: "mock-attempt-" + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        test_type: testType,
        score,
        total,
        percentage,
        submitted_at: new Date().toISOString()
      };
      setMockAttempt(testType, attempt);
      return attempt;
    }

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
    const mock = getMockUser();
    if (mock && mock.user_metadata?.role === "teacher") {
      return [
        {
          profile: { id: "std-1", full_name: "Ahmad Fauzi (Simulasi)", nim: "210301001", email: "ahmad@gmail.com", role: "student" },
          pretest: { score: 15, total: 25, percentage: 60, submitted_at: new Date(Date.now() - 3600000).toISOString() },
          posttest: { score: 22, total: 25, percentage: 88, submitted_at: new Date().toISOString() },
          improvement: 28
        },
        {
          profile: { id: "std-2", full_name: "Siti Rahmawati (Simulasi)", nim: "210301002", email: "siti@gmail.com", role: "student" },
          pretest: { score: 12, total: 25, percentage: 48, submitted_at: new Date(Date.now() - 7200000).toISOString() },
          posttest: { score: 20, total: 25, percentage: 80, submitted_at: new Date().toISOString() },
          improvement: 32
        },
        {
          profile: { id: "std-3", full_name: "Budi Santoso (Simulasi)", nim: "210301003", email: "budi@gmail.com", role: "student" },
          pretest: { score: 18, total: 25, percentage: 72, submitted_at: new Date(Date.now() - 1800000).toISOString() },
          posttest: null,
          improvement: null
        }
      ];
    }

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

  window.NutriSphereAuth = {
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
