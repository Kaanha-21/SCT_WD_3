import React, { useState, useEffect } from "react";
import "./styles.css";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [vsComputer, setVsComputer] = useState(false);
  const [difficulty, setDifficulty] = useState("hard");
  // "easy" | "medium" | "hard"
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const winnerData = calculateWinner(board);
  const winner = winnerData?.player;

  const handleClick = (index) => {
    if (board[index] || winner || gameOver) return;

    const newBoard = [...board];

    // PvP MODE
    if (!vsComputer) {
      newBoard[index] = isXNext ? "X" : "O";
      setBoard(newBoard);
      setIsXNext(!isXNext);
      return;
    }

    // PvC MODE (player is X)
    if (vsComputer) {
      if (!isXNext) return; // block spam during computer turn

      newBoard[index] = "X";
      setBoard(newBoard);
      setIsXNext(false);

      setTimeout(() => {
        computerMove(newBoard);
      }, 500);
    }
  };

  const computerMove = (newBoard) => {
    if (calculateWinner(newBoard) || gameOver) return;

    let moveIndex;

    if (difficulty === "easy") {
      moveIndex = getRandomMove(newBoard);
    } else if (difficulty === "medium") {
      moveIndex =
        Math.random() < 0.5
          ? getRandomMove(newBoard)
          : minimax(newBoard, "O").index;
    } else {
      moveIndex = minimax(newBoard, "O").index;
    }

    if (moveIndex !== undefined) {
      newBoard[moveIndex] = "O";
      setBoard([...newBoard]);
      setIsXNext(true);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
    setGameOver(false);
  };

  useEffect(() => {
    if (winnerData && !gameOver) {
      setWinningLine(winnerData.line);
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
      setGameOver(true);
    } else if (board.every(Boolean) && !winnerData && !gameOver) {
      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));
      setGameOver(true);
    }
  }, [winnerData, winner, board, gameOver]);

  return (
    <div className="game">
      <div className="card">
        {/* 1️⃣ GAME TITLE */}
        <h1 className="neon-title">TIC TAC TOE</h1>
        <div className="scoreboard">
          <div className="score">X : {score.X}</div>
          <div className="score">O : {score.O}</div>
          <div className="score">Draw : {score.draw}</div>
        </div>

        {/* 2️⃣ MODE SELECTION */}
        <div className="mode">
          <button
            onClick={() => {
              setVsComputer(false);
              resetGame();
            }}
          >
            PvP
          </button>

          <button
            onClick={() => {
              setVsComputer(true);
              setDifficulty("easy");
              resetGame();
            }}
          >
            Easy
          </button>

          <button
            onClick={() => {
              setVsComputer(true);
              setDifficulty("medium");
              resetGame();
            }}
          >
            Medium
          </button>

          <button
            onClick={() => {
              setVsComputer(true);
              setDifficulty("hard");
              resetGame();
            }}
          >
            Hard
          </button>
        </div>

        {/* 3️⃣ MODE DISPLAY (PvP or PvC) */}
        <div className="mode-status">
          {!vsComputer
            ? "Player vs Player"
            : `Player vs Computer (${difficulty.toUpperCase()})`}
        </div>

        {/* 4️⃣ TURN / GAME STATUS */}
        <div className="status">
          {winner
            ? `Winner: ${winner}`
            : board.every(Boolean)
              ? "Draw!"
              : `Turn: ${isXNext ? "X" : "O"}`}
        </div>

        {/* 5️⃣ GAME BOARD */}
        <div className="board">
          {board.map((value, index) => (
            <button
              key={index}
              className={`cell
  ${value === "X" ? "x" : ""}
  ${value === "O" ? "o" : ""}
  ${winningLine.includes(index) ? "win" : ""}
`}
              onClick={() => handleClick(index)}
            >
              {value}
            </button>
          ))}
        </div>

        {/* 6️⃣ RESET BUTTON */}
        <button className="reset" onClick={resetGame}>
          Restart Game
        </button>
      </div>
    </div>
  );
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function minimax(board, player) {
  const winnerData = calculateWinner(board);
  const winner = winnerData?.player;

  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (board.every(Boolean)) return { score: 0 };

  const moves = [];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const move = {};
      move.index = i;
      board[i] = player;

      if (player === "O") {
        const result = minimax(board, "X");
        move.score = result.score;
      } else {
        const result = minimax(board, "O");
        move.score = result.score;
      }

      board[i] = null;
      moves.push(move);
    }
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function getRandomMove(board) {
  const empty = board
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);

  if (empty.length === 0) return undefined;

  return empty[Math.floor(Math.random() * empty.length)];
}
