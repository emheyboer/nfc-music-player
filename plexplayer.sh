#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")"

if [ "$#" -eq 2 ]; then
    env PlexPlayerAddr="$1" action="$2" node js/remote.js
elif [ "$#" -eq 1 ]; then
    env action="$1" node js/remote.js
else
    bin="$(basename "$0")"
    source .env
    
    echo "Usage:"
    echo "$bin [action]"
    echo "$bin [player hostname] [action]"

    echo
    echo "Examples:"
    echo "$bin pause"
    echo "$bin ${PlexPlayerAddr:-laptop} play"
    echo "$bin setParameters?volume=100"
    echo "$bin playMedia?uri=..."

    echo "
Supported Actions:
play pause stop
stepBack stepForward
skipPrevious skipNext
shuffle repeat
playAll playArtist playAlbum playTrack
nowPlaying
volumeUp volumeDown
[any /player/playback/* endpoint]"
fi