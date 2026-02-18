#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'videos');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

const tutorials = [
  {
    id: '01-complete-setup',
    title: 'Complete OpenCode Setup',
    duration: 15 * 60,
    steps: [
      { action: 'navigate', url: 'https://opencode.ai' },
      { action: 'terminal', command: 'npm install -g opencode' },
      { action: 'terminal', command: 'opencode --version' },
      { action: 'terminal', command: 'opencode models' },
      { action: 'file_edit', file: '~/.config/opencode/opencode.json' },
      { action: 'terminal', command: 'opencode --agent explore "Hello"' }
    ]
  },
  {
    id: '02-provider-config',
    title: 'Provider Configuration',
    duration: 10 * 60,
    steps: [
      { action: 'navigate', url: 'https://build.nvidia.com' },
      { action: 'file_edit', file: '~/.config/opencode/opencode.json' },
      { action: 'terminal', command: 'export NVIDIA_API_KEY="..."' },
      { action: 'terminal', command: 'opencode models | grep nvidia' }
    ]
  },
  {
    id: '03-agent-setup',
    title: 'Agent Configuration',
    duration: 12 * 60,
    steps: [
      { action: 'file_edit', file: '~/.config/opencode/oh-my-opencode.json' },
      { action: 'terminal', command: 'opencode --agent sisyphus "Test"' },
      { action: 'terminal', command: 'opencode --agent prometheus "Plan"' },
      { action: 'terminal', command: 'opencode --agent librarian "Research"' }
    ]
  },
  {
    id: '04-troubleshooting',
    title: 'Troubleshooting Guide',
    duration: 8 * 60,
    steps: [
      { action: 'terminal', command: 'opencode doctor' },
      { action: 'terminal', command: 'opencode auth list' },
      { action: 'file_edit', file: '~/.config/opencode/opencode.json' },
      { action: 'terminal', command: 'opencode models' }
    ]
  }
];

async function recordTutorial(tutorial) {
  console.log(`🎬 Recording: ${tutorial.title}`);
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  for (const step of tutorial.steps) {
    console.log(`  → ${step.action}: ${step.command || step.url || step.file}`);
    
    switch (step.action) {
      case 'navigate':
        await page.goto(step.url);
        await page.waitForTimeout(2000);
        break;
        
      case 'terminal':
        await simulateTerminalCommand(page, step.command);
        await page.waitForTimeout(3000);
        break;
        
      case 'file_edit':
        await simulateFileEditing(page, step.file);
        await page.waitForTimeout(4000);
        break;
    }
  }
  
  await browser.close();
  
  const videoPath = await context.video().path();
  const finalPath = path.join(OUTPUT_DIR, `${tutorial.id}.mp4`);
  
  fs.renameSync(videoPath, finalPath);
  console.log(`✅ Saved: ${finalPath}`);
  
  return finalPath;
}

async function simulateTerminalCommand(page, command) {
  await page.keyboard.press('Control+`');
  await page.waitForTimeout(500);
  await page.keyboard.type(command);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
}

async function simulateFileEditing(page, filePath) {
  const expandedPath = filePath.replace('~', process.env.HOME);
  await page.keyboard.press('Control+O');
  await page.waitForTimeout(500);
  await page.keyboard.type(expandedPath);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
}

async function main() {
  console.log('🎥 OpenCode Tutorial Recorder\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const results = [];
  
  for (const tutorial of tutorials) {
    try {
      const videoPath = await recordTutorial(tutorial);
      results.push({
        id: tutorial.id,
        title: tutorial.title,
        path: videoPath,
        status: 'success'
      });
    } catch (error) {
      console.error(`❌ Failed: ${tutorial.title}`);
      console.error(error.message);
      results.push({
        id: tutorial.id,
        title: tutorial.title,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  console.log('\n📊 Recording Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.id}: ${result.title}`);
  });
  
  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\nTotal: ${successCount}/${tutorials.length} successful`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { recordTutorial, tutorials };
