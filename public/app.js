document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            navigateTo(viewId);
        });
    });

    // Initial Load
    loadStats();
    loadDashboardInsights();
    loadViewData('dashboard');

    // Forms Handling
    setupForm('workshop-form', '/api/workshops');
    setupForm('contact-form', '/api/contacts');

    // Tab Handling
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderUpdates(tab.getAttribute('data-tab'));
        });
    });

    // Roadmap Fetch
    const fetchBtn = document.getElementById('fetch-roadmap-btn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', async () => {
            fetchBtn.disabled = true;
            fetchBtn.textContent = 'Bezig met ophalen...';
            
            const roadmapItems = [
                { 
                    title: 'Teams Phone Agent', 
                    category: 'Copilot', 
                    relevance: 'Hoog', 
                    release_date: 'Juni 2026', 
                    bam_impact: 'AI-gestuurde agent voor Teams Phone om gesprekken samen te vatten.',
                    summary: 'De Teams Phone agent gebruikt AI om gesprekken samen te vatten, actiepunten te identificeren en de belgeschiedenis te doorzoeken.',
                    youtube_links: 'https://www.youtube.com/results?search_query=Microsoft+Mechanics+Teams+Phone+AI'
                },
                { 
                    title: 'Copilot Studio: Autonomous Agents', 
                    category: 'Copilot Studio', 
                    relevance: 'Hoog', 
                    release_date: 'Q2 2026', 
                    bam_impact: 'Agents die proactief taken uitvoeren op de achtergrond.',
                    summary: 'Autonome agents in Copilot Studio kunnen zelfstandig processen bewaken en acties ondernemen zonder menselijke tussenkomst.',
                    youtube_links: 'https://www.youtube.com/results?search_query=Copilot+Studio+Autonomous+Agents'
                },
                { 
                    title: 'Power Apps: Copilot for App Users', 
                    category: 'Power Platform', 
                    relevance: 'Medium', 
                    release_date: 'Juli 2026', 
                    bam_impact: 'Eindgebruikers kunnen vragen stellen aan hun eigen data binnen een Power App.',
                    summary: 'Gebruikers kunnen nu via een natuurlijke taal interface vragen stellen over data in hun Power Apps, zoals "Wat was de totale omzet op locatie X?".',
                    youtube_links: 'https://www.youtube.com/results?search_query=Power+Apps+Copilot+users'
                }
            ];

            for (const item of roadmapItems) {
                await fetch('/api/updates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            }

            fetchBtn.textContent = `Klaar!`;
            loadViewData('updates');
            loadDashboardInsights();
            setTimeout(() => { fetchBtn.disabled = false; fetchBtn.textContent = '📡 Roadmap Ophalen'; }, 3000);
        });
    }

    // AI Video Finder
    const findVideoBtn = document.getElementById('find-video-btn');
    if (findVideoBtn) {
        findVideoBtn.addEventListener('click', async () => {
            const title = document.getElementById('detail-title').textContent;
            findVideoBtn.disabled = true;
            findVideoBtn.textContent = '🔍 Zoeken...';
            
            try {
                const res = await fetch('/api/updates/find-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title })
                });
                const data = await res.json();
                if (data.url) {
                    document.getElementById('detail-yt-link').value = data.url;
                    findVideoBtn.textContent = '✨ Gevonden!';
                    setTimeout(() => { findVideoBtn.disabled = false; findVideoBtn.textContent = '✨ Zoek Video'; }, 2000);
                }
            } catch (e) {
                findVideoBtn.textContent = '❌ Fout';
                setTimeout(() => { findVideoBtn.disabled = false; findVideoBtn.textContent = '✨ Zoek Video'; }, 2000);
            }
        });
    }

    // Save All Update Details
    const saveAllBtn = document.getElementById('save-all-btn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', async () => {
            const id = activeUpdateId;
            const data = {
                notes: document.getElementById('detail-notes').value,
                youtube_links: document.getElementById('detail-yt-link').value,
                target_audience: document.getElementById('detail-audience').value,
                readiness_score: document.getElementById('detail-readiness-score').value,
                impact_score: document.getElementById('detail-impact-score').value,
                complexity_score: document.getElementById('detail-complexity-score').value,
                use_case: document.getElementById('detail-use-case').value,
                action_plan: JSON.stringify(getChecklistData())
            };
            
            const res = await fetch(`/api/updates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                saveAllBtn.textContent = '✅ Alles Opgeslagen!';
                setTimeout(() => saveAllBtn.textContent = '✅ Alles Opslaan', 2000);
                loadViewData('updates');
                loadDashboardInsights();
            }
        });
    }

    // Voting
    const voteBtn = document.getElementById('vote-btn');
    if (voteBtn) {
        voteBtn.addEventListener('click', async () => {
            const res = await fetch(`/api/updates/${activeUpdateId}/vote`, { method: 'POST' });
            if (res.ok) {
                const countElem = document.getElementById('detail-vote-count');
                countElem.textContent = parseInt(countElem.textContent) + 1;
                voteBtn.disabled = true;
                voteBtn.textContent = 'Bedankt!';
                loadDashboardInsights();
            }
        });
    }

    // Plan Workshop
    const planWorkshopBtn = document.getElementById('plan-workshop-btn');
    if (planWorkshopBtn) {
        planWorkshopBtn.addEventListener('click', async () => {
            const title = document.getElementById('detail-title').textContent;
            const impact = document.getElementById('detail-impact').textContent;
            
            const workshopData = {
                title: `Workshop: ${title}`,
                type: 'Workshop',
                date: new Date().toISOString().slice(0, 16),
                location: 'BAM HQ / Teams',
                description: `Sessie gepland naar aanleiding van nieuwe update. Impact analyse: ${impact}`
            };

            const res = await fetch('/api/workshops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workshopData)
            });

            if (res.ok) {
                planWorkshopBtn.textContent = '📅 Workshop Gepland!';
                planWorkshopBtn.classList.add('btn-secondary');
                loadStats();
            }
        });
    }
});

let activeUpdateId = null;

function navigateTo(viewId) {
    document.querySelectorAll('.nav-item').forEach(i => {
        i.classList.remove('active');
        if (i.getAttribute('data-view') === viewId) i.classList.add('active');
    });
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const viewElem = document.getElementById(`view-${viewId}`);
    if (viewElem) viewElem.classList.remove('hidden');
    loadViewData(viewId);
}

function setupForm(formId, endpoint) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (formId === 'contact-form') data.is_champion = form.querySelector('[name="is_champion"]').checked ? 1 : 0;
        
        const id = data.id;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${endpoint}/${id}` : endpoint;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            hideModal(formId.replace('-form', '-modal'));
            loadViewData(formId.replace('-form', 's'));
            loadStats();
            form.reset();
        }
    });
}

