# SnapFind
Snap it. Find it.
# SnapFind – Requirement Specification (Draft)

## 1. Purpose & Vision

The purpose of this application is to provide an **offline-first, mobile web inventory system** that allows users to:

* Capture the contents of physical boxes using a mobile device
* Identify and tag items using AI assistance
* Assign and manage a short, human-friendly box identifier
* Retrieve box contents instantly using search, code entry, or QR scan
* Perform **semantic item search fully offline**

The system is designed to work reliably **without network connectivity**, with optional cloud-based enhancement when connectivity is available.

---

## 2. Target Users

* Individuals managing home storage (garage, attic, lockers)
* Small businesses managing physical inventory
* Warehouse or field users with unreliable connectivity

---

## 3. Design Principles

* **Offline-first**: All core functionality must work without internet
* **AI-assisted, not AI-dependent**: AI enhances but never blocks workflows
* **Low friction**: Minimal steps to create and retrieve inventory
* **Privacy by default**: Images and data stay on-device unless user opts in

---

## 4. Functional Requirements

### 4.1 Box Creation & Inventory Upload

**FR-1**: The system shall allow users to create a new box entry while offline.

**FR-2**: The user shall be able to capture one or more photos of a box’s contents using the device camera.

**FR-3**: The system shall generate a **unique 4-character alphanumeric box code** (A–Z, 0–9) locally.

**FR-4**: The system shall validate box code uniqueness against local storage.

**FR-5**: The system shall associate captured images with the generated box code.

---

### 4.2 AI-Based Tagging (Bring Your Own AI Provider)

**FR-6**: The system shall support **on-device AI inference** for basic object recognition when available.

**FR-7**: The system shall support a **Bring Your Own AI (BYO-AI) provider model**, allowing users to configure their own AI service providers.

**FR-8**: Users shall be able to add, update, or remove AI provider credentials (e.g., API keys) for supported providers.

**FR-9**: Supported AI providers may include, but are not limited to:

* OpenAI
* Azure OpenAI
* Google Gemini
* Any compatible REST-based AI service

**FR-10**: AI provider configuration shall be optional and shall not be required for core offline functionality.

**FR-11**: The system shall allow users to choose which AI provider to use for:

* Image-based item recognition
* Tag refinement
* Text embedding generation (optional online)

**FR-12**: AI inference using external providers shall only occur when network connectivity is available and user consent is granted.

**FR-13**: AI provider credentials shall be stored securely on-device and never transmitted to third parties other than the selected provider.

**FR-14**: The system shall gracefully fall back to on-device AI or manual tagging if an external AI provider is unavailable or misconfigured.

---

### 4.3 Box Identification & Retrieval

**FR-10**: The system shall display the generated box code prominently after creation.

**FR-11**: The system shall generate a QR code representing the box code.

**FR-12**: The user shall be able to retrieve a box by:

* Manually entering the box code
* Scanning the QR code

**FR-13**: Box retrieval shall work fully offline.

---

### 4.4 Semantic Search (Offline)

**FR-14**: The system shall allow users to search for items using free-text input.

**FR-15**: The system shall generate on-device embeddings for box tags and item labels.

**FR-16**: The system shall generate an embedding for the user’s search query on-device.

**FR-17**: The system shall perform semantic similarity matching between the query embedding and stored box embeddings.

**FR-18**: The system shall return a ranked list of boxes likely containing the searched item.

**FR-19**: Semantic search shall function without network connectivity.

---

### 4.5 Edit Box Contents

**FR-20**: The system shall allow users to edit box contents after initial creation.

**FR-21**: Users shall be able to add, remove, or update items and tags for an existing box.

**FR-22**: Users shall be able to add new photos to an existing box or replace outdated images.

**FR-23**: When box contents change, the system shall regenerate the box’s semantic embedding locally.

**FR-24**: Updates to box contents shall be immediately reflected in search and retrieval results, even while offline.

---

### 4.6 Location & Multi‑Outlet Tagging

**FR-25**: The system shall allow users to define one or more **locations/outlets** (e.g., House, Office, Warehouse, Store A).

**FR-26**: Each box shall be taggable with a single primary location and optional secondary location tags.

**FR-27**: Location tags shall be user-configurable and editable offline.

