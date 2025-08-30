#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import Conf from 'conf';
import open from 'open';
import fs from 'fs-extra';
import path from 'path';
import { RapidTools, ToolConfig } from '@rapidtools/sdk';

const program = new Command();
const config = new Conf();

// Initialize RapidTools SDK
const rapidTools = new RapidTools({
  apiKey: config.get('apiKey') as string,
  baseUrl: config.get('baseUrl') as string || 'https://api.rapidtools.com'
});

// Utility functions
const log = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  title: (message: string) => console.log(chalk.bold.cyan(message))
};

const promptForAuth = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: (input) => input.includes('@') || 'Please enter a valid email'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your password:',
      validate: (input) => input.length > 0 || 'Password is required'
    }
  ]);

  return answers;
};

const promptForToolConfig = async (): Promise<ToolConfig> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Tool name:',
      validate: (input) => input.length > 0 || 'Tool name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Tool description (optional):'
    },
    {
      type: 'list',
      name: 'type',
      message: 'Tool type:',
      choices: [
        { name: 'Calculator', value: 'calculator' },
        { name: 'Form Builder', value: 'form' },
        { name: 'Data Visualization', value: 'chart' },
        { name: 'Code Snippet', value: 'code' },
        { name: 'Custom Tool', value: 'custom' }
      ]
    },
    {
      type: 'confirm',
      name: 'public',
      message: 'Make tool public?',
      default: false
    }
  ]);

  return {
    name: answers.name,
    description: answers.description,
    type: answers.type,
    components: [],
    settings: {
      public: answers.public
    }
  };
};

// CLI Commands
program
  .name('rapidtools')
  .description('RapidTools Command Line Interface')
  .version('1.0.0');

// Authentication commands
program
  .command('login')
  .description('Login to RapidTools')
  .action(async () => {
    try {
      const spinner = ora('Logging in...').start();
      const credentials = await promptForAuth();
      
      const result = await rapidTools.authenticate(credentials.email, credentials.password);
      
      config.set('apiKey', result.token);
      config.set('user', result.user);
      
      spinner.succeed('Login successful!');
      log.success(`Welcome back, ${result.user.username}!`);
    } catch (error) {
      log.error('Login failed. Please check your credentials.');
      process.exit(1);
    }
  });

