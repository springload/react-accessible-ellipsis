import React, { Fragment } from "react";
// import FontFaceObserver from 'font-face-observer';

const SIXTY_FPS = 1000 / 60;
const DEFAULT_ELLIPSIS = "\u2026";
const DEFAULT_ELLIPSIS_CLASS = "rae-ellipsis";
const PIXEL_ROUNDING_BUFFER = 1.5; // Browsers sometimes calculate heights of DOM elements, or scrollHeight, by rounding up to nearest integer... so to compare for 'equality' we use this constant to find near numbers.
const DEFAULT_MUTATION_WATCHER_MILLISECONDS = 15;
const MAX_MUTATION_WATCHER_MILLISECONDS = 10000;

const EllipsisContext = React.createContext();

export class EllipsisProvider extends React.Component {
  state = {
    isOpen: false,
  };
  render() {
    return (
      <EllipsisContext.Provider
        value={{
          state: this.state,
          toggleExpandCollapse: () => {
            this.setState({ isOpen: !this.state.isOpen });
            //TODO: this is a bit yuck and causes jank when clicking 'show less'
            window.dispatchEvent(new Event("resize"));
          },
        }}
      >
        {this.props.children}
      </EllipsisContext.Provider>
    );
  }
}

export const DefaultToggleButton = props => {
  //TODO: spread other {...props} in, e.g. custom data attributes etc
  return (
    <button aria-hidden onClick={props.onClick} className={props.className}>
      {props.children}
    </button>
  );
};

