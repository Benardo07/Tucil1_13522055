

import React, { useState, useRef } from 'react';

function File() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState({});
  const fileInputRef = useRef();

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      event.target.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };



  const handleSolveClick = async () => {

    if (!selectedFile ) {
      alert('Please select a file ');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsLoading(true);

    try {
      const response = await fetch('/solveFile', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 400) {
        const errorData = await response.json(); // Assuming the backend sends a JSON response with an error message
        alert(`Error: ${errorData.message}`); // Display the error message from the backend
        setIsLoading(false); // Stop loading since we've handled the error
        return; // Exit the function early to avoid further processing
    }
      const data = await response.json();

      setResults(data);
      setShowResult(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    }finally {
      setIsLoading(false); // Stop loading regardless of the outcome
    }
  };
  const renderMatrix = (matrix) => {
    return (
      <table style={{ margin: "auto", borderCollapse: "collapse" }}>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{ border: "1px solid #d0ed57", padding: "5px", textAlign: "center" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  const handleResult = () => {
    setShowResult(false);
    setSelectedFile(null);
  }

  const handleDownloadResult = () => {
    if (!results || !results.bestPath) {
      alert('No results to download');
      return;
    }
    
    // Construct the content for the text file
    let content = `${results.maxReward}\n`;
    content += results.bestPath.map(tokenInfo => tokenInfo.value).join(" ") + "\n";
    results.bestPath.forEach((tokenInfo, index) => {
      content += `${tokenInfo.pos.x + 1}, ${tokenInfo.pos.y + 1}\n`;
    });
    content += `${results.executionTime} ms\n`;

    // Convert the content to a Blob object
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a URL for the Blob object
    const fileURL = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = fileURL;
    tempLink.setAttribute('download', 'results.txt'); // Specify the filename for download
    document.body.appendChild(tempLink); // Append to the body (required for Firefox)

    // Programmatically click the anchor to trigger the download
    tempLink.click();

    // Clean up by removing the temporary link and revoking the Blob URL
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(fileURL);
  };

  return (
    <div className='w-screen h-screen flex flex-col items-center text-[#d0ed57]'>
      {isLoading && (
        <div className="fixed w-20 h-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-5 rounded-lg flex flex-col items-center z-50">
          <p>Loading...</p>
        </div>
      )}
      <div className={`flex flex-col items-center w-full h-full ${showResult ? 'filter blur-sm' : ''}`}>
        <div className="text-6xl font-sans font-bold text-shadow mt-20 text-center">
          Cyberpunk 2077 Breach Protocol
        </div>
        <div className="mt-10">
          <div 
            className="border-2 border-dashed border-[#d0ed57] rounded-lg p-10 w-96 text-center cursor-pointer"
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            Drag and drop a file here, or click to select a file.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedFile && (
            <p className="mt-4 text-center">Selected file: {selectedFile.name}</p>
          )}
        </div>
        <button onClick={handleSolveClick} className='w-40 mt-5 border-2 border-solid p-3 text-3xl shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out'>Solve</button>
        
        <div>
            <a href='/manual'><button className="fixed top-10 right-10 border-2 border-[#d0ed57] border-solid p-2 text-l font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">Input Manual</button></a>
        </div>
        <div>
            <a href='/'><button className="fixed top-10 left-10 border-2 border-[#d0ed57] border-solid p-2 text-l font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">First Page</button></a>
        </div>
      </div>
      {showResult && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#111] text-white p-5 rounded-lg flex flex-col items-center z-50 max-w-4xl max-h-[80vh] overflow-auto w-2/3 h-2/3">
          <h2 className="text-xl font-bold w-full  bg-[#d0ed57] text-black text-center">Results:</h2>
          <div className='flex flex-row justify-between w-2/3 flex-wrap'>
            <div className="my-5">
              <h3 className="text-lg font-semibold">Matrix:</h3>
              {renderMatrix(results.data.matrix)}
            </div>
            <div className="my-5">
              <h3 className="text-lg font-semibold">Sequences and Rewards:</h3>
              {results.data.sequences.map((seq, index) => (
                <div key={index} className="mt-2">
                  <span>- Sequence: {seq.tokens.join(", ")} </span>
                  <span className='ml-3'> | Reward: {seq.reward}</span>
                </div>
              ))}
            </div>
          </div>
          <div className='flex flex-row justity-between w-2/3'>
          {results.maxReward > 0 ? (
            <div className='flex flex-row justify-between w-2/3'>
              <div className="my-5 w-2/3">
                <h3 className="text-lg font-semibold">Best Path:</h3>
                <div>{results.bestPath.map(tokenInfo => tokenInfo.value).join(" ")}</div>
              </div>
              <div className="my-5">
                <h3 className="text-lg font-semibold">Max Reward:</h3>
                <pre className="whitespace-pre-wrap">{results.maxReward}</pre>
              </div>
            </div>
          ) : (
            <div className="my-5 w-full text-center">
              <h3 className="text-lg font-semibold">No Solution</h3>
            </div>
          )}
            <div className="my-5">
              <h3 className="text-lg font-semibold">Max Reward:</h3>
              <pre className="whitespace-pre-wrap">{results.maxReward}</pre>
            </div>
          </div>
          <div className="my-5 w-2/3">
            <h3 className="text-lg font-semibold">Coordinates of Best Path:</h3>
            <div className='flex flex-col gap-3'>
              {results.bestPath.map((tokenInfo, index) => (
                <div key={index}>
                  {tokenInfo.pos.x + 1}, {tokenInfo.pos.y + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="my-5 w-2/3 text-lg font-semibold">
            Execution Time : {results.executionTime} ms
          </div>
          <div className='flex flex-row w-2/3 justify-between'>
          <button onClick={handleDownloadResult} className="border-2 border-[#d0ed57] border-solid p-4 text-l font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">Download Result</button>
          <button onClick={handleResult} className="border-2 border-[#d0ed57] border-solid p-4 text-l font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">Close</button>
          </div>
        </div>
    )}
      
      
    </div>
  );
}

export default File;

