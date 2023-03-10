import esbuild, { Metafile } from 'esbuild'
import fs from 'fs'
import path from 'path'
import ReactDOM from 'react-dom/server'
import { logger } from './logger'
import { loadPlugins } from './plugin-repository'

const log = logger('root')

const run = async (): Promise<void> => {
	const root = __dirname
	const temp = await fs.promises.mkdtemp(path.join(root, '.static'))
	const output = createOutputPath(root)
	const plugins = await loadPlugins(__dirname)

	log.info('plugins:', plugins.map(p => p.name).join(', '))

	const serverOut = path.join(temp, 'server-content.js')
	try {
		await esbuild.build({
			entryPoints: ['../test-project/index.tsx'],
			bundle: false,
			minify: false,
			format: 'cjs',
			platform: 'node',
			outfile: serverOut,
		})

		const bundlePromise = esbuild.build({
			// entryPoints: ['../test-project/index.tsx'],
			stdin: {
				contents: `
				import Comp from '../test-project/index.tsx'
				import ReactDOM from 'react-dom'
				import React from 'react'
				${plugins
					.filter(p => p.webPlugin)
					.map(p => `import STATIC__${p.normalizedName} from '${p.webPlugin}'`)
					.join('\n')}

				ReactDOM.hydrate(${plugins
					.filter(p => p.webPlugin)
					.reduce(
						(acc, plugin) =>
							`React.createElement(STATIC__${plugin.normalizedName}, {}, ${acc})`,
						'React.createElement(Comp, {}, null)'
					)}
					, document.getElementById('react-root'))
				`,
				resolveDir: __dirname,
				loader: 'tsx',
			},
			bundle: true,
			minify: false,
			jsxDev: true,
			format: 'iife',
			platform: 'browser',
			entryNames: '[ext]/[name]-[hash]',
			metafile: true,
			outdir: output,
		})

		const ctx = { location: '/', file: 'dummy' }

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Root = require(serverOut).default
		const Body = plugins.reduce(
			(prev, plugin) =>
				plugin.server?.wrap ? plugin.server.wrap(ctx, prev) : prev,
			<Root />
		)
		const content = ReactDOM.renderToString(Body)

		const template = await loadHtmlTemplate()
		const { body, head } = plugins.reduce(
			(acc, plugin) => {
				const html = plugin.server?.html?.(ctx, template, acc)
				if (html?.body) acc.body.push(html.body)
				if (html?.head) acc.head.push(html.head)
				return acc
			},
			{ body: [], head: [] } as { body: string[]; head: string[] }
		)

		const { metafile } = await bundlePromise
		const bundle = extractBundle(metafile, output)

		const out = Function(
			'args',
			`{ return \`${template}\`}`
		)({ content, bundle, body, head })

		await fs.promises.writeFile(path.join(output, 'index.html'), out, 'utf-8')
	} finally {
		await fs.promises.rm(temp, { recursive: true, force: true })
	}
}

const loadHtmlTemplate = async (): Promise<string> => {
	//TODO: allow to overwrite template by the user
	return fs.promises.readFile('./template.html', 'utf-8')
}

const createOutputPath = (root: string): string => {
	const folder = path.join(root, 'dist')
	if (!fs.existsSync(folder)) {
		log.info(`Creating output folder: ${folder}`)
		fs.mkdirSync(folder)
	} else {
		log.info(`Clearing output folder: ${folder}`)
		fs.rmSync(folder, { recursive: true })
	}

	return folder
}

const extractBundle = (metafile: Metafile, outdir: string): string | null => {
	const bundleFile = Object.keys(metafile.outputs).find(f => f.endsWith('.js'))
	if (bundleFile) {
		return path.resolve(bundleFile).substring(path.resolve(outdir).length)
	}
	return null
}

run()
