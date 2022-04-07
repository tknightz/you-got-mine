import { useState } from "react";
import "./game.css";

function isValidIdx(idx, size) {
  return !(idx < 0 || idx >= size);
}

function Cell({ isShow, hasFlag, hasMine, value, onShow, onFlag }) {
  const showedMineCls = isShow && hasMine ? "mine" : "";
  const showed = isShow ? "showed" : "";
  const flagged = hasFlag && !isShow ? "flagged" : "";
  const cssValue = !hasMine && isShow ? `c${value}` : "";

  const className = ["cell", showedMineCls, showed, cssValue, flagged]
    .filter(Boolean)
    .join(" ")
    .trim();

  const rightClick = (e) => {
    e.preventDefault();
    if (onFlag) onFlag();
  };

  return (
    <div className={className} onClick={onShow} onContextMenu={rightClick}>
      {isShow && <>{value}</>}
    </div>
  );
}

function generateMineMap(numberOfMine, numberOfCellARow) {
  const minePositions = {};
  const map = [...new Array(numberOfCellARow)].map(
    (_) => new Array(numberOfCellARow)
  );

  function isMineExist(x, y) {
    if (!(isValidIdx(x, numberOfCellARow) && isValidIdx(y, numberOfCellARow)))
      return false;

    return minePositions[x + "" + y] !== undefined;
  }

  function generateMineCoordinate(numberOfCellARow) {
    const x = Math.floor(Math.random() * (numberOfCellARow - 1));
    const y = Math.floor(Math.random() * (numberOfCellARow - 1));

    return [x, y];
  }

  for (let i = 0; i < numberOfMine; i++) {
    let [x, y] = generateMineCoordinate(numberOfCellARow);
    while (isMineExist(x, y)) {
      [x, y] = generateMineCoordinate(numberOfCellARow);
    }

    minePositions[x + "" + y] = 1;
  }

  for (let x = 0; x < numberOfCellARow; x++) {
    for (let y = 0; y < numberOfCellARow; y++) {
      if (isMineExist(x, y)) {
        map[x][y] = "x";
        continue;
      }

      let value = 0;
      if (isMineExist(x, y + 1)) value++;
      if (isMineExist(x, y - 1)) value++;

      if (isMineExist(x + 1, y)) value++;
      if (isMineExist(x + 1, y - 1)) value++;
      if (isMineExist(x + 1, y + 1)) value++;

      if (isMineExist(x - 1, y)) value++;
      if (isMineExist(x - 1, y - 1)) value++;
      if (isMineExist(x - 1, y + 1)) value++;

      map[x][y] = value;
    }
  }

  return map;
}

function Game({ size, numberOfMines }) {
  const [showMap, setShowMap] = useState({});
  const [flagMap, setFlagMap] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const [mineMap, _] = useState(() => {
    const mineMap = generateMineMap(numberOfMines, size);
    return mineMap;
  });

  const showIdx = function (rowIdx, colIdx, isFirst = true) {
    let traceMap = { ...showMap };

    function recursiveExplore(rowIdx, colIdx, isFirst = false) {
      const idx = rowIdx + "" + colIdx;

      if (!(isValidIdx(rowIdx, size) && isValidIdx(colIdx, size))) return;
      if (traceMap[idx]) return;

      traceMap[idx] = true;

      if (mineMap[rowIdx][colIdx] == "x") {
        console.log("You got Mine!!!");
        if (isFirst) {
          setGameOver(true);
          return;
        }
      } else if (mineMap[rowIdx][colIdx] === 0) {
        recursiveExplore(rowIdx - 1, colIdx);
        recursiveExplore(rowIdx + 1, colIdx);
        recursiveExplore(rowIdx, colIdx - 1);
        recursiveExplore(rowIdx, colIdx + 1);
      }
    }

    recursiveExplore(rowIdx, colIdx, isFirst);

    if (size * size - Object.keys(traceMap).length === numberOfMines)
      setWin(true);

    setShowMap(traceMap);
  };

  const putFlag = (idx) => {
    if (showMap[idx]) return;

    const value = flagMap[idx] === true ? false : true;
    setFlagMap((prev) => ({ ...prev, [idx]: value }));
  };

  return (
    <div className="App">
      <h1>💥💥 MineSweeper 💥💥</h1>
      <div className="main">
        {gameOver && <div className="result game-over">Game over!!!</div>}
        {win && <div className="result game-win">You win!!!</div>}
        <div className="game">
          {mineMap.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const idx = rowIdx + "" + colIdx;
              return (
                <Cell
                  key={idx}
                  isShow={showMap[idx] === true}
                  hasFlag={flagMap[idx]}
                  hasMine={cell === "x"}
                  onShow={() => showIdx(rowIdx, colIdx, true)}
                  onFlag={() => putFlag(idx)}
                  value={cell !== "x" ? cell : "💥"}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;
