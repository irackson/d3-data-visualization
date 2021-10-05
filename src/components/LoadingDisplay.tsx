import { FC } from 'react';

export const LoadingDisplay: FC<{ loadingString: string }> = ({
    loadingString,
}) => <h2>{loadingString}</h2>;
