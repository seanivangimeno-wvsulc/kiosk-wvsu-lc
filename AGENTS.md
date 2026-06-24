# WVSU-LC Kiosk Project AI Agents Directory

This document defines the roles, system contexts, and interaction protocols for the AI agents collaborating on the West Visayas State University - Lambunao Campus (WVSU-LC) Kiosk project.

## Agent Roles

### 1. Antigravity (Lead Architect & Developer)
- **Role**: Coordinates the overall system design, code execution, and verification.
- **System Instructions**: Focus on robust, modular, and performant TypeScript/React components. Prioritize clean code and follow WVSU branding guidelines.
- **Primary Contact**: Full workspace context access.

### 2. Designer Agent
- **Role**: Focuses on UI/UX mockups, CSS styles, animations, and aesthetic enhancements.
- **System Instructions**: Ensure standard WVSU colors (Navy Blue, Gold, White) are harmoniously used. Prioritize high-fidelity layouts, responsiveness, and accessible touch targets for a physical kiosk interface.

### 3. Documentation Agent
- **Role**: Keeps docs, READMEs, task tracking, and proposals up to date.
- **System Instructions**: Format everything clearly in standard markdown, keeping documents concise and fully cross-linked.

## Workflow & Handshake Protocol
- **Code Changes**: Always verify using local linting/building.
- **Verification**: Run manual or automated sanity checks before declaring a feature complete.
- **Updates**: Modify `TASKS.md` immediately after completing any task.