program
  .command('register')
  .description('Register a new RapidTools account')
  .action(async () => {
    try {
      const spinner = ora('Creating account...').start();
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input) => input.includes('@') || 'Please enter a valid email'
        },
        {
          type: 'input',
          name: 'username',
          message: 'Username:',
          validate: (input) => input.length >= 3 || 'Username must be at least 3 characters'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          validate: (input) => input.length >= 8 || 'Password must be at least 8 characters'
        },
        {
          type: 'input',
          name: 'firstName',
          message: 'First name (optional):'
        },
        {
          type: 'input',
          name: 'lastName',
          message: 'Last name (optional):'
        }
      ]);

      const result = await rapidTools.register(answers);
      
      config.set('apiKey', result.token);
      config.set('user', result.user);
      
      spinner.succeed('Account created successfully!');
      log.success(`Welcome to RapidTools, ${result.user.username}!`);
    } catch (error) {
      log.error('Registration failed. Please try again.');
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Logout from RapidTools')
  .action(() => {
    config.delete('apiKey');
    config.delete('user');
    log.success('Logged out successfully!');
  });

program
  .command('whoami')
  .description('Show current user information')
  .action(async () => {
    try {
      const user = await rapidTools.getCurrentUser();
      log.title('Current User');
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Member since: ${new Date(user.createdAt).toLocaleDateString()}`);
    } catch (error) {
      log.error('Not authenticated. Please run "rapidtools login" first.');
      process.exit(1);
    }
  });

// Tool management commands
program
  .command('create')
  .description('Create a new tool')
  .option('-n, --name <name>', 'Tool name')
  .option('-t, --type <type>', 'Tool type')
  .option('-d, --description <description>', 'Tool description')
  .option('-p, --public', 'Make tool public')
  .action(async (options) => {
    try {
      let toolConfig: ToolConfig;

      if (options.name && options.type) {
        toolConfig = {
          name: options.name,
          description: options.description,
          type: options.type as any,
          components: [],
          settings: {
            public: options.public || false
          }
        };
      } else {
        toolConfig = await promptForToolConfig();
      }

      const spinner = ora('Creating tool...').start();
      const tool = await rapidTools.createTool(toolConfig);
      spinner.succeed('Tool created successfully!');

      log.success(`Tool "${tool.name}" created with ID: ${tool.id}`);
      console.log(`View at: https://rapidtools.com/tools/${tool.slug}`);
    } catch (error) {
      log.error('Failed to create tool. Please try again.');
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List your tools')
  .option('-p, --page <page>', 'Page number', '1')
  .option('-l, --limit <limit>', 'Items per page', '10')
  .option('--public', 'Show only public tools')
  .option('--type <type>', 'Filter by tool type')
  .action(async (options) => {
    try {
      const spinner = ora('Loading tools...').start();
      
      const params: any = {
        page: parseInt(options.page),
        limit: parseInt(options.limit)
      };

      if (options.public) params.public = true;
      if (options.type) params.type = options.type;

      const result = await rapidTools.listTools(params);
      spinner.succeed(`Found ${result.total} tools`);

      if (result.tools.length === 0) {
        log.info('No tools found.');
        return;
      }

      console.log('\n' + chalk.bold('Your Tools:'));
      result.tools.forEach((tool, index) => {
        const status = tool.isPublished ? chalk.green('Published') : chalk.yellow('Draft');
        const visibility = tool.isPublic ? chalk.blue('Public') : chalk.gray('Private');
        
        console.log(`${index + 1}. ${chalk.bold(tool.name)}`);
        console.log(`   ID: ${tool.id}`);
        console.log(`   Type: ${tool.type}`);
        console.log(`   Status: ${status} | ${visibility}`);
        console.log(`   Views: ${tool.views} | Likes: ${tool.likes}`);
        console.log(`   Created: ${new Date(tool.createdAt).toLocaleDateString()}`);
        console.log('');
      });
    } catch (error) {
      log.error('Failed to load tools. Please try again.');
      process.exit(1);
    }
  });

program
  .command('get <id>')
  .description('Get tool details')
  .action(async (id) => {
    try {
      const spinner = ora('Loading tool...').start();
      const tool = await rapidTools.getTool(id);
      spinner.succeed('Tool loaded successfully!');

      log.title(`Tool: ${tool.name}`);
      console.log(`ID: ${tool.id}`);
      console.log(`Slug: ${tool.slug}`);
      console.log(`Type: ${tool.type}`);
      console.log(`Description: ${tool.description || 'No description'}`);
      console.log(`Status: ${tool.isPublished ? 'Published' : 'Draft'}`);
      console.log(`Visibility: ${tool.isPublic ? 'Public' : 'Private'}`);
      console.log(`Version: ${tool.version}`);
      console.log(`Views: ${tool.views}`);
      console.log(`Likes: ${tool.likes}`);
      console.log(`Created: ${new Date(tool.createdAt).toLocaleDateString()}`);
      console.log(`Updated: ${new Date(tool.updatedAt).toLocaleDateString()}`);
      console.log(`Author: ${tool.author.username}`);
      console.log(`URL: https://rapidtools.com/tools/${tool.slug}`);
    } catch (error) {
      log.error('Failed to load tool. Please check the tool ID.');
      process.exit(1);
    }
  });

program
  .command('delete <id>')
  .description('Delete a tool')
  .action(async (id) => {
    try {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this tool? This action cannot be undone.',
          default: false
        }
      ]);

      if (!confirm) {
        log.info('Deletion cancelled.');
        return;
      }

      const spinner = ora('Deleting tool...').start();
      await rapidTools.deleteTool(id);
      spinner.succeed('Tool deleted successfully!');
      log.success('Tool has been permanently deleted.');
    } catch (error) {
      log.error('Failed to delete tool. Please try again.');
      process.exit(1);
    }
  });

program
  .command('publish <id>')
  .description('Publish a tool')
  .action(async (id) => {
    try {
      const spinner = ora('Publishing tool...').start();
      const tool = await rapidTools.publishTool(id);
      spinner.succeed('Tool published successfully!');
      
      log.success(`Tool "${tool.name}" is now live!`);
      console.log(`URL: https://rapidtools.com/tools/${tool.slug}`);
    } catch (error) {
      log.error('Failed to publish tool. Please try again.');
      process.exit(1);
    }
  });

program
  .command('unpublish <id>')
  .description('Unpublish a tool')
  .action(async (id) => {
    try {
      const spinner = ora('Unpublishing tool...').start();
      const tool = await rapidTools.unpublishTool(id);
      spinner.succeed('Tool unpublished successfully!');
      
      log.success(`Tool "${tool.name}" is now offline.`);
    } catch (error) {
      log.error('Failed to unpublish tool. Please try again.');
      process.exit(1);
    }
  });

// Deployment commands
program
  .command('deploy <toolId>')
  .description('Deploy a tool')
  .option('-d, --domain <domain>', 'Custom domain')
  .option('-s, --subdomain <subdomain>', 'Subdomain')
  .action(async (toolId, options) => {
    try {
      const spinner = ora('Creating deployment...').start();
      
      const deployment = await rapidTools.createDeployment({
        toolId,
        domain: options.domain,
        subdomain: options.subdomain
      });

      spinner.succeed('Deployment created successfully!');
      
      log.success(`Deployment ID: ${deployment.id}`);
      console.log(`Status: ${deployment.status}`);
      
      if (deployment.domain) {
        console.log(`Domain: ${deployment.domain}`);
      }
      if (deployment.subdomain) {
        console.log(`Subdomain: ${deployment.subdomain}`);
      }
    } catch (error) {
      log.error('Failed to create deployment. Please try again.');
      process.exit(1);
    }
  });

program
  .command('deployments')
  .description('List deployments')
  .option('-t, --tool <toolId>', 'Filter by tool ID')
  .action(async (options) => {
    try {
      const spinner = ora('Loading deployments...').start();
      const deployments = await rapidTools.listDeployments(options.tool);
      spinner.succeed(`Found ${deployments.length} deployments`);

      if (deployments.length === 0) {
        log.info('No deployments found.');
        return;
      }

      console.log('\n' + chalk.bold('Deployments:'));
      deployments.forEach((deployment, index) => {
        const statusColor = deployment.status === 'deployed' ? chalk.green : 
                           deployment.status === 'failed' ? chalk.red : chalk.yellow;
        
        console.log(`${index + 1}. ${chalk.bold(`Deployment ${deployment.id}`)}`);
        console.log(`   Tool ID: ${deployment.toolId}`);
        console.log(`   Status: ${statusColor(deployment.status)}`);
        console.log(`   Domain: ${deployment.domain || 'N/A'}`);
        console.log(`   Subdomain: ${deployment.subdomain || 'N/A'}`);
        console.log(`   Created: ${new Date(deployment.createdAt).toLocaleDateString()}`);
        if (deployment.deployedAt) {
          console.log(`   Deployed: ${new Date(deployment.deployedAt).toLocaleDateString()}`);
        }
        console.log('');
      });
    } catch (error) {
      log.error('Failed to load deployments. Please try again.');
      process.exit(1);
    }
  });

// Utility commands
program
  .command('open <id>')
  .description('Open tool in browser')
  .action(async (id) => {
    try {
      const tool = await rapidTools.getTool(id);
      const url = `https://rapidtools.com/tools/${tool.slug}`;
      
      log.info(`Opening ${url} in browser...`);
      await open(url);
    } catch (error) {
      log.error('Failed to open tool. Please check the tool ID.');
      process.exit(1);
    }
  });

program
  .command('dashboard')
  .description('Open RapidTools dashboard in browser')
  .action(async () => {
    const url = 'https://rapidtools.com/dashboard';
    log.info(`Opening dashboard at ${url}...`);
    await open(url);
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    log.title('RapidTools Configuration');
    console.log(`API URL: ${config.get('baseUrl') || 'https://api.rapidtools.com'}`);
    console.log(`API Key: ${config.get('apiKey') ? 'Set' : 'Not set'}`);
    
    const user = config.get('user') as any;
    if (user) {
      console.log(`User: ${user.username} (${user.email})`);
    }
  });

program
  .command('config:set <key> <value>')
  .description('Set configuration value')
  .action((key, value) => {
    config.set(key, value);
    log.success(`Configuration updated: ${key} = ${value}`);
  });

program
  .command('config:get <key>')
  .description('Get configuration value')
  .action((key) => {
    const value = config.get(key);
    if (value !== undefined) {
      console.log(value);
    } else {
      log.error(`Configuration key "${key}" not found.`);
    }
  });

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  throw err;
}