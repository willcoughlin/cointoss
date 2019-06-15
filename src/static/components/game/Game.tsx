import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface GameProps extends RouteComponentProps<{ id: string }> {}

class Game extends Component<GameProps> {
  constructor(props: GameProps) {
    super(props);
  }

  render() {
    return <p>{ this.props.match.params.id }</p>;
  }
}

export default Game;