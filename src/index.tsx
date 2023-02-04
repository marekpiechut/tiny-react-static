import esbuild, { Metafile } from 'esbuild'
import fs from 'fs'
import path from 'path'
import ReactDOM from 'react-dom/server'
import { helmetPlugin } from './plugins/helmet'
import { reactRouterPlugin } from './plugins/react-router'

const plugins = [helmetPlugin(), reactRouterPlugin()]

const run = async (): Promise<void> => {
	const root = __dirname
	const temp = await fs.promises.mkdtemp(path.join(root, '.static'))
	const output = path.join(root, 'dist')

	await fs.promises.mkdir(output).catch(e => console.log(e))

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
			entryPoints: ['../test-project/index.tsx'],
			bundle: true,
			minify: true,
			format: 'iife',
			platform: 'browser',
			entryNames: '[ext]/[name]-[hash]',
			metafile: true,
			outdir: output,
		})

		const ctx = { location: '/about', file: 'dummy' }

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Root = require(serverOut).default
		const Body = plugins.reduce(
			(prev, plugin) => (plugin.wrap ? plugin.wrap(ctx, prev) : prev),
			<Root />
		)
		const content = ReactDOM.renderToString(Body)

		const template = await loadHtmlTemplate()
		const { body, head } = plugins.reduce(
			(acc, plugin) => {
				const html = plugin.html?.(ctx, template, acc)
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

		console.log(out)
	} finally {
		await fs.promises.rm(temp, { recursive: true, force: true })
	}
}

const loadHtmlTemplate = async (): Promise<string> => {
	//TODO: allow to overwrite template by the user
	return fs.promises.readFile('./template.html', 'utf-8')
}

const extractBundle = (
	metafile: Metafile,
	outdir: string
): string | undefined => {
	const bundleFile = Object.keys(metafile.outputs).find(f => f.endsWith('.js'))
	if (bundleFile) {
		return path.resolve(bundleFile).substring(path.resolve(outdir).length)
	}
}

run()
