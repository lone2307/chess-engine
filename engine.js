import { Chess } from "chess.js/dist/cjs/chess.js";


let CHESSBOARD = new Chess()

function eval_score(board) {
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
    const cur_board = board.board()
    for (let x = 0; x < cur_board.length; x++) {
        for (let y = 0; y < cur_board[x].length; y++) {
            const piece = cur_board[x][y]
            if (piece) {
                score += piece.color === 'w' ? eval_table[piece.type][8 * (x + 1) + y] + value[piece.type] : -eval_table[piece.type][8 * (7 - x + 1) + (7 - y)] - value[piece.type]
            }
        }
    }
    return score
}

function minimax(move, depth, maxPlayer, board, alpha, beta) {
    if (depth === 0 | board.isGameOver()) {
        return eval_score(board)
    } else if (maxPlayer) {
        let max = -Infinity
        for (const pos_move of board.moves()) {
            const newGame = new Chess(board.fen());
            newGame.move(pos_move)
            const value = minimax(move, depth - 1, !maxPlayer, newGame, alpha, beta)
            max = max(max, value)
            alpha = max(alpha, max)
            if (beta <= alpha) break
        }
        return max
    } else {
        let min = Infinity
        for (const pos_move of board.moves()) {
            const newGame = new Chess(board.fen());
            newGame.move(pos_move)
            const value = minimax(move, depth - 1, !maxPlayer, newGame, alpha, beta)
            min = min(min, value)
            beta = min(beta, min)
            if (beta <= alpha) break
        }
        return min
    }
}


while (CHESSBOARD.isGameOver()) {
    sleep(2000).then(() => { console.log('World!'); });
}