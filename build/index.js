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

var DEFAULT_ELLIPSIS = "\u2026";
var NBSP = "\xA0";

var Ellipsis = function (_React$Component) {
  _inherits(Ellipsis, _React$Component);

  function Ellipsis(props) {
    _classCallCheck(this, Ellipsis);

    var _this = _possibleConstructorReturn(this, (Ellipsis.__proto__ || Object.getPrototypeOf(Ellipsis)).call(this, props));

    _this.reflowEllipsis = _this.reflowEllipsis.bind(_this);
    _this.renderEllipsisAt = _this.renderEllipsisAt.bind(_this);
    _this.moveEllipsis = _this.moveEllipsis.bind(_this);

    _this.ellipsisNode = document.createElement("span");
    _this.ellipsisNode.setAttribute("aria-hidden", true);
    _this.ellipsisNode.textContent = _this.props.ellipsis || DEFAULT_ELLIPSIS;
    _this.whitespaceNode = document.createElement("div");
    _this.whitespaceNode.textContent = NBSP;
    _this.whitespaceNode.style.height = "100px";
    _this.whitespaceNode.style.width = "100%";
    return _this;
  }

  _createClass(Ellipsis, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.reflowEllipsis();
      window.addEventListener("resize", this.reflowEllipsis);
      window.addEventListener("orientationchange", this.reflowEllipsis);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("resize", this.reflowEllipsis);
      window.removeEventListener("orientationchange", this.reflowEllipsis);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      return nextProps.children !== this.props.children;
    }
  }, {
    key: "reflowEllipsis",
    value: function reflowEllipsis() {
      if (this.ellipsisNode.parentNode) {
        this.containerNode.removeChild(this.ellipsisNode);
        this.ellipsisNode = null;
      }
      this.offset = this.props.children.length;
      this.moveEllipsis();
    }
  }, {
    key: "moveEllipsis",
    value: function moveEllipsis() {
      if (!this.containerNode || this.containerNode.scrollHeight === undefined) {
        return;
      }
      var PIXEL_ROUNDING_BUFFER = 1;
      var viewableDifference = Math.abs((this.containerNode.scrollHeight - this.containerNode.clientHeight) / 2);
      // testing this rather that whether there's a height because any set height may be
      // enough to contain the element, so really we need to check whether the element is
      // fully visible
      var noOverflow = viewableDifference < PIXEL_ROUNDING_BUFFER;
      if (noOverflow) {
        // then just exit
        return;
      }
      if (this.ellipsisNode) {
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
      var offset = this.offset;
      var reverseChildren = this.props.children.split("").reverse().join("");
      var newOffsetIndexOf = reverseChildren.indexOf(" ", reverseChildren.length - offset + 1);

      var newOffset = newOffsetIndexOf !== -1 ? reverseChildren.length - newOffsetIndexOf - 1 : undefined;

      this.offset = newOffset;
      this.renderEllipsisAt(this.offset);
      setTimeout(this.moveEllipsis, 2000);
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
      this.containerNode.appendChild(this.whitespaceNode);
      this.containerNode.appendChild(document.createTextNode(this.props.children.substr(offset)));
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          className = _props.className,
          style = _props.style;


      if (this.offset !== undefined) {
        requestAnimationFrame(this.moveEllipsis);
      }

      return _react2.default.createElement(
        "div",
        {
          ref: function ref(containerNode) {
            _this2.containerNode = containerNode;
          },
          className: className,
          style: _extends({
            position: "relative", // needed to calculate location of child nodes
            overflow: "hidden" }, style)
        },
        children
      );
    }
  }]);

  return Ellipsis;
}(_react2.default.Component);

exports.default = Ellipsis;
