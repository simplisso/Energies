(() => {
    const pages = [
        { href: 'dashboard.html', label: 'Dashboard', icon: 'fa-chart-line', key: 'dashboard' },
        { href: 'annonces-list.html', label: 'Nos Services', icon: 'fa-list', key: 'services' },
        { href: 'realisations-list.html', label: 'Nos Réalisations', icon: 'fa-images', key: 'realisations' },
        { href: 'leads.html', label: 'Demandes', icon: 'fa-envelope', key: 'leads' },
        { href: 'team-list.html', label: 'Équipe', icon: 'fa-users', key: 'team' },
        { href: 'agents.html', label: 'Agents', icon: 'fa-user-tie', key: 'agents' },
        { href: 'settings.html', label: 'Réglages', icon: 'fa-cog', key: 'settings' }
    ];

    function renderSidebar() {
        const sidebar = document.querySelector('body > .admin-layout > aside, body > aside');
        if (!sidebar) return;

        const fileName = window.location.pathname.split('/').pop() || 'dashboard.html';
        const activeKey = fileName === 'dashboard.html' ? 'dashboard'
            : fileName.startsWith('annonces-') ? 'services'
                : fileName === 'realisations-list.html' ? 'realisations'
                    : fileName === 'leads.html' ? 'leads'
                        : fileName === 'team-list.html' ? 'team'
                            : fileName === 'agents.html' ? 'agents'
                                : fileName === 'settings.html' ? 'settings' : '';

        document.body.classList.add('admin-shell');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <a class="sidebar-brand" href="dashboard.html"><i class="fas fa-bolt" aria-hidden="true"></i><span>SIMEL Admin</span></a>
            </div>
            <nav class="sidebar-menu" aria-label="Navigation administration">
                ${pages.map(page => `
                    <a href="${page.href}"${page.key === activeKey ? ' class="active" aria-current="page"' : ''}>
                        <i class="fas ${page.icon}" aria-hidden="true"></i><span>${page.label}</span>
                    </a>
                `).join('')}
                <a class="sidebar-quote" href="https://simplisso.github.io/devis-simel/accueil.html?ent=SIMEL_S.E.S&exp=Simplice_OLOUBI">
                    <i class="fas fa-plus-circle" aria-hidden="true"></i><span>Créer un devis</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="../index.html" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt" aria-hidden="true"></i><span>Voir le site</span>
                </a>
            </div>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSidebar, { once: true });
    } else {
        renderSidebar();
    }
})();
