# 🧠 CtrlSketch Architecture Snapshot

This document captures the current working design and architecture of CtrlSketch, based on the full integration conversation.

---

## ✅ Supabase + BOM Integration

- **Parts Catalog** is stored in Supabase (`PartsCatalog` table).
- Vue 3 components:
  - `PartsPlusBrowser.vue`: Card view of parts
  - `PartsAdminTable.vue`: Table view for admin usage
- `"Add to BOM"` triggers:
  - `makeShapePart()` → promotes a shape
  - `bomStore.addPart()` → updates the live BOM
- Browser access points:
  - Tab menu opens full-page view
  - Right-click on shape opens floating panel

---

## 🧱 Shape Types

- **Symbol Shapes** (default):
  - Used for general drawing
  - Not included in BOM
- **Part Shapes**:
  - Created by promoting a symbol using `makeShapePart()`
  - Metadata is added (part number, description, tags)
- Right-click or button activates "Make Shape a Part"
- BOM updates in real-time when parts are created

---

## 📦 Shape Library System

- Users can manage multiple **named libraries**:
  - HVAC, Lighting, Security, etc.
- Features:
  - Create, rename, delete libraries
  - Add or remove shapes
- `.vssx` Import:
  - Upload a Visio `.vssx` file
  - Unzipped and parsed into CtrlSketch shape JSON format
- Libraries may be stored in Supabase for persistence

---

## 🔌 Wiring Diagram Connection System

- Connect two shapes with a button-driven action:
  - Select Shape A
  - Select Shape B
  - Click “Connect”
- System draws **flexible orthogonal lines**:
  - 90° turn routing
  - Auto-updates as shapes move
- Supports multi-line bundles:
  - Single / Double / Triple / Quad line styles
- Each connection is an object with:
  ```json
  {
    "id": "conn-001",
    "from": "shapeA",
    "to": "shapeB",
    "style": "double",
    "path": [ {x, y}, ... ]
  }
  ```

---

## 🔒 You Don’t Need to Repeat:

This document tracks:
- BOM + Supabase architecture
- Part vs. Symbol logic
- Shape library structure
- VSSX import path
- Connector wiring strategy

Everything is retained and mapped — use this file as a reference baseline.