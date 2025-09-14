'use client'
import { useState } from 'react'

export default function SettingsDialog({ params, onChange, onClose }) {
  const [filterAddOn, setFilterAddOn] = useState(params.knowledgeSourceParams?.[0]?.filterAddOn || '')

  const handleSave = () => {
    const updatedParams = { ...params }
    
    if (filterAddOn.trim()) {
      updatedParams.knowledgeSourceParams = [{
        filterAddOn: filterAddOn.trim()
      }]
    } else {
      // Remove knowledgeSourceParams if filterAddOn is empty
      delete updatedParams.knowledgeSourceParams
    }
    
    onChange(updatedParams)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Query Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Add-On
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Additional filter expression to apply to the knowledge source search. Use OData syntax to filter results.
            </p>
            <textarea
              value={filterAddOn}
              onChange={(e) => setFilterAddOn(e.target.value)}
              placeholder="e.g. category eq 'medical' or publishDate gt 2023-01-01"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional: Leave empty to search all available content without additional filtering
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}