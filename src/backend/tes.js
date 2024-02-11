const express = require('express');
const fs = require('fs');
const readline = require('readline');

const app = express();
const port = 3000;

app.use(express.json());

const readFromFile = async (filePath) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let data = { bufferSize: 0, matrixWidth: 0, matrixHeight: 0, matrix: [], sequences: [] };
    let lineCount = 0;
    let sequenceRead = false;
    let sequenceIndex = 0;

    for await (const line of rl) {
        if (lineCount === 0) {
            data.bufferSize = parseInt(line);
        } else if (lineCount === 1) {
            [data.matrixWidth, data.matrixHeight] = line.split(' ').map(Number);
        } else if (lineCount <= data.matrixHeight + 1) {
            data.matrix.push(line.split(' '));
        } else if (!sequenceRead) {
            data.sequences = new Array(parseInt(line)).fill(null).map(() => ({ tokens: [], reward: 0 }));
            sequenceRead = true;
        } else {
            if (line.includes(' - Reward: ')) {
                const [tokens, reward] = line.split(' - Reward: ');
                data.sequences[sequenceIndex].tokens = tokens.split(' ');
                data.sequences[sequenceIndex].reward = parseInt(reward);
                sequenceIndex++;
            }
        }
        lineCount++;
    }

    return data;
};

const calculatePathReward = (path, sequences) => {
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
                break;
            }
        }
    });
    return totalReward;
};

// Example endpoint to trigger file read and process
app.get('/processFile', async (req, res) => {
    const filePath = 'path/to/your/input/file.txt'; // Specify your file path here
    const inputData = await readFromFile(filePath);
    // Process inputData as needed, for example:
    console.log(inputData);
    res.send('File processed. Check server logs for output.');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
