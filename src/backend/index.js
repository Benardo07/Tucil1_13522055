const express = require('express')
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const readline = require('readline');
const { TokenInfo, Position, Sequence } = require('./entitites');
const app = express()

app.use(express.urlencoded({ extended: true }));



function calculatePathReward(path, sequences) {
    let totalReward = 0;
    sequences.forEach(sequence => {
      if (sequence.tokens.length > path.length) return;
      for (let i = 0; i <= path.length - sequence.tokens.length; i++) {
        let match = true;
        for (let j = 0; j < sequence.tokens.length; j++) {
          if (path[i + j].value !== sequence.tokens[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          totalReward += sequence.reward;
          break; // Assuming a path can match a sequence only once
        }
      }
    });
    return totalReward;
  }


function explorePaths(matrix, pos, path, visited, bufferSize, moveVertical, sequences, maxReward, bestPath) {
    if (pos.x < 0 || pos.x >= matrix[0].length || pos.y < 0 || pos.y >= matrix.length || visited[pos.y][pos.x]) {
      return;
    }
  
    visited[pos.y][pos.x] = true;
    path.push(new TokenInfo(matrix[pos.y][pos.x], pos));
  
    let currentReward = calculatePathReward(path, sequences);
    if (currentReward > maxReward.max) {
      maxReward.max = currentReward;
      bestPath.length = 0; // Clear existing path
      path.forEach(p => bestPath.push(p)); // Copy current path to bestPath
    }
  
    if (path.length < bufferSize) {
      let nextPositions = [];
      if (moveVertical) {
        for (let newY = pos.y + 1; newY < matrix.length; newY++) {
          nextPositions.push(new Position(pos.x, newY));
        }
        for (let newY = pos.y - 1; newY >= 0; newY--) {
          nextPositions.push(new Position(pos.x, newY));
        }
      } else {
        for (let newX = pos.x + 1; newX < matrix[0].length; newX++) {
          nextPositions.push(new Position(newX, pos.y));
        }
        for (let newX = pos.x - 1; newX >= 0; newX--) {
          nextPositions.push(new Position(newX, pos.y));
        }
      }
  
      nextPositions.forEach(nextPos => {
        explorePaths(matrix, nextPos, path, visited, bufferSize, !moveVertical, sequences, maxReward, bestPath);
      });
    }
  
    path.pop();
    visited[pos.y][pos.x] = false;
}
  

async function readFromFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    const data = {
      bufferSize: 0,
      matrixWidth: 0,
      matrixHeight: 0,
      matrix: [],
      sequences: []
    };
  
    let lineCount = 0;
    let numberOfSequences = 0;
    let isReadingSequence = true;
    let tokens;
    for await (const line of rl) {
      if (line.trim() === '') continue;
      if(lineCount === 0){
        data.bufferSize = parseInt(line);
      }else if(lineCount === 1){
        [data.matrixWidth, data.matrixHeight] = line.split(' ').map(Number);
      }else if(lineCount <= data.matrixHeight + 1){
        data.matrix.push(line.split(' '));
      }else if(lineCount === data.matrixHeight + 2){
        numberOfSequences = parseInt(line);
      }else{
        if(isReadingSequence){
            tokens = line.split(' ');
            isReadingSequence = false;
        }else{
            const reward = parseInt(line,10);
            data.sequences.push({ tokens, reward });
            isReadingSequence = true;
        }
        
        
      }
      lineCount++;
    }
  
    return data;
  }
  
const upload = multer({ dest: 'uploads/' });
app.post("/solveFile", upload.single('file'), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
  }

  try {
      const startTime = Date.now();
      const data = await readFromFile(req.file.path);
      const matrix = data.matrix;
      const sequences = data.sequences.map(seq => new Sequence(seq.tokens, seq.reward));

      
      let overallBestPath = [];
      let maxOverallReward = 0;

      // Loop through each column in the first row
      for (let col = 0; col < data.matrixWidth; col++) {
          const visited = Array.from({ length: data.matrixHeight }, () => Array(data.matrixWidth).fill(false));
          const path = [];
          const bestPath = [];
          const maxRewardObject = { max: 0 };
          const startPos = new Position(col, 0); // Starting position for this iteration

          explorePaths(matrix, startPos, path, visited, data.bufferSize, true, sequences, maxRewardObject, bestPath);

          // Compare and update overall best path and reward
          if (maxRewardObject.max > maxOverallReward) {
              maxOverallReward = maxRewardObject.max;
              overallBestPath = bestPath.slice(); // Make a copy of the best path
          }
      }

      const endTime = Date.now(); // End timing
      const executionTime = endTime - startTime;

      // Respond with the best results found among all starting positions
      res.json({
          message: "File processed successfully",
          data: data,
          maxReward: maxOverallReward,
          bestPath: overallBestPath.map(t => ({ value: t.value, pos: t.pos })),
          executionTime: executionTime
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error processing file", error: error.message });
  }
});

app.post('/solve',upload.none(), async (req, res) => {
  let { token, bufferSize, matrixHeight, matrixWidth, sequenceSize, maxSequence } = req.body;

  // Convert token to array if it's a string
  if (typeof token === 'string') {
    token = token.split(' ');
  }

  // Validate input
  if (!token || !bufferSize || !matrixHeight || !matrixWidth || !sequenceSize || !maxSequence || token.length === 0) {
    return res.status(400).json({ message: "All fields are required and token array cannot be empty" });
  }

  // Parse numeric values from strings
  bufferSize = parseInt(bufferSize, 10);
  matrixWidth = parseInt(matrixWidth, 10);
  matrixHeight = parseInt(matrixHeight, 10);
  sequenceSize = parseInt(sequenceSize, 10);
  maxSequence = parseInt(maxSequence, 10);

  // Initialize data structure
  let data = {
    bufferSize,
    matrixWidth,
    matrixHeight,
    matrix: [],
    sequences: []
  };

  // Generate the matrix
  for (let i = 0; i < matrixHeight; ++i) {
    let row = [];
    for (let j = 0; j < matrixWidth; ++j) {
      let tokenIndex = Math.floor(Math.random() * token.length);
      row.push(token[tokenIndex]);
    }
    data.matrix.push(row);
  }

  // Generate sequences
  for (let i = 0; i < sequenceSize; ++i) {
    let sequenceLength = 2 + Math.floor(Math.random() * (maxSequence - 1));
    let sequenceTokens = [];
    for (let j = 0; j < sequenceLength; ++j) {
      let tokenIndex = Math.floor(Math.random() * token.length);
      sequenceTokens.push(token[tokenIndex]);
    }
    let reward = (Math.floor(Math.random() * 10) + 1) * 5;
    data.sequences.push({ tokens: sequenceTokens, reward });
  }

  // Find best path starting from each column in the first row
  let bestOverallReward = 0;
  let bestOverallPath = [];
  const startTime = Date.now();

  for (let col = 0; col < matrixWidth; ++col) {
    const startPos = new Position(col, 0);
    const visited = Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill(false));
    const path = [];
    const bestPath = [];
    const maxRewardObject = { max: 0 };

    explorePaths(data.matrix, startPos, path, visited, bufferSize, true, data.sequences, maxRewardObject, bestPath);

    if (maxRewardObject.max > bestOverallReward) {
      bestOverallReward = maxRewardObject.max;
      bestOverallPath = bestPath.slice(); // Make a copy of the best path
    }
  }

  const endTime = Date.now();
  const executionTime = endTime - startTime;

  // Send response
  res.json({
    message: "Matrix and sequences generated successfully",
    data,
    maxReward: bestOverallReward,
    bestPath: bestOverallPath.map(t => ({ value: t.value, pos: t.pos })),
    executionTime
  });
});

app.listen(5000, () => {console.log("Server started on port 5000")})