import { describe, it, expect } from 'vitest';
import { sortWorkflowStates, STATE_TYPE_ORDER, toIssueResult } from './linear-issues';

describe('sortWorkflowStates', () => {
  it('sorts states in Linear order: backlog → unstarted → started → completed → cancelled', () => {
    const states = [
      { type: 'completed', name: 'Done', id: '3', color: '#green' },
      { type: 'backlog', name: 'Backlog', id: '1', color: '#gray' },
      { type: 'cancelled', name: 'Cancelled', id: '5', color: '#red' },
      { type: 'started', name: 'In Progress', id: '2', color: '#yellow' },
      { type: 'unstarted', name: 'Todo', id: '4', color: '#blue' },
    ];

    const sorted = sortWorkflowStates(states);

    expect(sorted.map((s) => s.type)).toEqual([
      'backlog',
      'unstarted',
      'started',
      'completed',
      'cancelled',
    ]);
  });

  it('preserves relative order of same-type states', () => {
    const states = [
      { type: 'started', name: 'In Progress', id: '1', color: '#y' },
      { type: 'started', name: 'In Review', id: '2', color: '#g' },
      { type: 'backlog', name: 'Backlog', id: '3', color: '#x' },
    ];

    const sorted = sortWorkflowStates(states);

    expect(sorted.map((s) => s.name)).toEqual([
      'Backlog',
      'In Progress',
      'In Review',
    ]);
  });

  it('puts unknown types at the end', () => {
    const states = [
      { type: 'custom_type', name: 'Custom', id: '1', color: '#c' },
      { type: 'backlog', name: 'Backlog', id: '2', color: '#b' },
    ];

    const sorted = sortWorkflowStates(states);

    expect(sorted.map((s) => s.name)).toEqual(['Backlog', 'Custom']);
  });

  it('does not mutate the original array', () => {
    const states = [
      { type: 'completed', name: 'Done', id: '1', color: '#g' },
      { type: 'backlog', name: 'Backlog', id: '2', color: '#x' },
    ];
    const original = [...states];

    sortWorkflowStates(states);

    expect(states).toEqual(original);
  });

  it('handles empty array', () => {
    expect(sortWorkflowStates([])).toEqual([]);
  });
});

describe('STATE_TYPE_ORDER', () => {
  it('has all five Linear workflow types', () => {
    expect(Object.keys(STATE_TYPE_ORDER)).toEqual([
      'backlog', 'unstarted', 'started', 'completed', 'cancelled',
    ]);
  });

  it('backlog is first (lowest value)', () => {
    const min = Math.min(...Object.values(STATE_TYPE_ORDER));
    expect(STATE_TYPE_ORDER.backlog).toBe(min);
  });

  it('cancelled is last (highest value)', () => {
    const max = Math.max(...Object.values(STATE_TYPE_ORDER));
    expect(STATE_TYPE_ORDER.cancelled).toBe(max);
  });
});

describe('toIssueResult', () => {
  it('maps node to LinearIssueResult', () => {
    const node = {
      id: 'abc-123',
      identifier: 'NET-42',
      title: 'Fix bug',
      url: 'https://linear.app/team/NET-42',
    };

    expect(toIssueResult(node)).toEqual({
      id: 'abc-123',
      identifier: 'NET-42',
      title: 'Fix bug',
      url: 'https://linear.app/team/NET-42',
    });
  });

  it('does not include extra properties from source', () => {
    const node = {
      id: '1',
      identifier: 'X-1',
      title: 'Test',
      url: 'https://example.com',
      extraField: 'should be dropped',
    };

    const result = toIssueResult(node);
    expect(Object.keys(result)).toEqual(['id', 'identifier', 'title', 'url']);
  });
});
