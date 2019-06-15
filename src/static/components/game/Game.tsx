import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import io from 'socket.io';

// Captures game ID from route
interface GameProps extends RouteComponentProps<{ id: string }> {}

enum PlayState {
  WaitingForPlayer2,  // when one player is in the game 
  WaitingForCall,     // when two are in the game and waiting on p1 to call
  Done                // after p1 has called and result determined
}

type GameState = {
  playState: PlayState,
  isPlayer1?: boolean  // p2 may become p1 if p1 leaves the game,
  socket: io.Server
};

class Game extends Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      playState: PlayState.WaitingForPlayer2,
      isPlayer1: null,
      socket: io()
    };

    this.configureSocketConnection();
  }

  // tell the server we are leaving
  componentWillUnmount() {
    this.state.socket.emit('leave');
  }

  render() {
    if (this.state.playState === PlayState.WaitingForPlayer2) {
      return <h1>Waiting for player 2 to join</h1>;
    } else if (this.state.playState == PlayState.WaitingForCall) {
      return <h1>Waiting for player 1 to call</h1>;
    }
  }

  private configureSocketConnection() {
    this.state.socket.emit('joinGame', this.props.match.params.id);

    // TODO: refactor listeners into named methods
    
    this.state.socket.on('setIsPlayer1', (isPlayer1: boolean) => {
      console.log(`You are Player ${isPlayer1 ? '1' : '2'}`);
      this.setState({
        isPlayer1: isPlayer1,
        playState: isPlayer1 ? PlayState.WaitingForPlayer2 : PlayState.WaitingForCall
      });
    });

    this.state.socket.on('player2Join', () => {
      console.log('Player 2 has joined');
      this.setState({
        playState: PlayState.WaitingForCall
      });
    });

    this.state.socket.on('playerDisconnect', () => {
      console.log(`Player ${this.state.isPlayer1 ? '2' : '1'} has disconnected`);
      if (!this.state.isPlayer1) {
        console.log('You are now player 1!');
      }

      this.setState({
        isPlayer1: true,
        playState: PlayState.WaitingForPlayer2
      });
    });
  }
}

export default Game;