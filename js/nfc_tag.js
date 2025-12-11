// this script requires 'Auto Exit' be disabled
if (typeof exit != 'function') {
    var {exit, local, global, flash} = require('./shims.js');
}

const url = new URL(local('evtprm2'));  // evtprm2 contains the contents of the tag

// each tag contains a URL in the form 'https://listen.plex.tv/*' to call the remote control api
// to do this on a remote device, all we have to do is rewrite the host
url.protocol = 'http:';
url.host = global('PlexPlayerAddr');
url.port = global('PlexPlayerPort');

flash(url.href);
fetch(url.href).then(()=>exit());
