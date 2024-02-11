import React from 'react'

function Manual() {

  return (
    <div className='w-screen h-screen flex flex-col items-center  text-[#d0ed57] '>
        <div className=" text-6xl font-sans font-bold text-shadow mt-20" >
          Cyberpunk 2077 Breach Protocol
        </div>
        <form 
            action="http://localhost:5000/solve" 
            method="POST" 
            className='grid  grid-cols-2 mt-20 text-xl font-sans font-semibold w-1/2'
            >
            <div className='p-5 flex flex-row justify-between'>
                <label >Jumlah Token Unik </label>
                <label >:</label>
            </div>
            <input type="text" name="uniqueToken" className='h-10 m-5 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)] p-3' required></input>
            <div className='p-5 flex flex-row justify-between'>
                <label >Token Unik </label>
                <label >:</label>
            </div>
            <input type="text" name="token" className='h-10 m-5 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)]' required></input>
            <div className='p-5 flex flex-row justify-between'>
                <label  >Ukuran Buffer </label>
                <label >:</label>
            </div>
            <input type="text" name="bufferSize" className='h-10 m-5 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)] 'required></input>
            <div className='p-5 flex flex-row justify-between'>
                <label >Ukuran Matriks </label>
                <label >:</label>
            </div>
            <div className='flex flex-row p-5 gap-4'>
                <label className='mt-1' >Rows</label>
                <input type="text" name="matrixHeight" className='h-10  w-1/3 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)]' required></input>
                <label className='mt-1' >Cols</label>
                <input type="text" name="matrixWidth" className='h-10 w-1/3 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)]' required></input>
            </div>
            <div className='p-5 flex flex-row justify-between'>
                <label >Jumlah Sequences</label>
                <label >:</label>
            </div>
            <input type="text" name="sequenceSize" className='h-10 m-5 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)]' required></input>
            <div className='p-5 flex flex-row justify-between'>
                <label >Ukuran Maksimal Sequences</label>
                <label >:</label>
            </div>
            <input type="text" name="maxSequence" className='h-10 m-5 bg-transparent border-2 text-center shadow-[5px_5px_0_0_rgba(208,237,87,1)]' required></input>
            <div className='col-span-2 flex items-center justify-center p-5'>
            <button type='submit' className='w-1/3 border-2 border-solid p-3 text-3xl shadow-[5px_5px_0_0_rgba(208,237,87,1)] hover:bg-[#d0ed57] hover:bg-opacity-10 active:scale-95 transition duration-150 ease-in-out'>Solve</button>
            </div>
        </form>
    </div>
  )
}

export default Manual
