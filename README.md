**This project is in development and should not yet be used.**

# react-accessible-ellipsis
Truncate multiline with an ellipsis... without causing accessibility problems

## Features

* Accessible. It inserts ellipsis on multiline text without truncating sentences for screenreaders.

## Install

    npm install react-accessible-ellipsis

    yarn add react-accessible-ellipsis
    
## Usage

Put `<Ellipsis>` tags around your text, and ensure that it's only used within a component with a set height

    import Ellipsis from 'react-accessible-ellipsis';

    export default () => {
      <Ellipsis> any text you want </Ellipsis>
    }
