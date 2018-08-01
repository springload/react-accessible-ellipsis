import React from "react";

export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.reflowEllipsis = this.reflowEllipsis.bind(this);
    this.renderEllipsisAt = this.renderEllipsisAt.bind(this);
    this.moveEllipsis = this.moveEllipsis.bind(this);
  }

  componentDidMount() {
    this.reflowEllipsis();
    window.addEventListener("resize", this.reflowEllipsis);
    window.addEventListener("orientationchange", this.reflowEllipsis);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.reflowEllipsis);
    window.removeEventListener("orientationchange", this.reflowEllipsis);
  }

  reflowEllipsis() {
    this.setState({
      offset: this.props.children.length
    });
  }

  moveEllipsis() {
    const PIXEL_ROUNDING_BUFFER = 1;
    const viewableDifference = Math.abs(
      (this.containerNode.scrollHeight - this.containerNode.clientHeight) / 2
    );
    // testing this rather that whether there's a height because any set height may be
    // enough to contain the element, so really we need to check whether the element is
    // fully visible
    const noOverflow = viewableDifference < PIXEL_ROUNDING_BUFFER;
    if (noOverflow) {
      // then just exit
      return;
    }
    if (this.ellipsisNode) {
      // because any character's height will include descenders (y how the tail goes below the line) to the
      // tallest letter, but an ellipsis is somewhere in the middle so we don't care if the descender area
      // is covered.
      const ellipsisVisibleHeight = this.ellipsisNode.offsetHeight / 2;

      const ellipsisBottom =
        this.ellipsisNode &&
        this.ellipsisNode.offsetTop + ellipsisVisibleHeight;

      const ellipsisVisible = ellipsisBottom <= this.containerNode.offsetHeight;

      if (ellipsisVisible) {
        // job done. stop.
        return;
      }
    }
    const offset = this.state.offset || this.props.children.length;
    const reverseChildren = this.props.children
      .split("")
      .reverse()
      .join("");
    const newOffsetIndexOf = reverseChildren.indexOf(
      " ",
      reverseChildren.length - offset + 1
    );

    const newOffset =
      newOffsetIndexOf !== -1
        ? reverseChildren.length - newOffsetIndexOf - 1
        : undefined;

    this.setState({ offset: newOffset });
  }

  render() {
    const { children, className, style } = this.props;
    const { offset } = this.state;

    if (offset !== undefined) {
      requestAnimationFrame(this.moveEllipsis);
    }

    return (
      <div
        ref={containerNode => {
          this.containerNode = containerNode;
        }}
        className={className}
        style={{
          position: "relative", // needed to calculate location of child nodes
          overflow: "hidden",
          ...style
        }}
      >
        {this.renderEllipsisAt(children, offset)}
      </div>
    );
  }

  renderEllipsisAt(children, offset) {
    if (offset === undefined || offset === children.length) {
      return children;
    }
    return (
      <React.Fragment>
        {children.substr(0, offset)}
        <span
          ref={ellipsisNode => {
            this.ellipsisNode = ellipsisNode;
          }}
          aria-hidden
        >
          {this.props.ellipsis || "\u2026"}
        </span>
        {children.substr(offset)}
      </React.Fragment>
    );
  }
}
