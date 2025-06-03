#!/usr/bin/env node

import { Command } from 'commander';
import { createAnalyzeCommand } from './commands/analyze';

const program = new Command();

program
  .name('whimsical-data-formatter')
  .description('CLI to analyze data files and generate structured JSON output with field metadata')
  .version('1.0.0');

// Add commands
program.addCommand(createAnalyzeCommand());

program.parse();
