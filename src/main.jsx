import React from 'react'
import ReactDOM from 'react-dom'
import Game from './Game'

ReactDOM.render(
  <React.StrictMode>
    <Game size={8} level={1} />
  </React.StrictMode>,
  document.getElementById('root')
)
