import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { getBoxById } from '../utils/storage';
import '../styles/BoxDetails.css';

const BoxDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [box, setBox] = useState(null);
    const [qrSrc, setQrSrc] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBox = async () => {
            try {
                const foundBox = await getBoxById(id);
                if (foundBox) {
                    setBox(foundBox);
                    const qrDataUrl = await QRCode.toDataURL(foundBox.code, { width: 200, margin: 1 });
                    setQrSrc(qrDataUrl);
                } else {
                    console.error("Box not found");
                }
            } catch (err) {
                console.error("Error loading box:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBox();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!box) return <div className="not-found">Box not found</div>;

    return (
        <div className="box-details-page">
            <div className="box-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                <h2>Box {box.code}</h2>
                <button onClick={() => navigate(`/edit/${id}`)} className="edit-btn">Edit</button>
            </div>

            <div className="box-image-container">
                {box.image && <img src={box.image} alt={`Box ${box.code}`} className="box-image" />}
            </div>

            <div className="box-info">
                <div className="qr-section">
                    <img src={qrSrc} alt="Box QR Code" className="qr-code" />
                    <p className="qr-label">Scan to find</p>
                </div>

                <div className="tags-section">
                    <h3>Contents</h3>
                    {box.items && box.items.length > 0 ? (
                        <ul>
                            {box.items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className="empty-tags">No items tagged yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoxDetails;
