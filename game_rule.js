import { Chess } from 'node_modules/chess.js/dist/esm/chess.js';

var board = null
var game = new Chess()

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function blackMove () {
  var possibleMoves = game.moves()

  // game over
  if (possibleMoves.length === 0) return
    let best_move = 0
    let best_score = Infinity
    for (let x = 0; x < possibleMoves.length; x++){
        let score = minimax(possibleMoves[x], 3, false, board)
        if (score < best_score){
            best_move = x
            best_score = score
        }
    }

  game.move(possibleMoves[best_move])
  board.position(game.fen())
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make random legal move for black
  window.setTimeout(blackMove, 250)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

function eval_score(game) {
    const value = { "r": 50, "n": 32, "b": 33, "q": 90, "p": 10, "k": 0 }
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

    let score = 0
    const cur_game = game.board()
    for (let x = 0; x < cur_game.length; x++) {
        for (let y = 0; y < cur_game[x].length; y++) {
            const piece = cur_game[x][y]
            if (piece) {
                score += piece.color === 'w' ? eval_table[piece.type][8 * (x + 1) + y] + value[piece.type] : -eval_table[piece.type][8 * (7 - x + 1) + (7 - y)] - value[piece.type]
            }
        }
    }
    return score
}

function minimax(move, depth, maxPlayer, board, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 | board.isGameOver()) {
        return eval_score(board)
    } else if (maxPlayer) {
        let max = -Infinity
        for (const pos_move of board.moves()) {
            const newGame = new Chess(board.fen());
            newGame.move(pos_move)
            const value = minimax(move, depth - 1, !maxPlayer, newGame, alpha, beta)
            max = Math.max(max, value)
            alpha = Math.max(alpha, max)
            if (beta <= alpha) break
        }
        return max
    } else {
        let min = Infinity
        for (const pos_move of board.moves()) {
            const newGame = new Chess(board.fen());
            newGame.move(pos_move)
            const value = minimax(move, depth - 1, !maxPlayer, newGame, alpha, beta)
            min = Math.min(min, value)
            beta = Math.min(beta, min)
            if (beta <= alpha) break
        }
        return min
    }
}

board = Chessboard("myBoard", config)
