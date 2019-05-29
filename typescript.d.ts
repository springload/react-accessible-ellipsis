import { Component, CSSProperties } from "react";

export type EllipsisProps = {
  className?: string;
  style?: CSSProperties;
  tagName?: keyof JSX.IntrinsicElements;
  children: string;
};

class Ellipsis extends Component<EllipsisProps> {}

export default Ellipsis;
