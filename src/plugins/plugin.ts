import React, { ReactElement, ReactNode } from 'react'
export type Context = {
	basename?: string
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

type WebPluginProps<Config> = {
	children: ReactNode | ReactNode[]
	config?: Config
}
export type WebPlugin<Config> = React.ComponentType<WebPluginProps<Config>>