async function loadStats() {
    try {
        const workshops = await (await fetch('/api/workshops')).json();
        const contacts = await (await fetch('/api/contacts')).json();
        const updates = await (await fetch('/api/updates')).json();

        document.getElementById('count-workshops').textContent = workshops.length;
        document.getElementById('count-contacts').textContent = contacts.length;
        document.getElementById('count-updates').textContent = updates.length;
    } catch (e) { console.error('Stats loading failed', e); }
}

async function loadDashboardInsights() {
    try {
        const updates = await (await fetch('/api/updates')).json();
        
        // Top Impact
        const topImpact = [...updates].sort((a, b) => b.impact_score - a.impact_score).slice(0, 3);
        document.getElementById('top-impact-list').innerHTML = topImpact.map(u => `
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <span style="font-size: 0.9rem; font-weight: 500;">${u.title}</span>
                <span class="badge badge-primary">Impact: ${u.impact_score}/5</span>
            </div>
        `).join('');

        // Top Votes
        const topVotes = [...updates].sort((a, b) => b.vote_count - a.vote_count).slice(0, 3);
        document.getElementById('top-votes-list').innerHTML = topVotes.map(u => `
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <span style="font-size: 0.9rem; font-weight: 500;">${u.title}</span>
                <span class="badge badge-secondary">${u.vote_count} STEMMEN</span>
            </div>
        `).join('');
    } catch (e) { console.error('Dashboard insights loading failed', e); }
}

