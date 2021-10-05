import {
    ApiPool,
    ChartMap,
    Chronotope,
    Group,
    MapData,
    Segment,
} from './../map-types.d';
import PromisePool from '@supercharge/promise-pool';

export const fetchData = async (apiPool: ApiPool): Promise<MapData> => {
    console.log('fetching data...');

    const beforeTime = Date.now();

    const { results } = await PromisePool.withConcurrency(4)
        .for(apiPool)
        .process(async (apiCallback) => {
            return {
                key: apiCallback.key,
                data: await apiCallback.callback(),
            };
        });

    const map = results.find(({ key }) => key === 'map')?.data as ChartMap;
    const groups = results.find(({ key }) => key === 'groups')?.data as Group[];
    const segments = results.find(({ key }) => key === 'segments')
        ?.data as Segment[];
    const chronotope = results.find(({ key }) => key === 'chronotope')
        ?.data as Chronotope[];

    const afterTime = Date.now();
    console.log(`Time to fetch: ${afterTime - beforeTime}ms`);
    return new Promise(function (resolve, reject) {
        map.created_at && groups.length && segments.length && chronotope.length
            ? resolve({
                  map,
                  groups,
                  segments,
                  chronotope,
              })
            : reject();
    });
};
