const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getSubnet: async () => {
        try {
            const subnet = await ipcRenderer.invoke('get-subnet');
            return subnet;
        } catch (error) {
            console.error('Error in getSubnet:', error);
        }
    },
    scanNetwork: async () => {
        try {
            await ipcRenderer.invoke('scan-network');
        } catch (error) {
            console.error('Error in scanNetwork:', error);
        }
    },
    stopScan: () => {
        ipcRenderer.send('stop-scan');
    },
    resizeWindow: (height) => {
        ipcRenderer.send('resize-window', height);
    },
    onDeviceFound: (callback) => {
        ipcRenderer.on('device-found', (event, device) => {
            callback(device);
        });
    },
    onScanFinished: (callback) => {
        ipcRenderer.on('scan-finished', () => {
            callback();
        });
    },
    onProgressUpdate: (callback) => {
        ipcRenderer.on('progress-update', (event, progress) => {
            callback(progress);
        });
    }
});
