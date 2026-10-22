import { runCli } from './run-cli';

runCli(process.argv.slice(2), { stdout: process.stdout, stderr: process.stderr })
  .catch(error => {
    process.stderr.write(`typewriter-effect: ${error.message}\n`);
    process.exitCode = 1;
  });
