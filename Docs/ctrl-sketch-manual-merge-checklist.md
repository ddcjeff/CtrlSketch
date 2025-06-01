
# ✅ Ctrl Sketch Pro: Manual Merge Checklist (`dev` → `main`)

## 🧪 1. Test Locally
- [ ] `npm run dev` runs without console errors or browser crashes
- [ ] `npm run test` (unit tests) passes
- [ ] `npm run test:e2e` (Playwright) passes or known/expected fails are documented
- [ ] Play with:
  - [ ] Ribbon toggle buttons
  - [ ] Canvas tools (select, draw, zoom, drag)
  - [ ] Properties panel + shapes
  - [ ] Layers visibility/opacity

## 📁 2. Clean Git Working Tree
- [ ] Run `git status` and verify:
  - No uncommitted changes
  - No stray `.log`, `.tmp`, `.env`, or `.DS_Store` files
- [ ] Stage and commit anything valuable before merge

## 📌 3. Prepare `main`
- [ ] Checkout `main`:  
  `git checkout main`
- [ ] Pull latest:  
  `git pull origin main`

## 🔀 4. Merge `dev` to `main`
```bash
git merge dev
# Resolve any conflicts surgically
# Confirm app still runs post-merge
```

## ⬆️ 5. Push to Remote
```bash
git push origin main
```

## 🚨 Optional Cleanup
- [ ] Delete stale branches after merge (`dev`, hotfixes, etc.)
- [ ] Re-tag version (`v1.0.0-beta`, etc.)
- [ ] Zip and archive locally
