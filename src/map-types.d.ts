export interface Chronotope {
    node_id: string;
    message_id: string;
    hit_time: string;
    segment_no: number;
}

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

export interface Segment {
    identification: number;
    segment_no: number;
    group_no: number;
    name: string;
    position: number;
    hexadecimal: string;
    num_nodes: number;
}

export type MapData = {
    map: ChartMap;
    groups: Group[];
    segments: Segment[];
    chronotope: Chronotope[];
};

export interface TargetNode {
    message_id: string;
    hit_time: string;
    segment_name: string;
    segment_hex: string;
    group_name: string;
    group_hex: string;
}

type API_KEY = 'map' | 'groups' | 'segments' | 'chronotope';

type API_CALLBACK = ChartMap | Group[] | Segment[] | Chronotope[];

export type ApiPool = {
    key: API_KEY;
    callback: () => Promise<API_CALLBACK>;
}[];
