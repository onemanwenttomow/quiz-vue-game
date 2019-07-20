const express       = require('express');
const app           = express();
const http          = require('http').createServer(app);
const io            = require('socket.io')(http);
let playerPieces    = require('./pieces').map(piece => {
    return piece = {
        piece: piece,
        selected: "",
        x: -30,
        y: -30
    };
});

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

    socket.on('all pieces', function(allPieces) {
        playerPieces = allPieces;
    });

    socket.on('new piece position', function(socketPiece) {
        let updatedMovements = playerPieces.map(piece => {
            if (piece.piece === socketPiece.piece) {
                return {
                    piece: piece.piece,
                    selected: "selected",
                    x: socketPiece.x,
                    y: socketPiece.y
                } ;
            } else {
                return piece;
            }
        });
        io.emit('piece movements', updatedMovements);
        console.log("after map:", updatedMovements);

    });

    let time;
    socket.on('start timer', function() {
        time = 30;
        countDownTimer();
        function countDownTimer() {
            time--;
            io.emit('timeLeft', time);
            if (time <= -1 ) {
                return;
            }
            setTimeout(countDownTimer, 1000);
        }
    });

});

http.listen(process.env.PORT || 8080, () => console.log("QUIZ! up and running"));
