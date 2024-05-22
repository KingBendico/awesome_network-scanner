# Awesome Network-Scanner

Network Scanner is a desktop application built using Electron that allows users to scan their local network for connected devices. It provides information about each device, including its IP address, MAC address and manufacturer.

## Features

- Detects and displays the subnet of the local network.
- Scans the network to find connected devices.
- Displays the IP address, MAC address and manufacturer of each detected device.
- Allows users to stop the scan at any time.
- Displays scan progress with a progress bar.
- Search functionality to filter results by IP or manufacturer.
- Super fast, leveraging parallel computation.

## Installation

To get started with Network Scanner, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/network-scanner.git
    cd network-scanner
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the application**:
    ```bash
    npm start
    ```

## Files

- `index.html`: The main HTML file that defines the structure of the UI.
- `style.css`: The CSS file that styles the UI.
- `renderer.js`: The JavaScript file that handles the UI interactions and updates.
- `preload.js`: The JavaScript file that bridges the communication between the Electron main process and renderer process.
- `main.js`: The main Electron process file that sets up the application window and handles the network scanning logic.
- `oui.txt`: A text file containing MAC address prefixes and their corresponding manufacturers.

## Usage

1. **Start the Application**:
   Launch the application using `npm start`.

2. **Scan the Network**:
   Click the "Scan Network" button to start scanning the local subnet for connected devices.

3. **Stop the Scan**:
   Click the "Stop Scan" button to halt the scanning process at any time.

4. **Search Results**:
   Use the search input to filter the displayed devices by IP address or manufacturer.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Setting Up Development Environment

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/network-scanner.git
    cd network-scanner
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the application in development mode**:
    ```bash
    npm start
    ```

### Building for Production

To package the application for distribution:

1. **Install Electron Packager**:
    ```bash
    npm install -g electron-packager
    ```

2. **Package the application**:
    ```bash
    electron-packager . NetworkScanner --platform=win32 --arch=x64 --out=dist/
    ```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps with JavaScript, HTML, and CSS.
- [ping](https://www.npmjs.com/package/ping) - A simple wrapper for the system ping utility.
- [node-arp](https://www.npmjs.com/package/node-arp) - A package to get MAC addresses from IP addresses using ARP.

---


