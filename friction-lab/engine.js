(function (global) {
  'use strict';

  class SeededRandom {
    constructor(seed) { this.seed = seed >>> 0 || 1; }
    next() {
      this.seed += 0x6D2B79F5;
      let value = this.seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    }
  }

  class MinHeap {
    constructor() { this.items = []; }
    push(item) {
      this.items.push(item);
      let index = this.items.length - 1;
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (this.items[parent].time <= item.time) break;
        this.items[index] = this.items[parent];
        index = parent;
      }
      this.items[index] = item;
    }
    pop() {
      if (!this.items.length) return null;
      const first = this.items[0];
      const last = this.items.pop();
      if (this.items.length) {
        let index = 0;
        while (true) {
          let child = index * 2 + 1;
          if (child >= this.items.length) break;
          if (child + 1 < this.items.length && this.items[child + 1].time < this.items[child].time) child += 1;
          if (this.items[child].time >= last.time) break;
          this.items[index] = this.items[child];
          index = child;
        }
        this.items[index] = last;
      }
      return first;
    }
    get length() { return this.items.length; }
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function round(value, places = 1) {
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
  }

  function simulate(sourceModel, options = {}) {
    const model = clone(sourceModel);
    const days = options.days || model.days || 22;
    const hoursPerDay = options.hoursPerDay || model.hoursPerDay || 8;
    const horizon = days * hoursPerDay * 60;
    const random = new SeededRandom(options.seed || 1847);
    const events = new MinHeap();
    const nodeById = Object.fromEntries(model.nodes.map(node => [node.id, node]));
    const nextById = Object.fromEntries(model.edges.map(edge => [edge.from, edge.to]));
    const firstNode = model.nodes[0].id;

    const state = {};
    const stats = {};
    model.nodes.forEach(node => {
      state[node.id] = { queue: [], active: 0 };
      stats[node.id] = {
        id: node.id,
        label: node.label,
        processed: 0,
        errors: 0,
        waitMinutes: 0,
        busyMinutes: 0,
        peakQueue: 0,
        backlog: 0,
        utilization: 0,
        averageWaitMinutes: 0,
        errorRate: 0,
        laborCost: 0
      };
    });

    let created = 0;
    for (let day = 0; day < days; day += 1) {
      for (let index = 0; index < model.volumePerDay; index += 1) {
        const withinDay = random.next() * hoursPerDay * 60;
        events.push({
          time: day * hoursPerDay * 60 + withinDay,
          type: 'arrive',
          nodeId: firstNode,
          job: { id: ++created, createdAt: day * hoursPerDay * 60 + withinDay, reworks: {} }
        });
      }
    }

    let completed = 0;
    let completedWithinHorizon = 0;
    let totalCycleMinutes = 0;
    let lastCompletionTime = 0;
    let horizonSnapshot = null;

    function beginAvailableWork(nodeId, now) {
      const node = nodeById[nodeId];
      const nodeState = state[nodeId];
      while (nodeState.active < node.capacity && nodeState.queue.length) {
        const queued = nodeState.queue.shift();
        const durationVariance = 0.82 + random.next() * 0.36;
        const duration = Math.max(1, node.processTime * durationVariance);
        nodeState.active += 1;
        stats[nodeId].processed += 1;
        stats[nodeId].waitMinutes += Math.max(0, now - queued.queuedAt);
        stats[nodeId].busyMinutes += duration;
        events.push({ time: now + duration, type: 'complete', nodeId, job: queued.job });
      }
    }

    while (events.length) {
      const event = events.pop();
      if (!event) break;
      if (!horizonSnapshot && event.time > horizon) {
        horizonSnapshot = Object.fromEntries(model.nodes.map(node => [
          node.id,
          state[node.id].queue.length + state[node.id].active
        ]));
      }
      const node = nodeById[event.nodeId];
      const nodeState = state[event.nodeId];

      if (event.type === 'arrive') {
        nodeState.queue.push({ job: event.job, queuedAt: event.time });
        stats[event.nodeId].peakQueue = Math.max(stats[event.nodeId].peakQueue, nodeState.queue.length);
        beginAvailableWork(event.nodeId, event.time);
        continue;
      }

      nodeState.active = Math.max(0, nodeState.active - 1);
      const reworkCount = event.job.reworks[event.nodeId] || 0;
      const failed = random.next() < node.errorRate && reworkCount < 2;

      if (failed) {
        stats[event.nodeId].errors += 1;
        event.job.reworks[event.nodeId] = reworkCount + 1;
        events.push({ time: event.time + 2, type: 'arrive', nodeId: event.nodeId, job: event.job });
      } else {
        const nextId = nextById[event.nodeId];
        if (nextId) {
          events.push({ time: event.time, type: 'arrive', nodeId: nextId, job: event.job });
        } else {
          completed += 1;
          if (event.time <= horizon) completedWithinHorizon += 1;
          totalCycleMinutes += event.time - event.job.createdAt;
          lastCompletionTime = Math.max(lastCompletionTime, event.time);
        }
      }
      beginAvailableWork(event.nodeId, event.time);
    }

    if (!horizonSnapshot) {
      horizonSnapshot = Object.fromEntries(model.nodes.map(node => [node.id, 0]));
    }

    let laborCost = 0;
    let manualHours = 0;
    let totalErrors = 0;
    let totalProcessed = 0;
    let totalWaitMinutes = 0;
    let backlog = 0;

    model.nodes.forEach(node => {
      const nodeStats = stats[node.id];
      nodeStats.backlog = horizonSnapshot[node.id] || 0;
      nodeStats.utilization = Math.min(1, nodeStats.busyMinutes / (node.capacity * horizon));
      nodeStats.averageWaitMinutes = nodeStats.processed ? nodeStats.waitMinutes / nodeStats.processed : 0;
      nodeStats.errorRate = nodeStats.processed ? nodeStats.errors / nodeStats.processed : 0;
      nodeStats.laborCost = nodeStats.busyMinutes / 60 * node.hourlyCost;
      laborCost += nodeStats.laborCost;
      manualHours += nodeStats.busyMinutes / 60;
      totalErrors += nodeStats.errors;
      totalProcessed += nodeStats.processed;
      totalWaitMinutes += nodeStats.waitMinutes;
      backlog += nodeStats.backlog;
    });

    return {
      model,
      created,
      completed,
      completedWithinHorizon,
      backlog,
      completionRate: created ? completedWithinHorizon / created : 0,
      throughputPerDay: created / Math.max(days, lastCompletionTime / (hoursPerDay * 60)),
      averageCycleHours: completed ? totalCycleMinutes / completed / 60 : 0,
      averageWaitHours: totalProcessed ? totalWaitMinutes / totalProcessed / 60 : 0,
      manualHours,
      laborCost,
      totalErrors,
      errorRate: totalProcessed ? totalErrors / totalProcessed : 0,
      nodeStats: stats,
      days,
      hoursPerDay
    };
  }

  function diagnose(result) {
    const rows = Object.values(result.nodeStats);
    const maxWait = Math.max(1, ...rows.map(row => row.averageWaitMinutes));
    const maxBacklog = Math.max(1, ...rows.map(row => row.backlog));
    const ranked = rows.map(row => ({
      ...row,
      score: row.utilization * 45 + row.averageWaitMinutes / maxWait * 25 + row.backlog / maxBacklog * 20 + row.errorRate * 100 * 0.10
    })).sort((a, b) => b.score - a.score);

    const bottleneck = ranked[0];
    let reason;
    let recommendation;

    if (bottleneck.errorRate >= 0.07) {
      reason = `${bottleneck.label} is generating repeated work. About ${Math.round(bottleneck.errorRate * 100)}% of processed items require another pass.`;
      recommendation = 'Add validation at the point of entry, remove duplicate data entry, and automate the most repeatable checks.';
    } else if (bottleneck.utilization >= 0.88) {
      reason = `${bottleneck.label} is operating near its practical capacity, so even small spikes create a growing queue.`;
      recommendation = 'Reduce processing time through automation or add parallel capacity during peak demand.';
    } else {
      reason = `${bottleneck.label} contributes the most waiting time and accumulated work in this model.`;
      recommendation = 'Simplify the handoff, standardize its inputs, and remove work that does not change the outcome.';
    }

    return { bottleneck, ranked, reason, recommendation };
  }

  function optimize(sourceModel, baselineResult) {
    const model = clone(sourceModel);
    const diagnosis = diagnose(baselineResult);
    const target = model.nodes.find(node => node.id === diagnosis.bottleneck.id);
    const changes = [];

    if (target.errorRate >= 0.07) {
      const before = Math.round(target.errorRate * 100);
      target.errorRate = Math.max(0.01, target.errorRate * 0.32);
      target.processTime *= 0.88;
      target.type = 'automated';
      changes.push(`Added entry validation to ${target.label}, reducing modeled errors from ${before}% to ${Math.round(target.errorRate * 100)}%.`);
    }

    if (diagnosis.bottleneck.utilization >= 0.84) {
      if (target.processTime >= 10) {
        const oldTime = target.processTime;
        target.processTime *= 0.62;
        target.type = 'automated';
        changes.push(`Automated repetitive work in ${target.label}, reducing modeled handling time from ${round(oldTime)} to ${round(target.processTime)} minutes.`);
      } else {
        target.capacity += 1;
        changes.push(`Added one parallel processing slot to ${target.label}.`);
      }
    }

    if (!changes.length) {
      const oldTime = target.processTime;
      target.processTime *= 0.72;
      target.type = 'automated';
      changes.push(`Streamlined ${target.label}, reducing modeled handling time from ${round(oldTime)} to ${round(target.processTime)} minutes.`);
    }

    const secondary = model.nodes
      .filter(node => node.id !== target.id && node.errorRate >= 0.08)
      .sort((a, b) => b.errorRate - a.errorRate)[0];
    if (secondary) {
      secondary.errorRate *= 0.55;
      changes.push(`Added lightweight validation to ${secondary.label}.`);
    }

    return { model, changes, diagnosis };
  }

  global.FrictionEngine = { simulate, diagnose, optimize, clone };
})(window);
