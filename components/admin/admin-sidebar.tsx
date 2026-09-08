'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Package,
  Truck,
  ShoppingBag,
  Percent,
  BadgeCheck,
  Gift,
  Users,
  Banknote,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  // { href: "/admin/posts", icon: FileText, label: "Posts" },
  // { href: "/admin/tags", icon: Tag, label: "Tags" },
  // { href: "/admin/authors", icon: Users, label: "Authors" },
  { href: '/admin/remedies', icon: Sparkles, label: 'Remedies Category' },
  { href: '/admin/remedy-products', icon: Package, label: 'Remedy Products' },
  { href: '/admin/remedy-orders', icon: ShoppingBag, label: 'Remedies Orders' },
  { href: '/admin/gifts', icon: Gift, label: 'Gifts' },
  { href: '/admin/delivery-charges', icon: Truck, label: 'Delivery Charges' },
  { href: '/admin/commission', icon: Percent, label: 'Commission' },
  { href: '/admin/astrologer-verification', icon: BadgeCheck, label: 'Astrologer Verification' },
  { href: '/admin/astrologers', icon: Users, label: 'Astrologers' },
  { href: '/admin/payouts', icon: Banknote, label: 'Payouts' },
  { href: '/admin/remedy-analytics', icon: BarChart3, label: 'Remedy Analytics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full" style={{ backgroundColor: '#611508' }}>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[#4a1006]">
        <Link href="/" className="block">
          <span className="text-[#F8F3DF] font-mukta text-lg font-semibold tracking-wide">
            Astro Sewa
          </span>
          <p className="text-[#F8F3DF]/50 text-xs font-mukta mt-0.5">Admin Panel</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-mukta text-sm ${
                isActive
                  ? 'bg-[#4a1006] text-[#F8F3DF]'
                  : 'text-[#F8F3DF]/70 hover:text-[#F8F3DF] hover:bg-[#4a1006]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#4a1006]">
        <p className="text-[#F8F3DF]/30 text-xs font-mukta">© Astro Sewa</p>
      </div>
    </aside>
  );
}
