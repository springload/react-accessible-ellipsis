# react-accessible-ellipsis

Truncate multiline with an ellipsis... without causing accessibility problems!

## Why?

For visual reasons it can be informative to show that text has been truncated with an ellipsis character "..." such as

    It was the best of times,...

However browser support for `text-overflow:ellipsis` is poor, especially on multiline text.

    It was the best of times,
    it was the blurst of...

There are a variety of JavaScript-based solutions that aim to solve this but they either have poor accessibility or poor browser support, or they require `text-align: justify`.

To contrast `react-accessible-ellipsis` has:

- **Better accessibility:** CSS `text-overflow:ellipsis` does not truncate the text that screenreaders speak and neither should a JavaScript approach, because the placement is "..." is visual-only and stopping speaking mid-sentence may be confusing to screenreader users. The ellipsis is visual decoration and it should only do that.
- **Better browser support than `text-overflow:ellipsis`:** this is a JavaScript solution that works everywhere React does.
- **Arbitrary alignment:** this doesn't require `text-align: justify` and works with any text or font (variable width or fixed etc.).
- **Tiny dependency:** 2kb (minified and gzipped)
- **TypeScript**

Please note that it only supports plaintext though, not HTML (the `children` prop should just be one text node).

## Install

    npm install react-accessible-ellipsis

    yarn add react-accessible-ellipsis

## Usage

Put `<Ellipsis>` tags around your text, and ensure that it's only used within a component with a set height

    import Ellipsis from 'react-accessible-ellipsis';

    export default () => (
      <Ellipsis style={{ height: '2em' }}> any text you want lorem ipsum etc. </Ellipsis>
    )

or,

    export default () => (
      <Ellipsis className="some-class-with-height"> any text you want lorem ipsum etc. </Ellipsis>
    )

### Props

- `children` (string, required): The string to add an ellipsis to.
- `ellipsis` (string, optional): String indicating the text was truncated. Defaults to "" (U2026).
- `className` (string, optional): class to apply to container element. Although optional either `className` or `style` should be used to restrict width or height.
- `style` (React.CSSProperties AKA map/object, optional): a [style object](https://reactjs.org/docs/dom-elements.html#style) for inline styling. Although optional either `className` or `style` should be used to restrict width or height.
- `tagName` (string, optional, default=`"div"`): tag to be used for container element. Defaults to `div`.
- `pixelRoundingBuffer` (number, optional, default=`1.5`): Used internally to handle rounding errors in browser measurements. Browsers sometimes give measurement values in integers when they are infact fractional, and compounding math based on these integers can result in rounding errors and this prop is used to compare numbers within a certain threshold.
- `ellipsisWithinCharacterBoxRatio` (number, optional, default=`0.9`). The ellipsis characters position within a character box (and therefore whether it's visible) can vary based on font.
- `debug` (boolean, optional, default=`false`): whether to log debug info via `console.info()`.

(thanks to [ldanet](https://github.com/ldanet) for these docs!)

## Troubleshooting

### Console error about `children.split` is not a function

This gruesome sounding error means that you have multiple `children` nodes being passed to react-accessible-ellipsis, or non-plaintext children. Try joining them into a single string.. for example, don't do,

    <Ellipsis>{propText} some description {moreText}</Ellipsis>

do this instead,

    <Ellipsis>{`${propText} some description ${moreText}`}</Ellipsis>

(those are backticks aka [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals))
