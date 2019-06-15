import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom'; 
import Game from './game/Game';

type AppState = {
  newGameId: string
};

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    const initialNewId = this._makeId();    
    this.state = {
      newGameId: initialNewId
    };
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Link to={ this.state.newGameId } onClick={ this._setNewGameId.bind(this) }>
            <button type='button'>New Game</button> 
          </Link>
          <Route path='/:id' component={Game}></Route>
        </div>
      </BrowserRouter>
    );
  }

  _makeId() {
    return Math.random().toString(36).substring(7);
  }

  _setNewGameId() {
    const newGameId = this._makeId();
    this.setState({
      newGameId: newGameId
    });
  }
}

export default App;