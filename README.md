## Data Visualization made with D3.js, React & TypeScript

[![Netlify Status](https://api.netlify.com/api/v1/badges/1797b1cf-9dea-4ee2-ae50-f544a244eb4a/deploy-status)](https://app.netlify.com/sites/elastic-yalow-cf01f5/deploys)

### [![wakatime](https://wakatime.com/badge/github/irackson/beertrends-d3-react.svg)](https://wakatime.com/badge/github/irackson/beertrends-d3-react) + [![wakatime](https://wakatime.com/badge/github/irackson/d3-data-visualization.svg)](https://wakatime.com/badge/github/irackson/d3-data-visualization)

---

The goal of this application is to display chronotope information for a map in a single page: a chronotope is a scatter-plot-like visualization that displays the usages of a specific hashtag over time by nodes within specific segments or groups of a map.

### API

There are four mock API endpoints corresponding to the information architecture and hierarchy:

-   `fetchMap()` returns the metadata for a single map. A chronotope page is always within the context of a single map. A map contains groups, which in turn contain segments.

<pre><code class="language-javascript">
export interface ChartMap {
    identification: number;
    name: string;
    description: string;
    type: string;
    created_at: string;
    num_nodes: number;
    num_groups: number;
    num_segments: number;
}
</code></pre>

-   `fetchGroups()` returns the metadata for all of the groups of segments for a map. Groups are ordered by their `position` property and are unique identified within a map via their `group_no` property.

<pre><code class="language-javascript">
export interface Group {
    identification: number;
    group_no: number;
    name: string;
    description: string;
    position: number;
    hexadecimal: string;
    num_segments: number;
    num_nodes: number;
}
</code></pre>

-   `fetchSegments()` returns the metadata for all of the segments for a map. Each segment is a collection of Twitter users. The segment object has a pointer `group_no` that that tells you which group it's in (it matches to a group's corresponding `group_no` property). Segments are ordered by their `position` property and are uniquely identified within a map via their `segment_no` property.

<pre><code class="language-javascript">
export interface Segment {
    identification: number;
    segment_no: number;
    group_no: number;
    name: string;
    position: number;
    hexadecimal: string;
    num_nodes: number;
}
</code></pre>

-   `fetchChronotopeData()` returns an array of occurrences for the hashtag `#craftbeer` in this map. Each one will have a `hit_time` that tells you when (in UTC) the hashtag was used, and the `segment_no` which tells you in which segment the user of this hashtag belongs in (it matches to a segment's corresponding `segment_no` property).

<pre><code class="language-javascript">
export interface Chronotope {
	node_id: string;
	message_id: string;
	hit_time: string;
	segment_no: number;
}
</code></pre>

### Deliverable

The business requirements for this exercise is to have the React application render the chronotope visualization with the following must-haves:

-   There should be a title on the page that contains the map's name
-   There should be a visualization with two axes:
    -   The x-axis is time, starting from the earliest occurrence in the chronotope data, and ending with the latest occurrence in the chronotope data
    -   The y-axis has a categorical entry for each segment, depending on the grouping mode.
    -   The y-axis values should be ordinally sorted by the following criterion: by the group's `position` ascending, then by the segment's `position` ascending. Example: if two values corresponding to segments A and B have positions 12 and 3, but A's group has position 2 and B's group has position 4, then A should come before B. If A and B belongs in the same group, then A should come after B.
-   The visualization must render a data point corresponding to the appropriate X and Y coordinate based on when an occurrence happened (x-value) and in which segment the occurrence happened (y-value). One data point should be rendered per occurrence.
-   Each data point rendered on the page should have the same color as the segment that it belongs to. The color of a segment is dictated by its `hexadecimal` property (which is a hex value).
-   When clicking on a data point, there should be an informational block appearing somewhere on the page that lists the details of the occurrence:
    -   When the occurrence happened
    -   The name of the segment in which it happened, this text should be colored by the segment's `hexadecimal`.
    -   The name of the group in which it happened, this text should be colored by the group's `hexadecimal`.

---

<!-- title -->

Hashtags Over Time

<!-- description -->

A customizable data visualization that concurrently fetches and displays historical Twitter trends

<!-- live url -->

<https://d3-data-visualization.ianrackson.com/>

<!-- repo url -->

<https://github.com/irackson/d3-data-visualization>

<!-- thumbnail -->

<https://i.imgur.com/AbDW6T1.png>
