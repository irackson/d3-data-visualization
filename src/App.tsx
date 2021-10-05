import { max, min } from 'd3-array';
import { axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { differenceInDays } from 'date-fns';
import { sortBy } from 'lodash';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api';
import './App.css';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingDisplay } from './components/LoadingDisplay';
import { MapTitleDisplay } from './components/MapTitleDisplay';
import { NodeDataDisplay } from './components/NodeDataDisplay';
import {
    dimensions,
    displayFontSize,
    errorString,
    hoverColor,
    loadingString,
    titleString,
} from './constants/chronotope-constants';
import { ApiPool, Chronotope, MapData, Segment, TargetNode } from './map-types';
import { fetchData } from './utils/fetchWithConcurrency';
const targetErrorString = 'technical difficulties';

const apiPool: ApiPool = [
    { key: 'map', callback: api.fetchMap },
    { key: 'groups', callback: api.fetchGroups },
    { key: 'segments', callback: api.fetchSegments },
    { key: 'chronotope', callback: api.fetchChronotopeData },
];

const App: FC = () => {
    //* data getting / setting
    const [data, setData] = useState<MapData | null>();
    const [fetchingError, setFetchingError] = useState(false);
    const [targetNode, setTargetNode] = useState<TargetNode | null>();

    //* svg hooks
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [selection, setSelection] = useState<null | Selection<
        SVGSVGElement | null,
        unknown,
        null,
        undefined
    >>(null);

    //* utility functions
    const getTimeFrame = useCallback(
        () =>
            data
                ? differenceInDays(
                      new Date(
                          max(data.chronotope, ({ hit_time }) => hit_time)!
                      ),
                      new Date(
                          min(data.chronotope, ({ hit_time }) => hit_time)!
                      )
                  )
                : 0,
        [data]
    );

    const computeYAxisOffset = useCallback(
        () =>
            data
                ? max(data.segments, ({ name }) => name.length - 1)! *
                      dimensions.segmentNameFontSize *
                      (1 / 2) +
                  9
                : 1,
        [data]
    );

    useEffect(() => {
        if (!data) {
            //* fetch data, handle error
            fetchData(apiPool)
                .then((data) => setData(data))
                .catch(() => setFetchingError(true));
        } else if (!selection) {
            //* initialize map
            const timeFrame = getTimeFrame();
            setSelection(
                select(svgRef.current)
                    .attr('width', dimensions.widthPerDay * timeFrame)
                    .attr(
                        'height',
                        dimensions.heightPerSegment * data.map.num_segments
                    )
                    .style('overflow', 'visible')
                    .style('padding-left', computeYAxisOffset())
            );
        } else {
            //* render data

            //! prepare data for visualization in required order
            // initialize 2d array of groups of segments for displaying y-axis names in proper order
            const orderedGroupsOfOrderedSegments = Array<Segment[]>(
                data.map.num_groups
            );

            // populate 2d array via ordinal sort, according to the group's `position` ascending, then by the segment's `position` ascending
            sortBy(data.groups, [({ position }) => position]).forEach(
                (group, index) =>
                    (orderedGroupsOfOrderedSegments[index] = sortBy(
                        data.segments.filter(
                            ({ group_no }) => group_no === group.group_no
                        ),
                        ({ position }) => position
                    ))
            );

            // provide utility function to find segment associated with a particular node as it is displayed on the map
            const getSegmentNoFromOrderedSegments = (segment_no: number) =>
                orderedGroupsOfOrderedSegments
                    .flat()
                    .find(
                        (orderedSeg) =>
                            data.segments.find(
                                (dataSeg) => dataSeg.segment_no === segment_no
                            ) === orderedSeg
                    );

            //! set, format, and render axes & scales
            // set yScale based on variable dimensions and number of segments
            const timeFrame = getTimeFrame();
            const yScale = scaleLinear()
                .domain([max(data.segments, ({ position }) => position)!, 0])
                .range([
                    dimensions.heightPerSegment * data.map.num_segments,
                    0,
                ]);

            // format yAxis to have one tick per segment with names aligned to the orientation of the data
            const yAxis = axisRight(yScale)
                .ticks(data.map.num_segments)
                .tickFormat(
                    (_, i) =>
                        orderedGroupsOfOrderedSegments.flat().reverse()[i].name
                );

            // render yAxis, with distance from time=0 varying based on font-size and the space taken up by the longest segment name
            selection
                .append('g')
                .call(yAxis)
                .attr('transform', `translate(${-1 * computeYAxisOffset()}, 0)`)
                // color labels appropriately using sorted order
                .call((g) =>
                    g
                        .selectAll('text')
                        .attr(
                            'fill',
                            (_, i) =>
                                '#' +
                                orderedGroupsOfOrderedSegments.flat().reverse()[
                                    i
                                ].hexadecimal
                        )
                        .attr(
                            'font-size',
                            `${dimensions.segmentNameFontSize}px`
                        )
                )
                // color group rectangles appropriately using sorted order
                .call((g) =>
                    g
                        .selectAll('line')
                        .attr(
                            'stroke',
                            (_, i) =>
                                '#' +
                                data.groups.find(
                                    ({ group_no }) =>
                                        orderedGroupsOfOrderedSegments
                                            .flat()
                                            .reverse()[i].group_no === group_no
                                )?.hexadecimal
                        )
                        .attr('stroke-width', dimensions.heightPerSegment + 1)
                )
                // hide axis decorations
                .select('.domain')
                .attr('opacity', 0);

            // set xScale based on variable dimensions and chronotope period
            const xScale = scaleLinear()
                .domain([
                    new Date(min(data.chronotope, ({ hit_time }) => hit_time)!),
                    new Date(max(data.chronotope, ({ hit_time }) => hit_time)!),
                ])
                .range([0, dimensions.widthPerDay * timeFrame]);

            // format and render xAxis (import axisBottom from d3-axis to use)
            /* const xAxis = axisBottom(xScale)
                .ticks(Math.round(timeFrame / 10) * 10)
                // .tickFormat((time, i) => (i + 1).toString());
                .tickFormat((time, i) => '');
            selection
                .append('g')
                .call(xAxis)
                .attr(
                    'transform',
                    `translate(0, ${
                        dimensions.heightPerSegment * data.map.num_segments
                    })`
                ); */

            //! event handlers
            // use data of a particular node to gather associated information
            const composeTargetNodeFromHover = (
                e: any,
                nodeToTarget: Chronotope
            ): TargetNode | null => {
                e.preventDefault();
                e.stopPropagation();
                const currentSegment = getSegmentNoFromOrderedSegments(
                    nodeToTarget.segment_no
                );
                if (currentSegment) {
                    const currentGroup = data.groups.find(
                        ({ group_no }) => group_no === currentSegment.group_no
                    );
                    return {
                        message_id: nodeToTarget.message_id,
                        hit_time: nodeToTarget.hit_time,
                        segment_name: currentSegment.name,
                        segment_hex: currentSegment.hexadecimal,
                        group_name: currentGroup?.name ?? targetErrorString,
                        group_hex:
                            currentGroup?.hexadecimal ?? targetErrorString,
                    };
                }
                return null;
            };

            //! plot data
            selection
                .selectAll()
                .data(data.chronotope)
                .enter()
                .append('circle')
                .attr('cx', ({ hit_time }) => xScale(new Date(hit_time)))
                // compensate for the reordering of the y-axis by mapping `segment_no` in chronotope node data to associated label
                .attr('cy', ({ segment_no }) =>
                    yScale(
                        orderedGroupsOfOrderedSegments
                            .flat()
                            .indexOf(
                                getSegmentNoFromOrderedSegments(segment_no) ??
                                    orderedGroupsOfOrderedSegments[0][0]
                            )
                    )
                )
                .attr('r', 2)
                // fill circle with appropriate color, again by compensating for the reordering of the y-axis
                .attr(
                    'fill',
                    ({ segment_no }) =>
                        '#' +
                            getSegmentNoFromOrderedSegments(segment_no)
                                ?.hexadecimal ?? 'red'
                )
                .on('mouseenter', (event, chronotope) => {
                    setTargetNode(
                        composeTargetNodeFromHover(event, chronotope)
                    );
                    // add outline to hovered node
                    event.srcElement?.setAttribute(
                        'style',
                        `outline: 1px solid ${hoverColor};`
                    );
                })
                .on('mouseleave', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setTargetNode(null);
                    // remove outline when node is no longer hovered
                    event.srcElement?.setAttribute('style', 'outline: unset');
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selection, targetNode?.message_id]);

    return (
        <div className="App">
            {data ? (
                <div>
                    <MapTitleDisplay
                        titleString={titleString}
                        mapName={data.map.name}
                    />
                    <svg ref={svgRef} />
                    <NodeDataDisplay
                        targetNode={targetNode ?? null}
                        displayFontSize={displayFontSize}
                    />
                </div>
            ) : fetchingError ? (
                <ErrorDisplay errorString={errorString} />
            ) : (
                <LoadingDisplay loadingString={loadingString} />
            )}
        </div>
    );
};

export default App;
