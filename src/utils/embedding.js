import { pipeline } from '@xenova/transformers';

let extractor = null;

/**
 * Load the embedding model (singleton).
 * Using 'all-MiniLM-L6-v2' (quantized) for browser efficiency.
 */
export const loadModel = async () => {
    if (extractor) return extractor;
    try {
        // Specify 'Xenova/all-MiniLM-L6-v2'
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true,
        });
        return extractor;
    } catch (error) {
        console.error("Error loading embedding model:", error);
        throw error;
    }
};

/**
 * Generate embedding for a given text.
 * Returns a generic array of numbers (Float32Array converted to Array).
 */
export const generateEmbedding = async (text) => {
    const pipe = await loadModel();
    // pooling: 'mean' or 'cls' usually works. Default is usually none (returns all tokens).
    // For sentence embeddings, we typically want 'mean' pooling and normalization.
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    // Output is Tensor, convert to array
    return Array.from(output.data);
};

/**
 * Calculate Cosine Similarity between two vectors.
 */
export const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};
