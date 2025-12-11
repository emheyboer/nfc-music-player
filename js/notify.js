// this script requires 'Auto Exit' be disabled
if (typeof exit != 'function') {
    var {exit, local, global, flash} = require('./shims.js');
}

const api_url = 'https://api.pushover.net/1/messages.json';

const reasons = {
    low_battery: 'low battery — consider charging soon',
};

const parameters = {
    token: global('PushoverToken'),
    user: global('PushoverUser'),
    message: reasons[local('reason')],
};

flash(parameters.message);
fetch(api_url, {
    method: 'post',
    body: new URLSearchParams(parameters),
}).then(()=>exit());