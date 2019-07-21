var socket = io();

new Vue({
    el: '#main',
    data: {
        playerPieces: [],
        selectedPiece: "",
        selectPieceCoordinates: {
            x: -30,
            y: -30
        },
        showPickPieces: true,
        mainText: "Pick your player",
        userSelectedAnswer: null,
        correctAnswer: null,
        timeLeft: 30,
        questions: [],
        questionCount: 0
    },
    mounted: function() {
        this.selectedPiece = sessionStorage.getItem('piece');
        socket.emit('get pieces');
        this.addSockets();

    },
    computed: {
        numberOfPlayers: function () {
            return this.playerPieces.filter(piece => {
                return piece.selected;
            }).length;
        }
    },
    methods: {
        selectPiece: function(index) {
            if (this.playerPieces[index].selected === "selected" || this.selectedPiece) {
                return;
            }
            sessionStorage.setItem('piece', this.playerPieces[index].piece);
            socket.emit('update piece', index);
            this.selectedPiece = this.playerPieces[index].piece;
        },
        startGame: function() {
            console.log("questions: ", this.questions);
            this.showPickPieces = false;
            this.mainText = "Time Left: ";
            socket.emit('gameStarted', true);
            socket.emit('start timer');
        },
        restart: function() {
            socket.emit("restartGame");

        },
        selectedAnswer: function(id) {
            if (this.timeLeft === 0 || this.userSelectedAnswer === 0 || this.userSelectedAnswer) {
                return;
            }
            this.userSelectedAnswer = id;
        },
        checkAnswer: function() {
            if (this.userSelectedAnswer === this.questions[this.questionCount].answer) {
                console.log("correct!");
            } else {
                console.log("wrong!!");
            }

        },
        mouseMoving: function(e) {
            console.log(e.path[0].id);
            if (this.userSelectedAnswer === 0 ||
                this.userSelectedAnswer ||
                this.timeLeft <= 0 ||
                e.path[0].id === "keep-answer-on-top"
            ) {
                return;
            }

            this.selectPieceCoordinates.x = e.pageX - 20;
            this.selectPieceCoordinates.y = e.pageY - 22;
            socket.emit('all pieces', this.playerPieces);
            socket.emit('new piece position', {
                piece: this.selectedPiece,
                x: e.pageX - 20,
                y: e.pageY - 22
            });
        },
        addSockets: function() {
            socket.on('pieces', (pieces, questions) => {
                console.log("questions: ", questions);
                this.playerPieces = pieces;
                this.questions = questions;
                console.log("this.questions:" , this.questions);
            });
            socket.on('gameStarted', (gameStarted) => {
                this.showPickPieces = !gameStarted;
                if (gameStarted) {
                    console.log("made it to here");
                    this.mainText = "Time Left: ";
                } else {
                    this.showPickPieces = true;
                    this.mainText = "Pick your player";
                }
            });
            socket.on('restart', () => {
                sessionStorage.setItem('piece', "");
                this.selectedPiece = "";
                this.correctAnswer = null;
                this.timeLeft = 30;
                this.selectPieceCoordinates.x = -30;
                this.selectPieceCoordinates.y = -30;
                this.questionCount = 0;
                this.userSelectedAnswer = null;
            });
            socket.on('timeLeft', (timeLeft) => {
                this.timeLeft = timeLeft;
                if (this.timeLeft === 0) {
                    this.correctAnswer = this.questions[this.questionCount].answer;
                    this.mainText = "Time's Up";
                    return;
                }
            });
            socket.on('piece movements', (updatedPieces) => {
                this.playerPieces = updatedPieces;
            });
        }
    }
});
