"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import FontFaceObserver from 'font-face-observer';

var SIXTY_FPS = 1000 / 60;
var DEFAULT_ELLIPSIS = "\u2026";
var PIXEL_ROUNDING_BUFFER = 1.5; // Browsers sometimes calculate heights of DOM elements, or scrollHeight, by rounding up to nearest integer... so to compare for 'equality' we use this constant to find near numbers.
var DEFAULT_MUTATION_WATCHER_MILLISECONDS = 15;
var MAX_MUTATION_WATCHER_MILLISECONDS = 10000;

var Ellipsis = function (_React$Component) {
  _inherits(Ellipsis, _React$Component);

  function Ellipsis(props) {
    _classCallCheck(this, Ellipsis);

    var _this = _possibleConstructorReturn(this, (Ellipsis.__proto__ || Object.getPrototypeOf(Ellipsis)).call(this, props));

    _this.reflowEllipsis = _this.debounce(_this.reflowEllipsis.bind(_this), SIXTY_FPS);
    _this.reflowIfSizeChange = _this.reflowIfSizeChange.bind(_this);
    _this.renderEllipsisAt = _this.renderEllipsisAt.bind(_this);
    _this.moveEllipsis = _this.moveEllipsis.bind(_this);
    _this.mutationWatcherMilliseconds = DEFAULT_MUTATION_WATCHER_MILLISECONDS;
    return _this;
  }

  _createClass(Ellipsis, [{
    key: "debounce",
    value: function debounce(fn, delayMilliseconds) {
      var timer = void 0;
      return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, delayMilliseconds);
      };
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.mounted = true;
      this.containerScrollHeight = this.containerNode.scrollHeight;
      window.addEventListener("resize", this.reflowEllipsis);
      window.addEventListener("orientationchange", this.reflowEllipsis);

      this.ellipsisNode = document.createElement("span");
      this.ellipsisNode.setAttribute("aria-hidden", true);
      this.ellipsisNode.style.userSelect = "none"; // disable text selection. Don't care about non-standard browser prefixes.
      this.ellipsisNode.setAttribute("unselectable", "on"); // IE < 10 and Opera < 15 https://stackoverflow.com/a/4358620
      this.ellipsisNode.textContent = this.props.ellipsis || DEFAULT_ELLIPSIS;

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
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener("resize", this.reflowEllipsis);
      window.removeEventListener("orientationchange", this.reflowEllipsis);
    }
  }, {
    key: "reflowIfSizeChange",
    value: function reflowIfSizeChange() {
      if (!this.mounted) return;
      // Fonts loading can affect the correct ellipsis placement, yet it's hard to know if
      // fonts changed or what font was used.
      setTimeout(this.reflowIfSizeChange, this.mutationWatcherMilliseconds);
      if (this.containerScrollHeight === this.containerNode.scrollHeight) {
        this.mutationWatcherMilliseconds = this.mutationWatcherMilliseconds * (DEFAULT_MUTATION_WATCHER_MILLISECONDS / 10);
        if (this.mutationWatcherMilliseconds > MAX_MUTATION_WATCHER_MILLISECONDS) {
          this.mutationWatcherMilliseconds = MAX_MUTATION_WATCHER_MILLISECONDS;
        }
        // console.log('Same scroll height.', this.mutationWatcherMilliseconds);
        return;
      }
      this.mutationWatcherMilliseconds = DEFAULT_MUTATION_WATCHER_MILLISECONDS;
      // console.log(
      //   'Scroll height change, so reflow',
      //   this.containerScrollHeight,
      //   'vs',
      //   this.containerNode.scrollHeight,
      //   this.mutationWatcherMilliseconds
      // );
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this.reflowEllipsis, SIXTY_FPS);
      this.containerScrollHeight = this.containerNode.scrollHeight;
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      return nextProps.children !== this.props.children;
    }
  }, {
    key: "reflowEllipsis",
    value: function reflowEllipsis() {
      if (!this.mounted) return;
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
  }, {
    key: "moveEllipsis",
    value: function moveEllipsis() {
      if (!this.containerNode) {
        if (!this.mounted) return;
        this.timer = setTimeout(this.moveEllipsis, SIXTY_FPS);
      }

      var viewableDifference = Math.abs((this.containerNode.scrollHeight - this.containerNode.clientHeight) / 2);
      // testing this rather that whether there's a height because any set height may be
      // enough to contain the element, so really we need to check whether the element is
      // fully visible
      var noOverflow = viewableDifference < PIXEL_ROUNDING_BUFFER;
      if (noOverflow) {
        // then just exit
        return;
      }
      if (this.ellipsisNode && this.ellipsisNode.parentNode) {
        // because any character's height will include descenders (y how the tail goes below the line) to the
        // tallest letter, but an ellipsis is somewhere in the middle so we don't care if the descender area
        // is covered.
        var ellipsisVisibleHeight = this.ellipsisNode.offsetHeight / 2;

        var ellipsisBottom = this.ellipsisNode && this.ellipsisNode.offsetTop + ellipsisVisibleHeight;

        var ellipsisVisible = ellipsisBottom <= this.containerNode.offsetHeight;

        if (ellipsisVisible) {
          // job done. stop.
          return;
        }
      }
      var offset = this.offset || this.props.children.length;
      var reverseChildren = this.props.children.split("").reverse().join("");
      var newOffsetIndexOf = reverseChildren.indexOf(" ", reverseChildren.length - offset + 1);

      var newOffset = newOffsetIndexOf !== -1 ? reverseChildren.length - newOffsetIndexOf - 1 : undefined;

      this.offset = newOffset;
      this.renderEllipsisAt(this.offset);
      this.timer = setTimeout(this.moveEllipsis, SIXTY_FPS);
    }
  }, {
    key: "renderEllipsisAt",
    value: function renderEllipsisAt(offset) {
      if (offset === undefined || offset === this.props.children.length) {
        this.containerNode.innerText = this.props.children;
        return;
      }

      while (this.containerNode.firstChild) {
        this.containerNode.removeChild(this.containerNode.firstChild);
      }

      this.containerNode.appendChild(document.createTextNode(this.props.children.substr(0, offset)));
      this.containerNode.appendChild(this.ellipsisNode);
      this.containerNode.appendChild(document.createTextNode(this.props.children.substr(offset)));
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          tagName = _props.tagName,
          children = _props.children,
          className = _props.className,
          style = _props.style;


      if (this.offset !== undefined) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(this.reflowEllipsis, SIXTY_FPS);
      }

      return _react2.default.createElement(tagName, {
        ref: function ref(containerNode) {
          _this2.containerNode = containerNode;
        },
        className: className,
        style: _extends({
          display: "block", // allow using tags that are inline by default
          position: "relative", // needed to calculate location of child nodes
          overflow: "hidden" }, style)
      }, children);
    }
  }]);

  return Ellipsis;
}(_react2.default.Component);

Ellipsis.defaultProps = {
  tagName: 'div'
};
exports.default = Ellipsis;
