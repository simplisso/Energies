(() => {
    const SUPABASE_URL = 'https://owkprsgfbxaxkijcomln.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a3Byc2dmYnhheGtpamNvbWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzI1NjQsImV4cCI6MjA4MjEwODU2NH0.RvVHppQWTDqEFfBLrHJxSdC5cvb5BwuulpAxDi4TndM';
    const isAdminPage = document.documentElement.hasAttribute('data-admin-page');
    if (isAdminPage) {
        const style = document.createElement('style');
        style.textContent = 'html.admin-checking body { visibility: hidden; }';
        document.head.appendChild(style);

        const layoutStyles = document.createElement('link');
        layoutStyles.rel = 'stylesheet';
        layoutStyles.href = 'layout.css';
        document.head.appendChild(layoutStyles);

        const layoutScript = document.createElement('script');
        layoutScript.src = 'layout.js';
        document.head.appendChild(layoutScript);

        document.documentElement.classList.add('admin-checking');
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.adminSupabase = client;
    window.adminReady = Promise.resolve(true);

    if (isAdminPage) {
        window.adminReady = (async () => {
            try {
                const { data: { session }, error: sessionError } = await client.auth.getSession();
                if (sessionError || !session) {
                    window.location.replace('login.html');
                    return false;
                }

                const { data: isAdmin, error: accessError } = await client.rpc('is_admin');
                if (accessError || isAdmin !== true) {
                    await client.auth.signOut();
                    window.location.replace('login.html?access=denied');
                    return false;
                }

                document.documentElement.classList.remove('admin-checking');
                return true;
            } catch {
                window.location.replace('login.html?access=denied');
                return false;
            }
        })();
    }
})();
