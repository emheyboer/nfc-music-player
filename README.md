# Introduction
The goal of this project was to make a physical media player. It stores links to albums on pins with embedded nfc tags. An android device can then scan and tell plexamp to play them. To control playback, a bluetooth numpad functions as a remote control and sends commands to plexamp to play/pause/skip/etc.

<img width="50%" height="50%" src=images/controller,remote,tags.jpg />

# Software Requirements
- plexamp
- tailscale
- tasker and autoinput

# Setup
1. setup plexamp and write tags as desired using its native share functionality
2. setup tailscale on player and controller
3. import the tasker project from `nfc_music_player.prj.xml`
4. update js file paths in `play nfc` & `remote` tasks as needed
5. set the following variables: `Players` (comma-separated list of player hostnames), `Tailnet` (in the form of `tail*.ts.net`), and `PlexPlayerPort` (usually 32500)
6. set tasker as default handler for tags
7. setup tasker's autoinput plugin so it can capture keypresses
8. connect to remote, set which keys should be intercepted by `key is pressed on remote` action, and update `actions` in `remote.js` as appropriate
9. Run the task `setup`

# Components
This project consists of four components:
1. player: a device running plexamp
2. controller: a dedicated android phone 
3. remote: a wireless keyboard
4. nfc tags

## Player
<img width="50%" height="50%" src=images/player.jpg />

The player is a device (e.g. a laptop) running plexamp (with remote control enabled) and tailscale. To connect to the player, the controller needs to be configured with the player's address in tailscale and plexamp's port number (usually 32500). 

## Controller
<img width="50%" height="50%" src=images/controller.jpg />

The controller is an android device (with an nfc reader) running tailscale and tasker. Tasker keeps the device awake and responds to two inputs:
1. When an nfc tag is scanned, the controller takes the url and `GET`s it. Before doing so, we need to rewrite the host to `[player's tailscale address]:[port number]` so the api call goes to the player. This begins playing the album and replaces the existing playback queue.
2. When a key is pressed on the remote, the controller takes the keycode and consults an array of corresponding actions (e.g. play/pause/skip). For each action, the controller queries the player state as appropriate and makes another api call to update it.

## Remote
<img width="50%" height="50%" src=images/remote.jpg />

The remote is a wireless keyboard connected to the controller. Each keypress on the remote triggers a distinct function on the controller which in turn updates the player. For this to work, autoinput must be setup on the controller to intercept and suppress keypresses. Autoinput then sends these keypress events to `remote.js`.

## Tags
<img width="50%" height="50%" src=images/tags.jpg />

Using plexamp, we can write a URL (which calls `/player/playback/playMedia`) to each nfc tag for playback. These tags are then compatible with both this player and any other nfc-enabled device running plexamp. Also this project uses nfc tags embedded in pins with a metal backing. Because of that, on-metal nfc tags with a ferrite layer are required.