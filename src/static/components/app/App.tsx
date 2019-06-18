import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom'; 
import copy from 'copy-to-clipboard';

import Game from '../game/Game';
import './App.css';

type AppState = {
  newGameId: string
};

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    const initialNewId = this.makeId();    
    this.state = {
      newGameId: initialNewId
    };
  }

  render() {
    return (
      <BrowserRouter>
        <div className='topBar'>
          <Link to={ this.state.newGameId } onClick={ this.setNewGameId.bind(this) }>
            <button type='button'>New Game</button> 
          </Link>
          { window.location.pathname === '/' ? null : <button type='button' onClick={ this.copyUrl }>Copy Link</button> }
        </div>
        <Route path='/:id' render={(props) => <Game {...props} key={ Math.random() } />}></Route>
      </BrowserRouter>
    );
  }

  private copyUrl() {
    copy(window.location.href);
    alert('Link copied. Share it with your opponent!');
  }

  private makeId() {
    return Math.random().toString(36).substring(7);
  }

  private setNewGameId() {
    const newGameId = this.makeId();
    this.setState({
      newGameId: newGameId
    });
  }
}

export default App;