**FR-28**: Location information shall be included as part of the box’s searchable metadata.

**FR-29**: Semantic search shall consider location tags when ranking results.

**FR-30**: The system shall allow filtering search results by location (e.g., show only Warehouse boxes).

---

### 4.7 Local Data Storage

**FR-20**: The system shall store all box data, images, tags, and embeddings in local persistent storage.

**FR-21**: Data shall remain available across app restarts and device reboots.

---

### 4.8 Optional Online Enhancements (Non-blocking)

**FR-25**: When connectivity is available and an AI provider is configured, the system may upload images or metadata for improved AI tagging.

**FR-26**: The system may refine existing tags, classifications, and embeddings using the selected AI provider.

**FR-27**: Online enhancement shall require explicit user consent per provider.

**FR-28**: The system shall allow users to switch AI providers without impacting stored data.

---

## 5. Non-Functional Requirements

### 5.1 Performance

* Box creation should complete in under 2 seconds (excluding AI inference)
* Semantic search results should appear within 300ms for up to 1,000 boxes

### 5.2 Reliability

* No core user journey shall depend on network availability
* Partial failures (e.g., AI unavailable) shall not block progress

### 5.3 Security & Privacy

* All data is stored locally by default
* No automatic cloud sync
* User-controlled data deletion

---

## 6. User Journeys

### Journey 1: Create a New Box (Offline)

**Actor**: User

1. User opens the app on their mobile device
2. User taps **“Create New Box”**
3. App opens the camera interface
4. User takes a photo of the box contents
5. App generates a unique 4-character box code
6. App runs on-device AI and suggests item tags
7. User reviews and edits tags if needed
8. App displays box code and QR code
9. User saves the box

**Outcome**: Box is stored locally and retrievable offline

---

### Journey 2: Retrieve Box Using Code or QR (Offline)

**Actor**: User

1. User opens the app
2. User selects **“Find Box”**
3. User enters the box code or scans QR code
4. App fetches box details from local storage
5. App displays images, tags, and items

**Outcome**: User immediately sees box contents

---

### Journey 3: Semantic Item Search (Offline)

**Actor**: User

1. User opens the app
2. User enters a search term (e.g., "charger")
3. App generates a query embedding on-device
4. App compares the query against stored box embeddings
5. App ranks matching boxes by relevance
6. App displays matching boxes with confidence indicators

**Outcome**: User finds the most likely box containing the item

---

### Journey 4: Edit Box Contents (Offline)

**Actor**: User / Packer

1. User retrieves an existing box using code or QR scan
2. Physical contents of the box change (item added, removed, or replaced)
3. User selects **“Edit Box”**
4. User updates item list, tags, or adds new photos
5. App regenerates semantic embeddings locally
6. Changes are saved to local storage

**Outcome**: Box inventory stays accurate and searchable

---

### Journey 5: Packers & Movers – Category-Based Packing

**Actor**: Packer / Mover

1. Packer selects a category (e.g., Kitchen, Electronics, Fragile, Documents)
2. Packer selects or confirms the destination location (e.g., House, Office, Warehouse)
3. App assigns category and location to the box
4. App generates a QR code with category and location metadata
5. App visually color-codes the box label and QR based on category
6. Packer attaches printed or handwritten code/QR to the box
7. During unloading, QR scan reveals category, contents, and destination location

**Outcome**: Faster packing, unloading, and location-wise sorting

---

### Journey 6: Optional AI Enhancement (Online)

**Actor**: User

1. Device gains internet connectivity
2. App notifies user of optional enhancement
3. User consents to upload images
4. App refines tags using cloud AI
5. App updates local tags and embeddings

**Outcome**: Improved accuracy without disrupting offline use

---

## 7. Success Criteria

* User can locate any stored item in under 10 seconds
* User can filter and find boxes across multiple locations/outlets
* App remains fully usable without internet
* Packers can identify destination location by scanning a box

---

* User can locate any stored item in under 10 seconds
* App remains fully usable without internet
* Minimal friction in box creation and retrieval

---

## 8. Out of Scope (Initial Version)

* Multi-user sharing
* Cross-device sync
* Warehouse-scale inventory optimization
* Barcode-based item-level tracking

---

*This document represents a first draft and is intended to evolve as implementation feedback is gathered.*
