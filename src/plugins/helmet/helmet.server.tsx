import { HelmetProvider, HelmetServerState } from 'react-helmet-async'
import { Plugin } from '../plugin'

type HelmetContext = {
	helmet?: HelmetServerState
}
export const helmetPlugin = (): Plugin => {
	const helmet: HelmetContext = {}
	return {
		html() {
			if (isEmpty(helmet.helmet)) {
				return {}
			} else {
				return {
					head: generateHead(helmet.helmet),
				}
			}
		},
		wrap(_, body) {
			return <HelmetProvider context={helmet}>{body}</HelmetProvider>
		},
	} as Plugin
}

export default helmetPlugin

const isEmpty = (helmet?: HelmetServerState): boolean => {
	return !helmet || !Object.values(helmet).some(e => e.toString())
}

const generateHead = (helmet?: HelmetServerState): string =>
	Object.values(helmet || {})
		.map(e => e.toString())
		.filter(e => e)
		.join('\n')
