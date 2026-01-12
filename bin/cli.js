#!/usr/bin/env node

import { program } from 'commander';
import { createProject } from '../src/index.js';

program
  .name('zt')
  .description('CLI tool to create projects from GitHub template repositories')
  .version('1.0.0');

program
  .argument('[template]', 'GitHub repository URL or owner/repo format (e.g., travzhang/react-vite-template)')
  .argument('[project-name]', 'Project name/directory')
  .option('-f, --force', 'Overwrite existing directory')
  .action(async (template, projectName, options) => {
    await createProject(template, projectName, options);
  });

program.parse();
