/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        // Add your custom shadow here
        'text-shadow': '2px 2px 4px #d0ed57',
      }
    },
  },
  plugins: [],
}

