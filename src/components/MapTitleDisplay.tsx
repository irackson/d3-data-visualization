import { FC } from 'react';

export const MapTitleDisplay: FC<{ titleString: string; mapName: string }> = ({
    titleString,
    mapName,
}) => <h2>{`${titleString} ${mapName.replace(/_/g, ' ')}`}</h2>;
