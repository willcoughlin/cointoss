import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom'; 
import Game from './game/Game';

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
        <div>
          <Link to={ this.state.newGameId } onClick={ this.setNewGameId.bind(this) }>
            <button type='button'>New Game</button> 
          </Link>
          {/* <Route path='/:id' component={Game}></Route> */}
          <Route path='/:id' render={(props) => <Game {...props} key={ Math.random() } />}></Route>
        </div>
      </BrowserRouter>
    );
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