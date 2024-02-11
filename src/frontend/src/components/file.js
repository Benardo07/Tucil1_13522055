import React, { useState, useRef } from 'react';

function File() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      // If you want to support uploading the dropped file, you can do so here
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current.click();
  };

  const handleSolveClick = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/solveFile', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data); // Process the response data as needed
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  return (
    <div className='w-screen h-screen flex flex-col items-center text-[#d0ed57]'>
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
      <button onClick={handleSolveClick}  className='w-40 mt-5 border-2 border-solid p-3 text-3xl shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out'>Solve</button>

    </div>
  );
}

export default File;
