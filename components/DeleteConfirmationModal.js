'use client'

export default function DeleteConfirmationModal({ agentName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-red-500 text-2xl">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Agent</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the agent <strong>"{agentName}"</strong>?
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 text-lg">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  Your knowledge sources will <strong>not be deleted</strong> and will remain available 
                  for other agents. Knowledge sources must be deleted separately if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          >
            Delete Agent
          </button>
        </div>
      </div>
    </div>
  )
}