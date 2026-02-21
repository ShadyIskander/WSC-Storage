import { supabase } from './supabase.js'

// State
let state = {
    activeTab: 'take',
    isAdminUnlocked: false,
    equipment: [],
    selectedItem: null
}

// UI Elements
const mainContent = document.getElementById('main-content')
const tabButtons = document.querySelectorAll('.tab-bar .tab-btn')
const passwordOverlay = document.getElementById('password-overlay')
const pwInput = document.getElementById('admin-pw-input')
const notificationsContainer = document.getElementById('notifications')

// --- Notifications ---
function notify(msg, type = 'info') {
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.innerHTML = msg
    notificationsContainer.appendChild(toast)
    setTimeout(() => {
        toast.style.opacity = '0'
        setTimeout(() => toast.remove(), 400)
    }, 3000)
}

// --- Data Fetching ---
async function fetchEquipment() {
    const { data, error } = await supabase.from('equipment').select('*').order('name_en')
    if (error) {
        notify('System Error: Database unreachable.', 'error')
        return []
    }
    state.equipment = data
    return data
}

// --- Renderers ---

const renderGuidedSearch = (type) => {
    state.selectedItem = null
    const title = type === 'take' ? 'Take Equipment' : 'Return Equipment'
    const label = type === 'take' ? 'Search Item' : 'Search Item'
    const btnText = type === 'take' ? 'Confirm Take' : 'Confirm Return'
    const btnClass = type === 'take' ? 'btn' : 'btn btn-success'

    mainContent.innerHTML = `
        <div class="action-card">
            <h2>${title}</h2>
            <form id="action-form">
            <div class="field">
                    <label>Your Name</label>
                    <input type="text" id="user-name" placeholder="Full name" required>
                </div>
                <div class="field">
                    <label>${label}</label>
                    <input type="text" id="item-search" placeholder="Type name..." autocomplete="off">
                    <div id="search-results" class="search-results hidden"></div>
                </div>
                <div class="field">
                    <label>Location </label>
                    <input type="text" id="item-location" readonly placeholder="Select an item above">
                </div>
                <div class="field">
                    <label>How many?</label>
                    <input type="number" id="item-qty" placeholder="Quantity of item?" min="1" required>
                </div>
                <button type="submit" class="${btnClass}">${btnText}</button>
            </form>
        </div>
    `

    const searchInput = document.getElementById('item-search')
    const resultsBox = document.getElementById('search-results')
    const locationInput = document.getElementById('item-location')

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase()
        if (!query) {
            resultsBox.classList.add('hidden')
            return
        }

        let filtered = state.equipment.filter(i =>
            i.name_en.toLowerCase().includes(query) ||
            (i.name_ar && i.name_ar.includes(query))
        )

        if (type === 'return') {
            filtered = filtered.filter(i => i.available_quantity < i.total_quantity)
        }

        if (filtered.length > 0) {
            resultsBox.innerHTML = filtered.map(i => `
                <div class="search-item" data-id="${i.id}">
                    <strong>${i.name_en}</strong>
                    <span class="item-sub">${i.name_ar || ''}</span>
                    <span class="item-sub">Available: ${i.available_quantity} / ${i.total_quantity}</span>
                </div>
            `).join('')
            resultsBox.classList.remove('hidden')
        } else {
            resultsBox.innerHTML = '<div class="search-item">No matches found</div>'
            resultsBox.classList.remove('hidden')
        }
    })

    resultsBox.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.search-item')
        if (!itemEl || !itemEl.dataset.id) return

        const item = state.equipment.find(i => i.id === itemEl.dataset.id)
        if (item) {
            state.selectedItem = item
            searchInput.value = item.name_en
            locationInput.value = item.location || 'Unknown'
            resultsBox.classList.add('hidden')
        }
    })

    document.getElementById('action-form').addEventListener('submit', (e) => handleAction(e, type))
}

