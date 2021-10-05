import { FC } from 'react';
import { TargetNode } from '../map-types';

export const NodeDataDisplay: FC<{
    targetNode: TargetNode | null | undefined;
    displayFontSize: number;
}> = ({ targetNode, displayFontSize }) => (
    <div
        style={{
            width: 'min-content',
            height: `${displayFontSize * 4}rem`,
        }}
    >
        {targetNode && (
            <div
                className="node-data"
                style={{ fontSize: `${displayFontSize}rem` }}
            >
                <p>
                    Timestamp:{` `}
                    <span>{targetNode.hit_time}</span>
                </p>
                <p>
                    Associated Cluster:{` `}
                    <span style={{ color: `#${targetNode.segment_hex}` }}>
                        {targetNode.segment_name}
                    </span>
                </p>
                <p>
                    Associated Group:{` `}
                    <span style={{ color: `#${targetNode.group_hex}` }}>
                        {targetNode.group_name}
                    </span>
                </p>
            </div>
        )}
    </div>
);
