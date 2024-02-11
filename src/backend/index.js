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
    // You can access the uploaded file through req.file
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        // Asynchronously read from the uploaded file and wait for the data
        const data = await readFromFile(req.file.path);
        const matrix = data.matrix;
        const sequences = data.sequences.map(seq => new Sequence(seq.tokens, seq.reward));
        const visited = Array.from({ length: data.matrixHeight }, () => Array(data.matrixWidth).fill(false));
        const path = [];
        const bestPath = [];
        const maxRewardObject = { max: 0 };

        // Choose an appropriate starting position based on your requirements
        const startPos = new Position(0, 0); // Example starting position

        // Call explorePaths with the read and prepared data
        explorePaths(matrix, startPos, path, visited, data.bufferSize, true, sequences, maxRewardObject, bestPath);

        // Respond with the results
        res.json({
            message: "File processed successfully",
            data: data,
            maxReward: maxRewardObject.max,
            bestPath: bestPath.map(t => ({ value: t.value, pos: t.pos }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing file", error: error.message });
    }
});

app.post('/solve',upload.none(), (req, res) => {
  console.log(req.body);
  let { bufferSize ,token, matrixHeight, matrixWidth, sequenceSize, maxSequence } = req.body;

  // Simple validation to check if all fields are provided
  if (typeof token === 'string') {
    token = token.split(' ');
}

// Simple validation to check if all fields are provided
if (!token || !bufferSize || !matrixHeight || !matrixWidth || !sequenceSize || !maxSequence || token.length === 0) {
    return res.status(400).json({ message: "All fields are required and token array cannot be empty" });
}

  // Initialize the data structure
  let data = {
      bufferSize: parseInt(bufferSize, 10),
      matrixWidth: parseInt(matrixWidth, 10),
      matrixHeight: parseInt(matrixHeight, 10),
      matrix: [],
      sequences: []
  };
  console.log(data)
  // Generate the matrix
  for (let i = 0; i < data.matrixHeight; ++i) {
      data.matrix[i] = [];
      for (let j = 0; j < data.matrixWidth; ++j) {
          let tokenIndex = Math.floor(Math.random() * token.length); // Randomly select a token index
          data.matrix[i][j] = token[tokenIndex]; // Assign the token to the matrix cell
      }
  }

  // Generate sequences
  for (let i = 0; i < sequenceSize; ++i) {
      let randomSequenceSize = 2 + Math.floor(Math.random() * (maxSequence - 1)); // Random size between 2 and maxSequence
      let sequenceTokens = [];
      for (let j = 0; j < randomSequenceSize; ++j) {
          let tokenIndex = Math.floor(Math.random() * token.length); // Randomly select a token index
          sequenceTokens.push(token[tokenIndex]); // Add the token to the sequence
      }
      let reward = (Math.floor(Math.random() * 10) + 1) * 5; // Random reward between 5 and 50, in steps of 5
      data.sequences.push({ tokens: sequenceTokens, reward: reward });
  }

  // Log generated data for debugging
  const matrix = data.matrix;
  const sequences = data.sequences.map(seq => new Sequence(seq.tokens, seq.reward));
  const visited = Array.from({ length: data.matrixHeight }, () => Array(data.matrixWidth).fill(false));
  const path = [];
  const bestPath = [];
  const maxRewardObject = { max: 0 };

  // Choose an appropriate starting position based on your requirements
  const startPos = new Position(0, 0); // Example starting position

  // Call explorePaths with the read and prepared data
  explorePaths(matrix, startPos, path, visited, data.bufferSize, true, sequences, maxRewardObject, bestPath);

  console.log(data)
  // Sending a success response with generated data
  res.json({
      message: "Matrix and sequences generated successfully",
      data: data,
      maxReward: maxRewardObject.max,
      bestPath: bestPath.map(t => ({ value: t.value, pos: t.pos }))
  });
});

app.listen(5000, () => {console.log("Server started on port 5000")})