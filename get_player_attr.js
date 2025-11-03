// the endpoint /player/timeline/poll returns an xml object which contains the following attributes:

// state (playing/paused), duration (ms), time (ms), playQueueItemID, key,
// ratingKey, playQueueID, playQueueVersion, containerKey, type,
// itemType, volume (0-100), shuffle (0-1), repeat (0-2), controllable, machineIdentifier,
// protocol, address, port

const parser = new DOMParser();
const xml = parser.parseFromString(http_data, 'application/xml');
var value = xml.querySelector('Timeline[itemType="music"]').attributes[attr].value;
