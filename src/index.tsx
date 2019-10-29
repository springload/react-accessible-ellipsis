import React, {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ReactChild,
  CSSProperties
} from "react";

type Props = {
  children: ReactChild;
  ellipsis?: string | undefined; // defaults to "…" (U+2026)
  className?: string | undefined;
  tagName?: string | undefined; // defaults to 'div'
  pixelRoundingBuffer?: number | undefined;
  style?: CSSProperties | undefined;
  ellipsisWithinCharacterBoxRatio?: number | undefined;
  debug?: boolean | undefined; // whether to log internal status to console
};

export default function Ellipsis(props: Props): ReactNode {
  const {
    tagName = "div",
    ellipsis = DEFAULT_ELLIPSIS,
    children,
    className = "",
    pixelRoundingBuffer = DEFAULT_PIXEL_ROUNDING_BUFFER,
    style,
    debug = false,
    ellipsisWithinCharacterBoxRatio = DEFAULT_ELLIPSIS_WITHIN_CHARACTER_BOX_RATIO
  } = props;

  // Window size may change and ellipsis should recalculate
  const size = useWindowSize();
  // Fonts may load later and affect ellipsis placement however we don't currently handle that. Any ideas?

  if (typeof children !== "string") throw Error(CHILDREN_STRING_ERROR);

  const reverseChildren = children
    .split("")
    .reverse()
    .join("");

  const onMount = useCallback(
    (containerElement: HTMLElement | null) => {
      if (containerElement === null) return;

      const ellipsisElement = document.createElement("span");
      ellipsisElement.setAttribute("aria-hidden", "true");
      ellipsisElement.style.userSelect = "none"; // disable text selection. Don't care about non-standard browser prefixes.
      ellipsisElement.setAttribute("unselectable", "on"); // IE < 10 and Opera < 15 https://stackoverflow.com/a/4358620
      ellipsisElement.textContent = ellipsis;

      let timer;
      let offset = children.length;

      const hasOverflow =
        Math.abs(
          // Math.abs to ensure positive number
          containerElement.scrollHeight - containerElement.clientHeight
        ) < pixelRoundingBuffer;

      function ellipsisIsVisible() {
        const ellipsisVisibleHeight =
          ellipsisElement.offsetHeight * ellipsisWithinCharacterBoxRatio;
        const ellipsisTop = ellipsisElement
          ? ellipsisElement.offsetTop + ellipsisVisibleHeight
          : 0;
        return ellipsisTop <= containerElement.offsetHeight;
      }

      if (!hasOverflow) {
        if (debug) {
          info(
            `(step 1) Container has overflow. About to add ellipsis. Offset ${offset}.`
          );
        }
        containerElement.appendChild(ellipsisElement);
        // Any ellipsis character's height will include space for descenders (eg with "y" how
        // the tail goes below the line) even though an ellipsis doesn't have one

        function nextWhitespace(offset: number, children: string): number {
          const reversedOffset = reverseChildren.indexOf(
            " ",
            reverseChildren.length - offset + 1
          );
          return reversedOffset !== -1
            ? reverseChildren.length - reversedOffset - 1
            : -1;
        }

        if (ellipsisIsVisible()) {
          // if it's immediately visible then it's likely that
          // the container overflow is only a few pixels, so we should remove the
          // ellipsis
          containerElement.removeChild(ellipsisElement);
          if (debug) {
            info(
              "(step 2) Ellipsis is visible on first move. Removing ellipsis and stopping."
            );
          }
        } else {
          function moveEllipsis() {
            if (typeof children !== "string")
              throw Error(CHILDREN_STRING_ERROR);

            const newOffset = nextWhitespace(offset, children);

            if (newOffset === -1) {
              if (debug)
                info(
                  `(step 3) Can't find whitespace to move to. Offset was ${offset}. Stopping.`
                );
              return;
            }

            offset = newOffset;

            while (containerElement.firstChild) {
              containerElement.removeChild(containerElement.firstChild);
            }

            containerElement.appendChild(
              document.createTextNode(children.substring(0, offset))
            );
            containerElement.appendChild(ellipsisElement);

            const remainingText = document.createElement("span");
            remainingText.style.cssText = `
              position: absolute; /* Outside the DOM flow */
              height: 1px;
              width: 1px; /* Nearly collapsed */
              overflow: hidden;
              clip: rect(1px 1px 1px 1px); /* IE 7+ only support clip without commas */
              clip: rect(1px, 1px, 1px, 1px); /* All other browsers */
            `
            remainingText.textContent = children.substring(offset);

            containerElement.appendChild(remainingText);

            if (!ellipsisIsVisible()) {
              if (debug)
                info(
                  `(step 2) Ellipsis not yet visible. Offset ${offset}. Recursing...`
                );
              moveEllipsis()
            } else {
              if (debug)
                info(
                  `(step 3) Ellipsis now visible. Offset ${offset}. Stopping.`
                );
            }
          }
          moveEllipsis()
        }
      } else if (debug) {
        info(
          "(step 1) Container has no overflow. No need for ellipsis. Stopping."
        );
      }
      return () => {
        containerElement.removeChild(ellipsisElement);
        if (timer) cancelAnimationFrame(timer);
      };
    },
    [children, size, reverseChildren, ellipsis, className, style]
  );

  return React.createElement(
    tagName,
    {
      ref: onMount,
      className,
      style: {
        display: "block", // allow using tags that are inline by default
        position: "relative", // needed to calculate location of child nodes
        overflow: "hidden", // they can always override this with style if they have any niche use-cases for ellipsis and overflow: 'visible'
        ...style
      }
    },
    children
  );
}

function useWindowSize() {
  // Via https://usehooks.com/useWindowSize/
  const isClient = typeof window === "object";

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

function info(...args) {
  console.info("react-accessible-ellipsis", ...args);
}

const DEFAULT_ELLIPSIS = "\u2026";
const DEFAULT_PIXEL_ROUNDING_BUFFER = 1.5; // Browsers sometimes calculate heights of DOM elements, or scrollHeight, by rounding up to nearest integer... so we need a certain threshold to compare similarly sized things
const CHILDREN_STRING_ERROR =
  "The 'children' prop of react-accessible-ellipsis must be a single string. If interpolating props put them in a single template string (eg) <Ellipsis>{`${prop1} words ${prop2}`}</Ellipsis>";
const DEFAULT_ELLIPSIS_WITHIN_CHARACTER_BOX_RATIO = 1; // vertical ratio within offsetHeight that we think the ellipsis is visible. Ie, 0.9 means even if 0.1 of the bottom of the character box is cut off then it's still visible. Varies by font.
