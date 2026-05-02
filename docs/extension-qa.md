# Extension QA Checklist

Manual verification steps for the Uncognito Chrome Extension (Manifest V3).

## Load Extension

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `frontend/extension/` directory (the one containing `manifest.json`)
5. Verify the extension appears with the Uncognito icon

## Consent Gate

- [ ] Popup shows the red consent banner: "Screenshots of your active tab may become public..."
- [ ] Controls (backend URL, intensity, buttons) are hidden behind the consent gate
- [ ] Status text reads "Review the consent notice before enabling."
- [ ] Clicking "I understand, enable capture" reveals the controls and hides the banner
- [ ] Reloading the popup keeps the consent accepted (stored in `chrome.storage.local`)

## Manual Roast (Roast me now)

- [ ] With backend running on `http://localhost:3000`, click "Roast me now"
- [ ] Status changes through: "Capturing..." → "Uploading..." → "Roast created."
- [ ] "Open roast" link appears and opens the roast detail page
- [ ] Roast detail page shows the screenshot, caption, timestamp, and share buttons

## LinkedIn Link Demo

- [ ] Click "Screenshot + LinkedIn Link"
- [ ] Roast is created and both "Open roast" and "Open LinkedIn share" links appear
- [ ] LinkedIn share link opens a LinkedIn share dialog pre-filled with the roast URL
- [ ] The upload response includes `shareStatus: "link_ready"` and `linkedInShareUrl`

## Enable/Disable Toggle + Scheduling

- [ ] Enable toggle turns red when checked
- [ ] When enabled, status text shows "Enabled and waiting."
- [ ] "Next capture" timestamp updates when enabled
- [ ] When disabled, status text shows "Disabled" and next capture clears
- [ ] Demos mode alarm fires within 30-60 seconds (watch console)

## Edge Cases

- [ ] Capture on `chrome://extensions` page: shows "Skipped restricted browser page."
- [ ] Upload while another upload is in progress: shows "Upload already in progress."
- [ ] Backend URL set to a non-running server: shows network error message
- [ ] After 5 rapid uploads: rate limit kicks in (429), shows retry guidance
- [ ] Toggle, intensity, and backend URL persist across popup close/reopen

## Admin Controls (via web portal)

- [ ] Visit `/admin` and enter `ADMIN_TOKEN`
- [ ] List of all roasts appears with status badges
- [ ] "Hide" hides a public roast (removes from Wall of Shame)
- [ ] "Delete" marks roast deleted (soft delete in DB, image removal attempted)
