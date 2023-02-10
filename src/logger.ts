import chalk from 'chalk'

const level = 0

type Logger = {
	debug: (...args: unknown[]) => void
	info: (...args: unknown[]) => void
	warn: (...args: unknown[]) => void
	error: (...args: unknown[]) => void
}

export const logger = (name: string): Logger => {
	return {
		debug: (...args): void => {
			if (level <= 0) console.debug(chalk.grey('DEBUG', '-', name, ...args))
		},
		info: (...args): void => {
			if (level <= 10)
				console.info(chalk.blue('INFO'), chalk.white(name, '-', ...args))
		},
		warn: (...args): void => {
			if (level <= 20) console.warn(chalk.yellow('WARN', name, '-', ...args))
		},
		error: (...args): void => {
			if (level <= 30) console.error(chalk.red('ERROR', name, '-', ...args))
		},
	}
}
