import { ReactElement } from 'react'
export type Context = {
	location: string
	file: string
}

export type Plugin = {
	html?: (
		context: Context,
		template: string,
		current: {
			head: string[]
			body: string[]
		}
	) => {
		head?: string
		body?: string
	}
	wrap?: (ctx: Context, body: ReactElement) => ReactElement
}
