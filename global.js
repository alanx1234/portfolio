console.log("IT'S ALIVE!");

let pages = [
  { url: 'index.html',              title: 'Home' },
  { url: 'projects/index.html',     title: 'Projects' },
  { url: 'contact/index.html',      title: 'Contact' },
  { url: 'resume/index.html',       title: 'Resume' },
  { url: 'https://github.com/alanx1234', title: 'GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

for (let p of pages) {
  let url = p.url;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  nav.append(a);

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = "_blank";
  }
}
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  try { localStorage.colorScheme = colorScheme; } catch {}
}

let select = document.querySelector('.color-scheme select');

select.addEventListener('input', (e) => setColorScheme(e.target.value));
select.addEventListener('change', (e) => setColorScheme(e.target.value));


if ("colorScheme" in localStorage && localStorage.colorScheme) {
    select.value = localStorage.colorScheme;
    setColorScheme(localStorage.colorScheme);
}

const form = document.querySelector('form[action^="mailto:"]');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const params = [];

  for (const [name, value] of data) {
    params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  const url = form.action + (params.length ? `?${params.join('&')}` : '');
  location.href = url; 
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    console.log(response); // Inspect in DevTools
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    throw error;
  }
}


export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  const list = Array.isArray(project) ? project : [project];

  for (const p of list) {
    const article = document.createElement('article');
    const originBase = window.location.origin + BASE_PATH;  

    article.innerHTML = `
      <${headingLevel}>${p.title}</${headingLevel}>
      <img src="${p.image}" alt="${p.title}">
      <p>${p.description}</p>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}