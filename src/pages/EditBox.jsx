import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBoxById, updateBox, deleteBox } from '../utils/storage';
import { generateEmbedding } from '../utils/embedding';
import { analyzeImage } from '../utils/aiService';
import CameraComponent from '../components/CameraComponent';
import '../styles/CreateBox.css'; // Reusing create styles

const STEPS = {
    PREVIEW: 'preview',
    CAMERA: 'camera',
};

const EditBox = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.PREVIEW);
    const [loading, setLoading] = useState(true);

    const [box, setBox] = useState(null);
    const [itemsText, setItemsText] = useState('');
    const [location, setLocation] = useState('Home');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const fetchBox = async () => {
            try {
                const found = await getBoxById(id);
                if (found) {
                    setBox(found);
                    setItemsText(found.items ? found.items.join(', ') : '');
                    setLocation(found.location || 'Home');
                } else {
                    alert("Box not found");
                    navigate('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Load locations
        const locs = JSON.parse(localStorage.getItem('box_locations') || '["Home", "Office", "Storage"]');
        setAvailableLocations(locs);

        fetchBox();
    }, [id, navigate]);

    const handleCapture = (imageData) => {
        setBox(prev => ({ ...prev, image: imageData }));
        setStep(STEPS.PREVIEW);
    };

    const handleRetake = () => {
        setStep(STEPS.CAMERA);
    };

    const handleAutoTag = async () => {
        setIsAnalyzing(true);
        try {
            const tags = await analyzeImage(box.image);
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
            const items = itemsText.split(',').map(item => item.trim()).filter(Boolean);

            let embedding = box.embedding;
            const originalItemsStr = box.items ? box.items.join(', ') : '';

            // Regenerate embedding if items changed or if it was missing
            if (itemsText !== originalItemsStr || !embedding) {
                if (itemsText.trim()) {
                    try {
                        embedding = await generateEmbedding(itemsText);
                    } catch (e) {
                        console.error("Embedding generation failed:", e);
                    }
                }
            }

            const updatedBox = {
                ...box,
                items,
                location,
                embedding,
                // Keep original code, id, timestamp
            };

            await updateBox(updatedBox);
            navigate(`/box/${id}`);
        } catch (error) {
            console.error("Failed to update box:", error);
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this box?")) {
            await deleteBox(id);
            navigate('/');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="create-box-page">
            {step === STEPS.CAMERA && (
                <>
                    <h2>Retake Photo</h2>
                    <CameraComponent onCapture={handleCapture} />
                    <button className="btn-secondary" style={{ marginTop: 20 }} onClick={() => setStep(STEPS.PREVIEW)}>Cancel</button>
                </>
            )}

            {step === STEPS.PREVIEW && box && (
                <div className="preview-container">
                    <h2>Edit Box {box.code}</h2>
                    <img src={box.image} alt="Box" className="preview-image" />

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
                            <label htmlFor="items-input">Contents (comma separated)</label>
                            <button
                                className="auto-tag-btn"
                                onClick={handleAutoTag}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? '✨ Analyzing...' : '✨ Auto-Tag'}
                            </button>
                        </div>
                        <textarea
                            id="items-input"
                            className="items-input"
                            value={itemsText}
                            onChange={(e) => setItemsText(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons-row">
                        <button onClick={handleRetake} className="btn-secondary" disabled={isSaving}>Retake Photo</button>
                        <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <button onClick={handleDelete} className="btn-danger" style={{ marginTop: '20px', color: 'red', border: '1px solid red', padding: '10px', borderRadius: '8px' }}>
                        Delete Box
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditBox;
