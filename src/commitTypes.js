export const COMMIT_TYPES = {
  feat: {
    emoji: '✨',
    description: 'A new feature',
    release: true
  },
  fix: {
    emoji: '🐛',
    description: 'A bug fix',
    release: true
  },
  perf: {
    emoji: '⚡️',
    description: 'A code change that improves performance',
    release: true
  },
  docs: {
    emoji: '📚',
    description: 'Documentation only changes',
    release: false
  },
  refactor: {
    emoji: '♻️',
    description: 'A code change that neither fixes a bug nor adds a feature',
    release: false
  },
  test: {
    emoji: '🏁',
    description: 'Adding missing tests or correcting existing tests',
    release: false
  },
  build: {
    emoji: '👷',
    description: 'Changes that affect the build system or external dependencies',
    release: false
  }
}
