document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            navigateTo(viewId);
        });
    });

    // Initial Load
    loadStats();
    loadViewData('dashboard');

    // Forms Handling
    setupForm('workshop-form', '/api/workshops');
    setupForm('contact-form', '/api/contacts');
    setupForm('update-form', '/api/updates');

    // Tab Handling
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderUpdates(tab.getAttribute('data-tab'));
        });
    });

    // Roadmap Fetch Button
    const fetchBtn = document.getElementById('fetch-roadmap-btn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', async () => {
            fetchBtn.disabled = true;
            fetchBtn.textContent = 'Bezig met ophalen...';
            
            // Scraped Data from M365 Roadmap
            const roadmapItems = [
                { title: 'Teams Phone Agent', category: 'Copilot', relevance: 'Hoog', bam_impact: 'AI-gestuurde agent voor Teams Phone om gesprekken en geschiedenis te beheren. Preview verwacht in juni 2026.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap?featureid=490564' },
                { title: 'DLP for Microsoft 365 Copilot', category: 'Copilot', relevance: 'Hoog', bam_impact: 'Data Loss Prevention wordt uitgebreid naar Copilot webarches om gevoelige data te beschermen.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap?featureid=560398' },
                { title: 'Interactive Agents for Meetings', category: 'Copilot Studio', relevance: 'Hoog', bam_impact: 'Integratie van interactieve agents uit BizChat en Copilot Studio direct in Teams meetings.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap' },
                { title: 'Agent Ownership Reassignment', category: 'Copilot Studio', relevance: 'Medium', bam_impact: 'Nieuwe admin-functie om eigendom van agents over te dragen bij rolveranderingen binnen BAM.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap' },
                { title: 'Larger File Upload Support', category: 'Copilot Studio', relevance: 'Medium', bam_impact: 'Ondersteuning voor grotere bestanden bij het trainen van agents voor betere kennisborging.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap' },
                { title: 'Copilot Studio Autonomous Agent Analytics', category: 'Copilot Studio', relevance: 'Hoog', bam_impact: 'Verbeterde rapportages in Viva Insights specifiek voor autonome agents.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap' },
                { title: 'Insider Risk Management - Fabric triggers', category: 'Power Platform', relevance: 'Hoog', bam_impact: 'Detectie van datalekken in Microsoft Fabric (Power BI/Lakehouse) als trigger voor security beleid.', source_url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap?featureid=560399' }
            ];

            for (const item of roadmapItems) {
                await fetch('/api/updates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            }

            fetchBtn.textContent = 'Klaar!';
            loadViewData('updates');
            setTimeout(() => {
                fetchBtn.disabled = false;
                fetchBtn.textContent = '📡 Roadmap Ophalen';
            }, 2000);
        });
    }
});

function navigateTo(viewId) {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(i => {
        i.classList.remove('active');
        if (i.getAttribute('data-view') === viewId) i.classList.add('active');
    });

    views.forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    loadViewData(viewId);
}

