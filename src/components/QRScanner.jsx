import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/QRScanner.css';

const QRScanner = ({ onScan, onError }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Unique ID for the scanner element
        const scannerId = "reader";

        // Config
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const scanner = new Html5QrcodeScanner(scannerId, config, /* verbose= */ false);

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                // Optionally clear after scan if we want one-time scan
                scanner.clear();
            },
            (errorMessage) => {
                // parse error, ignore it.
                if (onError) onError(errorMessage);
            }
        );

        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScan, onError]);

    return (
        <div className="qr-scanner-container">
            <div id="reader"></div>
        </div>
    );
};

export default QRScanner;
