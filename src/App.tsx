import { useState, useEffect, useMemo } from 'react'
import './App.css'

type Grid = number[][]
type Solution = { row: number; col: number; num: number } | null

// Initialize grid with 16 clues (0-based indexing)
function initializeGrid(): Grid {
  const g: Grid = Array(9).fill(null).map(() => Array(9).fill(0))
  
  // Row 0 (1-based row 1): col 1=2, col 2=9
  g[0][2] = 2
  g[0][4] = 9
  
  // Row 1 (1-based row 2): col 0=8, col 1=5
  g[1][0] = 8
  g[1][2] = 5
  
  // Row 2 (1-based row 3): col 0=1
  g[2][0] = 1
  
  // Row 3 (1-based row 4): col 1=9, col 3=6, col 5=4
  g[3][1] = 9
  g[3][4] = 6
  g[3][7] = 4
  
  // Row 4 (1-based row 5): col 5=5, col 6=8
  g[4][7] = 5
  g[4][8] = 8
  
  // Row 5 (1-based row 6): col 6=1
  g[5][8] = 1
  
  // Row 6 (1-based row 7): col 1=7, col 4=2
  g[6][1] = 7
  g[6][6] = 2
  
  // Row 7 (1-based row 8): col 0=3, col 3=5
  g[7][0] = 3
  g[7][3] = 5
  
  // Row 8 (1-based row 9): col 3=1
  g[8][3] = 1
  
  return g
}

// Check if placing num at (row, col) is valid
function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false
    }
  }
  
  return true
}

// Count solutions up to maxSolutions (for efficiency)
function countSolutions(grid: Grid, maxSolutions: number = 2): number {
  let count = 0
  
  function backtrack(): void {
    if (count >= maxSolutions) return
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num
              backtrack()
              grid[row][col] = 0
              if (count >= maxSolutions) return
            }
          }
          return // No valid number found, backtrack
        }
      }
    }
    // Grid is complete
    count++
  }
  
  backtrack()
  return count
}

// Find the 17th clue in the upper-right 3x3 box (rows 0-2, cols 6-8)
function find17thClue(initialGrid: Grid): Solution {
  // Upper-right box: rows 0-2, columns 6-8
  for (let row = 0; row < 3; row++) {
    for (let col = 6; col < 9; col++) {
      // Skip if cell already has a clue
      if (initialGrid[row][col] !== 0) continue
      
      // Try each number 1-9
      for (let num = 1; num <= 9; num++) {
        // Check if this number is valid in this position
        if (!isValid(initialGrid, row, col, num)) continue
        
        // Create a copy of the grid with this number placed
        const testGrid = initialGrid.map(r => [...r])
        testGrid[row][col] = num
        
        // Count solutions
        const solutionCount = countSolutions(testGrid, 2)
        
        if (solutionCount === 1) {
          return { row, col, num }
        }
      }
    }
  }
  
  return null
}

function App() {
  const initialGrid = useMemo(() => initializeGrid(), [])
  const [grid, setGrid] = useState<Grid>(() => initialGrid)
  const [solution, setSolution] = useState<Solution>(null)
  const [solving, setSolving] = useState(true)

  // Find solution on component mount
  useEffect(() => {
    // Use setTimeout to avoid blocking the UI
    const timer = setTimeout(() => {
      const result = find17thClue(initialGrid)
      setSolution(result)
      if (result) {
        const newGrid = initialGrid.map(r => [...r])
        newGrid[result.row][result.col] = result.num
        setGrid(newGrid)
      }
      setSolving(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [initialGrid])

  // Check if a cell is in the upper-right box
  function isUpperRightBox(row: number, col: number): boolean {
    return row < 3 && col >= 6 && col < 9
  }

  // Check if a cell is an initial clue
  function isInitialClue(row: number, col: number): boolean {
    return initialGrid[row][col] !== 0
  }

  return (
    <div className="app">
      <h1>Code Challenge #22: Sudoku</h1>
      <p className="problem-description">
        Sudoku puzzles cannot have unique solutions unless they have 17 or more clues.
        This puzzle has 16 clues. Find the 17th clue in the upper-right 3x3 box.
      </p>
      
      {solving && <p className="solving">Solving...</p>}
      
      {solution && (
        <div className="solution">
          <h2>Solution Found!</h2>
          <p>
            Place <strong>{solution.num}</strong> at row {solution.row + 1}, column {solution.col + 1}
            <br />
            (Position: {solution.row + 1}, {solution.col + 1})
          </p>
        </div>
      )}
      
      <div className="sudoku-container">
        <table className="sudoku-grid">
          <tbody>
            {grid.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 3 === 2 && rowIdx < 8 ? 'row-border' : ''}>
                {row.map((cell, colIdx) => {
                  const isUpperRight = isUpperRightBox(rowIdx, colIdx)
                  const isSolution = solution && solution.row === rowIdx && solution.col === colIdx
                  const isInitial = isInitialClue(rowIdx, colIdx)
                  
                  return (
                    <td
                      key={colIdx}
                      className={`
                        ${colIdx % 3 === 2 && colIdx < 8 ? 'col-border' : ''}
                        ${isUpperRight ? 'upper-right-box' : ''}
                        ${isSolution ? 'solution-cell' : ''}
                        ${isInitial ? 'initial-clue' : ''}
                      `}
                    >
                      {cell !== 0 ? cell : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
