import React from 'react'

function Firstpage() {
    return (
      <div className=' w-screen h-screen flex flex-col items-center justify-center text-[#d0ed57]'>
        <div className=" text-6xl font-sans font-bold text-shadow">
          Cyberpunk 2077 Breach Protocol
        </div>
        <div className="text-xl font-sans font-normal mt-12 "> 
            BREACH PROTOCOL SOLVER - START CRACKING AND FIND SOLUTION
        </div>
        <div className='border-y-4 border-solid w-2/3  border-[#d0ed57] shadow-[0_0_30px_0_rgba(208,237,87,1)] mt-5'></div>

        <div className='flex flex-row items-center justify-center gap-10 mt-10'>
            <a> <button href="/api" className="border-2 border-[#d0ed57] border-solid p-4 text-xl font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">Input Manual</button></a>
            <a> <button className="border-2 border-[#d0ed57] border-solid p-4 text-xl font-sans font-semibold shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out">Input From File</button></a>
        </div>
      </div>
    );
  }
  
  export default Firstpage;