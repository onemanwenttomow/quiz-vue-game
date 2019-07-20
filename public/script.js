var socket = io();

new Vue({
    el: '#main',
    data: {
        playerPieces: [],
        selectedPiece: "",
        showPickPieces: true,
        mainText: "Pick your player",
        userSelectedAnswer: null,
        correctAnswer: null,
        timeLeft: 30,
        setTimeoutTracker: null,
        questions: [
            {
                question: "When you click the paragraph, what's the logged output?",
                code: `<div onclick="console.log('div')">
  <p onclick="console.log('p')">
    Click here!
  </p>
</div>`,
                answers: ["p div", "div p", "p", "div"],
                answer: 0,
                explanation: "If we click p, we see two logs: p and div. During event propagation, there are 3 phases: capturing, target, and bubbling. By default, event handlers are executed in the bubbling phase (unless you set useCapture to true). It goes from the deepest nested element outwards."
            }
        ],
        questionCount: 0
    },
    mounted: function() {
        this.selectedPiece = sessionStorage.getItem('piece');
        socket.emit('get pieces');
        this.addSockets();

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
            this.showPickPieces = false;
            this.mainText = "Time Left: ";
            // this.countDownTimer();
            socket.emit('gameStarted', true);
            socket.emit('start timer');
        },
        restart: function() {
            socket.emit("restartGame", this.setTimeoutTracker);
            this.selectedPiece = "";
            this.correctAnswer = null;
            clearTimeout(this.setTimeoutTracker);
            this.timeLeft = 30;
        },
        selectedAnswer: function(id) {
            if (this.timeLeft === 0) {
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
        countDownTimer: function() {
            // this.timeLeft--;
            // console.log(this.timeLeft);
            // if (this.timeLeft === 0) {
            //     this.correctAnswer = this.questions[this.questionCount].answer;
            //     this.mainText = "Time's Up";
            //     return;
            // }
            // this.setTimeoutTracker = setTimeout(this.countDownTimer,1000);
        },
        addSockets: function() {
            socket.on('pieces', (pieces) => {
                this.playerPieces = pieces;
            });
            socket.on('gameStarted', (gameStarted) => {
                this.showPickPieces = !gameStarted;
                if (gameStarted) {
                    console.log("made it to here");
                    this.mainText = "Time Left: ";
                    this.countDownTimer();
                } else {
                    this.showPickPieces = true;
                    this.mainText = "Pick your player";
                }
            });
            socket.on('restart', () => {
                sessionStorage.setItem('piece', "");
                this.selectedPiece = "";
                this.timeLeft = 30;
                this.correctAnswer = null;
                clearTimeout(this.setTimeoutTracker);
            });
            socket.on('timeLeft', (timeLeft) => {
                this.timeLeft = timeLeft;
                console.log(this.timeLeft);
                if (this.timeLeft === 0) {
                    this.correctAnswer = this.questions[this.questionCount].answer;
                    this.mainText = "Time's Up";
                    return;
                }
            });
        }
    }
});
