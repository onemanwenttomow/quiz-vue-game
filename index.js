const express       = require('express');
const app           = express();
const http          = require('http').createServer(app);
const io            = require('socket.io')(http);
let playerPieces    = require('./pieces');

app.use(express.static('public'));


let gameStarted = false;

io.on('connection', function(socket) {
    console.log('a user connected', socket.id);
    socket.on('disconnect', function() {
        console.log(`socket with the id ${socket.id} is now disconnected`);
    });

    socket.on('get pieces', function() {
        io.emit('pieces', playerPieces);
        if (gameStarted) {
            io.emit('gameStarted', true);
        }
    });

    socket.on('update piece', function(idx) {
        playerPieces[idx].selected = "selected";
        io.emit('pieces', playerPieces);
    });

    socket.on('gameStarted', function() {
        socket.broadcast.emit('gameStarted', true);
        gameStarted = true;
    });

    socket.on('restartGame', function() {
        playerPieces.map(piece => {
            return piece.selected = "";
        });
        gameStarted = false;
        io.emit('pieces', playerPieces);
        io.emit('gameStarted', false);
        io.emit('restart', this.setTimeoutTracker);
    });

});

http.listen(process.env.PORT || 8080, () => console.log("QUIZ! up and running"));
