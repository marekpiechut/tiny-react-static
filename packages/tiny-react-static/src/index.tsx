import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import os from 'os'
import ReactDOM from 'react-dom/server'
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
		console.log(
			await esbuild.build({
				entryPoints: ['../test-project/index.tsx'],
				bundle: false,
				minify: false,
				format: 'cjs',
				platform: 'node',
				outfile: serverjs,
			})
		)

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
		const templatePromise = fs.promises.readFile('./template.html', 'utf-8')

		const { root, helmet } = buildContext(<Comp.default />)
		const content = ReactDOM.renderToString(root)
		const head = Object.values(helmet.helmet || {})
			.map(e => e.toString())
			.filter(e => e)
			.join('\n')

		const template = await templatePromise
		const outputs = (await bundlePromise).metafile?.outputs
		const bundleFile = Object.keys(outputs).find(f => f.endsWith('.js'))
		const bundle =
			bundleFile &&
			path.resolve(bundleFile).substring(path.resolve(output).length)

		const out = Function(
			'args',
			`{ return \`${template}\`}`
		)({ content, bundle, head })
		console.log(out)
	} finally {
		await fs.promises.rm(temp, { recursive: true, force: true })
	}
}
const buildContext = (body: ReactElement) => {
	const helmet: HelmetContext = {}
	const root = <HelmetProvider context={helmet}>{body}</HelmetProvider>

	return { root, helmet }
}

run()
