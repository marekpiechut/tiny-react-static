import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default () => (
	<div>
		<Helmet>
			<title>Hopsa na mopsa</title>
			<meta name="description" content="Hopsa na mopsa" />
			<script src="https://example.com/some-script.js" />
			<link rel="stylesheet" href="https://example.com/some-style.css" />
		</Helmet>
		Hello from static site
		<Link to="/about">About</Link>
	</div>
)
