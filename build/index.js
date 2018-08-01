"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Ellipsis = function (_Component) {
  _inherits(Ellipsis, _Component);

  function Ellipsis(props) {
    _classCallCheck(this, Ellipsis);

    var _this = _possibleConstructorReturn(this, (Ellipsis.__proto__ || Object.getPrototypeOf(Ellipsis)).call(this, props));

    _this.state = {};
    _this.reflowEllipsis = _this.reflowEllipsis.bind(_this);
    _this.renderEllipsisAt = _this.renderEllipsisAt.bind(_this);
    _this.moveEllipsis = _this.moveEllipsis.bind(_this);
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
    key: "reflowEllipsis",
    value: function reflowEllipsis() {
      this.setState({
        offset: this.props.children.length
      });
    }
  }, {
    key: "moveEllipsis",
    value: function moveEllipsis() {
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
      var offset = this.state.offset || this.props.children.length;
      var reverseChildren = this.props.children.split("").reverse().join("");
      var newOffsetIndexOf = reverseChildren.indexOf(" ", reverseChildren.length - offset + 1);

      var newOffset = newOffsetIndexOf !== -1 ? reverseChildren.length - newOffsetIndexOf - 1 : undefined;

      this.setState({ offset: newOffset });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          className = _props.className,
          style = _props.style;
      var offset = this.state.offset;


      if (offset !== undefined) {
        requestAnimationFrame(this.moveEllipsis);
      }

      return React.createElement(
        "div",
        {
          ref: function ref(containerNode) {
            _this2.containerNode = containerNode;
          },
          className: className,
          style: _extends({
            position: "relative", // needed to calculate location of child nodes
            overflow: "hidden"
          }, style)
        },
        this.renderEllipsisAt(children, offset)
      );
    }
  }, {
    key: "renderEllipsisAt",
    value: function renderEllipsisAt(children, offset) {
      var _this3 = this;

      if (offset === undefined || offset === children.length) {
        return children;
      }
      return React.createElement(
        _react.Fragment,
        null,
        children.substr(0, offset),
        React.createElement(
          "span",
          {
            ref: function ref(ellipsisNode) {
              _this3.ellipsisNode = ellipsisNode;
            },
            "aria-hidden": true
          },
          this.props.ellipsis || "\u2026"
        ),
        children.substr(offset)
      );
    }
  }]);

  return Ellipsis;
}(_react.Component);

exports.default = Ellipsis;