export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // canOverflow means that an ellipsis CAN show, based on content width/height.
      // It may not be showing though, e.g. if expanded is toggled.
      canOverflow: false,
    };
    this.reflowEllipsis = this.debounce(
      this.reflowEllipsis.bind(this),
      SIXTY_FPS
    );
    this.reflowIfSizeChange = this.reflowIfSizeChange.bind(this);
    this.renderEllipsisAt = this.renderEllipsisAt.bind(this);
    this.moveEllipsis = this.moveEllipsis.bind(this);
    this.ellipsisNode = document.createElement("span");
    this.ellipsisNode.setAttribute("aria-hidden", true);
    this.ellipsisNode.style.userSelect = "none"; // disable text selection. Don't care about non-standard browser prefixes.
    this.ellipsisNode.setAttribute("unselectable", "on"); // IE < 10 and Opera < 15 https://stackoverflow.com/a/4358620
    this.ellipsisNode.className =
      props.ellipsisClassName || DEFAULT_ELLIPSIS_CLASS;
    this.ellipsisNode.textContent = this.props.ellipsis || DEFAULT_ELLIPSIS;
    this.mutationWatcherMilliseconds = DEFAULT_MUTATION_WATCHER_MILLISECONDS;
  }

  debounce(fn, delayMilliseconds) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delayMilliseconds);
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.containerScrollHeight = this.containerNode.scrollHeight;
    window.addEventListener("resize", this.reflowEllipsis);
    window.addEventListener("orientationchange", this.reflowEllipsis);

    // Fonts may load later and affect ellipsis placement.
    // This abandoned code might be useful in the future.
    // window
    //   .getComputedStyle(this.containerNode)
    //   .fontFamily // technically a font name could have "," in it.
    //   // Eg
    //   //    Verdana, "Tahoma (collapse, resonant)", Arial, sans-serif
    //   // but seems so unlikely that we'll wait for the bug report before adding that parsing complexity
    //   .split(',')
    //   .forEach(fontName =>
    //     new FontFaceObserver(fontName.replace(/^\s*"/, '').replace(/"\s*$/, ''))
    //       .check()
    //       .then(this.reflowEllipsis)
    //  );
    this.timer = setTimeout(this.reflowEllipsis, SIXTY_FPS);
    setTimeout(this.reflowIfSizeChange, this.mutationWatcherMilliseconds);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("resize", this.reflowEllipsis);
    window.removeEventListener("orientationchange", this.reflowEllipsis);
  }

  reflowIfSizeChange() {
    if (!this.mounted) return;
    // Fonts loading can affect the correct ellipsis placement, yet it's hard to know if
    // fonts changed or what font was used.
    setTimeout(this.reflowIfSizeChange, this.mutationWatcherMilliseconds);
    if (this.containerScrollHeight === this.containerNode.scrollHeight) {
      this.mutationWatcherMilliseconds =
        this.mutationWatcherMilliseconds *
        (DEFAULT_MUTATION_WATCHER_MILLISECONDS / 10);
      if (
        this.mutationWatcherMilliseconds > MAX_MUTATION_WATCHER_MILLISECONDS
      ) {
        this.mutationWatcherMilliseconds = MAX_MUTATION_WATCHER_MILLISECONDS;
      }
      return;
    }

    this.mutationWatcherMilliseconds = DEFAULT_MUTATION_WATCHER_MILLISECONDS;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.reflowEllipsis, SIXTY_FPS);
    this.containerScrollHeight = this.containerNode.scrollHeight;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.canOverflow !== this.state.canOverflow;
  }

  hasOverflow = () => {
    const viewableDifference = Math.abs(
      (this.containerNode.scrollHeight - this.containerNode.clientHeight) / 2
    );
    // testing this rather than whether there's a height because any set height may be
    // enough to contain the element, so really we need to check whether the element is
    // fully visible
    const noOverflow = viewableDifference < PIXEL_ROUNDING_BUFFER;
    if (noOverflow) {
      return false;
    } else {
      return true;
    }
  };

  reflowEllipsis() {
    if (!this.mounted) return;
    if (this.ellipsisNode.parentNode) {
      this.setState({ canOverflow: true });
      this.containerNode.removeChild(this.ellipsisNode);
    } else {
      this.setState({ canOverflow: false });
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
      if (!this.mounted) return;
      this.timer = setTimeout(this.moveEllipsis, SIXTY_FPS);
    }

    //there's no overflow, therefore no ellipsis to move
    if (!this.hasOverflow()) return;

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
        this.setState({ canOverflow: true });
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
    this.timer = setTimeout(this.moveEllipsis, SIXTY_FPS);
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
    const {
      children,
      className,
      style,
      showToggleButton,
      customButton,
      clickTextToToggle,
      showMoreText,
      showLessText,
    } = this.props;

    const { canOverflow } = this.state;

    const showMoreLabel = showMoreText || "Show more";
    const showLessLabel = showLessText || "Show less";

    if (this.offset !== undefined) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this.reflowEllipsis, SIXTY_FPS);
    }

    return (
      <EllipsisContext.Consumer>
        {context => (
          <Fragment>
            <p>canOverflow: {canOverflow ? "yes" : "no"}</p>
            <div
              ref={containerNode => {
                this.containerNode = containerNode;
              }}
              onClick={
                !!(clickTextToToggle && canOverflow)
                  ? context.toggleExpandCollapse
                  : null
              }
              className={`${className} rae-text ${
                context.state.isOpen ? "rae-text__open" : "rae-text__closed"
              }`}
              style={{
                position: "relative", // needed to calculate location of child nodes
                overflow: context.state.isOpen ? "visible" : "hidden",
                height: context.state.isOpen ? "auto" : null,
                ...style,
              }}
            >
              {children}
            </div>
            {showToggleButton && canOverflow && (
              <Fragment>
                {customButton ? (
                  customButton(
                    context.state.isOpen,
                    context.toggleExpandCollapse,
                    showMoreLabel,
                    showLessLabel
                  )
                ) : (
                  <DefaultToggleButton
                    isOpen={context.state.isOpen}
                    onClick={context.toggleExpandCollapse}
                    className={`rae-toggle-btn ${
                      context.state.isOpen
                        ? "rae-toggle-btn__open"
                        : "rae-toggle-btn__closed"
                    }`}
                  >
                    {context.state.isOpen ? showLessText : showMoreText}
                  </DefaultToggleButton>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </EllipsisContext.Consumer>
    );
  }
}
