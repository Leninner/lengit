import { intro, outro, text, select, confirm, multiselect } from '@clack/prompts'
import { COMMIT_TYPES } from './commitTypes.js'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'
import { getChangeFiles, getStagedFiles, gitAdd, gitCommit, restoreStagedFiles } from './git.js'

intro(
  `Asistente para creación de commits por ${colors.cyan(' @leninner ')}`
)

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: Comprueba que estás en un repositorio de git'))
  process.exit(1)
}

console.log('changedFiles', changedFiles.length)
console.log('stagedFiles', stagedFiles.length)

if (stagedFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: `${colors.cyan('No tienes nada preparado para hacer commit. Selecciona los archivos que quieres añadir al commit')}`,
    options: [
      {
        value: 'all',
        label: 'Añadir todos los archivos'
      },
      ...changedFiles.map((file) => ({
        value: file,
        label: file
      }))
    ]
  })

  if (files.includes('all')) {
    await gitAdd()
  } else {
    await gitAdd(files)
  }
}

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit'),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} • ${value.description}`
  }))
})

const commitMessage = await text({
  message: 'Escribe el mensaje del commit',
  placeholder: 'Ejemplo: Añade un nuevo asistente para crear commits'
})

const { emoji, release } = COMMIT_TYPES[commitType]

let isBreakingChange = false
if (release) {
  isBreakingChange = await confirm({
    initialValue: false,
    message: `¿El commit incluye un cambio importante que influye un cambio anterior?
      ${colors.yellow('Si la respuesta es sí, deberías crear un commit con el tipo "BREAKING CHANGE" y al hacer release se creará una nueva versión major')}`
  })
}

let commit = `${emoji} ${commitType}: ${commitMessage}`
commit = isBreakingChange ? `${commit} [breaking change]` : commit

const shouldContinue = await confirm({
  initialValue: true,
  message: `${colors.cyan('¿Quiéres continuar con el siguiente commit?')} 
  
    ${colors.green(colors.bold(commit))}

    ${colors.cyan('¿Confirmas?')}}`
})

if (!shouldContinue) {
  outro(colors.yellow('No se ha creado el commit'))
  await restoreStagedFiles(changedFiles)
  process.exit(0)
}
const { stdout: commitResult } = await gitCommit(commit)

outro(colors.green('Commit creado con éxito. ¡Gracias por usar el asistente!'))
