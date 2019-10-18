import { ReactNode, ReactChild, CSSProperties } from "react";
declare type Props = {
    children: ReactChild;
    ellipsis?: string | undefined;
    className?: string | undefined;
    tagName?: string | undefined;
    pixelRoundingBuffer?: number | undefined;
    style?: CSSProperties | undefined;
    ellipsisWithinCharacterBoxRatio?: number | undefined;
    debug?: boolean | undefined;
};
export default function Ellipsis(props: Props): ReactNode;
export {};
