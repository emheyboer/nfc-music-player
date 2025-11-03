# Components
This project consists of four components:
1. player: a device running plexamp
2. controller: a dedicated android phone 
3. remote: a wireless keyboard
4. nfc tags

## Player
The player is a device (e.g. a laptop) running plexamp (with remote control enabled) and tailscale. To connect to the player, the controller needs to be configured with the player's address in tailscale and plexamp's port number (usually 32500). 

## Controller
The controller is an android device (with an nfc reader) running tailscale and tasker. Tasker keeps the device awake and responds to two inputs:
1. When an nfc tag is scanned, the controller takes the url and `GET`s it. Before we `GET` the url, we need to rewrite the host to `[player's tailscale address]:[port number]` so the api call goes to the player. This begins playback.
2. When a key is pressed on the remote, the controller takes the keycode and consults an array of corresponding actions (e.g. play/pause/skip). For each action, the controller queries the player state as appropriate and makes another api call to update it.

## Remote
The remote is a wireless keyboard connected to the controller. Each keypress on the remote triggers a distinct function on the controller which in turn updates the player.

## nfc Tags
Using plexamp, we can write a URL (which calls /player/playback/playMedia) to each NFC tag for playback. These tags are therefore compatible with both this player and any other nfc-enabled device running plexamp.