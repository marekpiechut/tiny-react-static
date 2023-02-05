import type { WebPlugin } from '../plugin'
import { HelmetProvider } from 'react-helmet-async'

const HelmetPlugin: WebPlugin<void> = ({ children }) => (
	<HelmetProvider>{children}</HelmetProvider>
)

export default HelmetPlugin
