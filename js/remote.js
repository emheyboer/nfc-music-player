// this script requires 'Auto Exit' be disabled
if (typeof exit != 'function') {
    var {exit, local, global, setGlobal, flash, DOMParser} = require('./shims.js');
}

const STEP_DELTA = 10_000; // stepBack & stepForward time in ms
const VOLUME_DELTA = 5; // volume up & down increment
const ACTIONS = {
    143: 'player1',      154: 'player2', 155: 'player3',     67: 'player4',
    151: 'shuffle',      152: 'stop',    153: 'repeat',      156: 'volumeUp',
    148: 'skipPrevious', 149: 'play',    150: 'skipNext',    157: 'volumeDown',
    145: 'stepBack',     146: 'pause',   147: 'stepForward',
    144: 'nowPlaying',
}

function main() {
    const tag_contents = local('evtprm2');
    const keycode = Number(local('aikeycode'));

    const action = local('action')
        || action_from_tag(tag_contents)
        || ACTIONS[keycode];

    if (!action) {
        flash(`keycode = ${keycode}`);
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

        case 'player1':
        case 'player2':
        case 'player3':
        case 'player4':
        case 'nextPlayer':
            switch_player(action);
            flash(global('PlexPlayerAddr'));
            exit();

        case 'nowPlaying':
            timeline_callback = timeline => {
                const track = timeline.getElementsByTagName('Track')[0];
                const title = track.getAttribute('title');
                const artist = track.getAttribute('grandparentTitle');

                send_notification('now playing', `${title} by ${artist}`);
            };
            break;

        case 'lowBattery':
            send_notification(null, 'low battery — consider charging soon');
            return;
    }

    if (timeline_callback) {
        query_timeline(timeline_callback);
    } else {
        flash(action);
        const url = build_url(`/player/playback/${action}`);
        fetch(url).then(() => exit());
    }
}

function switch_player(action) {
    const players = global('Players').split(',');
    let index;
    if (action == 'nextPlayer') {
        const [hostname] = global('PlexPlayerAddr').split('.');
        index = (players.indexOf(hostname) + 1) % players.length;
    } else {
        index = Number(action.slice(6)) - 1; // player{1,2,3,4} -> {0,1,2,3}
    }

    const player = players[index];
    if (player) {
        const address = player_addr(player);
        setGlobal('PlexPlayerAddr', address);
    }
}

function player_addr(hostname) {
    const tailnet = global('Tailnet');
    if (tailnet) {
        return `${hostname}.${tailnet}`;
    }
    return hostname;
}

// each tag contains a URL in the form 'https://listen.plex.tv/player/playback/[action]'
function action_from_tag(tag_contents) {
    const url = new URL(tag_contents);
    const action = url.pathname.split('/').pop() + url.search;
    return action;
}

function send_notification(title, message) {
    const parameters = {
        token: global('PushoverToken'),
        user: global('PushoverUser'),
        message,
    };
    if (title) parameters.title = title;

    fetch('https://api.pushover.net/1/messages.json', {
        method: 'post',
        body: new URLSearchParams(parameters),
    }).then(()=>exit());
}

function build_url(path) {
    const host = global('PlexPlayerAddr');
    const port = global('PlexPlayerPort');
    return `http://${host}:${port}${path}`;
}

function query_timeline(callback) {
    // the caller is required to increment commandID on each call, but this is not enforced
    const url = build_url('/player/timeline/poll?wait=0&commandID=0&includeMetadata=1');

    fetch(url).then(response => response.text()).then(text => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const timeline = xml.getElementsByTagName('Timeline')[0];

        callback(timeline);
    });
}

main();
