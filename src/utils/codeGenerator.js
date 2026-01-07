/**
 * Generates a random 4-character alphanumeric code (A-Z, 0-9).
 * Excludes characters that might be confusing (e.g., 'O' vs '0', 'I' vs '1').
 */
export const generateBoxCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed 0, 1, I, O
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
