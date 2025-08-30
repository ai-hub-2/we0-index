import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ToolBuilderProps {
  onSave: (tool: ToolData) => void;
  onPreview: (tool: ToolData) => void;
}

interface ToolData {
  id: string;
  name: string;
  description: string;
  type: 'calculator' | 'form' | 'chart' | 'custom';
  config: Record<string, any>;
  collaborators: string[];
}

export const ToolBuilder: React.FC<ToolBuilderProps> = ({ onSave, onPreview }) => {
  const [tool, setTool] = useState<ToolData>({
    id: '',
    name: '',
    description: '',
    type: 'calculator',
    config: {},
    collaborators: []
  });

  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'settings'>('design');

  const handleInputChange = (field: keyof ToolData, value: any) => {
    setTool(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(tool);
  };

  const handlePreview = () => {
    onPreview(tool);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tool Builder</h1>
          <p className="mt-2 text-gray-600">Create and customize your collaborative tools</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Tool Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tool Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tool name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={tool.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your tool"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tool Type
                  </label>
                  <select
                    value={tool.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="calculator">Calculator</option>
                    <option value="form">Form Builder</option>
                    <option value="chart">Data Visualization</option>
                    <option value="custom">Custom Tool</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreview}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Preview Tool
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Tool
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Panel - Builder Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'design', label: 'Design', icon: '🎨' },
                    { id: 'code', label: 'Code', icon: '💻' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'design' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Visual Builder</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="text-gray-400 text-6xl mb-4">🎨</div>
                      <p className="text-gray-600">Drag and drop components to build your tool</p>
                      <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Code Editor</h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-green-400 text-sm">
                        <code>
{`// Tool Configuration
{
  "type": "${tool.type}",
  "name": "${tool.name}",
  "components": [
    {
      "type": "input",
      "label": "Enter value",
      "placeholder": "Type here..."
    }
  ]
}`}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tool Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Collaboration Mode
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>Real-time collaboration</option>
                          <option>Review mode</option>
                          <option>Read-only</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Access Control
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>Public</option>
                          <option>Team only</option>
                          <option>Private</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};