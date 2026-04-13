import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';

contextBridge.exposeInMainWorld('api', {
  getScreenshot: () => ipcRenderer.invoke(IPC.GET_SCREENSHOT),
  getTeams: () => ipcRenderer.invoke(IPC.GET_TEAMS),
  getProjects: () => ipcRenderer.invoke(IPC.GET_PROJECTS),
  searchIssues: (query: string) => ipcRenderer.invoke(IPC.SEARCH_ISSUES, query),
  getRecentIssues: () => ipcRenderer.invoke(IPC.GET_RECENT_ISSUES),
  createIssue: (input: unknown) => ipcRenderer.invoke(IPC.CREATE_ISSUE, input),
  addComment: (input: unknown) => ipcRenderer.invoke(IPC.ADD_COMMENT, input),
  getApiKey: () => ipcRenderer.invoke(IPC.GET_API_KEY),
  setApiKey: (key: string) => ipcRenderer.invoke(IPC.SET_API_KEY, key),
  getEnabled: () => ipcRenderer.invoke(IPC.GET_ENABLED),
  setEnabled: (enabled: boolean) => ipcRenderer.invoke(IPC.SET_ENABLED, enabled),
  openSettings: () => ipcRenderer.invoke(IPC.OPEN_SETTINGS),
  closeWindow: () => ipcRenderer.invoke(IPC.CLOSE_WINDOW),
  getRecentSelections: () => ipcRenderer.invoke(IPC.GET_RECENT_SELECTIONS),
  saveLastTeam: (teamId: string) => ipcRenderer.invoke(IPC.SAVE_LAST_TEAM, teamId),
  saveLastProject: (projectId: string) => ipcRenderer.invoke(IPC.SAVE_LAST_PROJECT, projectId),
  saveRecentTicket: (ticket: unknown) => ipcRenderer.invoke(IPC.SAVE_RECENT_TICKET, ticket),
});
