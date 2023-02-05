import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, Route, Routes } from 'react-router-dom'

export default () => {
	const [dummy, setDummy] = useState(0)
	useEffect(() => {
		setInterval(() => setDummy(Date.now()), 1000)
	}, [])

	return (
		<div>
			<Helmet>
				<title>Hopsa na mopsa</title>
				<meta name="description" content="Hopsa na mopsa" />
				<script src="https://example.com/some-script.js" />
				<link rel="stylesheet" href="https://example.com/some-style.css" />
			</Helmet>
			Hello from static site {dummy}
			<Link to="/about">About</Link>
			<Routes>
				<Route path="/about" element={<div>About content</div>} />
			</Routes>
		</div>
	)
}
