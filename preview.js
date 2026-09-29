(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function pathFor(from, to) {
    const startX = from.x + 66;
    const endX = to.x - 66;
    const middle = (startX + endX) / 2;
    return `M ${startX} ${from.y} C ${middle} ${from.y}, ${middle} ${to.y}, ${endX} ${to.y}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.FrictionScenarios || !window.FrictionEngine) return;
    const range = document.querySelector('#previewVolume');
    const output = document.querySelector('#previewVolumeOutput');
    const analyzeButton = document.querySelector('#previewAnalyze');
    const diagnosisCopy = document.querySelector('#previewDiagnosis');
    const svg = document.querySelector('#previewSvg');
    const cycle = document.querySelector('#previewCycle');
    const backlog = document.querySelector('#previewBacklog');
    const cost = document.querySelector('#previewCost');
    const fullLink = document.querySelector('.preview-link');
    if (!range || !svg) return;

    let model = FrictionScenarios.clone('dispatch');
    let result;
    let diagnosis = null;

    function render() {
      svg.replaceChildren();
      const nodes = Object.fromEntries(model.nodes.map(node => [node.id, node]));

      model.edges.forEach((edge, index) => {
        const data = pathFor(nodes[edge.from], nodes[edge.to]);
        svg.appendChild(svgElement('path', { id: `preview-path-${index}`, d: data, class: 'preview-edge' }));
        if (!reducedMotion) {
          const token = svgElement('circle', { r: '4.5', class: 'preview-token' });
          const motion = svgElement('animateMotion', { dur: `${3.2 + index * .2}s`, begin: `${index * .35}s`, repeatCount: 'indefinite', path: data });
          token.appendChild(motion);
          svg.appendChild(token);
        }
      });

      model.nodes.forEach(node => {
        const stats = result.nodeStats[node.id];
        const group = svgElement('g', { class: 'preview-node', transform: `translate(${node.x - 65} ${node.y - 36})` });
        if (diagnosis && diagnosis.bottleneck.id === node.id) group.classList.add('problem');
        group.appendChild(svgElement('rect', { width: '130', height: '72', rx: '8' }));
        const label = svgElement('text', { x: '12', y: '29' }); label.textContent = node.label; group.appendChild(label);
        const meta = svgElement('text', { x: '12', y: '50', class: 'preview-meta' }); meta.textContent = `${Math.round(stats.utilization * 100)}% used · ${stats.backlog} waiting`; group.appendChild(meta);
        svg.appendChild(group);
      });
    }

    function update() {
      model.volumePerDay = Number(range.value);
      output.value = model.volumePerDay;
      result = FrictionEngine.simulate(model);
      cycle.textContent = result.averageCycleHours < 1 ? `${Math.round(result.averageCycleHours * 60)} min` : `${result.averageCycleHours.toFixed(1)} h`;
      backlog.textContent = result.backlog.toLocaleString();
      cost.textContent = money.format(result.laborCost);
      fullLink.href = `friction-lab/?scenario=dispatch&volume=${model.volumePerDay}`;
      diagnosis = null;
      diagnosisCopy.textContent = 'Adjust the workload, then analyze the system.';
      render();
    }

    range.addEventListener('input', update);
    analyzeButton.addEventListener('click', () => {
      diagnosis = FrictionEngine.diagnose(result);
      diagnosisCopy.textContent = `${diagnosis.bottleneck.label} is the constraint. ${diagnosis.reason}`;
      render();
    });

    update();
  });
})();
