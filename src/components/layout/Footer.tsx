'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'

export default function Footer() {
  const { locale } = useLocale()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    about: {
      title: locale === 'zh' ? '关于我们' : 'About Us',
      links: [
        { name: locale === 'zh' ? '公司简介' : 'Company', href: '/about' },
        { name: locale === 'zh' ? '联系我们' : 'Contact', href: '/contact' },
        { name: locale === 'zh' ? '招聘信息' : 'Careers', href: '/careers' },
        { name: locale === 'zh' ? '新闻中心' : 'News Center', href: '/news' },
      ],
    },
    services: {
      title: locale === 'zh' ? '服务项目' : 'Services',
      links: [
        { name: locale === 'zh' ? '景点推荐' : 'Attractions', href: '/attractions' },
        { name: locale === 'zh' ? '行程规划' : 'Trip Planning', href: '/itineraries' },
        { name: locale === 'zh' ? '酒店预订' : 'Hotel Booking', href: '/hotels' },
        { name: locale === 'zh' ? '交通指南' : 'Transportation', href: '/transportation' },
      ],
    },
    support: {
      title: locale === 'zh' ? '客户支持' : 'Customer Support',
      links: [
        { name: locale === 'zh' ? '帮助中心' : 'Help Center', href: '/help' },
        { name: locale === 'zh' ? '常见问题' : 'FAQ', href: '/faq' },
        { name: locale === 'zh' ? '用户协议' : 'Terms of Service', href: '/terms' },
        { name: locale === 'zh' ? '隐私政策' : 'Privacy Policy', href: '/privacy' },
      ],
    },
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">
                {locale === 'zh' ? '平潭旅游' : 'Pingtan Tourism'}
              </span>
            </div>
            <p className="text-gray-300 mb-4">
              {locale === 'zh'
                ? '探索平潭岛的美丽风光，体验独特的海岛文化，让我们为您打造难忘的旅行体验。'
                : 'Explore the beautiful scenery of Pingtan Island and experience unique island culture. Let us create an unforgettable travel experience for you.'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+86 591-1234-5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>info@pingtantourism.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>
                  {locale === 'zh'
                    ? '福建省平潭综合实验区'
                    : 'Pingtan Comprehensive Experimental Zone, Fujian Province'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="WeChat"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
            <div className="text-gray-400 text-sm">
              <p>
                © {currentYear}{' '}
                {locale === 'zh' ? '平潭旅游' : 'Pingtan Tourism'}.
                {' '}
                {locale === 'zh' ? '保留所有权利。' : 'All rights reserved.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}