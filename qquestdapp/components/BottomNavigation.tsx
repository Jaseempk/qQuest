'use client'

import { Home, BarChart2, Gift, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: BarChart2, label: 'Dashboard', href: '/dashboard' },
    { icon: Gift, label: 'Rewards', href: '/rewards' },
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center py-2">
            <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={`text-xs mt-1 ${pathname === item.href ? 'text-blue-500' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}