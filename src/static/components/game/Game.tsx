import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import io from 'socket.io';

// Captures game ID from route
interface GameProps extends RouteComponentProps<{ id: string }> {}

enum PlayState {
  WaitingForPlayer2,  // when one player is in the game 
  WaitingForCall,     // when two are in the game and waiting on p2 to call
  WaitingForFlip,     // after p2 has called, waiting on p1 to flip
  Done                // after p1 has flipped
}

type GameState = {
  socket: io.Server
  errors: string[],
  playState?: PlayState,
  isPlayer1?: boolean  // p2 may become p1 if p1 leaves the game,
  headsOrTails: string,
  result: string
};

class Game extends Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      socket: io(),
      errors: [],
      playState: null,
      isPlayer1: null,
      headsOrTails: null,
      result: null
    };

    this.configureSocketConnection();
  }

  render() {
    // We have not joined game
    if (this.state.playState === null) {
      if (this.state.errors.length) {
        return (
          <div>
            { this.state.errors.map(err => <h1>{ err }</h1>) }
          </div>
          );
      }

      // If no errors, we haven't connected yet
      return <h1>Connecting...</h1>      
    }

    // We are in a game
    switch (this.state.playState) {
      case PlayState.WaitingForPlayer2:
        return <h1>Waiting for player 2 to join.</h1>;
      
      case PlayState.WaitingForCall:
        if (this.state.isPlayer1) {
          return <h1>Waiting for player 2 to call.</h1>;
        } 
        return (
          <div>
            <h1>Call it.</h1>
            <button type='button' onClick={ () => this.sendCall.bind(this)('heads') }>Heads</button>
            <button type='button' onClick={ () => this.sendCall.bind(this)('tails') }>Tails</button>
          </div>
        );
        
      
      case PlayState.WaitingForFlip:
          if (this.state.isPlayer1) {
            return (
              <div>
                <h1>You are {this.state.headsOrTails }. Flip it.</h1>
                <button type='button' onClick={ () => this.state.socket.emit('flip') }>Flip</button>
              </div>
            );
          } 
          
          return (
            <div>
              <h1>You are { this.state.headsOrTails }. Waiting for player 1 to flip.</h1>
            </div>
          );
          

      case PlayState.Done:
        if (this.state.headsOrTails === this.state.result) {
          return <h1>It's {this.state.result }. You win!</h1>;
        }

        return <h1>It's { this.state.result }. You lose!</h1>;
    }
  }

  /*
   * Used to tell the server we are leaving if "New Game" is clicked.
   */
  componentWillUnmount() {
    this.state.socket.emit('leave');
  }

  /* 
   * Join a game and set event handlers.
   */
  private configureSocketConnection() {
    // tell server we are joining this game
    this.state.socket.emit('joinGame', this.props.match.params.id);
    
    // server event handlers
    this.state.socket.on('setIsPlayer1', (isPlayer1: boolean) => { this.handleSetIsPlayer1.bind(this)(isPlayer1) });
    this.state.socket.on('player2Join', this.handlePlayer2Join.bind(this));
    this.state.socket.on('playerDisconnect', this.handlePlayerDisconnect.bind(this));
    this.state.socket.on('call', (choice: string) => { this.handleCall.bind(this)(choice) });
    this.state.socket.on('flip', (result: string) => { this.handleFlip.bind(this)(result) });
    this.state.socket.on('err', (err: string) => { this.setState({ errors: this.state.errors.concat([err]) }) });
  }

  /*
   * Sends the player's call to the server
   */
  private sendCall(choice: string) {
    this.state.socket.emit('call', choice);
    
    // update state
    this.handleCall(choice);
  }

  /*
   * Updates state following p1 call
   */
  private handleCall(choice: string) {
    // if player 2, your h or t value is the opposite of the p1 call
    const headsOrTails = this.state.isPlayer1 ? choice : (choice === 'heads' ? 'tails' : 'heads');
    
    this.setState({
      playState: PlayState.WaitingForFlip,
      headsOrTails: headsOrTails
    });
  }

  /*
   * Show result of game
   */
  private handleFlip(result: string) {
    this.setState({
      result: result,
      playState: PlayState.Done
    });
  }

  /*
   * Are we player 1? Update state accordingly.
   */
  private handleSetIsPlayer1(isPlayer1: boolean) {
    this.setState({
      isPlayer1: isPlayer1,
      playState: isPlayer1 ? PlayState.WaitingForPlayer2 : PlayState.WaitingForCall
    });
  }

  /*
   * If we are player 1, we get sent this event when p2 joins.
   */
  private handlePlayer2Join() {
    this.setState({
      playState: PlayState.WaitingForCall
    });
  }

  /*
   * When the other player disconnects, update state and make sure we are 
   * now player 1 if not before.
   */
  private handlePlayerDisconnect() {
    if (!this.state.isPlayer1) {
      console.log('You are now player 1!');
    }

    this.setState({
      isPlayer1: true,
      playState: PlayState.WaitingForPlayer2
    });
  }
}

export default Game;