let allUpdates = [];
async function loadViewData(viewId) {
    if (viewId === 'dashboard') { loadStats(); loadDashboardInsights(); }

    if (viewId === 'workshops') {
        const data = await (await fetch('/api/workshops')).json();
        const grid = document.getElementById('workshops-grid');
        grid.innerHTML = data.map(ws => `
            <div class="card clickable-card" onclick="editWorkshop(${JSON.stringify(ws).replace(/"/g, '&quot;')})">
                <div style="display: flex; justify-content: space-between;">
                    <span class="badge badge-primary">${ws.type}</span>
                    <span class="badge ${ws.status === 'Completed' ? 'badge-secondary' : (ws.status === 'Cancelled' ? 'badge-warning' : 'badge-primary')}">${ws.status}</span>
                </div>
                <div class="card-title" style="margin-top: 16px; font-size: 1.1rem; color: var(--text-main);">${ws.title}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">📅 ${new Date(ws.date).toLocaleDateString('nl-NL')} om ${new Date(ws.date).toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'})}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">📍 ${ws.location || 'Niet opgegeven'}</div>
                <p style="margin-top: 15px; font-size: 0.85rem; color: var(--primary); font-weight: 700;">BEWERKEN →</p>
            </div>
        `).join('');
    }

    if (viewId === 'contacts') {
        const data = await (await fetch('/api/contacts')).json();
        document.getElementById('contacts-grid').innerHTML = data.map(c => `
            <div class="card clickable-card" onclick="editContact(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div class="card-title" style="margin-bottom: 4px; color: var(--text-main); font-size: 1.1rem;">${c.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${c.department}</div>
                    </div>
                    ${c.is_champion ? '<span class="badge badge-secondary">🏆 Champion</span>' : '<span class="badge badge-primary">' + c.level + '</span>'}
                </div>
                <div style="margin-top: 16px; font-size: 0.85rem; color: var(--text-muted);">${c.email}</div>
                <p style="margin-top: 12px; font-size: 0.85rem; color: var(--primary); font-weight: 700;">BEWERKEN →</p>
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
    
    grid.innerHTML = filtered.map(u => {
        const audience = u.target_audience ? u.target_audience.split(',') : [];
        const ytLink = u.youtube_links || '';
        return `
            <div class="card" onclick="openUpdateDetail(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span class="badge badge-warning">${u.category}</span>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">${u.release_date || 'TBD'}</span>
                </div>
                <div class="card-title" style="margin-top: 12px; color: var(--text-main); font-size: 1.15rem; line-height: 1.4;">${u.title}</div>
                
                <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                    ${audience.map(a => `<span class="tag">${a.trim()}</span>`).join('')}
                </div>

                <div style="background: #fff7ed; padding: 12px; border-radius: 12px; margin-top: 16px; border-left: 4px solid var(--primary);">
                    <p style="font-size: 0.85rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${u.bam_impact}</p>
                </div>

                <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        ${ytLink ? `<a href="${ytLink}" target="_blank" onclick="event.stopPropagation()" class="yt-link" style="background:#fee2e2; color:#b91c1c; padding:4px 8px; border-radius:6px; font-size:0.7rem; font-weight:700; text-decoration:none;">▶ Video</a>` : ''}
                        <span title="Draagvlak" style="font-size: 0.8rem; font-weight: 600;">👍 ${u.vote_count || 0}</span>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">DETAILS →</span>
                </div>
            </div>
        `;
    }).join('');
}

function openUpdateDetail(u) {
    activeUpdateId = u.id;
    document.getElementById('detail-title').textContent = u.title;
    document.getElementById('detail-category').textContent = u.category;
    document.getElementById('detail-date').textContent = `Verwachte release: ${u.release_date || 'TBD'}`;
    document.getElementById('detail-impact').textContent = u.bam_impact;
    document.getElementById('detail-summary').textContent = u.summary;
    document.getElementById('detail-notes').value = u.notes || '';
    document.getElementById('detail-yt-link').value = u.youtube_links || '';
    document.getElementById('detail-link').href = u.source_url || '#';
    
    document.getElementById('detail-audience').value = u.target_audience || '';
    document.getElementById('detail-impact-score').value = u.impact_score || 0;
    document.getElementById('detail-complexity-score').value = u.complexity_score || 0;
    document.getElementById('detail-readiness-score').value = u.readiness_score || 0;
    document.getElementById('detail-use-case').value = u.use_case || '';
    document.getElementById('detail-vote-count').textContent = u.vote_count || 0;
    
    document.getElementById('vote-btn').disabled = false;
    document.getElementById('vote-btn').textContent = '👍 Stemmen';
    document.getElementById('plan-workshop-btn').textContent = '📅 Plan Workshop';
    document.getElementById('plan-workshop-btn').classList.remove('btn-secondary');

    renderChecklist(u.action_plan);
    showModal('update-detail-modal');
}

function renderChecklist(dataStr) {
    const container = document.getElementById('action-plan-container');
    container.innerHTML = '';
    let data = [];
    try { data = JSON.parse(dataStr || '[]'); } catch(e) {}
    if (data.length === 0) data = [{text: 'Communicatie opstellen', done: false}, {text: 'Governance check', done: false}];
    data.forEach(item => addActionItem(item.text, item.done));
}

function addActionItem(text = '', done = false) {
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.innerHTML = `
        <input type="checkbox" ${done ? 'checked' : ''}>
        <input type="text" value="${text}" placeholder="Taak..." style="flex:1; border:none; border-bottom: 1px solid var(--border); font-size:0.9rem;">
    `;
    document.getElementById('action-plan-container').appendChild(div);
}

function getChecklistData() {
    const items = [];
    document.querySelectorAll('.checklist-item').forEach(div => {
        const text = div.querySelector('input[type="text"]').value;
        if (text.trim()) {
            items.push({
                text: text,
                done: div.querySelector('input[type="checkbox"]').checked
            });
        }
    });
    return items;
}

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
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex'; 
}

function hideModal(id) { 
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        if (id === 'workshop-modal') document.getElementById('workshop-form').reset();
        if (id === 'contact-modal') document.getElementById('contact-form').reset();
    }
}
