import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function getChangeFiles () {
  const { stdout } = await execAsync('git status --porcelain')

  return cleanStdout(stdout).map(line => line.split(' ').at(-1)).filter(Boolean)
}

export const cleanStdout = (stdout) => stdout.trim().split('\n')

export const getStagedFiles = async () => {
  const { stdout } = await execAsync('git diff --cached --name-only')

  return cleanStdout(stdout)
}
