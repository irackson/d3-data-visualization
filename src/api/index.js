import mapData from './map.json';
import groupsData from './groups.json';
import segmentsData from './segments.json';
import chronotopeData from './chronotope.json';

/**
 * @template T
 * @param {T} value
 * @returns {Promise<T>}
 */
function delay(value) {
    const duration = Math.round(Math.random());
    return new Promise((resolve) =>
        window.setTimeout(resolve, duration * 1000, value)
    );
}

export function fetchMap() {
    return delay(mapData);
}

export function fetchSegments() {
    return delay(segmentsData);
}

export function fetchGroups() {
    return delay(groupsData);
}

export function fetchChronotopeData() {
    return delay(chronotopeData);
}
