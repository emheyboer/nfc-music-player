var url = new URL(local('evtprm2'));
url.protocol = 'http:';
url.host = global('%PlexPlayerAddr');
url.port = global('%PlexPlayerPort');

flash(url.href);
fetch(url.href).then(()=>exit());
