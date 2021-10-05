import { FC } from 'react';

export const ErrorDisplay: FC<{ errorString: string }> = ({ errorString }) => (
    <h2>{errorString}</h2>
);
