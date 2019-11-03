const express       = require('express');
const app           = express();
const http          = require('http').createServer(app);
const io            = require('socket.io')(http);
const questions     = require('./questions');
let playerPieces    = require('./pieces').map(piece => {
    return piece = {
        piece: piece,
        selected: "",
        x: -15,
        y: -15
    };
});

app.use(express.static('public'));


let gameStarted = false;
let totalScore = 0;
let numberOfAnswersThisRound = 0;
let correctAnswerPieces = [];

io.on('connection', function(socket) {
    console.log('a user connected', socket.id);
    socket.on('disconnect', function() {
        console.log(`socket with the id ${socket.id} is now disconnected`);
    });
    console.log("number of quizes: ", questions.length);

    io.emit('number of quizes', questions.length);

    socket.on('quiz to use', function(questionBankToUse) {
        io.emit('new quiz number', questionBankToUse);
    });

    socket.on('get pieces', function() {
        io.emit('pieces', playerPieces, questions);
        if (gameStarted) {
            io.emit('gameStarted', true);
        }
    });

    socket.on('update piece', function(idx) {
        playerPieces[idx].selected = "selected";
        io.emit('pieces', playerPieces, questions);
    });

    socket.on('gameStarted', function() {
        socket.broadcast.emit('gameStarted', true);
        console.log("GAME STARTED!!!!");
        gameStarted = true;
    });

    socket.on('restartGame', function() {
        playerPieces.map(piece => {
            return piece.selected = "";
        });
        gameStarted = false;
        time = 30;
        totalScore = 0;
        correctAnswerPieces = [];
        clearTimeout(setTimeoutTracker);
        io.emit('pieces', playerPieces, questions);
        io.emit('gameStarted', false);
        io.emit('restart');
    });

    socket.on('all pieces', function(allPieces) {
        playerPieces = allPieces;
    });

    socket.on('player selected answer', selectedPiece => {
        console.log("player selected answer!!!!", selectedPiece);
        numberOfAnswersThisRound ++;
    });


    socket.on('correct answer', function(correct, piece) {
        correct && totalScore++;
        correct && correctAnswerPieces.push(piece);
        console.log("emitting total score: ", totalScore, correctAnswerPieces);
        io.emit('total score', totalScore, correctAnswerPieces);
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

    });

    socket.on('next question', function() {
        socket.broadcast.emit('next question');
        correctAnswerPieces = [];
        time = 30;
        totalScore = 0;
        clearTimeout(setTimeoutTracker);
        countDownTimer();
    });

    let time;
    let setTimeoutTracker;

    socket.on('start timer', function() {
        time = 30;
        countDownTimer();
    });

    function countDownTimer() {
        if (numberOfAnswersThisRound ==  playerPieces.filter(piece => piece.selected).length) {
            time = 1;
        }

        time--;
        console.log(time);
        io.emit('timeLeft', time);
        if (time <= 0 ) {
            numberOfAnswersThisRound = 0;
            return;
        }
        setTimeoutTracker = setTimeout(countDownTimer, 1000);
    }

});

http.listen(process.env.PORT || 8080, () => console.log("QUIZ! up and running"));
