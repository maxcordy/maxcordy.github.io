const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => {
  const header = document.querySelector('.site-header');
  header.classList.toggle('open');
  menu.setAttribute('aria-expanded', header.classList.contains('open'));
});
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.site-header').classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

document.querySelectorAll('.show-more').forEach(button => button.addEventListener('click', () => {
  const target = document.getElementById(button.dataset.target);
  const expanded = !target.classList.contains('is-expanded');
  target.classList.toggle('is-expanded', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  button.childNodes[0].nodeValue = `${expanded ? button.dataset.labelLess : button.dataset.labelMore} `;
}));

const fallback = [
  { year: '—', title: 'Publications are temporarily unavailable', venue: 'Browse the complete peer-reviewed record on DBLP or Google Scholar.', url: 'https://dblp.org/pid/73/10839.html' }
];

function renderPublications(items) {
  document.getElementById('publication-list').innerHTML = items.map(item => `
    <a class="publication" href="${item.url}" target="_blank" rel="noreferrer">
      <span class="pub-year">${item.year}</span>
      <div><h3>${item.title}</h3><p>${item.venue}</p></div>
      <span class="pub-arrow" aria-hidden="true">↗</span>
    </a>`).join('');
}

fetch('https://dblp.org/search/publ/api?q=author%3AMaxime_Cordy%3A&h=200&format=json')
  .then(response => { if (!response.ok) throw new Error('DBLP unavailable'); return response.json(); })
  .then(data => {
    const hits = data.result?.hits?.hit || [];
    const peerReviewedTypes = new Set([
      'Conference and Workshop Papers',
      'Journal Articles',
      'Parts in Books or Collections'
    ]);
    const publications = hits.filter(hit => {
      const info = hit.info || {};
      const searchable = `${info.venue || ''} ${info.url || ''} ${info.ee || ''}`.toLowerCase();
      return peerReviewedTypes.has(info.type) && !searchable.includes('corr') && !searchable.includes('arxiv');
    }).map(hit => ({
      year: hit.info.year || '—',
      title: hit.info.title?.replace(/<[^>]*>/g, '') || 'Untitled publication',
      venue: [hit.info.venue, hit.info.type].filter(Boolean).join(' · '),
      url: hit.info.ee || hit.info.url || 'https://dblp.org/pid/73/10839.html'
    }));
    const currentYear = new Date().getFullYear();
    const current = publications.filter(item => Number(item.year) === currentYear);
    const previous = publications.filter(item => Number(item.year) === currentYear - 1);
    const selected = current.length >= 6 ? current : [...current, ...previous];
    renderPublications(selected.length ? selected : fallback);
  })
  .catch(() => renderPublications(fallback));
