# 🚫 DO NOT INSTALL THESE PACKAGES — EVER (For CtrlSketch Pro)

These type packages are either **built-in**, **deprecated**, or **nonexistent**. Installing them will summon TypeScript demons and break your `npm install`.

## ❌ DO NOT RUN
```bash
npm install -D @types/konva         # 🚫 Konva already ships with types
npm install -D @types/react-dom@next # 🚫 Unless you're running bleeding-edge React DOM
npm install -D @types/node@latest    # 🚫 Only if you're writing backend scripts
npm install -D @types/* for packages that include their own types
```

## ✅ Safe Konva Install
Only run:
```bash
npm install konva
```

## 🧠 TypeScript Type Rules for This Project

- **Konva** → ships with built-in types (`.d.ts` files inside `lib/`)
- **React / ReactDOM** → your project already has correct versions
- **No `@types/konva` needed** — it does not exist and never should be in your package.json
- If VS Code is showing type errors:
  - Restart TS Server (`Ctrl+Shift+P → Restart TS Server`)
  - Check `tsconfig.json`
  - Force-import a type from the library to wake up IntelliSense

## 🔥 Remember:
If you `npm install @types/konva` again, you *will* get a 404. And you *will* deserve it.
