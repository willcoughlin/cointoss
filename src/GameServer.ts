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

  start() {
    this.socketServer.on('connection', (socket: io.Socket) => {
      
      // TODO: refactor listeners into named methods  

      const socketLog = (msg: string) => {
        console.log(`(socket.id: ${socket.id}) ${msg}`);
      };

      socketLog('Player connected.');

      socket.on('joinGame', (gameId: string) => {
        socket.join(gameId);

        const doesGameExist = this.activeGames.has(gameId);
        if (doesGameExist) {
          if (this.activeGames.get(gameId).isFull) {
            // if game is full, notify user
            socket.emit('err', 'Game is full!');//
            // socket.broadcast.to(socket.id).emit('error', 'Game is full!');
            socketLog('Game exists and is full.');
          } else {
            // set game to full
            this.activeGames.get(gameId).isFull = true;

            // notify player 1
            socket.to(gameId).emit('player2Join');
            socketLog('Game exists. Joining as player 2.');
          }
        } else {
          // new game
          this.activeGames.set(gameId, {
            id: gameId,
            isFull: false
          });
          socketLog('Creating new game.');
        }

        // player 1 if no game with this id already exists
        socket.emit('setIsPlayer1', !doesGameExist);
      
        socket.on('leave', () => {
          socket.disconnect();
        })

        socket.on('disconnect', () => {
          socket.to(gameId).emit('playerDisconnect');
          socketLog('Player disconnected.');
        });
        // end on disconnect
      }); 
      // end on joinGame
    });
    // end on connection
  }
}

export default GameServer;