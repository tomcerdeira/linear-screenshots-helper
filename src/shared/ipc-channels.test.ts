import { describe, it, expect } from 'vitest';
import { IPC } from './ipc-channels';

describe('IPC channels', () => {
  it('has unique channel names (no duplicates)', () => {
    const values = Object.values(IPC);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('all channels follow namespace:action format', () => {
    for (const channel of Object.values(IPC)) {
      expect(channel).toMatch(/^[a-z]+:[a-zA-Z]+$/);
    }
  });

  it('exports all expected channels', () => {
    expect(IPC.GET_SCREENSHOT).toBeDefined();
    expect(IPC.GET_TEAMS).toBeDefined();
    expect(IPC.GET_PROJECTS).toBeDefined();
    expect(IPC.GET_WORKFLOW_STATES).toBeDefined();
    expect(IPC.GET_LABELS).toBeDefined();
    expect(IPC.GET_MEMBERS).toBeDefined();
    expect(IPC.SEARCH_ISSUES).toBeDefined();
    expect(IPC.GET_RECENT_ISSUES).toBeDefined();
    expect(IPC.CREATE_ISSUE).toBeDefined();
    expect(IPC.ADD_COMMENT).toBeDefined();
    expect(IPC.CLOSE_WINDOW).toBeDefined();
    expect(IPC.SHOW_TOAST).toBeDefined();
    expect(IPC.CREATE_ISSUE_BG).toBeDefined();
    expect(IPC.ADD_COMMENT_BG).toBeDefined();
    expect(IPC.GET_UPDATE_STATE).toBeDefined();
    expect(IPC.START_UPDATE_INSTALL).toBeDefined();
    expect(IPC.GET_AUTO_CHECK_FOR_UPDATES).toBeDefined();
    expect(IPC.SET_AUTO_CHECK_FOR_UPDATES).toBeDefined();
  });
});
