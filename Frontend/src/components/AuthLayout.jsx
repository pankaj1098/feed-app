import { CameraLogo } from './Icons'

export default function AuthLayout({ children, signup }) {
  const quote = signup ? 'The world is beautiful, capture it. Share it. Inspire others.' : 'Collect memories, not things.'
  return <main className="auth-page"><section className="auth-card"><aside className="auth-hero"><div className="auth-brand"><CameraLogo /><span>Feedly</span></div><p className="auth-tagline">Share your moments.<br />Inspire the world.</p><blockquote><b>“</b><p>{quote}</p><cite>— Unknown</cite></blockquote></aside><section className="auth-panel">{children}</section></section></main>
}
