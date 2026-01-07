import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraComponent from '../components/CameraComponent';
import { generateBoxCode } from '../utils/codeGenerator';
import { saveBox, checkCodeExists } from '../utils/storage';
import { generateEmbedding } from '../utils/embedding';
import { analyzeImage } from '../utils/aiService';
import '../styles/CreateBox.css';

const STEPS = {
    CAMERA: 'camera',
    PREVIEW: 'preview',
    SUCCESS: 'success'
};

const CreateBox = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.CAMERA);
    const [image, setImage] = useState(null);
    const [boxCode, setBoxCode] = useState('');
    const [itemsText, setItemsText] = useState('');
    const [location, setLocation] = useState('Home');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const initCode = async () => {
            let code = generateBoxCode();
            let exists = await checkCodeExists(code);
            while (exists) {
                code = generateBoxCode();
                exists = await checkCodeExists(code);
            }
            setBoxCode(code);
        };
        initCode();

        // Load locations
        const locs = JSON.parse(localStorage.getItem('box_locations') || '["Home", "Office", "Storage"]');
        setAvailableLocations(locs);
        if (locs.length > 0) setLocation(locs[0]);
    }, []);

    const handleCapture = (imageData) => {
        setImage(imageData);
        setStep(STEPS.PREVIEW);
    };

    const handleRetake = () => {
        setImage(null);
        setStep(STEPS.CAMERA);
    };

    const handleAutoTag = async () => {
        setIsAnalyzing(true);
        try {
            // Assume image is data URL
            const tags = await analyzeImage(image);
            if (tags && tags.length > 0) {
                const current = itemsText ? itemsText + ', ' : '';
                setItemsText(current + tags.join(', '));
            } else {
                alert("No items detected or AI provider error.");
            }
        } catch (error) {
            console.error("Auto-tag error:", error);
            alert(error.message || "Failed to analyze image.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Split text into array of items
            const items = itemsText.split(',').map(item => item.trim()).filter(Boolean);

            // Generate embedding if items exist
            let embedding = null;
            if (itemsText.trim()) {
                try {
                    embedding = await generateEmbedding(itemsText);
                } catch (e) {
                    console.error("Embedding generation failed:", e);
                    // Proceed without embedding? Or alert user?
                    // Proceeding to avoid blocking simple usage.
                }
            }

            const newBox = {
                id: crypto.randomUUID(),
                code: boxCode,
                image: image,
                timestamp: Date.now(),
                tags: [], // Future AI tags
                items: items, // Manual items
                location: location, // Added location
                embedding: embedding // Vector for search
            };
            await saveBox(newBox);
            setStep(STEPS.SUCCESS);
            // Wait a moment then go home or to box details
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error("Failed to save box:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="create-box-page">
            {step === STEPS.CAMERA && (
                <>
                    <h2>Snap Content</h2>
                    <CameraComponent onCapture={handleCapture} />
                    <p className="instruction">Point at the box contents</p>
                </>
            )}

            {step === STEPS.PREVIEW && (
                <div className="preview-container">
                    <h2>Review Box {boxCode}</h2>
                    <img src={image} alt="Captured box" className="preview-image" />

                    <div className="input-group">
                        <label>Location</label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="location-select"
                        >
                            {availableLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label htmlFor="items-input">What's inside? (comma separated)</label>
                            <button
                                className="auto-tag-btn"
                                onClick={handleAutoTag}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? '✨ Analyzing...' : '✨ Auto-Tag with AI'}
                            </button>
                        </div>
                        <textarea
                            id="items-input"
                            className="items-input"
                            placeholder="e.g. Winter coats, boots, scarf"
                            value={itemsText}
                            onChange={(e) => setItemsText(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons-row">
                        <button onClick={handleRetake} className="btn-secondary" disabled={isSaving || isAnalyzing}>Retake</button>
                        <button onClick={handleSave} className="btn-primary" disabled={isSaving || isAnalyzing}>
                            {isSaving ? 'Saving...' : 'Save Box'}
                        </button>
                    </div>
                </div>
            )}

            {step === STEPS.SUCCESS && (
                <div className="success-container">
                    <div className="success-icon">✓</div>
                    <h2>Box Saved!</h2>
                    <p className="box-code-display">{boxCode}</p>
                </div>
            )}
        </div>
    );
};

export default CreateBox;
