import type { WebPlugin } from '../plugin'
import { BrowserRouter } from 'react-router-dom'

const ReactRouterPlugin: WebPlugin<void> = ({ children }) => (
	<BrowserRouter>{children}</BrowserRouter>
)

export default ReactRouterPlugin
