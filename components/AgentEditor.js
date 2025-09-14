'use client'
import { useState, useEffect } from 'react'
import { fetchKnowledgeSources, createAgent, updateAgent } from '@/lib/api'

export default function AgentEditor({ agent, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    knowledgeSources: [],
    models: [{
      kind: 'azureOpenAI',
      azureOpenAIParameters: {
        resourceUri: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || 'https://fsunavala-openai-swecen.openai.azure.com',
        deploymentId: 'gpt-4o-mini',
        modelName: 'gpt-4o-mini'
      }
    }],
    outputConfiguration: {
      modality: 'extractiveData'
    },
    retrievalInstructions: '',
    answerInstructions: ''
  })
  
  const [availableKnowledgeSources, setAvailableKnowledgeSources] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Load available knowledge sources and use hardcoded models
    async function loadData() {
      try {
        const ksData = await fetchKnowledgeSources()
        
        // Hardcoded supported Azure OpenAI models
        const supportedModels = [
          { id: 'gpt-4o', model: 'gpt-4o' },
          { id: 'gpt-4o-mini', model: 'gpt-4o-mini' },
          { id: 'gpt-4.1-nano', model: 'gpt-4.1-nano' },
          { id: 'gpt-4.1-mini', model: 'gpt-4.1-mini' },
          { id: 'gpt-4.1', model: 'gpt-4.1' },
          { id: 'gpt-5', model: 'gpt-5' },
          { id: 'gpt-5-mini', model: 'gpt-5-mini' },
          { id: 'gpt-5-nano', model: 'gpt-5-nano' }
        ]
        
        setAvailableKnowledgeSources(ksData.value || [])
        setAvailableModels(supportedModels)
        console.log('Using supported models:', supportedModels)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()

    // If editing existing agent, populate form
    if (agent) {
      setIsEditing(true)
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        knowledgeSources: agent.knowledgeSources || [],
        models: agent.models || formData.models,
        outputConfiguration: agent.outputConfiguration || formData.outputConfiguration,
        retrievalInstructions: agent.retrievalInstructions || '',
        answerInstructions: agent.answerInstructions || ''
      })
    }
  }, [agent])

  const handleKnowledgeSourceToggle = (ksName) => {
    const existing = formData.knowledgeSources.find(ks => ks.name === ksName)
    if (existing) {
      // Remove
      setFormData(prev => ({
        ...prev,
        knowledgeSources: prev.knowledgeSources.filter(ks => ks.name !== ksName)
      }))
    } else {
      // Add
      setFormData(prev => ({
        ...prev,
        knowledgeSources: [...prev.knowledgeSources, {
          name: ksName,
          includeReferences: true
        }]
      }))
    }
  }

  const handleOutputModalityChange = (modality) => {
    setFormData(prev => ({
      ...prev,
      outputConfiguration: {
        ...prev.outputConfiguration,
        modality: modality
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare agent data according to API schema
      const agentData = {
        name: formData.name,
        description: formData.description,
        knowledgeSources: formData.knowledgeSources.map(ks => ({
          name: ks.name,
          includeReferences: ks.includeReferences
        })),
        models: formData.models,
        outputConfiguration: {
          modality: formData.outputConfiguration.modality
        }
      }

      // Add optional instructions if provided
      if (formData.retrievalInstructions?.trim()) {
        agentData.retrievalInstructions = formData.retrievalInstructions
      }
      
      // Answer instructions go inside outputConfiguration
      if (formData.answerInstructions?.trim() && formData.outputConfiguration.modality === 'answerSynthesis') {
        agentData.outputConfiguration.answerInstructions = formData.answerInstructions
      }

      console.log('Submitting agent data:', JSON.stringify(agentData, null, 2))

      if (isEditing) {
        await updateAgent(agent.name, agentData)
        onSuccess(agentData.name)
      } else {
        await createAgent(agentData)
        onSuccess(agentData.name)
      }
    } catch (error) {
      console.error('Agent submission error:', error)
      alert(`Failed to ${isEditing ? 'update' : 'create'} agent: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-2">
            <div className="spinner"></div>
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {isEditing ? `Edit Agent: ${agent.name}` : 'Create New Agent'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-500" title="Unique identifier for your agent. Cannot be changed after creation.">
                    ℹ️
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isEditing}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter a unique agent name"
                  title="Unique identifier for your agent. Cannot be changed after creation."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-500" title="Brief description of what this agent does and its purpose.">
                    ℹ️
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Describe what this agent does..."
                  title="Brief description of what this agent does and its purpose."
                  required
                />
              </div>
            </div>

            {/* Knowledge Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Knowledge Sources <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500" title="Select data sources that the agent can search through to find relevant information.">
                  ℹ️
                </span>
              </label>
              <div className={`grid grid-cols-1 gap-2 max-h-32 overflow-auto border rounded-md p-2 ${isEditing ? 'bg-gray-50' : ''}`}>
                {availableKnowledgeSources.map(ks => (
                  <label key={ks.name} className={`flex items-center gap-2 ${isEditing ? 'cursor-not-allowed opacity-70' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.knowledgeSources.some(selected => selected.name === ks.name)}
                      onChange={() => handleKnowledgeSourceToggle(ks.name)}
                      disabled={isEditing}
                      className={isEditing ? 'cursor-not-allowed' : ''}
                    />
                    <span className="text-sm">{ks.name}</span>
                    <span className="text-xs text-gray-500">({ks.kind})</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.knowledgeSources.length}
                {isEditing && <span className="text-amber-600 ml-2">• Cannot be changed when editing</span>}
              </p>
            </div>

            {/* Output Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Mode <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500" title="Choose how the agent responds: Extract raw data or synthesize natural answers.">
                  ℹ️
                </span>
              </label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="outputMode"
                    value="extractiveData"
                    checked={formData.outputConfiguration.modality === 'extractiveData'}
                    onChange={(e) => handleOutputModalityChange(e.target.value)}
                  />
                  <span className="text-sm">Extractive Data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="outputMode"
                    value="answerSynthesis"
                    checked={formData.outputConfiguration.modality === 'answerSynthesis'}
                    onChange={(e) => handleOutputModalityChange(e.target.value)}
                  />
                  <span className="text-sm">Answer Synthesis</span>
                </label>
              </div>
            </div>

            {/* Retrieval Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retrieval Instructions
                <span className="ml-2 text-xs text-gray-500" title="Guide how the agent searches and filters information from knowledge sources.">
                  ℹ️
                </span>
              </label>
              <textarea
                value={formData.retrievalInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, retrievalInstructions: e.target.value }))}
                className="w-full p-2 border rounded-md h-20"
                placeholder="Instructions for how to retrieve relevant information..."
                title="Guide how the agent searches and filters information from knowledge sources."
              />
            </div>

            {/* Answer Instructions - Only show for Answer Synthesis */}
            {formData.outputConfiguration.modality === 'answerSynthesis' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer Instructions
                  <span className="ml-2 text-xs text-gray-500" title="Define how the agent should format and present synthesized answers to users.">
                    ℹ️
                  </span>
                </label>
                <textarea
                  value={formData.answerInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, answerInstructions: e.target.value }))}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Instructions for how to synthesize the answer..."
                  title="Define how the agent should format and present synthesized answers to users."
                />
              </div>
            )}

            {/* Model Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Deployment <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500" title="Choose the AI model that will process queries and generate responses.">
                  ℹ️
                </span>
              </label>
              <select
                value={formData.models[0]?.azureOpenAIParameters?.deploymentId || ''}
                onChange={(e) => {
                  const selectedModel = availableModels.find(m => m.id === e.target.value)
                  setFormData(prev => ({
                    ...prev,
                    models: [{
                      ...prev.models[0],
                      azureOpenAIParameters: {
                        ...prev.models[0].azureOpenAIParameters,
                        deploymentId: e.target.value,
                        modelName: selectedModel?.model || e.target.value
                      }
                    }]
                  }))
                }}
                disabled={isEditing}
                className={`w-full p-2 border rounded-md ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                title="Choose the AI model that will process queries and generate responses."
                required
              >
                <option value="">Select a model deployment...</option>
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {availableModels.length > 0 
                  ? `${availableModels.length} supported Azure OpenAI models`
                  : 'No models available'
                }
                {isEditing && <span className="text-amber-600 ml-2">• Cannot be changed when editing</span>}
              </p>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.description || formData.knowledgeSources.length === 0 || !formData.models[0]?.azureOpenAIParameters?.deploymentId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Agent' : 'Create Agent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}