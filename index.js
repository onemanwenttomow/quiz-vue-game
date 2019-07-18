const express       = require('express');
const app           = express();
const http          = require('http').createServer(app);
const io            = require('socket.io')(http);

app.use(express.static('public'));

const playerPieces = [
    {
        piece: "🐵",
        selected: ""
    }, {
        piece: "🐶",
        selected: ""
    },
    {
        piece: "🐱",
        selected: ""
    },
    {
        piece: "🦝",
        selected: ""
    },
    {
        piece: "🐸",
        selected: ""
    },
    {
        piece: "🐼",
        selected: ""
    },
    {
        piece: "🐨",
        selected: ""
    },
    {
        piece: "🐻",
        selected: ""
    },
    {
        piece: "🐹",
        selected: ""
    },
    {
        piece: "🐭",
        selected: ""
    },
    {
        piece: "🐷",
        selected: ""
    },
    {
        piece: "🐗",
        selected: ""
    },
    {
        piece: "🐔",
        selected: ""
    },
    {
        piece: "🦄",
        selected: ""
    },
    {
        piece: "🐺",
        selected: ""
    },
    {
        piece: "🦁",
        selected: ""
    },
    {
        piece: "🐯",
        selected: ""
    },
    {
        piece: "🐴",
        selected: ""
    },
    {
        piece: "🐮",
        selected: ""
    },
    {
        piece: "🦊",
        selected: ""
    },
    {
        piece: "🐌",
        selected: ""
    }
];

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
        console.log('piece!!!: ' + idx);
        playerPieces[idx].selected = "selected";
        io.emit('pieces', playerPieces);
    });

    socket.on('gameStarted', function() {
        console.log("GAME STARTED!");
        io.emit('gameStarted', true);
        gameStarted = true;
    });

});

http.listen(process.env.PORT || 8080, () => console.log("QUIZ! up and running"));
