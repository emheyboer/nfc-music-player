const parser = new DOMParser();
const xml = parser.parseFromString(http_data, 'application/xml');
var value = xml.querySelector('Timeline[itemType="music"]').attributes[attr].value;
