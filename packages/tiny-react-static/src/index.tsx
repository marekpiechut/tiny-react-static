import esbuild, { Metafile } from 'esbuild'
import fs from 'fs'
import path from 'path'
import os from 'os'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import type { HelmetServerState } from 'react-helmet-async'
import type { ReactElement } from 'react'

type HelmetContext = {
	helmet?: HelmetServerState
}

const run = async () => {
	const root = __dirname
	const temp = await fs.promises.mkdtemp(path.join(root, '.static'))
	const output = path.join(root, 'dist')

	await fs.promises.mkdir(output).catch(e => console.log(e))

	const serverjs = path.join(temp, 'server-content.js')
	try {
		await esbuild.build({
			entryPoints: ['../test-project/index.tsx'],
			bundle: false,
			minify: false,
			format: 'cjs',
			platform: 'node',
			outfile: serverjs,
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

		const Comp = require(serverjs)

		const { root, helmet } = wrap(<Comp.default />)
		const content = ReactDOM.renderToString(root)
		const head = generateHead(helmet?.helmet)

		const template = await loadHtmlTemplate()
		const { metafile } = await bundlePromise
		const bundle = extractBundle(metafile, output)

		const out = Function(
			'args',
			`{ return \`${template}\`}`
		)({ content, bundle, head })
		console.log(out)
	} finally {
		await fs.promises.rm(temp, { recursive: true, force: true })
	}
}
const wrap = (body: ReactElement) => {
	const helmet: HelmetContext = {}
	const root = (
		<StaticRouter location="/">
			<HelmetProvider context={helmet}>{body}</HelmetProvider>
		</StaticRouter>
	)
	return { root, helmet }
}

const generateHead = (helmet?: HelmetServerState): string =>
	Object.values(helmet || {})
		.map(e => e.toString())
		.filter(e => e)
		.join('\n')

const loadHtmlTemplate = async () => {
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
