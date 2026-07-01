import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '□' },
  { to: '/invoices', label: 'Invoices', icon: '≡' },
  { to: '/clients', label: 'Clients', icon: '●' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

interface Props {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: Props) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'bg-accent/10 text-accent font-medium'
        : 'text-neutral-600 hover:bg-neutral-100'
    }`;

  return (
    <aside className={`h-full shrink-0 border-r border-border bg-white flex flex-col ${mobile ? 'w-64 shadow-xl' : 'w-56'}`}>
      <div className="px-4 py-6 flex items-center justify-between gap-2">
        <img src="/minvoicelogo.png" alt="MinVoice" className="w-full object-contain" />
        {mobile && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 md:hidden"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={linkClass}
            onClick={onClose}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-muted">MinVoice v0.1</p>
      </div>
    </aside>
  );
}
