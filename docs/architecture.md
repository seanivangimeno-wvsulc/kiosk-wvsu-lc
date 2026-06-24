# Technical Architecture: WVSU-LC Kiosk

## 🛠️ Stack & Technologies
- **Core Library**: React (v19)
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Animations**: Motion (Framer Motion)
- **Local Server**: Express (TypeScript server configured via `server.ts`)
- **Build Tool**: Vite (bundling React frontend assets)
- **Bundler**: esbuild (compiling production node server)

## 📡 Data Flow
```
+------------------+           HTTP / REST           +---------------------+
|  Kiosk UI        | <=============================> | Express Server      |
|  (React/Vite)    |                                 | (Node.js backend)   |
+------------------+                                 +---------------------+
         |                                                      |
         v (WebSockets/Polling)                                 v
   [Local Storage]                                     [WVSU School Database]
   - Map Coordinates                                   - Faculty Roster
   - System Settings                                   - Announcement Feeds
```

## 📂 Core Source Structure
- `src/main.tsx`: App mount point.
- `src/App.tsx`: Main application router, sidebar navigation container, and views loader.
- `src/components/`: Reusable components (map viewer, search bar, contact details modal).
- `src/types.ts`: TypeScript interfaces for directory records, buildings, and announcements.
- `src/index.css`: Global styles, CSS tailwind directives.
