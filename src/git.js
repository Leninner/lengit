import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function getChangeFiles () {
  const { stdout } = await execAsync('git status --porcelain')

  return cleanStdout(stdout).map((line) => line.split(' ').pop()).filter(Boolean)
}

export const cleanStdout = (stdout) => stdout.trim().split('\n').filter(Boolean)

export const getStagedFiles = async () => {
  const { stdout } = await execAsync('git diff --cached --name-only')

  return cleanStdout(stdout)
}

export const gitCommit = async (commit) => {
  const { stdout } = await execAsync(`git commit -m '${commit}'`)

  return cleanStdout(stdout)
}

export const gitAdd = async (file = ['.']) => {
  const filesLine = file.join(' ')
  const { stdout } = await execAsync(`git add ${filesLine}`)

  return cleanStdout(stdout)
}

export const restoreStagedFiles = async (files) => {
  const { stdout } = await execAsync(`git restore --staged ${files.join(' ')}`)

  return cleanStdout(stdout)
}
