(function (global) {
  'use strict';

  const scenarios = {
    dispatch: {
      id: 'dispatch',
      name: 'Service dispatch',
      description: 'A local service company receives requests, schedules technicians, completes field work, and invoices customers.',
      volumePerDay: 44,
      days: 22,
      hoursPerDay: 8,
      nodes: [
        { id: 'request', label: 'New request', x: 90, y: 230, capacity: 1, processTime: 3, errorRate: 0.02, hourlyCost: 22, type: 'input' },
        { id: 'intake', label: 'Manual intake', x: 280, y: 130, capacity: 1, processTime: 14, errorRate: 0.10, hourlyCost: 24, type: 'manual' },
        { id: 'schedule', label: 'Scheduling', x: 480, y: 230, capacity: 1, processTime: 8, errorRate: 0.04, hourlyCost: 25, type: 'decision' },
        { id: 'field', label: 'Field work', x: 675, y: 130, capacity: 7, processTime: 70, errorRate: 0.03, hourlyCost: 38, type: 'work' },
        { id: 'invoice', label: 'Invoice', x: 875, y: 230, capacity: 1, processTime: 12, errorRate: 0.08, hourlyCost: 27, type: 'output' }
      ],
      edges: [
        { from: 'request', to: 'intake' },
        { from: 'intake', to: 'schedule' },
        { from: 'schedule', to: 'field' },
        { from: 'field', to: 'invoice' }
      ]
    },

    laboratory: {
      id: 'laboratory',
      name: 'Specimen intake',
      description: 'A teaching laboratory receives specimens, identifies them, records their properties, analyzes them, and publishes results.',
      volumePerDay: 52,
      days: 22,
      hoursPerDay: 8,
      nodes: [
        { id: 'receive', label: 'Receive', x: 90, y: 225, capacity: 1, processTime: 4, errorRate: 0.02, hourlyCost: 20, type: 'input' },
        { id: 'identify', label: 'Identify', x: 280, y: 125, capacity: 1, processTime: 8, errorRate: 0.05, hourlyCost: 24, type: 'manual' },
        { id: 'record', label: 'Record data', x: 475, y: 225, capacity: 1, processTime: 11, errorRate: 0.09, hourlyCost: 22, type: 'database' },
        { id: 'analyze', label: 'Analyze', x: 675, y: 125, capacity: 3, processTime: 20, errorRate: 0.04, hourlyCost: 30, type: 'work' },
        { id: 'report', label: 'Report', x: 875, y: 225, capacity: 1, processTime: 7, errorRate: 0.03, hourlyCost: 26, type: 'output' }
      ],
      edges: [
        { from: 'receive', to: 'identify' },
        { from: 'identify', to: 'record' },
        { from: 'record', to: 'analyze' },
        { from: 'analyze', to: 'report' }
      ]
    },

    escapeRoom: {
      id: 'escape-room',
      name: 'Escape-room operations',
      description: 'Groups move from booking through waivers and check-in, into their game, and finally through room reset.',
      volumePerDay: 18,
      days: 22,
      hoursPerDay: 8,
      nodes: [
        { id: 'booking', label: 'Booking', x: 90, y: 220, capacity: 1, processTime: 5, errorRate: 0.03, hourlyCost: 19, type: 'input' },
        { id: 'waiver', label: 'Waivers', x: 280, y: 120, capacity: 1, processTime: 7, errorRate: 0.12, hourlyCost: 19, type: 'manual' },
        { id: 'checkin', label: 'Check-in', x: 475, y: 220, capacity: 1, processTime: 10, errorRate: 0.04, hourlyCost: 20, type: 'decision' },
        { id: 'game', label: 'Live game', x: 675, y: 120, capacity: 3, processTime: 60, errorRate: 0.02, hourlyCost: 22, type: 'work' },
        { id: 'reset', label: 'Room reset', x: 875, y: 220, capacity: 2, processTime: 24, errorRate: 0.08, hourlyCost: 21, type: 'output' }
      ],
      edges: [
        { from: 'booking', to: 'waiver' },
        { from: 'waiver', to: 'checkin' },
        { from: 'checkin', to: 'game' },
        { from: 'game', to: 'reset' }
      ]
    },

    custom: {
      id: 'custom',
      name: 'Custom workflow',
      description: 'A neutral workflow you can rename and tune to resemble your own process.',
      volumePerDay: 32,
      days: 22,
      hoursPerDay: 8,
      nodes: [
        { id: 'start', label: 'Request', x: 110, y: 215, capacity: 1, processTime: 4, errorRate: 0.02, hourlyCost: 22, type: 'input' },
        { id: 'review', label: 'Review', x: 350, y: 120, capacity: 1, processTime: 12, errorRate: 0.07, hourlyCost: 26, type: 'manual' },
        { id: 'work', label: 'Do the work', x: 630, y: 120, capacity: 2, processTime: 25, errorRate: 0.05, hourlyCost: 32, type: 'work' },
        { id: 'finish', label: 'Deliver', x: 875, y: 215, capacity: 1, processTime: 8, errorRate: 0.03, hourlyCost: 25, type: 'output' }
      ],
      edges: [
        { from: 'start', to: 'review' },
        { from: 'review', to: 'work' },
        { from: 'work', to: 'finish' }
      ]
    }
  };

  function cloneScenario(id) {
    const selected = scenarios[id] || scenarios.dispatch;
    return JSON.parse(JSON.stringify(selected));
  }

  global.FrictionScenarios = { all: scenarios, clone: cloneScenario };
})(window);
