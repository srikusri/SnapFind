import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBoxes } from '../utils/storage';
import { loadModel } from '../utils/embedding';
import '../styles/Home.css';

const Home = () => {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBoxes();
        // Preload embedding model for offline use
        loadModel().catch(err => console.log("Model loading deferred or failed", err));
    }, []);

    const loadBoxes = async () => {
        try {
            const allBoxes = await getAllBoxes();
            // Sort by newest first
            setBoxes(allBoxes.sort((a, b) => b.timestamp - a.timestamp));
        } catch (error) {
            console.error("Failed to load boxes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-page">
            <h1>My Boxes</h1>

            {loading ? (
                <p>Loading...</p>
            ) : boxes.length === 0 ? (
                <p className="empty-state">No boxes snapped yet.</p>
            ) : (
                <div className="box-grid">
                    {boxes.map(box => (
                        <Link key={box.id} to={`/box/${box.id}`} className="box-card">
                            <div className="box-card-image">
                                {box.image ? (
                                    <img src={box.image} alt="Box thumbnail" />
                                ) : (
                                    <div className="placeholder-image">{box.code}</div>
                                )}
                            </div>
                            <div className="box-card-info">
                                <span className="box-code">{box.code}</span>
                                <span className="box-date">{new Date(box.timestamp).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="action-buttons">
                <Link to="/create" className="btn-primary">
                    Snap New Box
                </Link>
                <Link to="/search" className="btn-secondary">
                    Find Item
                </Link>
            </div>
        </div>
    );
};

export default Home;
