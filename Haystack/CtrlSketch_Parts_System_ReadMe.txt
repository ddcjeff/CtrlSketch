
CtrlSketch Smart Parts + BOM + Takeoff Engine
=============================================

This guide explains everything delivered to you so far, and how it fits into CtrlSketch.

──────────────────────────────────────────────
1. OVERVIEW
──────────────────────────────────────────────

This package enables CtrlSketch to behave like your advanced Visio + VBA system.

You now have:
✔️ A working part promotion engine
✔️ A BOM store (via Pinia)
✔️ A Vue component to edit shape metadata
✔️ A takeoff engine for AI-powered part suggestions

──────────────────────────────────────────────
2. FILES INCLUDED
──────────────────────────────────────────────

📦 bomStore.js
  → Pinia store for managing page-specific BOM entries

📦 makeShapePart.js
  → Utility function that promotes a normal shape into a part, assigning fields like tag, partNumber, quantity, etc.

📦 PartInspectorPanel.vue
  → Drop-in Vue component that behaves like Visio’s Shape Data window.
    Displays editable part fields when a shape is selected.

📦 ctrlsketch_blackwall_takeoff.py
  → Python Flask server that provides a local /takeoff endpoint for generating BOM suggestions based on shape metadata

📦 PartList.csv
  → Your real parts list that the takeoff engine uses to return BOM results

📦 README_CtrlSketch_Takeoff.txt
  → Usage instructions for the Python takeoff engine

📦 CtrlSketch_Takeoff_Frontend_Guide.txt
  → Vue integration guide for calling the takeoff engine from inside CtrlSketch

──────────────────────────────────────────────
3. WHAT THIS IS NOT
──────────────────────────────────────────────

This is NOT the full CtrlSketch app — these are intelligent **modules** meant to plug into it.

You still need your canvas, pageStore, and shape rendering engine.

──────────────────────────────────────────────
4. HOW TO USE IT
──────────────────────────────────────────────

🚀 Promote a Shape to a Part:
-----------------------------
1. Import `makeShapePart()` from 'utils/makeShapePart'
2. Call it like this:
   makeShapePart(shape.id)
3. This adds BOM fields to the shape and registers it in `bomStore`

🛠️ Edit Shape Fields:
----------------------
1. Add `<PartInspectorPanel />` to your sidebar layout
2. When a part shape is selected, it shows tag, partNumber, quantity, etc.

📦 View All Parts:
------------------
1. Use `useBomStore().parts` to get all current page parts
2. You can render them in a table, export, or send to the takeoff engine

🧠 Generate Smart BOM Suggestions:
----------------------------------
1. Start your Flask server:
   python ctrlsketch_blackwall_takeoff.py
2. From Vue, POST to:
   http://localhost:5050/takeoff
   with JSON like:
   {
     "request": [
       { "category": "sensor", "mount": "duct" }
     ]
   }

──────────────────────────────────────────────
5. NEXT OPTIONS
──────────────────────────────────────────────

✅ Wire shape drop to auto-call makeShapePart()
✅ Push page-level BOMs to Supabase
✅ Embed VSSX viewer into CtrlSketch to import Visio stencils
✅ Trigger AI takeoff suggestions automatically from canvas state

──────────────────────────────────────────────

Have more parts to import? Want to automate the cut sheet export? Just say the word.
