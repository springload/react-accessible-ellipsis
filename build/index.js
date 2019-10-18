"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
function Ellipsis(props) {
    const { tagName = "div", ellipsis = DEFAULT_ELLIPSIS, children, className = "", pixelRoundingBuffer = DEFAULT_PIXEL_ROUNDING_BUFFER, style, debug = false, ellipsisWithinCharacterBoxRatio = DEFAULT_ELLIPSIS_WITHIN_CHARACTER_BOX_RATIO } = props;
    // Window size may change and ellipsis should recalculate
    const size = useWindowSize();
    // Fonts may load later and affect ellipsis placement however we don't currently handle that. Any ideas?
    if (typeof children !== "string")
        throw Error(CHILDREN_STRING_ERROR);
    const reverseChildren = children
        .split("")
        .reverse()
        .join("");
    const onMount = react_1.useCallback((containerElement) => {
        if (containerElement === null)
            return;
        const ellipsisElement = document.createElement("span");
        ellipsisElement.setAttribute("aria-hidden", "true");
        ellipsisElement.style.userSelect = "none"; // disable text selection. Don't care about non-standard browser prefixes.
        ellipsisElement.setAttribute("unselectable", "on"); // IE < 10 and Opera < 15 https://stackoverflow.com/a/4358620
        ellipsisElement.textContent = ellipsis;
        const clearAllElement = document.createElement("div");
        clearAllElement.style.height = "1000px";
        let timer;
        let offset = children.length;
        const hasOverflow = Math.abs(
        // Math.abs to ensure positive number
        containerElement.scrollHeight - containerElement.clientHeight) < pixelRoundingBuffer;
        if (!hasOverflow) {
            if (debug) {
                info(`(step 1) Container has overflow. About to add ellipsis. Offset ${offset}.`);
            }
            containerElement.appendChild(ellipsisElement);
            // Any ellipsis character's height will include space for descenders (eg with "y" how
            // the tail goes below the line) even though an ellipsis doesn't have one, so we'll
            // take the offsetHeight and divide by 3 and consider that to be visible.
            function ellipsisIsVisible() {
                const ellipsisVisibleHeight = ellipsisElement.offsetHeight * ellipsisWithinCharacterBoxRatio;
                const ellipsisTop = ellipsisElement
                    ? ellipsisElement.offsetTop + ellipsisVisibleHeight
                    : 0;
                return ellipsisTop <= containerElement.offsetHeight;
            }
            function nextWhitespace(offset, children) {
                const reversedOffset = reverseChildren.indexOf(" ", reverseChildren.length - offset + 1);
                return reversedOffset !== -1
                    ? reverseChildren.length - reversedOffset - 1
                    : -1;
            }
            if (!ellipsisIsVisible()) {
                function moveEllipsis() {
                    if (typeof children !== "string")
                        throw Error(CHILDREN_STRING_ERROR);
                    const newOffset = nextWhitespace(offset, children);
                    if (newOffset === -1) {
                        if (debug)
                            info(`(step 3) Can't find whitespace to move to. Offset was ${offset}. Stopping.`);
                        return;
                    }
                    offset = newOffset;
                    while (containerElement.firstChild) {
                        containerElement.removeChild(containerElement.firstChild);
                    }
                    containerElement.appendChild(document.createTextNode(children.substring(0, offset)));
                    containerElement.appendChild(ellipsisElement);
                    containerElement.appendChild(clearAllElement);
                    containerElement.appendChild(document.createTextNode(children.substring(offset)));
                    if (!ellipsisIsVisible()) {
                        if (debug)
                            info(`(step 2) Ellipsis not yet visible. Offest ${offset}. Recursing...`);
                        timer = requestAnimationFrame(moveEllipsis);
                    }
                    else {
                        if (debug)
                            info(`(step 3) Ellipsis now visible. Offset ${offset}. Stopping.`);
                    }
                }
                timer = requestAnimationFrame(moveEllipsis);
            }
            else if (debug) {
                info("(step 2) Ellipsis is visible. Stopping.");
            }
        }
        else if (debug) {
            info("(step 1) Container has no overflow. No need for ellipsis. Stopping.");
        }
        return () => {
            containerElement.removeChild(ellipsisElement);
            if (timer)
                cancelAnimationFrame(timer);
        };
    }, [children, size, reverseChildren, ellipsis, className, style]);
    return react_1.default.createElement(tagName, {
        ref: onMount,
        className,
        style: {
            display: "block",
            position: "relative",
            overflow: "hidden",
            ...style
        }
    }, children);
}
exports.default = Ellipsis;
function useWindowSize() {
    // Via https://usehooks.com/useWindowSize/
    const isClient = typeof window === "object";
    function getSize() {
        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined
        };
    }
    const [windowSize, setWindowSize] = react_1.useState(getSize);
    react_1.useEffect(() => {
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
const DEFAULT_PIXEL_ROUNDING_BUFFER = 1.5; // Browsers sometimes calculate heights of DOM elements, or scrollHeight, by rounding up to nearest integer... so to compare for 'equality' we use this constant to find near numbers.
const CHILDREN_STRING_ERROR = "The 'children' prop of react-accessible-ellipsis must be a single string. If interpolating props put them in a single template string (eg) <Ellipsis>{`${prop1} words ${prop2}`}</Ellipsis>";
const DEFAULT_ELLIPSIS_WITHIN_CHARACTER_BOX_RATIO = 0.9; // vertical ratio within offsetHeight that we think the ellipsis is visible. Ie, 0.9 means even if 0.1 of the bottom of the character box is cut off then it's still visible. Varies by font.
//# sourceMappingURL=index.js.map