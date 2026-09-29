(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const elements = {
    scenario: document.querySelector('#scenarioSelect'),
    volume: document.querySelector('#volumeRange'),
    volumeOutput: document.querySelector('#volumeOutput'),
    description: document.querySelector('#scenarioDescription'),
    reset: document.querySelector('#resetButton'),
    diagnose: document.querySelector('#diagnoseButton'),
    optimize: document.querySelector('#optimizeButton'),
    motion: document.querySelector('#motionButton'),
    share: document.querySelector('#shareButton'),
    shareStatus: document.querySelector('#shareStatus'),
    svg: document.querySelector('#workflowSvg'),
    cycle: document.querySelector('#cycleKpi'),
    wait: document.querySelector('#waitKpi'),
    backlog: document.querySelector('#backlogKpi'),
    cost: document.querySelector('#costKpi'),
    diagnosisTitle: document.querySelector('#diagnosisTitle'),
    diagnosisReason: document.querySelector('#diagnosisReason'),
    diagnosisRecommendation: document.querySelector('#diagnosisRecommendation'),
    comparison: document.querySelector('#comparison'),
    comparisonBody: document.querySelector('#comparisonBody'),
    changeList: document.querySelector('#changeList'),
    metricsBody: document.querySelector('#metricsBody'),
    status: document.querySelector('#simulationStatus'),
    inspectorTitle: document.querySelector('#inspectorTitle'),
    inspectorHelp: document.querySelector('#inspectorHelp'),
    nodeForm: document.querySelector('#nodeForm'),
    nodeLabel: document.querySelector('#nodeLabel'),
    nodeTime: document.querySelector('#nodeTime'),
    nodeTimeOutput: document.querySelector('#nodeTimeOutput'),
    nodeCapacity: document.querySelector('#nodeCapacity'),
    nodeCapacityOutput: document.querySelector('#nodeCapacityOutput'),
    nodeError: document.querySelector('#nodeError'),
    nodeErrorOutput: document.querySelector('#nodeErrorOutput'),
    nodeStats: document.querySelector('#nodeStats')
  };

  let scenarioId = 'dispatch';
  let model;
  let result;
  let diagnosis = null;
  let selectedNodeId = null;
  let motionPaused = reducedMotion;
  let renderQueued = false;

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function formatHours(value) {
    if (!Number.isFinite(value)) return '—';
    if (value < 1) return `${Math.round(value * 60)} min`;
    return `${value.toFixed(value >= 10 ? 0 : 1)} h`;
  }

  function formatPercent(value) { return `${Math.round(value * 100)}%`; }

  function loadScenario(id, volumeOverride) {
    scenarioId = FrictionScenarios.all[id] ? id : 'dispatch';
    model = FrictionScenarios.clone(scenarioId);
    if (volumeOverride) model.volumePerDay = Number(volumeOverride);
    selectedNodeId = null;
    diagnosis = null;
    elements.scenario.value = scenarioId;
    elements.volume.value = model.volumePerDay;
    elements.volumeOutput.value = model.volumePerDay;
    elements.description.textContent = model.description;
    elements.optimize.disabled = true;
    elements.comparison.hidden = true;
    elements.diagnosisTitle.textContent = 'The model is ready.';
    elements.diagnosisReason.textContent = 'Run the diagnosis to identify the step creating the most operational friction.';
    elements.diagnosisRecommendation.textContent = '';
    hideInspector();
    runSimulation(false);
  }

  function runSimulation(announce = true) {
    result = FrictionEngine.simulate(model);
    updateSummary();
    renderWorkflow();
    updateMetricsTable();
    updateInspector();
    if (announce) {
      elements.status.textContent = `Simulation complete. ${result.backlog} items remain in the month-end backlog. Average completion time is ${formatHours(result.averageCycleHours)}.`;
    }
  }

  function updateSummary() {
    elements.cycle.textContent = formatHours(result.averageCycleHours);
    elements.wait.textContent = formatHours(result.averageWaitHours);
    elements.backlog.textContent = result.backlog.toLocaleString();
    elements.cost.textContent = currency.format(result.laborCost);
  }

  function pathFor(from, to) {
    const startX = from.x + 76;
    const endX = to.x - 76;
    const middle = (startX + endX) / 2;
    return `M ${startX} ${from.y} C ${middle} ${from.y}, ${middle} ${to.y}, ${endX} ${to.y}`;
  }

  function renderWorkflow() {
    elements.svg.replaceChildren();
    elements.svg.classList.toggle('flow-paused', motionPaused);

    const defs = svgElement('defs');
    const marker = svgElement('marker', { id: 'arrow', markerWidth: '9', markerHeight: '9', refX: '8', refY: '4.5', orient: 'auto' });
    marker.appendChild(svgElement('path', { d: 'M0,0 L9,4.5 L0,9 Z', fill: '#3c5067' }));
    defs.appendChild(marker);
    elements.svg.appendChild(defs);

    const nodeById = Object.fromEntries(model.nodes.map(node => [node.id, node]));
    model.edges.forEach((edge, index) => {
      const from = nodeById[edge.from];
      const to = nodeById[edge.to];
      const pathData = pathFor(from, to);
      elements.svg.appendChild(svgElement('path', { d: pathData, class: 'edge-glow' }));
      elements.svg.appendChild(svgElement('path', { id: `flow-path-${index}`, d: pathData, class: 'edge', 'marker-end': 'url(#arrow)' }));

      if (!motionPaused && !reducedMotion) {
        for (let tokenIndex = 0; tokenIndex < 2; tokenIndex += 1) {
          const token = svgElement('circle', { r: tokenIndex ? '3.5' : '5', class: 'flow-token' });
          const animation = svgElement('animateMotion', {
            dur: `${3.1 + index * .23}s`,
            begin: `${tokenIndex * 1.5 + index * .25}s`,
            repeatCount: 'indefinite'
          });
          const pathReference = svgElement('mpath');
          pathReference.setAttributeNS(XLINK_NS, 'href', `#flow-path-${index}`);
          pathReference.setAttribute('href', `#flow-path-${index}`);
          animation.appendChild(pathReference);
          token.appendChild(animation);
          elements.svg.appendChild(token);
        }
      }
    });

    model.nodes.forEach(node => {
      const nodeResult = result.nodeStats[node.id];
      const group = svgElement('g', {
        class: 'node',
        transform: `translate(${node.x - 75} ${node.y - 42})`,
        tabindex: '0',
        role: 'button',
        'aria-label': `${node.label}. ${formatPercent(nodeResult.utilization)} utilized. Select to edit.`
      });

      if (nodeResult.utilization >= .82 || nodeResult.backlog > 2) group.classList.add('warning');
      if (diagnosis && diagnosis.bottleneck.id === node.id) group.classList.add('bottleneck');
      if (node.type === 'automated') group.classList.add('automated');
      if (selectedNodeId === node.id) group.classList.add('selected');

      group.appendChild(svgElement('rect', { width: '150', height: '84' }));
      const title = svgElement('text', { x: '15', y: '31', class: 'node-title' });
      title.textContent = node.label;
      group.appendChild(title);
      const meta = svgElement('text', { x: '15', y: '54', class: 'node-meta' });
      meta.textContent = `${node.processTime.toFixed(node.processTime % 1 ? 1 : 0)} min · cap ${node.capacity} · ${formatPercent(nodeResult.utilization)}`;
      group.appendChild(meta);

      const queueDots = Math.min(5, Math.ceil(nodeResult.backlog / Math.max(1, model.volumePerDay / 5)));
      for (let index = 0; index < queueDots; index += 1) {
        group.appendChild(svgElement('circle', { cx: String(126 - index * 11), cy: '70', r: '3', class: 'node-queue' }));
      }

      group.addEventListener('click', () => selectNode(node.id));
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectNode(node.id);
        }
      });
      elements.svg.appendChild(group);
    });
  }

  function selectNode(id) {
    selectedNodeId = id;
    renderWorkflow();
    updateInspector();
    elements.inspectorTitle.focus?.();
  }

  function hideInspector() {
    elements.inspectorTitle.textContent = 'Choose a node';
    elements.inspectorHelp.textContent = 'Select any workflow step to inspect and change it.';
    elements.nodeForm.hidden = true;
    elements.nodeStats.hidden = true;
  }

  function updateInspector() {
    if (!selectedNodeId || !result) { hideInspector(); return; }
    const node = model.nodes.find(item => item.id === selectedNodeId);
    const stats = result.nodeStats[selectedNodeId];
    if (!node || !stats) { hideInspector(); return; }

    elements.inspectorTitle.textContent = node.label;
    elements.inspectorHelp.textContent = 'Change a value and the month will be simulated again.';
    elements.nodeForm.hidden = false;
    elements.nodeStats.hidden = false;
    elements.nodeLabel.value = node.label;
    elements.nodeTime.value = Math.round(node.processTime);
    elements.nodeTimeOutput.value = `${Math.round(node.processTime)} min`;
    elements.nodeCapacity.value = node.capacity;
    elements.nodeCapacityOutput.value = node.capacity;
    elements.nodeError.value = Math.round(node.errorRate * 100);
    elements.nodeErrorOutput.value = `${Math.round(node.errorRate * 100)}%`;
    elements.nodeStats.replaceChildren();
    [
      ['Utilization', formatPercent(stats.utilization)],
      ['Avg. wait', formatHours(stats.averageWaitMinutes / 60)],
      ['Peak queue', stats.peakQueue.toLocaleString()],
      ['Rework', stats.errors.toLocaleString()]
    ].forEach(([label, value]) => {
      const cell = document.createElement('div');
      const name = document.createElement('span'); name.textContent = label;
      const data = document.createElement('strong'); data.textContent = value;
      cell.append(name, data);
      elements.nodeStats.appendChild(cell);
    });
  }

  function updateMetricsTable() {
    elements.metricsBody.replaceChildren();
    model.nodes.forEach(node => {
      const stats = result.nodeStats[node.id];
      const row = document.createElement('tr');
      [
        node.label,
        formatPercent(stats.utilization),
        formatHours(stats.averageWaitMinutes / 60),
        stats.errors.toLocaleString(),
        stats.peakQueue.toLocaleString(),
        stats.backlog.toLocaleString()
      ].forEach(value => {
        const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
      });
      elements.metricsBody.appendChild(row);
    });
  }

  function runDiagnosis() {
    diagnosis = FrictionEngine.diagnose(result);
    elements.diagnosisTitle.textContent = `${diagnosis.bottleneck.label} is creating the most friction.`;
    elements.diagnosisReason.textContent = diagnosis.reason;
    elements.diagnosisRecommendation.textContent = diagnosis.recommendation;
    elements.optimize.disabled = false;
    renderWorkflow();
    elements.status.textContent = `Diagnosis complete. ${diagnosis.bottleneck.label} is the primary bottleneck.`;
  }

  function optimizeSystem() {
    if (!diagnosis) return;
    const baseline = result;
    const optimized = FrictionEngine.optimize(model, baseline);
    model = optimized.model;
    result = FrictionEngine.simulate(model);
    diagnosis = FrictionEngine.diagnose(result);
    updateSummary();
    renderWorkflow();
    updateMetricsTable();
    updateInspector();
    showComparison(baseline, result, optimized.changes);
    elements.optimize.disabled = true;
    elements.diagnosisTitle.textContent = 'The revised system has been simulated.';
    elements.diagnosisReason.textContent = result.backlog < baseline.backlog
      ? `The modeled month-end backlog fell from ${baseline.backlog.toLocaleString()} to ${result.backlog.toLocaleString()} items.`
      : 'The first change exposed another constraint. Complex systems often require more than one iteration.';
    elements.diagnosisRecommendation.textContent = 'Select any remaining problem node to test another change, or reset the scenario.';
    elements.status.textContent = 'Optimization comparison is now available below the workflow.';
    elements.comparison.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function showComparison(before, after, changes) {
    elements.comparison.hidden = false;
    elements.changeList.replaceChildren();
    changes.forEach(change => { const item = document.createElement('li'); item.textContent = change; elements.changeList.appendChild(item); });

    const rows = [
      ['Average completion', before.averageCycleHours, after.averageCycleHours, formatHours],
      ['Month-end backlog', before.backlog, after.backlog, value => Math.round(value).toLocaleString()],
      ['Manual processing', before.manualHours, after.manualHours, value => `${Math.round(value).toLocaleString()} h`],
      ['Modeled labor cost', before.laborCost, after.laborCost, value => currency.format(value)],
      ['Rework events', before.totalErrors, after.totalErrors, value => Math.round(value).toLocaleString()]
    ];

    elements.comparisonBody.replaceChildren();
    rows.forEach(([label, oldValue, newValue, formatter]) => {
      const row = document.createElement('tr');
      const improvement = oldValue ? (oldValue - newValue) / oldValue : 0;
      [label, formatter(oldValue), formatter(newValue), `${improvement >= 0 ? '↓' : '↑'} ${Math.abs(improvement * 100).toFixed(0)}%`].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        cell.textContent = value;
        if (index === 3 && improvement > 0) cell.classList.add('improved');
        row.appendChild(cell);
      });
      elements.comparisonBody.appendChild(row);
    });
  }

  function clearDiagnosisForEdit() {
    diagnosis = null;
    elements.optimize.disabled = true;
    elements.comparison.hidden = true;
    elements.diagnosisTitle.textContent = 'The model has changed.';
    elements.diagnosisReason.textContent = 'Run the diagnosis again to evaluate the revised assumptions.';
    elements.diagnosisRecommendation.textContent = '';
  }

  function scheduleEditedSimulation() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      clearDiagnosisForEdit();
      runSimulation(false);
    });
  }

  async function shareModel() {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('scenario', scenarioId);
    url.searchParams.set('volume', model.volumePerDay);
    try {
      await navigator.clipboard.writeText(url.toString());
      elements.shareStatus.textContent = 'Link copied.';
    } catch (error) {
      window.prompt('Copy this link:', url.toString());
      elements.shareStatus.textContent = 'Share link prepared.';
    }
  }

  function setup() {
    Object.entries(FrictionScenarios.all).forEach(([id, scenario]) => {
      const option = document.createElement('option'); option.value = id; option.textContent = scenario.name; elements.scenario.appendChild(option);
    });

    const query = new URLSearchParams(window.location.search);
    const initialScenario = query.get('scenario') || 'dispatch';
    const volume = Number(query.get('volume'));
    loadScenario(initialScenario, Number.isFinite(volume) && volume >= 5 && volume <= 90 ? volume : null);

    elements.scenario.addEventListener('change', () => loadScenario(elements.scenario.value));
    elements.volume.addEventListener('input', () => {
      model.volumePerDay = Number(elements.volume.value);
      elements.volumeOutput.value = model.volumePerDay;
      scheduleEditedSimulation();
    });
    elements.reset.addEventListener('click', () => loadScenario(scenarioId));
    elements.diagnose.addEventListener('click', runDiagnosis);
    elements.optimize.addEventListener('click', optimizeSystem);
    elements.share.addEventListener('click', shareModel);
    if (reducedMotion) {
      elements.motion.textContent = 'Motion reduced';
      elements.motion.disabled = true;
      elements.motion.setAttribute('aria-pressed', 'true');
    }
    elements.motion.addEventListener('click', () => {
      motionPaused = !motionPaused;
      elements.motion.setAttribute('aria-pressed', String(motionPaused));
      elements.motion.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
      renderWorkflow();
    });

    elements.nodeLabel.addEventListener('input', () => {
      const node = model.nodes.find(item => item.id === selectedNodeId);
      if (!node) return;
      node.label = elements.nodeLabel.value.trim() || 'Untitled step';
      elements.inspectorTitle.textContent = node.label;
      scheduleEditedSimulation();
    });
    elements.nodeTime.addEventListener('input', () => {
      const node = model.nodes.find(item => item.id === selectedNodeId); if (!node) return;
      node.processTime = Number(elements.nodeTime.value); elements.nodeTimeOutput.value = `${node.processTime} min`; scheduleEditedSimulation();
    });
    elements.nodeCapacity.addEventListener('input', () => {
      const node = model.nodes.find(item => item.id === selectedNodeId); if (!node) return;
      node.capacity = Number(elements.nodeCapacity.value); elements.nodeCapacityOutput.value = node.capacity; scheduleEditedSimulation();
    });
    elements.nodeError.addEventListener('input', () => {
      const node = model.nodes.find(item => item.id === selectedNodeId); if (!node) return;
      node.errorRate = Number(elements.nodeError.value) / 100; elements.nodeErrorOutput.value = `${elements.nodeError.value}%`; scheduleEditedSimulation();
    });
  }

  document.addEventListener('DOMContentLoaded', setup);
})();
