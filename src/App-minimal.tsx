import React from 'react'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          RealGlobal Platform
        </h1>
        <p className="text-lg text-gray-600">
          AI-Powered Real Estate Investment Platform
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <p className="text-green-600 font-semibold">
            ✅ Server is running successfully!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The full application with all features will load here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App