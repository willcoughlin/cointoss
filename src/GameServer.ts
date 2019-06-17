import io from 'socket.io';
import { Server as HttpServer } from 'http'

type GameType = {
  id: string,
  isFull: boolean
};

class GameServer {
  private socketServer: io.Server;
  private activeGames: Map<string, GameType>  = new Map<string, GameType>();

  constructor(httpServer: HttpServer) {
    this.socketServer = io(httpServer);
  }

  /*
   * Sets the connection listener and enables game connections.
   */
  start() {
    this.socketServer.on('connection', (socket: io.Socket) => {
      this.socketLog(socket.id, 'Player connected.');
      socket.on('joinGame', (gameId: string) => { this.handleJoinGame(socket, gameId) });
    });
  }

  private socketLog(socketId: string, msg: string) {
    console.log(`(socket.id: ${socketId}) ${msg}`);
  }

  /*
   * Handles request to join game. Creates one if it doesn't exist,
   * notifies client of error if full.
   */
  private handleJoinGame(socket: io.Socket, gameId: string) {
    socket.join(gameId);

    const doesGameExist = this.activeGames.has(gameId);
    if (doesGameExist) {
      if (this.activeGames.get(gameId).isFull) {
        // if game is full, notify user
        socket.emit('err', 'Game is full!');//
        this.socketLog(socket.id, 'Game exists and is full.');
      } else {
        // set game to full
        this.activeGames.get(gameId).isFull = true;

        // notify player 1
        socket.to(gameId).emit('player2Join');
        this.socketLog(socket.id, 'Game exists. Joining as player 2.');
      }
    } else {
      // new game
      this.activeGames.set(gameId, {
        id: gameId,
        isFull: false
      });
      this.socketLog(socket.id, 'Creating new game.');
    }

    // player is player 1 if no game with this id already exists
    socket.emit('setIsPlayer1', !doesGameExist);
  

    // game events
    socket.on('call', (choice: string) => { socket.to(gameId).emit('call', choice) });

    // leave/disconnect events
    socket.on('leave', () => { socket.disconnect() });
    socket.on('disconnect', () => { this.handleDisconnect(socket, gameId) });
  }

  /* 
   * Handle disconnection of player
   */
  private handleDisconnect(socket: io.Socket, gameId: string) {
    socket.to(gameId).emit('playerDisconnect');
    this.socketLog(socket.id, 'Player disconnected.');

    // Open slot in game or delete
    const game = this.activeGames.get(gameId);
    if (game.isFull) {
      game.isFull = false;
      this.socketLog(socket.id, `There is now an open seat in the game (/${gameId}).`);
    } else {
      this.activeGames.delete(gameId);
      this.socketLog(socket.id, `The game (/${gameId}) has been deleted.`);
    }
  }

  private handleCall(socket: io.Socket, gameId: string, choice: string) {
    socket.to(gameId).emit('call', choice);
  }
}

export default GameServer;