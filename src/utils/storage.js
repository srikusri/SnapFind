import { openDB } from 'idb';

const DB_NAME = 'snapfind-db';
const BOX_STORE = 'boxes';
const DB_VERSION = 1;

/**
 * Initialize the IndexedDB
 */
export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(BOX_STORE)) {
                const store = db.createObjectStore(BOX_STORE, { keyPath: 'id' });
                store.createIndex('code', 'code', { unique: true });
                store.createIndex('created', 'timestamp');
            }
        },
    });
};

/**
 * Save a new box to storage
 * @param {Object} box - The box object to save
 */
export const saveBox = async (box) => {
    const db = await initDB();
    return db.add(BOX_STORE, box);
};

/**
 * Get all boxes from storage
 */
export const getAllBoxes = async () => {
    const db = await initDB();
    return db.getAllFromIndex(BOX_STORE, 'created'); // Sort by created timestamp implicitly if index works, or just getAll
};

/**
 * Get a single box by ID
 */
export const getBoxById = async (id) => {
    const db = await initDB();
    return db.get(BOX_STORE, id);
};

/**
 * Check if a box code already exists
 */
export const checkCodeExists = async (code) => {
    const db = await initDB();
    const box = await db.getFromIndex(BOX_STORE, 'code', code);
    return !!box;
};

/**
 * Get box by code
 */
export const getBoxByCode = async (code) => {
    const db = await initDB();
    return db.getFromIndex(BOX_STORE, 'code', code);
};

/**
 * Update an existing box
 */
export const updateBox = async (box) => {
    const db = await initDB();
    return db.put(BOX_STORE, box);
};

/**
 * Delete a box
 */
export const deleteBox = async (id) => {
    const db = await initDB();
    return db.delete(BOX_STORE, id);
};
