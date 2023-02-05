import { StaticRouter } from 'react-router-dom/server'
import { Plugin } from '../plugin'

export const reactRouterPlugin = (): Plugin => {
	return {
		wrap(ctx, body) {
			return <StaticRouter location={ctx.location}>{body}</StaticRouter>
		},
	} as Plugin
}

export default reactRouterPlugin
