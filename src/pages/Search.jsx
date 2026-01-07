import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { getBoxByCode, getAllBoxes } from '../utils/storage';
import { generateEmbedding, cosineSimilarity } from '../utils/embedding';
import '../styles/Search.css';

const Search = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'scan'
    const [query, setQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    // Load locations on mount
    useEffect(() => {
        try {
            const locs = JSON.parse(localStorage.getItem('box_locations') || '[]');
            setAvailableLocations(Array.isArray(locs) ? locs : []);
        } catch (e) {
            console.error("Error parsing locations", e);
            setAvailableLocations([]);
        }
    }, []);

    const handleSearch = async (e) => { //...
        e.preventDefault();
        if (!query.trim() && !locationFilter) return;
        setError('');
        setResults(null);
        setIsSearching(true);

        try {
            // 0. Get all boxes first to apply filters if query is empty OR for hybrid search failure fallback
            const allBoxes = await getAllBoxes();
            let candidateBoxes = allBoxes;

            // Apply Location Filter
            if (locationFilter) {
                candidateBoxes = candidateBoxes.filter(b => b.location === locationFilter);
            }

            // 1. If only filtering by location, just return those
            if (!query.trim()) {
                setResults(candidateBoxes);
                if (candidateBoxes.length === 0) setError(`No boxes found in ${locationFilter}.`);
                setIsSearching(false);
                return;
            }

            // 2. Try Exact Code Match (if query looks like code)
            if (query.length < 6) {
                const codeBox = candidateBoxes.find(b => b.code === query.toUpperCase());
                if (codeBox) {
                    navigate(`/box/${codeBox.id}`);
                    return;
                }
            }

            // 3. Semantic Search
            const queryEmbedding = await generateEmbedding(query);

            // Filter boxes that have embeddings
            const validBoxes = candidateBoxes.filter(b => b.embedding && b.embedding.length > 0);

            const rankedBoxes = validBoxes.map(box => {
                const score = cosineSimilarity(queryEmbedding, box.embedding);
                return { ...box, score };
            });

            // Sort by score descending
            rankedBoxes.sort((a, b) => b.score - a.score);

            // Filter by threshold (e.g. 0.25) to avoid bad matches
            const topMatches = rankedBoxes.filter(b => b.score > 0.25).slice(0, 5);

            if (topMatches.length > 0) {
                setResults(topMatches);
            } else {
                setError(`No matching boxes found using semantic search.`);
            }

        } catch (err) {
            console.error(err);
            setError("Error during search.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleScan = async (decodedText) => {
        try {
            const code = decodedText.trim().toUpperCase();
            const box = await getBoxByCode(code);
            if (box) {
                navigate(`/box/${box.id}`);
            } else {
                setError(`Box code '${code}' not found.`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="search-page">
            <div className="search-tabs">
                <button
                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('text'); setError(''); setResults(null); }}
                >
                    Search Item
                </button>
                <button
                    className={`tab ${activeTab === 'scan' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('scan'); setError(''); }}
                >
                    Scan QR
                </button>
            </div>

            <div className="search-content">
                {activeTab === 'text' && (
                    <>
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-bar-row">
                                <select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="location-filter"
                                >
                                    <option value="">All Locations</option>
                                    {availableLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Box Code or Item Name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={isSearching}>
                                {isSearching ? '...' : 'Search'}
                            </button>
                        </form>

                        {results && (
                            <div className="search-results">
                                <h3>Top Matches</h3>
                                {results.map(box => (
                                    <div key={box.id} onClick={() => navigate(`/box/${box.id}`)} className="search-result-item">
                                        <div className="result-thumb">
                                            {box.image ? <img src={box.image} alt="thumb" /> : box.code}
                                        </div>
                                        <div className="result-info">
                                            <span className="result-code">{box.code}</span>
                                            <span className="result-items">
                                                {box.items && box.items.join(', ')}
                                            </span>
                                        </div>
                                        <div className="result-score">
                                            {(box.score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'scan' && (
                    <div className="scan-section">
                        <p className="instruction">Point camera at a SnapFind QR code</p>
                        <QRScanner onScan={handleScan} />
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default Search;