const renderAdmin = async () => {
    if (!state.isAdminUnlocked) return

    mainContent.innerHTML = '<div class="loading">Loading dashboard...</div>'

    try {
        const { data: items, error: e1 } = await supabase.from('equipment').select('*')
        const { data: logs, error: e2 } = await supabase.from('transactions').select('*, equipment:equipment_id(name_en, name_ar)').order('created_at', { ascending: false }).limit(20)

        if (e1 || e2) throw new Error('Query failed')

        // Sorting: Missing items (avail < total) first, then by name
        const sortedItems = items.sort((a, b) => {
            const aMissing = a.available_quantity < a.total_quantity
            const bMissing = b.available_quantity < b.total_quantity
            if (aMissing && !bMissing) return -1
            if (!aMissing && bMissing) return 1
            return a.name_en.localeCompare(b.name_en)
        })

        mainContent.innerHTML = `
            <div class="admin-grid">
                <section class="inventory-sec">
                    <h3>Live Inventory</h3>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Item</th><th>Status</th><th>Stock</th></tr></thead>
                            <tbody>
                                ${sortedItems.map(i => {
            const percent = (i.available_quantity / i.total_quantity) * 100
            let statusClass = 'status-full'
            let statusText = 'GREEN'
            if (percent <= 0) { statusClass = 'status-critical'; statusText = 'EMPTY'; }
            else if (percent < 50) { statusClass = 'status-critical'; statusText = 'RED'; }
            else if (percent < 100) { statusClass = 'status-warning'; statusText = 'YELLOW'; }
            else { statusText = 'GREEN'; }

            return `
                                        <tr>
                                            <td>
                                                ${i.name_en}<br>
                                                <span class="arabic-sub">${i.name_ar || ''}</span>
                                            </td>
                                            <td>
                                                <span class="status-pill ${statusClass}">${statusText}</span>
                                            </td>
                                            <td>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${percent}%; background: ${percent < 50 ? 'var(--status-red)' : percent < 100 ? 'var(--status-yellow)' : 'var(--status-green)'}"></div>
                                                </div>
                                                <span>${i.available_quantity} / ${i.total_quantity}</span>
                                            </td>
                                        </tr>
                                    `
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section class="logs-sec">
                    <h3>Recent History </h3>
                    <div class="log-list">
                        ${logs.map(l => `
                            <div class="log-item">
                                <strong>${l.user_name}</strong> 
                                <span style="color: ${l.action_type === 'take' ? 'var(--status-red)' : 'var(--status-green)'}">
                                    ${l.action_type.toUpperCase()}
                                </span> 
                                ${l.quantity}x ${l.equipment?.name_en || 'Item'}
                                <small>${new Date(l.created_at).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </div>
                </section>
                <button id="clear-logs-btn" class="btn btn-danger">CLEAR RECENT LOGS</button>
            </div>
        `

        document.getElementById('clear-logs-btn').onclick = clearLogs
    } catch (err) {
        mainContent.innerHTML = `<div class="error-box"><p>Connection Lost. Check .env and internet.</p></div>`
    }
}

// --- Handlers ---

let isSubmitting = false

async function handleAction(e, type) {
    e.preventDefault()
    if (isSubmitting) return

    if (!state.selectedItem) {
        notify('Please select an item from the list first!', 'error')
        return
    }

    const qty = parseInt(document.getElementById('item-qty').value)
    const name = document.getElementById('user-name').value
    const item = state.selectedItem

    if (type === 'take' && qty > item.available_quantity) {
        notify('Error: Not enough items available!', 'error')
        return
    }

    if (type === 'return' && qty > (item.total_quantity - item.available_quantity)) {
        notify('Error: Cannot return more than what was taken!', 'error')
        return
    }

    isSubmitting = true
    const btn = e.target.querySelector('button')
    if (btn) btn.disabled = true

    try {
        // 1. Log transaction
        await supabase.from('transactions').insert({
            equipment_id: item.id,
            user_name: name,
            quantity: qty,
            action_type: type
        })

        // 2. Fetch latest raw count to prevent race conditions
        const { data: latest } = await supabase.from('equipment').select('available_quantity').eq('id', item.id).single()
        const newQty = type === 'take' ? latest.available_quantity - qty : latest.available_quantity + qty

        await supabase.from('equipment').update({ available_quantity: newQty }).eq('id', item.id)

        notify(`Success! Record updated.`, 'success')
        switchTab(type) // Reset view
    } catch (err) {
        notify('Transaction failed. Database busy.', 'error')
    } finally {
        isSubmitting = false
        if (btn) btn.disabled = false
    }
}

async function clearLogs() {
    if (isSubmitting) return
    if (!confirm('Are you sure you want to clear ALL transaction records? This will free up storage space but you will lose the history.')) return

    isSubmitting = true
    try {
        const { error } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all
        if (error) throw error
        notify('History cleared successfully.', 'success')
        renderAdmin()
    } catch (err) {
        notify('Delete failed. Check RLS policies.', 'error')
    } finally {
        isSubmitting = false
    }
}

async function switchTab(tabId) {
    if (tabId === 'admin' && !state.isAdminUnlocked) {
        openPasswordOverlay()
        return
    }

    state.activeTab = tabId
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId))

    await fetchEquipment()
    if (tabId === 'take' || tabId === 'return') renderGuidedSearch(tabId)
    else if (tabId === 'admin') renderAdmin()
}

// --- Password Magic ---
function openPasswordOverlay() {
    passwordOverlay.classList.remove('hidden')
    pwInput.focus()
}

function closePasswordOverlay() {
    passwordOverlay.classList.add('hidden')
    pwInput.value = ''
}

document.getElementById('pw-submit').onclick = () => {
    if (pwInput.value === '2003') {
        state.isAdminUnlocked = true
        closePasswordOverlay()
        switchTab('admin')
    } else {
        notify('Invalid Credentials', 'error')
        pwInput.value = ''
    }
}

document.getElementById('pw-cancel').onclick = closePasswordOverlay

// --- Init ---
tabButtons.forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab)
})

// Force Dark Mode initialization
document.documentElement.setAttribute('data-theme', 'dark')

// Initial load
switchTab('take')
