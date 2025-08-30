import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  PlusIcon, 
  CodeBracketIcon, 
  EyeIcon, 
  CogIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ToolComponent {
  id: string;
  type: 'input' | 'select' | 'button' | 'display' | 'chart' | 'form' | 'custom';
  label: string;
  placeholder?: string;
  options?: string[];
  formula?: string;
  validation?: any;
  style?: any;
}

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  type: 'calculator' | 'form' | 'chart' | 'code' | 'custom';
  components: ToolComponent[];
  code?: string;
  settings: {
    theme: 'light' | 'dark';
    layout: 'vertical' | 'horizontal' | 'grid';
    responsive: boolean;
    public: boolean;
  };
}

interface ToolBuilderProps {
  initialConfig?: Partial<ToolConfig>;
  onSave: (config: ToolConfig) => void;
  onPreview: (config: ToolConfig) => void;
  onDeploy: (config: ToolConfig) => void;
  isCollaborating?: boolean;
  collaborators?: Array<{ id: string; name: string; avatar: string }>;
}

const COMPONENT_TYPES = [
  { type: 'input', label: 'Text Input', icon: '📝' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'display', label: 'Display', icon: '📊' },
  { type: 'chart', label: 'Chart', icon: '📈' },
  { type: 'form', label: 'Form', icon: '📋' },
  { type: 'custom', label: 'Custom', icon: '⚙️' }
];

