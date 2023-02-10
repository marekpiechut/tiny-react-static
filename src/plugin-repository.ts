import type { Plugin } from './plugins/plugin'
import path from 'path'
import fs from 'fs'

type PluginDescriptor = {
	name: string
	normalizedName: string
	path: string
	webPlugin?: string
	server?: Plugin
}

export const loadPlugins = async (
	root: string
): Promise<PluginDescriptor[]> => {
	const pluginsFolder = path.join(root, 'plugins')
	const pluginDirs = await fs.promises.readdir(pluginsFolder, {
		withFileTypes: true,
	})
	const plugins: PluginDescriptor[] = []

	await Promise.all(
		pluginDirs
			.filter(f => f.isDirectory())
			.map(pluginDir => {
				const pluginPath = path.join(pluginsFolder, pluginDir.name)
				return fs.promises.readdir(pluginPath).then(files => {
					const plugin: PluginDescriptor = {
						name: pluginDir.name,
						normalizedName: normalizePluginName(pluginDir.name),
						path: pluginPath,
					}
					files.forEach(file => {
						if (file.endsWith('.web.ts') || file.endsWith('.web.tsx')) {
							plugin.webPlugin = path.join(pluginPath, file)
						}
						if (file.endsWith('.server.ts') || file.endsWith('.server.tsx')) {
							// eslint-disable-next-line @typescript-eslint/no-var-requires
							const factory = require(path.join(pluginPath, file))
							plugin.server = factory.default()
						}
					})
					plugins.push(plugin)
				})
			})
	)

	return plugins
}

const normalizePluginName = (s: string): string =>
	s.replace(/[^a-zA-Z0-9]/g, '_')
