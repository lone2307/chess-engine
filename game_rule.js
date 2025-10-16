import { Chess } from '/node_modules/chess.js/dist/esm/chess.js';


var board = null
var game = new Chess()

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.isGameOver()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}


function blackMove () {
    var possibleMoves = game.moves();

    if (possibleMoves.length === 0) return
    let best_move = 0;
    let best_score = Infinity;
    for (let x = 0; x < possibleMoves.length; x++){
        const newGame = new Chess(game.fen());
        newGame.move(possibleMoves[x]);
        let score = minimax(3, false, newGame)
        if (score < best_score){
            best_move = x;
            best_score = score;
        }
    }

    game.move(possibleMoves[best_move]);
    board.position(game.fen());
}

function onDrop (source, target) {
  // see if the move is legal
  if (source === target) return 'snapback';

  var move = game.move({
    from: source,
    to: target
  })

  // illegal move
  if (move === null) return 'snapback';

  // make legal move for black
  window.setTimeout(blackMove, 60);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen());
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

function eval_score(gameInstance) {
    const value = { r : 500, n: 320, b: 330, q: 900, p: 100, k: 0 }
    const eval_table = {
        "p": [
            0, 0, 0, 0, 0, 0, 0, 0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5, 5, 10, 25, 25, 10, 5, 5,
            0, 0, 0, 20, 20, 0, 0, 0,
            5, -5, -10, 0, 0, -10, -5, 5,
            5, 10, 10, -20, -20, 10, 10, 5,
            0, 0, 0, 0, 0, 0, 0, 0
        ],
        "n": [
            -50, -40, -30, -30, -30, -30, -40, -50,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -30, 5, 15, 20, 20, 15, 5, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 5, 10, 15, 15, 10, 5, -30,
            -40, -20, 0, 5, 5, 0, -20, -40,
            -50, -40, -30, -30, -30, -30, -40, -50,
        ],
        "b": [
            -20, -10, -10, -10, -10, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 10, 10, 5, 0, -10,
            -10, 5, 5, 10, 10, 5, 5, -10,
            -10, 0, 10, 10, 10, 10, 0, -10,
            -10, 10, 10, 10, 10, 10, 10, -10,
            -10, 5, 0, 0, 0, 0, 5, -10,
            -20, -10, -10, -10, -10, -10, -10, -20,
        ],
        "r": [
            0, 0, 0, 0, 0, 0, 0, 0,
            5, 10, 10, 10, 10, 10, 10, 5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            0, 0, 0, 5, 5, 0, 0, 0
        ],
        "q": [
            -20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -5, 0, 5, 5, 5, 5, 0, -5,
            0, 0, 5, 5, 5, 5, 0, -5,
            -10, 5, 5, 5, 5, 5, 0, -10,
            -10, 0, 5, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20
        ],
        "k": [
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -20, -30, -30, -40, -40, -30, -30, -20,
            -10, -20, -20, -20, -20, -20, -20, -10,
            20, 20, 0, 0, 0, 0, 20, 20,
            20, 30, 10, 0, 0, 10, 30, 20
        ]
    }

    const centralSquares = ['d4', 'e4', 'd5', 'e5'];

    let score = 0;
    const board = gameInstance.board();

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];

            if (!piece) continue;

            const type = piece.type;      // lowercase: 'p', 'n', etc.
            const color = piece.color;    // 'w' or 'b'

            const baseVal = value[type] ?? 0;
            const table = eval_table[type] ?? Array(64).fill(0); // fallback if type missing

            const flipIdx = 8 * x + y;
            const idx = 8 * (7 - x) + (7 - y);

            const positionalVal = (color === 'w') ? table[idx] : -table[flipIdx];
            const materialVal = (color === 'w') ? baseVal : -baseVal;

            score += materialVal + positionalVal;
            if (type === 'k') {
                if ((color === 'w' && y < 2) || (color === 'b' && y < 2)) {
                        score += color === 'w' ? -30 : 30; // king on side = safer
                    }
            }
        }
    }

    for (const sq of centralSquares) {
        const piece = gameInstance.get(sq);
        if (piece) {
            score += piece.color === 'w' ? 20 : -20;
        }
    }

    return score;
}

function minimax(depth, maxPlayer, gameInstance, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 || gameInstance.isGameOver()) {
        return eval_score(gameInstance)
    } else if (maxPlayer) {
        let highest = -Infinity
        for (const pos_move of gameInstance.moves()) {
            const newGame = new Chess(gameInstance.fen());
            newGame.move(pos_move);
            const value = minimax(depth - 1, false, newGame, alpha, beta)
            highest = Math.max(highest, value)
            alpha = Math.max(alpha, highest)
            if (beta <= alpha) break
        }
        return highest
    } else {
        let lowest = Infinity
        for (const pos_move of gameInstance.moves()) {
            const newGame = new Chess(gameInstance.fen());
            newGame.move(pos_move)
            const value = minimax(depth - 1, true, newGame, alpha, beta)
            lowest = Math.min(lowest, value)
            beta = Math.min(beta, lowest)
            if (beta <= alpha) break
        }
        return lowest
    }
}

board = Chessboard("myBoard", config)
