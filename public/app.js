document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            
            // UI Update
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // View Update
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(`view-${viewId}`).classList.remove('hidden');

            loadViewData(viewId);
        });
    });

    // Initial Load
    loadStats();

    // Forms
    document.getElementById('workshop-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch('/api/workshops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            hideModal('workshop-modal');
            loadViewData('workshops');
        }
    });
});

async function loadStats() {
    const workshops = await (await fetch('/api/workshops')).json();
    const contacts = await (await fetch('/api/contacts')).json();
    const updates = await (await fetch('/api/updates')).json();

    document.getElementById('count-workshops').textContent = workshops.length;
    document.getElementById('count-contacts').textContent = contacts.length;
    document.getElementById('count-updates').textContent = updates.length;
}

async function loadViewData(viewId) {
    if (viewId === 'workshops') {
        const data = await (await fetch('/api/workshops')).json();
        const grid = document.getElementById('workshops-grid');
        grid.innerHTML = data.map(ws => `
            <div class="card">
                <span class="badge badge-primary">${ws.type}</span>
                <div class="card-title">${ws.title}</div>
                <div class="card-meta">
                    <span>📅 ${new Date(ws.date).toLocaleDateString('nl-NL')}</span>
                    <span>📍 ${ws.location}</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${ws.description || ''}</p>
            </div>
        `).join('');
    }

    if (viewId === 'contacts') {
        const data = await (await fetch('/api/contacts')).json();
        const grid = document.getElementById('contacts-grid');
        grid.innerHTML = data.map(c => `
            <div class="card">
                <span class="badge ${c.is_champion ? 'badge-secondary' : 'badge-primary'}">
                    ${c.is_champion ? '🏆 Champion' : c.level}
                </span>
                <div class="card-title">${c.name}</div>
                <div class="card-meta">
                    <span>🏢 ${c.department}</span>
                </div>
                <p style="font-size: 0.8rem;">Interesses: ${c.interests}</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">${c.email}</p>
            </div>
        `).join('');
    }

    if (viewId === 'updates') {
        const data = await (await fetch('/api/updates')).json();
        const grid = document.getElementById('updates-grid');
        grid.innerHTML = data.map(u => `
            <div class="card">
                <span class="badge badge-warning">${u.category}</span>
                <span class="badge badge-primary">${u.relevance}</span>
                <div class="card-title">${u.title}</div>
                <div style="background: #fdf2e9; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <strong style="font-size: 0.8rem; color: var(--primary);">BAM IMPACT:</strong>
                    <p style="font-size: 0.9rem;">${u.bam_impact}</p>
                </div>
                <a href="${u.source_url}" target="_blank" style="display: block; margin-top: 12px; font-size: 0.8rem; color: var(--secondary);">Lees bron →</a>
            </div>
        `).join('');
    }
}

function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}
