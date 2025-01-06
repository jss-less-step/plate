const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
// 解决中文乱码问题
execSync('chcp 65001', { stdio: 'inherit' });

// eslint-disable-next-line turbo/no-undeclared-env-vars
const INIT_CWD = process.env.INIT_CWD;

if (!INIT_CWD) {
  console.error('INIT_CWD environment variable is not defined.');

  return;
}

// 切换到初始工作目录
try {
  execSync(`cd ${INIT_CWD}`);
} catch (error) {
  console.error(`Failed to change directory to ${INIT_CWD}`);

  throw error;
}

// Function to check if index.tsx exists and run barrelsby if it doesn't
function runBarrelsby(dir, ...args) {
  const indexPath = path.join(dir, 'index.tsx');

  if (!fs.existsSync(indexPath)) {
    // Run barrelsby if index.tsx doesn't exist
    const command = `barrelsby -d "${dir}" ${args.map((arg) => `"${arg}"`).join(' ')}`;
    console.log('command', command);

    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to execute barrelsby in ${dir}`);

      throw error;
    }
  }
}

const srcDir = path.join(INIT_CWD, 'src');
// Run barrelsby on the src directory if index.tsx doesn't exist
runBarrelsby(
  srcDir,
  '-l',
  'all',
  '-q',
  '-D',
  '-e',
  '.*__tests__.*|(.*(fixture|template|spec|internal).*)|(^.*/react/.*$)'
);

const srcReactDir = path.join(INIT_CWD, 'src', 'react');

if (fs.existsSync(srcReactDir)) {
  runBarrelsby(
    srcReactDir,
    '-l',
    'all',
    '-q',
    '-D',
    '-e',
    '.*__tests__.*|(.*(fixture|template|spec|internal).*)'
  );
}
