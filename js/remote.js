// this script requires 'Auto Exit' be disabled
if (typeof exit != 'function') {
    var {exit, local, global, flash} = require('./shims.js');
}

const STEP_DELTA = 10_000; // stepBack & stepForward time in ms
const VOLUME_DELTA = 5; // volume up & down increment

function main() {
    const keycode = Number(local('aikeycode'));
    const index = keycode - 145;
    const actions = [
        'stepBack',
        'pause',
        'stepForward',
        'skipPrevious',
        'play',
        'skipNext',
        'shuffle',
        'stop',
        'repeat',
        null,
        null,
        'volumeUp',
        'volumeDown',
    ];
    const action = actions[index];
    if (!action) {
        flash(`keycode = ${keycode}, index = ${index}`);
        exit();
    }

    perform_action(action);
}

function perform_action(action) {

    let timeline_callback;
    switch (action) {
        case 'volumeUp':
        case 'volumeDown':
            timeline_callback = timeline => {
                let volume = Number(timeline.getAttribute('volume'));

                if (action == 'volumeUp') {
                    volume = Math.min(volume + VOLUME_DELTA, 100);
                } else if (action == 'volumeDown') {
                    volume = Math.max(volume - VOLUME_DELTA, 0);
                }

                action = `setParameters?volume=${volume}`;
                perform_action(action);
            };
            break;
        case 'shuffle':
            timeline_callback = timeline => {
                let shuffle = Number(timeline.getAttribute('shuffle'));

                shuffle = 1 - shuffle;
                
                action = `setParameters?shuffle=${shuffle}`;
                perform_action(action);
            };
            break;
        case 'repeat':
            timeline_callback = timeline => {
                let repeat = Number(timeline.getAttribute('repeat'));

                repeat = (repeat + 1) % 3;
                
                action = `setParameters?repeat=${repeat}`;
                perform_action(action);
            };
            break;
        // while it is documented, plexamp doesn't actually implement
        // /player/playback/{stepBack,stepForward}, so we do it manually
        case 'stepBack':
        case 'stepForward':
            timeline_callback = timeline => {
                let time = Number(timeline.getAttribute('time'));

                if (action == 'stepBack') {
                    time = Math.max(0, time - STEP_DELTA);
                } else if (action == 'stepForward') {
                    time = time + STEP_DELTA;
                }
                
                action = `seekTo?offset=${time}`;
                perform_action(action);
            };
            break;
    }

    if (timeline_callback) {
        query_timeline(timeline_callback);
    } else {
        flash(action);
        const url = build_url(`/player/playback/${action}`);
        fetch(url).then(() => exit());
    }
}

function build_url(path) {
    const host = global('PlexPlayerAddr');
    const port = global('PlexPlayerPort');
    return `http://${host}:${port}${path}`;
}

function query_timeline(callback) {
    // the caller is required to increment commandID on each call, but this is not enforced
    const url = build_url('/player/timeline/poll?wait=0&commandID=0');

    fetch(url).then(response => response.text()).then(text => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const timeline = xml.querySelector('Timeline[itemType="music"]');

        callback(timeline);
    });
}

main();
