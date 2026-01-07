import React, { useRef, useState, useEffect } from 'react';
import '../styles/CameraComponent.css';

const CameraComponent = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Unable to access camera. Please deny permissions or use a device with a camera.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/jpeg');
            onCapture(imageDataUrl);
        }
    };

    return (
        <div className="camera-container">
            {error ? (
                <div className="camera-error">{error}</div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-preview"
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <button onClick={captureImage} className="capture-btn" aria-label="Capture Photo">
                        <div className="capture-btn-inner"></div>
                    </button>
                </>
            )}
        </div>
    );
};

export default CameraComponent;
