import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [provider, setProvider] = useState('gemini'); // 'gemini' or 'openai'
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const storedProvider = localStorage.getItem('ai_provider') || 'gemini';
        const storedKey = localStorage.getItem('ai_api_key') || '';
        const storedLocs = JSON.parse(localStorage.getItem('box_locations') || '["Home", "Office", "Storage"]');

        setProvider(storedProvider);
        setApiKey(storedKey);
        setLocations(storedLocs);
    }, []);

    const [locations, setLocations] = useState([]);
    const [newLoc, setNewLoc] = useState('');

    const handleSave = () => {
        localStorage.setItem('ai_provider', provider);
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('box_locations', JSON.stringify(locations));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addLocation = () => {
        if (newLoc.trim() && !locations.includes(newLoc.trim())) {
            setLocations([...locations, newLoc.trim()]);
            setNewLoc('');
        }
    };

    const removeLocation = (loc) => {
        setLocations(locations.filter(l => l !== loc));
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                <h2>Settings</h2>
            </div>

            <div className="settings-content">
                <h3>Locations</h3>
                <p className="settings-desc">Manage the places where you store boxes.</p>

                <div className="locations-list">
                    {locations.map(loc => (
                        <div key={loc} className="location-tag">
                            {loc}
                            <button onClick={() => removeLocation(loc)} className="remove-loc-btn">×</button>
                        </div>
                    ))}
                </div>

                <div className="add-location-row">
                    <input
                        type="text"
                        value={newLoc}
                        onChange={(e) => setNewLoc(e.target.value)}
                        placeholder="New Location (e.g. Attic)"
                    />
                    <button onClick={addLocation} className="btn-secondary">Add</button>
                </div>

                <hr className="divider" />

                <h3>AI Configuration</h3>
                <p className="settings-desc">
                    Configure your own AI provider to enable auto-tagging.
                    Keys are stored strictly on your device.
                </p>

                <div className="form-group">
                    <label>Provider</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI (GPT-4o/Mini)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
                    />
                </div>

                <button onClick={handleSave} className="btn-primary save-btn">
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>

                <div className="helper-links">
                    {provider === 'gemini' ? (
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get Gemini API Key</a>
                    ) : (
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Get OpenAI API Key</a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
