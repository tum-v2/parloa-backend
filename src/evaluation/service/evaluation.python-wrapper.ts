import { execSync } from 'child_process';

function similariyHandler(path: string) {
  return parseFloat(execSync(`python3 evaluation.similarity.py ${path} 1`).toString());
}
