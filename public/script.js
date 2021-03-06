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
        questionCount: 0,
        scores: [],
        quizNumber: 0,
    },
    mounted: function() {
        this.selectedPiece = sessionStorage.getItem('piece');
        if (sessionStorage.getItem('questionCount')) {
            this.questionCount = sessionStorage.getItem('questionCount');
        }
        if (sessionStorage.getItem('quizNumber')) {
            this.quizNumber = sessionStorage.getItem('quizNumber');
        }
        if (sessionStorage.getItem('scores')) {
            var scores = sessionStorage.getItem('scores');
            this.scores = JSON.parse(scores);
        }
        socket.emit('get pieces');
        this.addSockets();

    },
    computed: {
        numberOfPlayers: function () {
            return this.playerPieces.filter(piece => {
                return piece.selected;
            }).length;
        },
        wrongAnswer: function() {
            if (this.timeLeft <= 0) {
                return [0, 1, 2, 3, 4].filter(answer => answer != this.correctAnswer);
            } else {
                return [];
            }
        },
    },
    methods: {
        nextQuestion: function() {
            this.questionCount++;
            this.correctAnswer = null;
            this.userSelectedAnswer = null;
            this.mainText = "Time Left: ",
            sessionStorage.setItem('questionCount', this.questionCount);
            socket.emit('next question');
        },
        selectPiece: function(index) {
            if (this.playerPieces[index].selected === "selected" || this.selectedPiece) {
                return;
            }
            sessionStorage.setItem('piece', this.playerPieces[index].piece);
            socket.emit('update piece', index);
            this.selectedPiece = this.playerPieces[index].piece;
        },
        startGame: function() {
            this.showPickPieces = false;
            this.mainText = "Time Left: ";
            this.questions = this.questions[this.quizNumber];
            sessionStorage.setItem('questionCount', this.questionCount);
            sessionStorage.setItem('quizNumber', this.quizNumber);
            socket.emit('gameStarted', true);
            socket.emit('start timer');
        },
        updateQuizNumber: function(quizNumber) {
            socket.emit('quiz to use', quizNumber);
        },
        restart: function() {
            socket.emit("restartGame");
        },
        selectedAnswer: function(id) {
            if (this.timeLeft === 0 || this.userSelectedAnswer === 0 || this.userSelectedAnswer) {
                return;
            }
            socket.emit('player selected answer', (this.selectedPiece));
            this.userSelectedAnswer = id;
        },
        checkAnswer: function() {
            if (this.timeLeft === 0 && this.userSelectedAnswer === this.questions[this.questionCount].answer) {
                socket.emit('correct answer', true, this.selectedPiece);
            } else {
                socket.emit('correct answer', false);
            }

        },
        mouseMoving: function(e) {
            if (this.userSelectedAnswer === 0 ||
                this.userSelectedAnswer ||
                this.timeLeft <= 0
            ) {
                return;
            }
            this.selectPieceCoordinates.x = e.pageX - 15;
            this.selectPieceCoordinates.y = e.pageY - 15;
            socket.emit('all pieces', this.playerPieces);
            socket.emit('new piece position', {
                piece: this.selectedPiece,
                x: e.pageX - 15,
                y: e.pageY - 15
            });
        },
        addSockets: function() {
            socket.on('pieces', (pieces, questions) => {
                this.playerPieces = pieces;
                this.questions = questions;

            });
            socket.on('gameStarted', (gameStarted) => {
                sessionStorage.setItem('scores', '[]');
                this.scores = [];
                this.showPickPieces = !gameStarted;
                this.questions = this.questions[this.quizNumber];
                sessionStorage.setItem('questionCount', this.questionCount);
                if (gameStarted) {
                    this.mainText = "Time Left: ";
                } else {
                    this.showPickPieces = true;
                    this.mainText = "Pick your player";
                }
            });
            socket.on('restart', () => {
                sessionStorage.setItem('piece', "");
                sessionStorage.setItem('questionCount', "");
                sessionStorage.setItem('quizNumber', "");
                sessionStorage.setItem('scores', '[]');
                this.selectedPiece = "";
                this.correctAnswer = null;
                this.timeLeft = 30;
                this.selectPieceCoordinates.x = -15;
                this.selectPieceCoordinates.y = -15;
                this.questionCount = 0;
                this.userSelectedAnswer = null;
                this.scores = [];
            });
            socket.on('timeLeft', (timeLeft) => {
                this.timeLeft = timeLeft;
                if (this.timeLeft === 0) {
                    this.correctAnswer = this.questions[this.questionCount].answer;
                    this.mainText = "Time's Up";
                    this.checkAnswer();
                    return;
                }
            });
            socket.on('piece movements', (updatedPieces) => {
                this.playerPieces = updatedPieces;
            });
            socket.on('next question', () => {
                this.questionCount++;
                this.correctAnswer = null;
                this.userSelectedAnswer = null;
                this.mainText = "Time Left: ",
                sessionStorage.setItem('questionCount', this.questionCount);
            });
            socket.on('total score', (totalScore, correctAnswerPieces) => {
                this.scores[this.questionCount] = {
                    questionCount: this.questionCount + 1,
                    totalScore,
                    percentage: Math.round(totalScore / this.numberOfPlayers * 100) + "%",
                    correctAnswerPieces: correctAnswerPieces
                };

                this.$forceUpdate();
                sessionStorage.setItem('scores', JSON.stringify(this.scores));
            });

            socket.on('number of quizes', (numberOfQuizes) => {
                this.numberOfQuizes = numberOfQuizes;
            });

            socket.on('new quiz number', quizNumber => {
                this.quizNumber = quizNumber;
                sessionStorage.setItem('quizNumber', quizNumber);

            });
        }
    }
});
