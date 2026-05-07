import { ipcRenderer, contextBridge } from 'electron'
import path from 'path'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Expose the PDF worker path so the renderer can build an absolute file:// URL.
// Chromium's Web Worker loader bypasses Electron's asar virtual filesystem,
// so a relative './pdf.worker.min.mjs' fails in packaged builds.
// In production the file is at: <resourcesPath>/app.asar.unpacked/dist/pdf.worker.min.mjs
// In dev it lives in the public/ folder served by Vite (no file path needed).
contextBridge.exposeInMainWorld('electronEnv', {
  resourcesPath: process.resourcesPath,
  isPackaged: process.env.NODE_ENV === 'production',
})
