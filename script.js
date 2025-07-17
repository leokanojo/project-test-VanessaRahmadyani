const API_URL = 'https://suitmedia-backend.suitdev.com/api/ideas';

let currentPage = 1;
let pageSize = 10;
let sortOrder = '-published_at';

const grid = document.getElementById('ideas-grid');
const pagination = document.getElementById('pagination');
const itemCount = document.getElementById('item-count');
const perPageSelect = document.getElementById('per-page');
const sortSelect = document.getElementById('sort');
const header = document.getElementById('header');

let lastScrollY = window.scrollY;

// Restore saved state
const state = JSON.parse(localStorage.getItem('ideasState')) || {};
currentPage = state.currentPage || currentPage;
pageSize = state.pageSize || pageSize;
sortOrder = state.sortOrder || sortOrder;
perPageSelect.value = pageSize;
sortSelect.value = sortOrder;

function saveState() {
  localStorage.setItem('ideasState', JSON.stringify({ currentPage, pageSize, sortOrder }));
}

function fetchIdeas() {
  const params = new URLSearchParams({
    'page[number]': currentPage,
    'page[size]': pageSize,
    'sort': sortOrder,
    'append[]': 'small_image',
    'append[]': 'medium_image'
  });

  fetch(`${API_URL}?${params}`)
    .then(res => res.json())
    .then(data => {
      renderIdeas(data.data);
      renderPagination(data.meta.total);
    });
}

function renderIdeas(ideas) {
  grid.innerHTML = '';
  ideas.forEach((idea, i) => {
    const img = idea.attributes.small_image?.url || `./assets/content${(i % 8) + 1}.jpg`;
    const date = new Date(idea.attributes.published_at).toLocaleDateString('en-GB');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${img}" alt="Post Image" loading="lazy">
      <div class="card-content">
        <p class="date">${date}</p>
        <h3 class="title">${idea.attributes.title}</h3>
      </div>
    `;
    grid.appendChild(card);
  });

  const from = (currentPage - 1) * pageSize + 1;
  const to = from + ideas.length - 1;
  itemCount.textContent = `Showing ${from} - ${to}`;
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / pageSize);
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => {
      currentPage = i;
      saveState();
      fetchIdeas();
    };
    pagination.appendChild(btn);
  }
}

// --- MENU GRID DATA ---
const navbarGridItems = Array.from({length: 50}, (_, i) => ({
  img: `assets/content${(i % 2) + 1}.jpg`,
  label: (i % 2 === 0) ? "Traditional Drawing for Beginners and full of thoughs, nature and human resource" : "Oil Painting"
}));

// --- STATE MANAGEMENT ---
function getNavbarGridState() {
  const params = new URLSearchParams(window.location.search);
  return {
    page: parseInt(params.get('navbarPage')) || 1,
    perPage: parseInt(params.get('navbarPerPage')) || 10
  };
}
function setNavbarGridState({page, perPage}) {
  const params = new URLSearchParams(window.location.search);
  params.set('navbarPage', page);
  params.set('navbarPerPage', perPage);
  window.history.replaceState({}, '', '?' + params.toString());
}

// --- RENDER MENU GRID ---
function renderNavbarGrid() {
  const {page, perPage} = getNavbarGridState();
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const items = navbarGridItems.slice(start, end);

  const grid = document.getElementById('cards');
  grid.innerHTML = '';
  let row;
  items.forEach((item, idx) => {
    if (idx % 4 === 0) {
      row = document.createElement('div');
      row.className = 'cards-row';
      grid.appendChild(row);
    }
    // Buat elemen link agar bisa diklik ke article.html
    const link = document.createElement('a');
    link.className = 'cards-item';
    link.href = 'article.html';
    link.innerHTML = `
      <img src="${item.img}" alt="${item.label}">
      <div class="cards-label">${item.label}</div>
    `;
    row.appendChild(link);
  });

  // Render pagination for navbar grid
  renderNavbarGridPagination(navbarGridItems.length, perPage, page);

  // Update item count info
  const from = (page - 1) * perPage + 1;
  const to = from + items.length - 1;
  const info = document.getElementById('item-count');
  if (info) info.textContent = `Showing ${from} - ${to} of ${navbarGridItems.length}`;
}

// --- RENDER MENU GRID PAGINATION ---
function renderNavbarGridPagination(total, perPage, currentPage) {
  let totalPages = Math.ceil(total / perPage);
  let pag = document.getElementById('cards-pagination');
  if (!pag) {
    pag = document.createElement('div');
    pag.id = 'cards-pagination';
    pag.className = 'pagination';
    document.getElementById('cards').appendChild(pag);
  }
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  pag.innerHTML = html;
  pag.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      setNavbarGridState({page: parseInt(btn.dataset.page), perPage: getNavbarGridState().perPage});
      renderNavbarGrid();
    };
  });
}

// --- HANDLE SHOW PER PAGE SELECT ---
document.getElementById('per-page').addEventListener('change', e => {
  setNavbarGridState({page: 1, perPage: parseInt(e.target.value)});
  renderNavbarGrid();
});

// --- INIT SELECT VALUE ---
function initNavbarGridControls() {
  const {perPage} = getNavbarGridState();
  document.getElementById('per-page').value = perPage;
}
initNavbarGridControls();
renderNavbarGrid();

// Events
perPageSelect.addEventListener('change', () => {
  pageSize = parseInt(perPageSelect.value);
  currentPage = 1;
  saveState();
  fetchIdeas();
});

sortSelect.addEventListener('change', () => {
  sortOrder = sortSelect.value;
  currentPage = 1;
  saveState();
  fetchIdeas();
});

// Header scroll animation
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > lastScrollY && scrollY > 100) {
    header.classList.add('hide');
  } else {
    header.classList.remove('hide');
  }
  lastScrollY = scrollY;

  const banner = document.querySelector('.banner-image');
  if (banner) banner.style.transform = `translateY(${scrollY * 0.4}px)`;
});

// Init
fetchIdeas();


