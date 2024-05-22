const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const ping = require('ping');
const arp = require('node-arp');
const fs = require('fs');

let stopScanFlag = false;
let mainWindow;

// Load and parse OUI text file
const ouiFilePath = path.join(__dirname, 'oui.txt');

if (!fs.existsSync(ouiFilePath)) {
    console.error('oui.txt file not found');
    process.exit(1);
}

const ouiFileContent = fs.readFileSync(ouiFilePath, 'utf8');
const macVendors = {};

const lines = ouiFileContent.split('\n');
lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
        return;
    }
    const match = trimmedLine.match(/^([0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2})\s+\(hex\)\s+(.+)$/i);
    const base16Match = trimmedLine.match(/^([0-9A-F]{6})\s+\(base 16\)\s+(.+)$/i);
    if (match) {
        const macPrefixHyphen = match[1];
        const macPrefixColon = macPrefixHyphen.replace(/-/g, ':');
        const vendorName = match[2].trim();
        macVendors[macPrefixHyphen] = vendorName;
        macVendors[macPrefixColon] = vendorName;
    } else if (base16Match) {
        const macPrefixBase16 = base16Match[1].match(/.{1,2}/g).join(':');
        const macPrefixHyphen = macPrefixBase16.replace(/:/g, '-');
        const vendorName = base16Match[2].trim();
        macVendors[macPrefixBase16] = vendorName;
        macVendors[macPrefixHyphen] = vendorName;
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 550,


        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null);
    mainWindow.resizable=false;
   // mainWindow.setIcon('assets/elephant_network_icon.ico')
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('get-subnet', async () => {
    try {
        const subnet = getLocalSubnet();
        return subnet;
    } catch (error) {
        console.error('Error getting subnet:', error);
        return { error: error.message };
    }
});

ipcMain.handle('scan-network', async (event) => {
    stopScanFlag = false;  // Reset stop flag at the start of the scan
    try {
        const subnet = getLocalSubnet();
        await pingHosts(subnet, event.sender);
        return { success: true };
    } catch (error) {
        console.error('Error scanning network:', error);
        return { error: error.message };
    }
});

ipcMain.on('stop-scan', () => {
    stopScanFlag = true;  // Set stop flag to true when stop scan is requested
});

ipcMain.on('resize-window', (event, height) => {
    if (mainWindow) {
        const currentWidth = mainWindow.getSize()[0];
        mainWindow.setSize(currentWidth, height + 20); // Add some padding
    }

});

function getLocalSubnet() {
    const interfaces = os.networkInterfaces();
    for (let name of Object.keys(interfaces)) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                const subnet = iface.address.split('.').slice(0, 3).join('.');
                return subnet;
            }
        }
    }
    throw new Error('No valid network interface found');
}

async function pingHosts(subnet, sender) {
    const promises = [];
    for (let i = 1; i <= 255; i++) {
        if (stopScanFlag) {
            console.log('Scan stopped');
            break;
        }
        const host = `${subnet}.${i}`;
        promises.push(pingHost(host, sender, i));
    }
    await Promise.all(promises);
    sender.send('scan-finished');  // Notify the renderer process that the scan is finished
}

async function pingHost(host, sender, current) {
    try {
        const res = await ping.promise.probe(host, { timeout: 1 });
        if (res.alive) {
            const device = await resolveDeviceName(host);
            sender.send('device-found', device);
        }
    } catch (error) {
        console.error(`Error pinging ${host}:`, error);
    }
    sender.send('progress-update', { current, total: 255 });  // Send progress update
}

function resolveDeviceName(ip) {
    return new Promise((resolve) => {
        arp.getMAC(ip, (err, mac) => {
            if (err) {
                resolve({ ip, name: 'Unknown' });
            } else {
                const vendor = getVendorFromMAC(mac);
                resolve({ ip, name: `${mac} (${vendor})` });
            }
        });
    });
}

function getVendorFromMAC(mac) {
    const macPrefix = mac.toUpperCase().slice(0, 8).replace(/:/g, '-');
    const vendor = macVendors[macPrefix] || 'Unknown Vendor';
    return vendor;
}
