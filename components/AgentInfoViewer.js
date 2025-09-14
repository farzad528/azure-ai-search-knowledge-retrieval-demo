'use client'

export default function AgentInfoViewer({ agent, onClose }) {
  if (!agent) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">Agent Configuration: {agent.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">Basic Information</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Name:</strong> {agent.name}</div>
              <div><strong>Description:</strong> {agent.description}</div>
              <div><strong>Output Mode:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  agent.outputConfiguration?.modality === 'answerSynthesis' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {agent.outputConfiguration?.modality || 'extractiveData'}
                </span>
              </div>
            </div>
          </div>

          {/* Knowledge Sources */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">
              Knowledge Sources ({agent.knowledgeSources?.length || 0})
            </h4>
            <div className="space-y-2">
              {agent.knowledgeSources?.map(ks => (
                <div key={ks.name} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                  <span className="font-medium">{ks.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      ks.includeReferences ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ks.includeReferences ? 'References: On' : 'References: Off'}
                    </span>
                  </div>
                </div>
              ))}
              {(!agent.knowledgeSources || agent.knowledgeSources.length === 0) && (
                <p className="text-sm text-gray-500">No knowledge sources configured</p>
              )}
            </div>
          </div>

          {/* Model Configuration */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">Model Configuration</h4>
            <div className="space-y-1 text-sm">
              {agent.models?.map((model, i) => (
                <div key={i} className="bg-white p-2 rounded">
                  <div><strong>Type:</strong> {model.kind}</div>
                  {model.azureOpenAIParameters && (
                    <>
                      <div><strong>Model:</strong> {model.azureOpenAIParameters.modelName}</div>
                      <div><strong>Deployment:</strong> {model.azureOpenAIParameters.deploymentId}</div>
                      <div className="text-xs text-gray-600 truncate">
                        <strong>Endpoint:</strong> {model.azureOpenAIParameters.resourceUri}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {(agent.retrievalInstructions || agent.answerInstructions) && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">Instructions</h4>
              <div className="space-y-3">
                {agent.retrievalInstructions && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Retrieval Instructions:</h5>
                    <div className="bg-white p-2 rounded text-sm text-gray-600 whitespace-pre-wrap">
                      {agent.retrievalInstructions}
                    </div>
                  </div>
                )}
                {agent.answerInstructions && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Answer Instructions:</h5>
                    <div className="bg-white p-2 rounded text-sm text-gray-600 whitespace-pre-wrap">
                      {agent.answerInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}