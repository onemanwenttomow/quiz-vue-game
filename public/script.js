var socket = io();

new Vue({
    el: '#main',
    data: {
        playerPieces: [],
        selectedPiece: "",
        showPickPieces: true,
        mainText: "Pick your player"
    },
    mounted: function() {
        this.selectedPiece = sessionStorage.getItem('piece');
        socket.emit('get pieces');
        var me = this;
        socket.on('pieces', function(pieces){
            me.playerPieces = pieces;
        });
        socket.on('gameStarted', function(){
            console.log("GAME STARTED!");
            me.showPickPieces = false;
            me.mainText = "Quiz!";
        });
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
            console.log("game started!");
            this.showPickPieces = false;
            this.mainText = "Quiz!";
            socket.emit('gameStarted', true);
        }
    }
});
