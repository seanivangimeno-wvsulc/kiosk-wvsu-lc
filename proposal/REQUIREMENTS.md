# System Requirements Specification (SRS): WVSU-LC Kiosk

## 1. Functional Requirements

### FR-1: Interactive Map
- The system must display a vector-based (SVG) layout of the Lambunao Campus.
- Users must be able to tap on buildings to view office details, classrooms, and department rosters.
- The map must support basic zoom-in, zoom-out, and panning controls.

### FR-2: Faculty & Department Directory
- Users must be able to search for faculty members, staff, and campus offices by name, department, or keyword.
- Search results must show status (e.g., active, office hours), office room number, and contact email.

### FR-3: Announcement Board
- The system must pull latest announcements, events, and academic calendars.
- Announcements must support categories (e.g., Academic, Sports, Admission, Emergency).

## 2. Non-Functional Requirements

### NFR-1: Usability & Accessibility
- The interface must be fully optimized for touch interactions (minimum touch targets: 48x48px).
- Font size adjustments and high-contrast toggle must be accessible from the main header.

### NFR-2: Performance & Reliability
- The kiosk must reload the home page after 2 minutes of idle time.
- Offline support: Critical information (directories and map) must remain cached and viewable offline if server connection is lost.
