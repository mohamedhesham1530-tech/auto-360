import { Brand } from './Brand'
import { useI18n } from '../i18n/I18nProvider'

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/auto360service?stkn=OWhwdXRmcW9wbXFx',
    label: 'Instagram',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.4" cy="6.7" r="1.2" fill="currentColor"/></svg>,
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/share/1C8SQ7bn4c',
    label: 'Facebook',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.9 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.6 1.7-1.6h1.5V3.6c-.7-.1-1.4-.2-2.1-.2-2.5 0-4.2 1.5-4.2 4.3v2.2H8v3.1h2.8v8h3.1Z" fill="currentColor"/></svg>,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@auto360service',
    label: 'TikTok',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 3c.3 2.4 1.6 3.7 3.9 3.9v3.2c-1.3.1-2.6-.3-3.8-1.1v6.7a5.2 5.2 0 1 1-4.5-5.1v3.2a2.1 2.1 0 1 0 1.4 2V3h3Z" fill="currentColor"/></svg>,
  },
]

const phones = ['+20 101 422 7000', '+20 100 077 7844']

export function SiteFooter({ compact = false }) {
  const { t, language } = useI18n()
  const copy = language === 'ar'
    ? { title: 'تواصل مع AUTO 360', instagram: 'إنستجرام', facebook: 'فيسبوك', tiktok: 'تيك توك', phone: 'اتصل بنا' }
    : { title: 'Connect with AUTO 360', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', phone: 'Call us' }

  return <footer className={`site-footer ${compact ? 'site-footer--compact' : ''}`}>
    <div className="site-footer__brand">
      <Brand compact/>
      <div><strong>AUTO 360</strong><span>{t.footer}</span></div>
    </div>
    <div className="site-footer__socials" aria-label={copy.title}>
      {socials.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label}>{social.icon}</a>)}
    </div>
    <div className="site-footer__contacts" aria-label={copy.phone}>
      {phones.map((phone) => <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`}><span className="site-footer__phone-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.5 9.6 3c.7-.1 1.3.3 1.5 1l1 3.1c.2.6 0 1.2-.4 1.6l-1.5 1.2c1 2 2.6 3.6 4.6 4.6l1.2-1.5c.4-.5 1-.7 1.6-.4l3.1 1c.7.2 1.1.8 1 1.5l-.5 2.5c-.1.7-.7 1.2-1.4 1.3C11 19.5 4.5 13 4.6 4.9c0-.7.5-1.3 1.3-1.4l1.2-.2Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>{phone}</span></a>)}
    </div>
  </footer>
}
