import { intro, outro, text, select, confirm, multiselect, isCancel } from '@clack/prompts'
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

if (changedFiles.length === 0 && stagedFiles.length === 0) {
  outro(colors.yellow('No hay archivos para hacer commit'))
  process.exit(1)
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
  const possibleFiles = changedFiles.map((file) => `${colors.yellow(file)}`).join('\n\t')

  const shouldMultiSelect = await select({
    message: `${colors.cyan('Tienes los siguientes archivos con cambios que no están preparados para hacer commit')}

        ${possibleFiles}

    ${colors.cyan('¿Qué quieres hacer?')}`,
    options: [
      {
        value: 'add',
        label: 'Añadir todos los archivos al commit'
      },
      {
        value: 'select',
        label: 'Seleccionar los archivos que quieres añadir al commit'
      }
    ]
  })

  if (isCancel(shouldMultiSelect)) {
    outro(colors.yellow('No se ha hecho commit'))
    process.exit(1)
  }

  if (shouldMultiSelect === 'add') {
    await gitAdd()
  } else {
    const files = await multiselect({
      message: `${colors.cyan('No tienes nada preparado para hacer commit. Selecciona los archivos que quieres añadir al commit')}`,
      options: [
        ...changedFiles.map((file) => ({
          value: file,
          label: file
        }))
      ]
    })

    if (isCancel(files)) {
      outro(colors.yellow('No se ha hecho commit'))
      process.exit(1)
    }

    await gitAdd(files)
  }
}

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit\n'),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} • ${value.description}`
  }))
})

if (isCancel(commitType)) {
  await restoreStagedFiles(changedFiles)
  outro(colors.yellow('No se ha hecho commit'))
  process.exit(1)
}

const commitMessage = await text({
  message: 'Escribe el mensaje del commit',
  placeholder: 'Ejemplo: Añade un nuevo asistente para crear commits',
  validate: (value) => {
    if (value.length === 0) {
      return colors.red('El mensaje del commit no puede estar vacío')
    }

    if (value.length > 50) {
      return colors.red('El mensaje del commit no puede tener más de 50 caracteres. No es una buena práctica escribir mensajes muy largos')
    }
  }
})

if (isCancel(commitMessage)) {
  await restoreStagedFiles(changedFiles)
  outro(colors.yellow('No se ha hecho commit'))
  process.exit(1)
}

const { emoji, release } = COMMIT_TYPES[commitType]

let isBreakingChange = false
if (release) {
  isBreakingChange = await confirm({
    initialValue: false,
    message: `¿El commit incluye un cambio importante que influye un cambio anterior?
      ${colors.yellow('Si la respuesta es sí, deberías crear un commit con el tipo "BREAKING CHANGE" y al hacer release se creará una nueva versión major')}`
  })

  if (isCancel(isBreakingChange)) {
    await restoreStagedFiles(changedFiles)
    outro(colors.yellow('No se ha hecho commit'))
    process.exit(1)
  }
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
