import { useState, useMemo } from "react";
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

      map[x][y] = value || "";
    }
  }

  return map;
}

function Game({ size, level }) {
  const [showMap, setShowMap] = useState({});
  const [flagMap, setFlagMap] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [gridSize, setGridSize] = useState(size);
  const [gameLevel, setGameLevel] = useState(level);
  const [toggleReset, setToggleReset] = useState(false);

  const numberOfMines = useMemo(
    () => Math.floor((gridSize * gridSize) / (7 - gameLevel - 1)),
    [gridSize, gameLevel]
  );
  let mineMap = useMemo(
    () => generateMineMap(numberOfMines, gridSize),
    [numberOfMines, gridSize, toggleReset]
  );

  // I set width of cell is 50px and gaps is 5px => size * 55 = gridWidth
  const gridWidth = gridSize * 55;

  const exploreCell = function (rowIdx, colIdx) {
    let traceMap = { ...showMap };

    function recursiveExplore(rowIdx, colIdx) {
      const idx = rowIdx + "" + colIdx;

      if (!(isValidIdx(rowIdx, gridSize) && isValidIdx(colIdx, gridSize)))
        return;
      if (traceMap[idx]) return;

      traceMap[idx] = true;

      if (mineMap[rowIdx][colIdx] == "x") {
        console.log("You got Mine!!!");
        setGameOver(true);
        return;
      }

      if (mineMap[rowIdx][colIdx] === "") {
        recursiveExplore(rowIdx, colIdx - 1);
        recursiveExplore(rowIdx, colIdx + 1);

        recursiveExplore(rowIdx + 1, colIdx);
        recursiveExplore(rowIdx + 1, colIdx - 1);
        recursiveExplore(rowIdx + 1, colIdx + 1);

        recursiveExplore(rowIdx - 1, colIdx);
        recursiveExplore(rowIdx - 1, colIdx - 1);
        recursiveExplore(rowIdx - 1, colIdx + 1);
      }
    }

    recursiveExplore(rowIdx, colIdx);

    if (gridSize * gridSize - Object.keys(traceMap).length === numberOfMines)
      setGameWin(true);

    setShowMap(traceMap);
  };

  const putFlag = (idx) => {
    if (showMap[idx]) return;

    const value = flagMap[idx] === true ? false : true;
    setFlagMap((prev) => ({ ...prev, [idx]: value }));
  };

  const reset = () => {
    setGameOver(false);
    setGameWin(false);
    setShowMap({});
    setFlagMap({});
    setToggleReset((prev) => !prev);
  };

  // Event handler
  const onSelectLevel = (e) => {
    const _level = parseInt(e.target.value);
    setGameLevel(() => {
      reset();
      return _level;
    });
  };

  const onSelectSize = (e) => {
    const _size = parseInt(e.target.value);
    setGridSize(_size);
    reset();
  };

  return (
    <div className="App">
      <h1>💥💥 MineSweeper 💥💥</h1>

      <div className="controller">
        <div className="selection-group">
          <label htmlFor="game-level-selection">Level: </label>
          <select id="game-level-selection" onChange={onSelectLevel}>
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>
        </div>

        <div className="selection-group">
          <label htmlFor="grid-size-selection">Grid size: </label>
          <select id="grid-size-selection" onChange={onSelectSize}>
            <option value="6">6x6</option>
            <option value="8">8x8</option>
            <option value="10">10x10</option>
          </select>
        </div>

        <button onClick={reset}>↻</button>
      </div>

      <div className="info">
        <span>
          You got <b>{numberOfMines}</b> 💥 to sweep.
        </span>
      </div>

      <div className="main" style={{ width: `${gridWidth}px` }}>
        {gameOver && <div className="result game-over">Game over!!!</div>}
        {gameWin && <div className="result game-win">You win!!!</div>}
        <div className="game">
          {mineMap.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const idx = rowIdx + "" + colIdx;
              return (
                <Cell
                  key={idx}
                  isShow={showMap[idx] === true || gameOver}
                  hasFlag={flagMap[idx]}
                  hasMine={cell === "x"}
                  onShow={() => exploreCell(rowIdx, colIdx)}
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