export const ToolBuilder: React.FC<ToolBuilderProps> = ({
  initialConfig,
  onSave,
  onPreview,
  onDeploy,
  isCollaborating = false,
  collaborators = []
}) => {
  const [config, setConfig] = useState<ToolConfig>({
    id: initialConfig?.id || `tool-${Date.now()}`,
    name: initialConfig?.name || 'Untitled Tool',
    description: initialConfig?.description || '',
    type: initialConfig?.type || 'calculator',
    components: initialConfig?.components || [],
    code: initialConfig?.code || '',
    settings: {
      theme: 'light',
      layout: 'vertical',
      responsive: true,
      public: false,
      ...initialConfig?.settings
    }
  });

  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'preview' | 'settings'>('design');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (config.name !== 'Untitled Tool') {
        onSave(config);
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [config, onSave]);

  const addComponent = useCallback((type: ToolComponent['type']) => {
    const newComponent: ToolComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `New ${type}`,
      placeholder: `Enter ${type}...`,
      ...(type === 'select' && { options: ['Option 1', 'Option 2', 'Option 3'] }),
      ...(type === 'display' && { formula: 'result' })
    };

    setConfig(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    toast.success(`Added ${type} component`);
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<ToolComponent>) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    }));
  }, []);

  const removeComponent = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
    setSelectedComponent(null);
    toast.success('Component removed');
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    const component = config.components.find(comp => comp.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: `${component.label} (Copy)`
      };
      setConfig(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
      toast.success('Component duplicated');
    }
  }, [config.components]);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(config.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setConfig(prev => ({
      ...prev,
      components: items
    }));
  }, [config.components]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      toast.success('Tool saved successfully!');
    } catch (error) {
      toast.error('Failed to save tool');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    onPreview(config);
    setActiveTab('preview');
  };

  const handleDeploy = async () => {
    try {
      await onDeploy(config);
      toast.success('Tool deployed successfully!');
    } catch (error) {
      toast.error('Failed to deploy tool');
    }
  };

  const renderComponentEditor = (component: ToolComponent) => {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{component.type} Component</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => duplicateComponent(component.id)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeComponent(component.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={component.label}
              onChange={(e) => updateComponent(component.id, { label: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {component.type === 'input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Placeholder</label>
              <input
                type="text"
                value={component.placeholder || ''}
                onChange={(e) => updateComponent(component.id, { placeholder: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {component.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Options</label>
              <textarea
                value={component.options?.join('\n') || ''}
                onChange={(e) => updateComponent(component.id, { 
                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          {component.type === 'display' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Formula</label>
              <input
                type="text"
                value={component.formula || ''}
                onChange={(e) => updateComponent(component.id, { formula: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="a + b"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Tool Builder</h1>
              {isCollaborating && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {collaborators.map((collaborator) => (
                      <img
                        key={collaborator.id}
                        className="w-6 h-6 rounded-full border-2 border-white"
                        src={collaborator.avatar}
                        alt={collaborator.name}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {collaborators.length} collaborating
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                placeholder="Untitled Tool"
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreview}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Preview</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeploy}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Deploy</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Component Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
              
              <div className="space-y-2">
                {COMPONENT_TYPES.map((compType) => (
                  <motion.button
                    key={compType.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addComponent(compType.type as ToolComponent['type'])}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-2xl">{compType.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{compType.label}</span>
                  </motion.button>
                ))}
              </div>

              {selectedComponent && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {renderComponentEditor(
                    config.components.find(comp => comp.id === selectedComponent)!
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center Panel - Builder Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'design', label: 'Design', icon: '🎨' },
                    { id: 'code', label: 'Code', icon: '💻' },
                    { id: 'preview', label: 'Preview', icon: '👁️' },
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
                <AnimatePresence mode="wait">
                  {activeTab === 'design' && (
                    <motion.div
                      key="design"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Visual Builder</h3>
                      
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="components">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-3"
                            >
                              {config.components.map((component, index) => (
                                <Draggable
                                  key={component.id}
                                  draggableId={component.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-4 border-2 rounded-lg cursor-move transition-all ${
                                        selectedComponent === component.id
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                      onClick={() => setSelectedComponent(component.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <span className="text-2xl">
                                            {COMPONENT_TYPES.find(ct => ct.type === component.type)?.icon}
                                          </span>
                                          <div>
                                            <h4 className="font-medium text-gray-900">{component.label}</h4>
                                            <p className="text-sm text-gray-500">{component.type}</p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              duplicateComponent(component.id);
                                            }}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                          >
                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeComponent(component.id);
                                            }}
                                            className="p-1 text-red-500 hover:text-red-700"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      {config.components.length === 0 && (
                        <div className="text-center py-12">
                          <div className="text-gray-400 text-6xl mb-4">🎨</div>
                          <p className="text-gray-600">Drag components here to build your tool</p>
                          <p className="text-sm text-gray-500 mt-2">Start by adding components from the left panel</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'code' && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Code Editor</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Editor
                          height="400px"
                          defaultLanguage="javascript"
                          value={config.code || '// Add your custom code here\n\nfunction calculate() {\n  // Your logic here\n  return result;\n}'}
                          onChange={(value) => setConfig(prev => ({ ...prev, code: value || '' }))}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePreview}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Run Preview</span>
                        </motion.button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6 bg-white">
                        <div className="space-y-4">
                          {config.components.map((component) => (
                            <div key={component.id} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {component.label}
                              </label>
                              {component.type === 'input' && (
                                <input
                                  type="text"
                                  placeholder={component.placeholder}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              )}
                              {component.type === 'select' && (
                                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                  {component.options?.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {component.type === 'button' && (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                  {component.label}
                                </button>
                              )}
                              {component.type === 'display' && (
                                <div className="p-3 bg-gray-100 rounded-md">
                                  <span className="text-gray-600">Result will appear here</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Tool Settings</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={config.description}
                            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Describe your tool..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tool Type
                          </label>
                          <select
                            value={config.type}
                            onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="calculator">Calculator</option>
                            <option value="form">Form Builder</option>
                            <option value="chart">Data Visualization</option>
                            <option value="code">Code Snippet</option>
                            <option value="custom">Custom Tool</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={config.settings.theme}
                            onChange={(e) => setConfig(prev => ({ 
                              ...prev, 
                              settings: { ...prev.settings, theme: e.target.value as any }
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Layout
                          </label>
                          <select
                            value={config.settings.layout}
                            onChange={(e) => setConfig(prev => ({ 
                              ...prev, 
                              settings: { ...prev.settings, layout: e.target.value as any }
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                            <option value="grid">Grid</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="responsive"
                            checked={config.settings.responsive}
                            onChange={(e) => setConfig(prev => ({ 
                              ...prev, 
                              settings: { ...prev.settings, responsive: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="responsive" className="text-sm font-medium text-gray-700">
                            Responsive Design
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="public"
                            checked={config.settings.public}
                            onChange={(e) => setConfig(prev => ({ 
                              ...prev, 
                              settings: { ...prev.settings, public: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="public" className="text-sm font-medium text-gray-700">
                            Make Public
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
              
              {selectedComponent ? (
                renderComponentEditor(
                  config.components.find(comp => comp.id === selectedComponent)!
                )
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📋</div>
                  <p className="text-gray-600">Select a component to edit its properties</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};