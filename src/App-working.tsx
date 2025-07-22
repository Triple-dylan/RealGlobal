import React, { useState } from 'react'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                RealGlobal Platform
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                AI-Powered Real Estate Investment Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('map')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'map'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                🌍 Interactive Map
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'portfolio'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                📊 Portfolio Analytics
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'properties'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                🏢 Property Search
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'ai'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                🤖 AI Assistant
              </button>
            </div>
          </nav>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'map' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Interactive Global Map
                </h2>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🌍</div>
                    <p className="text-gray-600 mb-2">Interactive Map Component</p>
                    <p className="text-sm text-gray-500">
                      Mapbox integration with property overlays, opportunity zones, and market data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Portfolio Analytics Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900">Total Value</h3>
                    <p className="text-2xl font-bold text-blue-600">$2.4M</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-900">ROI</h3>
                    <p className="text-2xl font-bold text-green-600">+12.4%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900">Properties</h3>
                    <p className="text-2xl font-bold text-purple-600">8</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Search & Analysis
                </h2>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search for properties..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                      Search
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="bg-gray-200 h-32 rounded mb-3"></div>
                        <h3 className="font-medium">Commercial Property {i}</h3>
                        <p className="text-sm text-gray-600">$850,000</p>
                        <p className="text-sm text-gray-500">Cap Rate: 6.2%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Investment Assistant
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        Hello! I'm your AI investment assistant. I can help you analyze properties, 
                        identify opportunities, and provide market insights. What would you like to know?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Ask me about real estate investment..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 