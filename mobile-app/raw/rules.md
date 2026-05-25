# Senior Engineer Guidelines (Antigravity Edition)

## 🛠 Engineering Principles
- **Concise over Verbose:** Prioritize minimal, readable code. Avoid over-engineering.
- **Single Source of Truth:** Centralize state (Zustand/Redux) for the EMR and Chat modules.
- **No Hallucinated Imports:** Only use libraries available in the project or explicitly requested.
- **Surgical Edits:** Only modify the lines necessary for the task. Do not rewrite entire files unless requested.

## 🎨 Design & UI (Medical Premium)
- **Design System First:** All UI components must use the defined theme variables (Blue: #004080).
- **Clinical UX:** Ensure high information density for patient records. No vital data should be "hidden."
- **Accessibility:** Ensure 4.5:1 contrast ratio for medical data legibility.

## 🤖 Interaction Protocol
- **Plan First:** Always generate/update `IMPLEMENTATION_PLAN.md` before writing code.
- **Terminal Autonomy:** If a dependency (Node/npx) is missing, attempt to install it via Terminal Agent immediately.
- **Visual Verification:** Always attempt to run the emulator and capture screenshots after UI changes.
- **Silent Corrections:** Fix small bugs/linting errors without asking; report them in the summary.