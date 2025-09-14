'use client'
import { useState } from 'react'

export default function JsonViewer({ requestData, responseData, onClose }) {
  const [activeTab, setActiveTab] = useState('request')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">JSON View</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('request')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'request'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Request Payload
              </button>
              <button
                onClick={() => setActiveTab('response')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'response'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Response Data
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'request' && (
            <div className="h-full flex flex-col min-h-0 p-4">
              <div className="mb-2 text-sm text-gray-600 flex-shrink-0">
                POST request payload sent to Azure AI Search Knowledge Retrieval API
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 rounded border min-h-0">
                <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {requestData ? JSON.stringify(requestData, null, 2) : 'No request data available'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="h-full flex flex-col min-h-0 p-4">
              <div className="mb-2 text-sm text-gray-600 flex-shrink-0">
                Raw JSON response from Azure AI Search Knowledge Retrieval API
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 rounded border min-h-0">
                <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {responseData ? JSON.stringify(responseData, null, 2) : 'No response data available'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-500">
            {activeTab === 'request' 
              ? 'The exact JSON payload sent to the Azure AI Search API'
              : 'The raw response received from the Azure AI Search API'
            }
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}