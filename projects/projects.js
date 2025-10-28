import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleEl = document.querySelector('.projects-title');
if (titleEl) {
  titleEl.textContent = `${projects.length} Projects`;
}

let selectedIndex = -1;
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

function renderPieChart(projectsGiven) {
  function applyProjectFilter() {
    const searched = query
      ? projectsGiven.filter(p =>
          Object.values(p).join('\n').toLowerCase().includes(query.toLowerCase())
        )
      : projectsGiven;

    if (selectedIndex === -1) {
      renderProjects(searched, projectsContainer, 'h2');
    } else {
      const year = newData[selectedIndex]?.label;
      const subset = searched.filter(p => String(p.year) === String(year));
      renderProjects(subset, projectsContainer, 'h2');
    }
  }
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => String(d.year)
  );

  // re-calculate data
  newRolledData.sort((a, b) => +a[0] - +b[0]);
  let newData = newRolledData.map(([year, count]) => ({ label: year, value: count }));

  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value(d => d.value).sort(null);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map(d => arcGenerator(d));

  // update paths and legends, refer to steps 1.4 and 2.2
  let newSVG = d3.select('#projects-pie-plot');
  newSVG.selectAll('path').remove();

  let newLegend = d3.select('.legend');
  newLegend.selectAll('li').remove();

  newArcs.forEach((path, idx) => {
  newSVG.append('path')
    .attr('d', path)
    .attr('fill', colors(idx))
    .attr('class', idx === selectedIndex ? 'selected' : null)
    .on('click', () => {
      selectedIndex = selectedIndex === idx ? -1 : idx;
      newSVG.selectAll('path')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : null));
      newLegend.selectAll('li')
        .attr('class', (_, i) => 'legend-item' + (i === selectedIndex ? ' selected' : ''));
       applyProjectFilter();
    });
});

  newData.forEach((d, idx) => {
    newLegend.append('li')
      .attr('class', 'legend-item' + (idx === selectedIndex ? ' selected' : ''))
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        newSVG.selectAll('path')
          .attr('class', (_, i) => (i === selectedIndex ? 'selected' : null));
        newLegend.selectAll('li')
          .attr('class', (_, i) => 'legend-item' + (i === selectedIndex ? ' selected' : ''));
          applyProjectFilter();
      })
      });
    applyProjectFilter(); 
}


let query = '';
let searchInput = document.querySelector('.searchBar');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  renderPieChart(projects);   
});

