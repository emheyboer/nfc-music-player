# Setup
- plexamp on one device
- tasker on an android phone
- both devices on a shared tailnet
- tasker variables PlexPlayerPort & Tailnet must be set

# Process
1. scan NFC tag
2. tasker handles tag and triggers task
3. js (in tasker.js) reads tag contents, transforms into URL for remote, and fetch()s
5. plexamp begins playback
