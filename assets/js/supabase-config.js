(function () {
  const SUPABASE_URL = "https://raqkwfnzudyrkqahqmvr.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcWt3Zm56dWR5cmtxYWhxbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODgxOTksImV4cCI6MjA5NjE2NDE5OX0.Q-uLTHCTXNPI8OCevnLTEPLDWsob6aXs1wm5ja7Ucfw";

  function isConfigured() {
    return (
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_ANON_KEY.includes("YOUR-")
    );
  }

  const config = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    isConfigured: isConfigured()
  };

  window.NUTRIVERSE_SUPABASE_CONFIG = config;
  window.NUTRIVERSE_SUPABASE = null;

  if (config.isConfigured && window.supabase?.createClient) {
    window.NUTRIVERSE_SUPABASE = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
})();
