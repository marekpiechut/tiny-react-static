const esbuild = require('esbuild')
const ReactDOM = require('react-dom/server')
const React = require('react')

const run = async () => {
	let result = await esbuild.build({
		entryPoints: ['../test-project/index.tsx'],
		bundle: true,
		minify: true,
		format: 'cjs',
		platform: 'node',
		outdir: './dist',
	})
	console.log(result)
	const Comp = require('./dist/index.js')
	const html = ReactDOM.renderToString(React.createElement(Comp.default))
	console.log(html)
}

run()