function setupForm(formId, endpoint) {
    const form = document.getElementById(formId);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkbox
        if (formId === 'contact-form') {
            data.is_champion = form.querySelector('[name="is_champion"]').checked ? 1 : 0;
        }

        const id = data.id;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${endpoint}/${id}` : endpoint;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            hideModal(formId.replace('-form', '-modal'));
            const viewId = formId.replace('-form', 's');
            loadViewData(viewId);
            loadStats();
        }
    });
}

async function loadStats() {
    const workshops = await (await fetch('/api/workshops')).json();
    const contacts = await (await fetch('/api/contacts')).json();
    const updates = await (await fetch('/api/updates')).json();

    document.getElementById('count-workshops').textContent = workshops.length;
    document.getElementById('count-contacts').textContent = contacts.length;
    document.getElementById('count-updates').textContent = updates.length;
}

let allUpdates = [];

async function loadViewData(viewId) {
    if (viewId === 'dashboard') {
        loadStats();
    }

    if (viewId === 'workshops') {
        const data = await (await fetch('/api/workshops')).json();
        const grid = document.getElementById('workshops-grid');
        grid.innerHTML = data.map(ws => `
            <div class="card" onclick="editWorkshop(${JSON.stringify(ws).replace(/"/g, '&quot;')})">
                <span class="badge badge-primary">${ws.type}</span>
                <span class="badge ${ws.status === 'Completed' ? 'badge-secondary' : 'badge-warning'}" style="margin-left: 8px;">${ws.status}</span>
                <div class="card-title">${ws.title}</div>
                <div class="card-meta">
                    <span>📅 ${new Date(ws.date).toLocaleDateString('nl-NL')}</span>
                    <span>📍 ${ws.location}</span>
                </div>
                <p style="font-size: 0.95rem; color: var(--text-muted);">${ws.description || 'Geen beschrijving'}</p>
                <p style="margin-top: 15px; font-size: 0.85rem; color: var(--primary); font-weight: 700;">KLIK OM TE BEWERKEN →</p>
            </div>
        `).join('');
    }

    if (viewId === 'contacts') {
        const data = await (await fetch('/api/contacts')).json();
        const grid = document.getElementById('contacts-grid');
        grid.innerHTML = data.map(c => `
            <div class="card" onclick="editContact(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                <span class="badge ${c.is_champion ? 'badge-secondary' : 'badge-primary'}">
                    ${c.is_champion ? '🏆 BAM Champion' : c.level}
                </span>
                <div class="card-title">${c.name}</div>
                <div class="card-meta">
                    <span>🏢 ${c.department}</span>
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Interesses:</strong> ${c.interests || 'Nog niet ingevuld'}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${c.email}</p>
                <p style="margin-top: 15px; font-size: 0.85rem; color: var(--primary); font-weight: 700;">KLIK OM TE BEWERKEN →</p>
            </div>
        `).join('');
    }

    if (viewId === 'updates') {
        allUpdates = await (await fetch('/api/updates')).json();
        renderUpdates('all');
    }
}

function renderUpdates(filter) {
    const grid = document.getElementById('updates-grid');
    const filtered = filter === 'all' ? allUpdates : allUpdates.filter(u => u.category === filter);
    
    grid.innerHTML = filtered.map(u => `
        <div class="card">
            <span class="badge badge-warning">${u.category}</span>
            <span class="badge badge-primary" style="margin-left: 8px;">${u.relevance}</span>
            <div class="card-title">${u.title}</div>
            <div style="background: #fff7ed; padding: 16px; border-radius: 12px; margin-top: 16px; border-left: 4px solid var(--primary);">
                <strong style="font-size: 0.85rem; color: var(--primary); text-transform: uppercase;">BAM IMPACT:</strong>
                <p style="font-size: 0.95rem; line-height: 1.5; margin-top: 4px;">${u.bam_impact}</p>
            </div>
            ${u.source_url ? `<a href="${u.source_url}" target="_blank" style="display: inline-block; margin-top: 16px; font-size: 0.9rem; color: var(--secondary); font-weight: 700; text-decoration: none;">Lees roadmap bron →</a>` : ''}
        </div>
    `).join('');
}

// Edit functions
function editWorkshop(ws) {
    document.getElementById('edit-workshop-id').value = ws.id;
    document.getElementById('workshop-title').value = ws.title;
    document.getElementById('workshop-type').value = ws.type;
    document.getElementById('workshop-date').value = ws.date;
    document.getElementById('workshop-location').value = ws.location;
    document.getElementById('workshop-description').value = ws.description || '';
    document.getElementById('workshop-status').value = ws.status;
    
    document.getElementById('workshop-modal-title').textContent = 'Sessie Bewerken';
    showModal('workshop-modal');
}

function editContact(c) {
    document.getElementById('edit-contact-id').value = c.id;
    document.getElementById('contact-name').value = c.name;
    document.getElementById('contact-email').value = c.email;
    document.getElementById('contact-department').value = c.department;
    document.getElementById('contact-level').value = c.level;
    document.getElementById('contact-interests').value = c.interests || '';
    document.getElementById('contact-is-champion').checked = c.is_champion === 1;

    document.getElementById('contact-modal-title').textContent = 'Contact Bewerken';
    showModal('contact-modal');
}

function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
    document.getElementById(id).style.display = 'none';
    // Reset titles and IDs
    if (id === 'workshop-modal') {
        document.getElementById('workshop-modal-title').textContent = 'Nieuwe Sessie Toevoegen';
        document.getElementById('edit-workshop-id').value = '';
        document.getElementById('workshop-form').reset();
    }
    if (id === 'contact-modal') {
        document.getElementById('contact-modal-title').textContent = 'Nieuw Contact Toevoegen';
        document.getElementById('edit-contact-id').value = '';
        document.getElementById('contact-form').reset();
    }
}
