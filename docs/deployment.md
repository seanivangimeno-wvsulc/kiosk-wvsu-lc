# Hardware & Software Deployment Guide

This document describes the steps required to deploy the kiosk software on physical terminals at West Visayas State University - Lambunao Campus.

## 🖥️ Recommended Hardware Specs
- **OS**: Windows 11 Enterprise LTSC or Ubuntu LTS (Configured in Single-App Kiosk Mode)
- **CPU**: Intel Core i3 / Ryzen 3 or higher
- **RAM**: 8 GB
- **Display**: 21-inch to 32-inch Full HD (1920x1080) Projected Capacitive (PCAP) Multi-Touch Screen

## ⚙️ Kiosk Environment Configuration

### For Windows (Assigned Access Kiosk Mode)
1. Set up a local user account called `KioskUser`.
2. Configure **Assigned Access** in Windows Settings:
   - Select `KioskUser` as the targeted account.
   - Choose Microsoft Edge as the kiosk app.
   - Set Edge to open in Full Screen and point the URL to the local app IP: `http://localhost:5173` (or production port).
3. Disable sleep mode, screen savers, and automatic Windows updates during campus hours.

### For Linux (Openbox + Chromium Startup)
Create a `.xinitrc` startup script to boot Chromium automatically in kiosk mode:
```bash
#!/bin/bash
xset s off
xset -dpms
xset s noblank
chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:5173
```
