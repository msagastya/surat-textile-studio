# Roadmap — Out-smart NedGraphics, the AI way

**Thesis:** We do not out-CAD a 40-year incumbent by matching features. We win one
vertical — **Surat jacquard sarees, Stäubli/JC5, ₹ market** — end to end, using two
weapons NedGraphics structurally lacks: **modern vision AI** and a **proprietary
dataset pairing designs to real woven fabric.** Own that slice completely, then climb.

Positioning: **the AI-native design-to-loom pipeline** — photo → palette → design →
cost → loom-ready file → *predicted woven look before a single sample is woven.*

---

## The moat (why this can't be copied fast)

NedGraphics' simulator is decades of hand-tuned fiber physics. We go around it:

- A model trained on **(design file → photo of the actual woven fabric)** predicts the
  woven result without modeling a fiber.
- NedGraphics has no AI DNA and **no pipeline pairing designs to woven outcomes.** If we
  collect that data from partner mills, we hold something they can't quickly replicate.
- **The killer feature:** *approve a design without weaving a sample.* Every avoided
  sample run saves yarn + loom time = real money. That is where we are genuinely better.

**The one gating dependency:** a **loom partner** — one Surat mill with a jacquard loom
that lets us (a) validate our loom files and (b) photograph woven results for training
data. Without it we are a great front-end; with it, the ambitious version is real. This
is a relationship to secure in parallel with all engineering below.

---

## Phase 0 — Credibility unlock (now → weeks)
*Turn "toy" into "tool": produce a file a real mill can actually receive and weave.*

- [ ] **Indexed-BMP / palette export** that opens cleanly in a NedGraphics seat.
- [ ] **`.des` (NIFF/DSGN) writer** — reuse the decoded chunk grammar (DHDR/DPAL/pixel).
- [ ] **Real JC5 card body** validated on a partner loom (currently faithful text, not
      binary `.crd`).
- [ ] **`.des` pixel-body decoder** → render real motif thumbnails + "load motif to canvas."
- **Exit criteria:** a Surat mill opens our export in NedGraphics and weaves it correctly.

## Phase 1 — Data flywheel (weeks → months)
*Start collecting the asset that becomes the moat.*

- [ ] Capture pipeline: for every design sent to a loom, store the design file + a
      standardized photo of the woven result (lighting/scale normalized).
- [ ] Partner-mill uploader (mobile-friendly) to gather (design → woven-photo) pairs.
- [ ] Label with yarn/material/weave metadata (we already model these from NedGraphics data).
- **Exit criteria:** a growing, structured dataset of real design↔woven pairs.

## Phase 2 — AI woven simulator (the leapfrog)
*Predict the woven look better than a generic physics engine, for our vertical.*

- [ ] Baseline: image-to-image model conditioned on weave structure + yarn/material.
- [ ] Ground truth = Phase 1 photos. Goal is **buyer-approval quality**, not photorealism.
- [ ] In-app "Woven Preview" tab replacing flat swatches with predicted fabric.
- **Exit criteria:** buyers approve designs from our preview without a physical sample.

## Phase 3 — AI design intelligence (widen the lead)
*Use AI where NedGraphics has nothing.*

- [ ] Generative motif/colorway suggestions tuned to Surat market + season trends.
- [ ] "Cost-aware design": AI proposes edits that hit a target ₹/meter (fewer colors,
      cheaper yarns, simpler weave) with live cost feedback.
- [ ] Loom-feasibility co-pilot: warns and auto-fixes designs that exceed hook capacity,
      repeat limits, or float rules — before the file ever reaches the loom.

## Phase 4 — Climb (months → years)
*Expand from the beachhead as trust compounds.*

- [ ] More controllers (Bonas, Grosse, Dornier), more fabric types.
- [ ] Multi-mill collaboration, order/quote workflow, ERP hooks.
- [ ] Only now do we look like a NedGraphics *competitor* rather than an upstart.

---

## Where we already are (foundation in place)
- Real NedGraphics-grounded data (`src/data/nedColors|nedYarns|nedMotifs|nedLooms`).
- Authentic JC5 layout, WIF export, loom-capacity check, snap-to-atlas.
- Full pipeline: import → palette → recolor → weave → drawdown → cost → export.
- Decoded formats: NIFF/DSGN (`.des`), JC5 card grammar, color books, yarn/material DB.

## Success metrics
1. **Phase 0:** ≥1 mill weaves our export correctly.
2. **Phase 1:** ≥500 design↔woven pairs collected.
3. **Phase 2:** ≥70% of previews accepted by buyers without a sample.
4. **Business:** sample runs avoided per month (₹ saved) — the number that proves we win.

## What we will NOT do
- Match their fiber-physics engine head-on. (We predict, not simulate.)
- Support every loom on day one. (One controller, done right.)
- Chase breadth before the data flywheel spins. Focus is the whole strategy.
