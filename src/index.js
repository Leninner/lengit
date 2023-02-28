import { intro, outro, text, select } from '@clack/prompts'
import { COMMIT_TYPES } from './commitTypes.js'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'
import { getChangeFiles, getStagedFiles } from './git.js'

intro(
  `Asistente para creación de commits por ${colors.cyan(' @leninner ')}`
)

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles) {
  outro(colors.red('Error: Comprueba que estás en un repositorio de git'))
  process.exit(1)
}

console.log({ changedFiles, stagedFiles })

const commitMessage = await text({
  message: 'Escribe el mensaje del commit',
  placeholder: 'Ejemplo: Añade un nuevo asistente para crear commits'
})

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit'),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key} - ${value.description}`
  }))
})

outro('Commit creado con éxito. ¡Gracias por usar el asistente!')
