import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  PlusIcon,
  ChartBarIcon,
  UsersIcon,
  EyeIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const recentTools = [
  {
    id: 1,
    name: 'Calculator Pro',
    description: 'Advanced calculator with scientific functions',
    views: 1247,
    likes: 89,
    status: 'published',
    updatedAt: '2 hours ago'
  },
  {
    id: 2,
    name: 'Data Visualizer',
    description: 'Interactive charts and graphs',
    views: 892,
    likes: 156,
    status: 'draft',
    updatedAt: '1 day ago'
  },
  {
    id: 3,
    name: 'Form Builder',
    description: 'Dynamic form creation tool',
    views: 2341,
    likes: 234,
    status: 'published',
    updatedAt: '3 days ago'
  }
];

const stats = [
  {
    name: 'Total Tools',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: CodeBracketIcon
  },
  {
    name: 'Total Views',
    value: '12.4k',
    change: '+8.2%',
    changeType: 'positive',
    icon: EyeIcon
  },
  {
    name: 'Total Likes',
    value: '1.2k',
    change: '+15.3%',
    changeType: 'positive',
    icon: StarIcon
  },
  {
    name: 'Active Users',
    value: '89',
    change: '+5.1%',
    changeType: 'positive',
    icon: UsersIcon
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your tools.</p>
            </div>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New Tool
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tools */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Tools</CardTitle>
                    <CardDescription>Your recently created and updated tools</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTools.map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <CodeBracketIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{tool.name}</h3>
                          <p className="text-sm text-gray-600">{tool.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <EyeIcon className="w-3 h-3 mr-1" />
                              {tool.views}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <StarIcon className="w-3 h-3 mr-1" />
                              {tool.likes}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {tool.updatedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={tool.status === 'published' ? 'success' : 'warning'}>
                          {tool.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started quickly with these actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create New Tool
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RocketLaunchIcon className="w-4 h-4 mr-2" />
                  Deploy Tool
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Published "Calculator Pro"</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Updated "Data Visualizer"</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Added collaborator to "Form Builder"</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}