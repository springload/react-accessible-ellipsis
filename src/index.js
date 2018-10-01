import React from "react";

const DEFAULT_ELLIPSIS = "\u2026";
const PIXEL_ROUNDING_BUFFER = 1;

export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props);
    this.reflowEllipsis = this.reflowEllipsis.bind(this);
    this.renderEllipsisAt = this.renderEllipsisAt.bind(this);
    this.moveEllipsis = this.moveEllipsis.bind(this);

    this.ellipsisNode = document.createElement("span");
    this.ellipsisNode.setAttribute("aria-hidden", true);
    this.ellipsisNode.style.userSelect = "none"; // disable text selection. Don't care about non-standard browser prefixes.
    this.ellipsisNode.setAttribute("unselectable", "on"); // IE < 10 and Opera < 15 https://stackoverflow.com/a/4358620
    this.ellipsisNode.textContent = this.props.ellipsis || DEFAULT_ELLIPSIS;
  }

  componentDidMount() {
    this.mounted = true;
    this.reflowEllipsis();
    window.addEventListener("resize", this.reflowEllipsis);
    window.addEventListener("orientationchange", this.reflowEllipsis);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("resize", this.reflowEllipsis);
    window.removeEventListener("orientationchange", this.reflowEllipsis);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.children !== this.props.children;
  }

  reflowEllipsis() {
    if (this.ellipsisNode.parentNode) {
      this.containerNode.removeChild(this.ellipsisNode);
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.offset = this.props.children.length;
    this.containerNode.textContent = this.props.children;
    this.moveEllipsis();
  }

  moveEllipsis() {
    if (!this.containerNode) {
      if (this.mounted) {
        this.timer = setTimeout(this.moveEllipsis, 1000 / 60);
      }
      return;
    }

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
    if (this.ellipsisNode && this.ellipsisNode.parentNode) {
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
    const offset = this.offset || this.props.children.length;
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

    this.offset = newOffset;
    this.renderEllipsisAt(this.offset);
    this.timer = setTimeout(this.moveEllipsis, 1000 / 60);
  }

  renderEllipsisAt(offset) {
    if (offset === undefined || offset === this.props.children.length) {
      this.containerNode.innerText = this.props.children;
      return;
    }

    while (this.containerNode.firstChild) {
      this.containerNode.removeChild(this.containerNode.firstChild);
    }

    this.containerNode.appendChild(
      document.createTextNode(this.props.children.substr(0, offset))
    );
    this.containerNode.appendChild(this.ellipsisNode);
    this.containerNode.appendChild(
      document.createTextNode(this.props.children.substr(offset))
    );
  }

  render() {
    const { children, className, style } = this.props;

    if (this.offset !== undefined) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this.reflowEllipsis, 1000 / 60);
    }

    return (
      <div
        ref={containerNode => {
          this.containerNode = containerNode;
        }}
        className={className}
        style={{
          position: "relative", // needed to calculate location of child nodes
          overflow: "hidden", // they can always override this with style if they have any niche use-cases for ellipsis and overflow: 'visible'
          ...style
        }}
      >
        {children}
      </div>
    );
  }
}
