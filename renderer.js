let isScanning = false;
let foundDevices = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const subnet = await window.electron.getSubnet();
        document.getElementById('subnet-address').textContent = subnet;
    } catch (error) {
        console.error('Error getting subnet:', error);
    }
    resizeWindowToFitContent();
});

document.getElementById('scan-button').addEventListener('click', async () => {
    startScan();
});

document.getElementById('stop-button').addEventListener('click', () => {
    isScanning = false;
    window.electron.stopScan();
    displayScanMessage('Scan stopped', 'error');
    resetUI();
    resizeWindowToFitContent();
});

window.electron.onDeviceFound((device) => {
    if (!isScanning) return;
    foundDevices.push(device);
    updateResults();
    resizeWindowToFitContent();
});

window.electron.onScanFinished(() => {
    if (!isScanning) return;
    foundDevices.sort((a, b) => {
        const ipA = a.ip.split('.').map(Number);
        const ipB = b.ip.split('.').map(Number);
        for (let i = 0; i < ipA.length; i++) {
            if (ipA[i] < ipB[i]) return -1;
            if (ipA[i] > ipB[i]) return 1;
        }
        return 0;
    });
    updateResults();
    displayScanMessage('Scan finished', 'success');
    isScanning = false;
    resetUI();
    resizeWindowToFitContent();
});

window.electron.onProgressUpdate((progress) => {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const newWidth = (progress.current / progress.total) * 100;
    progressBar.style.width = `${newWidth}%`;
    progressText.textContent = `${Math.round(newWidth)}%`;
});

document.getElementById('search-input').addEventListener('input', () => {
    updateResults();
    resizeWindowToFitContent();
});

function startScan() {
    const resultsElement = document.getElementById('results');
    const scanButton = document.getElementById('scan-button');
    const stopButton = document.getElementById('stop-button');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    resultsElement.innerHTML = 'Scanning...';
    clearScanMessage();
    scanButton.style.display = 'none';
    stopButton.style.display = 'block';
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    isScanning = true;
    foundDevices = [];

    window.electron.scanNetwork().catch(error => {
        console.error('Error scanning network:', error);
        resultsElement.innerHTML = `Error: ${error.message}`;
        resetUI();
        isScanning = false;
    });
    resizeWindowToFitContent();
}

function resetUI() {
    const scanButton = document.getElementById('scan-button');
    const stopButton = document.getElementById('stop-button');
    const progressBarContainer = document.getElementById('progress-bar-container');
    scanButton.style.display = 'block';
    stopButton.style.display = 'none';
    progressBarContainer.style.display = 'none';
}

function updateResults() {
    const resultsElement = document.getElementById('results');
    const query = document.getElementById('search-input').value.toLowerCase();
    resultsElement.innerHTML = '';
    foundDevices.forEach(device => {
        if (device.ip.toLowerCase().includes(query) || device.name.toLowerCase().includes(query)) {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device';
            deviceElement.textContent = `IP: ${device.ip}, Name: ${device.name}`;
            resultsElement.appendChild(deviceElement);
        }
    });
}

function displayScanMessage(message, type) {
    const scanMessageElement = document.getElementById('scan-message');
    scanMessageElement.textContent = message;
    scanMessageElement.className = `scan-message ${type}`;
}

function clearScanMessage() {
    const scanMessageElement = document.getElementById('scan-message');
    scanMessageElement.textContent = '';
    scanMessageElement.className = 'scan-message';
}

function resizeWindowToFitContent() {
    const contentHeight = document.body.scrollHeight;
    window.electron.resizeWindow(contentHeight);
}

