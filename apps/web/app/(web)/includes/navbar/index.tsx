'use client';

import React, { useState, useEffect, useRef, RefObject } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import { APP_NAME } from '@/lib/config/config';
import SeekModal from "@/components/common/modals/seek/SeekModal";

import { Search, ChevronDown, X, Menu } from 'lucide-react';
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";

// imported icons from lucide-react to use in the navbar dropdowns
import {
  Info,
  HelpingHand,
  Mail,
  HelpCircle,
  Briefcase,
  BarChart,
  MessageCircle,
  Heart,
  FileText,
  Shield,
  File,
  Users,
  Video,
  UsersRound,
} from 'lucide-react';

// Placed outside the component
const getIcon = (name: string) => {
  const icons: Record<string, React.ReactNode> = {
    info: <Info className="w-4 h-4" />,
    'helping-hand': <HelpingHand className="w-4 h-4" />,
    mail: <Mail className="w-4 h-4" />,
    'help-circle': <HelpCircle className="w-4 h-4" />,
    briefcase: <Briefcase className="w-4 h-4" />,
    'bar-chart': <BarChart className="w-4 h-4" />,
    'message-circle': <MessageCircle className="w-4 h-4" />,
    heart: <Heart className="w-4 h-4" />,
    'file-text': <FileText className="w-4 h-4" />,
    shield: <Shield className="w-4 h-4" />,
    file: <File className="w-4 h-4" />,
    users: <Users className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    'users-round': <UsersRound className="w-4 h-4" />,
  };
  return icons[name] || <File className="w-4 h-4" />;
};

const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
  ATI_TEAS: 'ati-teas',
  HESI_A2: 'hesi-a2',
  PRE_NURSING: 'pre-nursing',
  RN_NURSING: 'rn-nursing',
  LPN_NURSING: 'lpn-nursing',
  NCLEX_RN: 'nclex-rn',
  NCLEX_PN: 'nclex-pn',
  CERTIFICATION: 'certification',
};

export default function Navbar() {
  const { user } = useCurrentSystemUser();
  const { programs } = useRelativeStrataPrograms();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownRefs: {
    services: RefObject<HTMLDivElement | null>;
    resources: RefObject<HTMLDivElement | null>;
    nursingExams: RefObject<HTMLDivElement | null>;
    more: RefObject<HTMLDivElement | null>;
    dashboards: RefObject<HTMLDivElement | null>;
    nclexExams: RefObject<HTMLDivElement | null>;
    account: RefObject<HTMLDivElement | null>;
  } = {
    services: useRef<HTMLDivElement>(null),
    resources: useRef<HTMLDivElement>(null),
    nursingExams: useRef<HTMLDivElement>(null),
    more: useRef<HTMLDivElement>(null),
    dashboards: useRef<HTMLDivElement>(null),
    nclexExams: useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null),
  };

  const navbarRef = useRef<HTMLElement>(null);
  const [showSearch] = useState(false);
  const [seekOpen, setSeekOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    // Close dropdowns on escape key press
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isDropdownActive = (dropdownName: string) => {
    return activeDropdown === dropdownName;
  };

  // Check if dropdown would go off screen and adjust position
  const getDropdownPosition = (dropdownRef: React.RefObject<HTMLDivElement | null>): string => {
    if (!dropdownRef.current) return 'left-0';

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.right > viewportWidth) {
      return 'right-0';
    }
    return 'left-0';
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [showSearch]);


  return (
    <header
      ref={navbarRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-emerald-200 shadow-md py-2' : 'bg-blue-200 py-4'
        }`}
    >
      <div className="w-full px-1 md:px-0 lg:px-4 flex items-center justify-between md:w-[90%] md:mx-auto">
        {/* Logo and System Name */}
        <div className="flex items-center gap-2 mr-6 lg:mr-10">
          <div className="block">
            <Image
              src="/logo/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="rounded w-8 h-8 md:w-8 md:h-8 lg:w-10 lg:h-10"
            />
          </div>
          <Link
            href="/"
            className="font-bold text-2xl md:text-2xl lg:text-3xl text-black md:text-gray-900 hover:opacity-90 transition-opacity"
            onClick={() => setActiveDropdown(null)}
          >
            {APP_NAME}
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-2 lg:gap-4 whitespace-nowrap font-medium text-sm md:text-[11px] lg:text-sm xl:text-base">

          <Link
            href="/"
            className="hidden lg:inline-block font-bold hover:text-blue-500 transition-colors text-white md:text-gray-900 text-sm lg:text-sm xl:text-base"
            onClick={() => setActiveDropdown(null)}
          >
            HOME
          </Link>

          <Link
            href="/pages/exams/ati-teas"
            className="font-bold hover:text-blue-500 transition-colors text-white md:text-gray-900 text-sm md:text-xs lg:text-sm xl:text-base"
            onClick={() => setActiveDropdown(null)}
          >
            ATI-TEAS
          </Link>

          <Link
            href="/pages/exams/hesi-a2"
            className="font-bold hover:text-blue-500 transition-colors text-white md:text-gray-900 text-sm md:text-xs lg:text-sm xl:text-base"
            onClick={() => setActiveDropdown(null)}
          >
            HESI-A2
          </Link>

          {/* Mega Dropdown: Nursing Exams */}
          <div className="relative" ref={dropdownRefs.nursingExams}>
            <button
              className={`font-bold flex items-center gap-1 hover:text-blue-500 transition-colors text-white md:text-gray-900 text-sm md:text-xs lg:text-sm xl:text-base ${isDropdownActive('nursingExams') ? 'text-blue-500' : ''
                }`}
              onMouseEnter={() => setActiveDropdown('nursingExams')}
              onClick={() => toggleDropdown('nursingExams')}
              aria-expanded={isDropdownActive('nursingExams')}
              aria-haspopup="true"
              aria-controls="nursingExams-dropdown"
            >
              Nursing School
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownActive('nursingExams') ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isDropdownActive('nursingExams') && (
              <div
                className={`absolute ${getDropdownPosition(
                  dropdownRefs.nursingExams
                )} top-full pt-3 z-50 transform -translate-x-1/2`}
                onMouseEnter={() => setActiveDropdown('nursingExams')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  id="nursingExams-dropdown"
                  className="w-[320px] bg-white text-gray-800 shadow-xl rounded-xl p-4 transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto"
                >
                  <ul className="space-y-3">
                    {/* RN-Nursing Exams */}
                    <li>
                      <Link
                        href="/pages/exams/rn-nursing"
                        className="hover:text-blue-600 transition-colors flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium">RN-Nursing Test Bank</h5>
                          <p className="text-xs text-gray-500">Registered Nurse prep</p>
                        </div>
                      </Link>
                    </li>

                    {/* LPN-Nursing Exams */}
                    <li>
                      <Link
                        href="/pages/exams/lpn-nursing"
                        className="hover:text-blue-600 transition-colors flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium">LPN-Nursing Test Bank</h5>
                          <p className="text-xs text-gray-500">Licensed Practical Nurse</p>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Mega Dropdown: NCLEX Exams */}
          <div className="relative" ref={dropdownRefs.nclexExams}>
            <button
              className={`font-bold flex items-center gap-1 hover:text-blue-500 transition-colors text-white md:text-gray-900 text-sm md:text-xs lg:text-sm xl:text-base ${isDropdownActive('nclexExams') ? 'text-blue-500' : ''
                }`}
              onMouseEnter={() => setActiveDropdown('nclexExams')}
              onClick={() => toggleDropdown('nclexExams')}
              aria-expanded={isDropdownActive('nclexExams')}
              aria-haspopup="true"
              aria-controls="nclexExams-dropdown"
            >
              NCLEX Exams
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownActive('nclexExams') ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isDropdownActive('nclexExams') && (
              <div
                className="absolute left-1/2 top-full pt-3 z-50 -translate-x-1/2"
                onMouseEnter={() => setActiveDropdown('nclexExams')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  id="nclexExams-dropdown"
                  className="w-[320px] max-w-[calc(100vw-2rem)] whitespace-normal bg-white text-gray-800 shadow-xl rounded-xl p-4 transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto"
                >
                  <ul className="space-y-3">
                    {/* RN-NCLEX Exams */}
                    <li>
                      <Link
                        href="/pages/exams/nclex-rn"
                        className="hover:text-blue-600 transition-colors flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 group [&>div:first-child]:shrink-0"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-medium">NCLEX - RN Test Bank</h5>
                          <p className="text-xs text-gray-500">National Council Licensure Examination for Registered Nurses</p>
                        </div>
                      </Link>
                    </li>

                    {/* LPN-NCLEX Exams */}
                    <li>
                      <Link
                        href="/pages/exams/nclex-pn"
                        className="hover:text-blue-600 transition-colors flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 group [&>div:first-child]:shrink-0"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-medium">NCLEX - PN Test Bank</h5>
                          <p className="text-xs text-gray-500">National Council Licensure Examination for Practical/Vocational Nurses</p>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/pages/notes"
            className="inline-flex items-center rounded-lg border border-green-300 md:border-green-500 px-2 py-1.5 lg:px-4 lg:py-2 font-bold bg-yellow-200 text-white md:text-gray-900 
            text-sm md:text-[11px] lg:text-sm xl:text-base transition-all duration-200 hover:border-blue-500 hover:text-blue-500 hover:bg-pink-200"
            onClick={() => setActiveDropdown(null)}
          >
            Nursing Notes
          </Link>

        </nav>


        {/* Mega Dropdown: More */}
        <div className="relative hidden lg:block" ref={dropdownRefs.more}>
          <button
            className={`flex items-center gap-1 font-bold hover:text-blue-500 transition-colors text-green-800 md:text-gray-900 text-sm md:text-xs lg:text-sm xl:text-base ${isDropdownActive('more') ? 'text-blue-500' : ''
              }`}
            onMouseEnter={() => setActiveDropdown('more')}
            onClick={() => toggleDropdown('more')}
            aria-expanded={isDropdownActive('more')}
            aria-haspopup="true"
            aria-controls="more-dropdown"
          >
            More
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownActive('more') ? 'rotate-180' : ''
                }`}
            />
          </button>

          {isDropdownActive('more') && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 top-full pt-3 z-50"
              onMouseEnter={() => setActiveDropdown('more')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div
                id="more-dropdown"
                className="w-[320px] max-h-[400px] overflow-y-auto bg-white text-gray-800 shadow-xl rounded-xl p-4 transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto"
              >
                <ul className="space-y-2">
                  {[
                    { name: 'About Us', href: '/pages/about-us', icon: 'info' },
                    { name: 'How we Help', href: '/pages/documentation', icon: 'helping-hand' },
                    { name: 'Contact Us', href: '/pages/contact-us', icon: 'mail' },
                    { name: 'F.A.Qs', href: '/pages/faqs', icon: 'help-circle' },
                    { name: 'Reviews & Testimonials', href: '/pages/reviews', icon: 'briefcase' },
                    { name: 'Our Staff', href: '/pages/team', icon: 'message-circle' },
                    { name: 'Our Values', href: '/pages/values', icon: 'heart' },
                    { name: 'Terms of Service', href: '/pages/terms-of-service', icon: 'file-text' },
                    { name: 'Privacy Policy', href: '/pages/privacy-policy', icon: 'shield' },
                    { name: 'Our Blog Posts', href: '/pages/blogs', icon: 'file' },
                    { name: 'Our Team', href: '/pages/our-team', icon: 'users' },
                    { name: 'Live Sessions', href: '/pages/live-sessions', icon: 'video' },
                    { name: 'Social Groups', href: '/pages/social-groups', icon: 'users-round' },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-sm text-gray-800 transition-colors group"
                      >
                        <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          {getIcon(item.icon)}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* Search */}
        <div
          className="relative"
        >

          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="search"
              placeholder="Type & Search . . ."
              tabIndex={showSearch ? 0 : -1}
              className={`absolute right-0 h-10 rounded-md border border-green-300 bg-white pl-4 pr-12 text-sm text-black
              focus:outline-none focus:ring-2 focus:ring-green-500
              transition-all duration-300 ease-in-out
              ${showSearch ? "w-64 opacity-100" : "w-0 opacity-0 border-transparent px-0"}`}
            />
            <button
              onClick={() => { setActiveDropdown(null); setSeekOpen(true); }}
              className="relative z-10 p-2 rounded-md border border-green-300 bg-white hover:bg-gray-100 transition-colors"
              aria-label="Search"
              aria-expanded={showSearch}
            >
              <Search
                className={`w-5 h-5 text-green-800 md:text-gray-900 transition-transform duration-300 ${showSearch ? "rotate-90 scale-110" : ""
                  }`}
              />
            </button>
          </div>


        </div>

        {/* Right Side Buttons */}
        <div className="hidden md:flex items-center gap-4">

          <div className="relative" ref={dropdownRefs.account}>
            <button
              className={`flex items-center gap-1
              px-3 py-1.5 md:px-2 md:py-1 lg:px-4 lg:py-2
              text-sm md:text-xs lg:text-sm xl:text-base
              rounded-xl font-semibold shadow-md border border-blue-300 transition-all
              bg-yellow-200 text-blue-600
              hover:bg-indigo-200 hover:shadow-lg hover:outline-1 hover:outline-black hover:outline-offset-0
              ${isDropdownActive('account')
                  ? 'bg-indigo-200 text-blue-700 border-pink-500'
                  : ''
                }
              `}
              onClick={() => toggleDropdown('account')}
              onMouseEnter={() => setActiveDropdown('account')}
              aria-expanded={isDropdownActive('account')}
              aria-haspopup="true"
              aria-controls="account-dropdown"
            >
              Account
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownActive('account') ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Centered Dropdown with precise hover behavior */}
            {isDropdownActive('account') && (
              <div
                className="absolute left-1/2 top-full pt-3 transform -translate-x-1/2 z-50"
                onMouseEnter={() => setActiveDropdown('account')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  id="account-dropdown"
                  className="bg-gradient-to-br from-green-200 to-orange-200 text-gray-800 shadow-xl rounded-xl p-2 transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto min-w-[220px] backdrop-blur-sm border border-blue-100"
                >
                  {!user ? (
                    <>
                      <Link
                        href="/auth/login"
                        className="px-4 py-2 hover:bg-red-100 hover:border border-black rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-7 h-7 flex items-center justify-center text-blue-600 bg-white rounded-md shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold">Login</span>
                      </Link>

                      <Link
                        href="/auth/register"
                        className="px-4 py-2 hover:bg-blue-200 hover:border border-black rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-7 h-7 flex items-center justify-center text-blue-800 bg-white rounded-md shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold">Register</span>
                      </Link>

                      <Link
                        href="/pages/actions"
                        className="px-4 py-2 hover:bg-blue-200 hover:border border-black rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-7 h-7 flex items-center justify-center text-blue-800 bg-white rounded-md shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold">Get Started</span>
                      </Link>
                      <Link
                        href="/auth/support"
                        className="px-4 py-2 hover:bg-blue-200 hover:border border-black rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-7 h-7 flex items-center justify-center text-blue-800 bg-white rounded-md shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold">Having Issues ?</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Programs list - only shown when logged in */}
                      <div className="px-2 pt-1 pb-2">
                        <p className="text-[10px] font-bold text-gray-600 text-center uppercase tracking-wide px-2 mb-1">
                          Select Target Program
                        </p>

                        <div className="border-t border-black my-2"></div>

                        <ul className="space-y-1 max-h-[240px] overflow-y-auto">
                          {programs.map((program) => {
                            const slug = SEGMENT_DASHBOARD_MAP[program.segment ?? ''];
                            if (!slug) return null;
                            return (
                              <li key={program.guidId}>
                                <Link
                                  href={`/dashboards/${slug}`}
                                  className="px-3 py-2 hover:bg-indigo-100 hover:border border-black rounded-lg transition-colors flex items-center gap-2 text-sm"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span className="font-medium">{program.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="border-t border-black my-2"></div>

                      {/* Contact Us - only when logged in */}
                      <Link
                        href="/pages/contact-us"
                        className="px-4 py-2 hover:bg-yellow-100 hover:border border-black rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-7 h-7 flex items-center justify-center text-green-600 bg-white rounded-md shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">Contact Us</span>
                      </Link>

                      {/* Actions - only when logged in */}
                      <Link
                        href="/pages/actions"
                        className="flex items-center gap-3 rounded-lg border border-transparent px-4 py-2 transition-all duration-200 hover:border-green-300 hover:bg-green-100"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm">
                          <Info className="h-4 w-4 stroke-[2.5]" />
                        </div>

                        <span className="text-sm font-medium">Get started</span>
                      </Link>

                      {/* About - only when logged in */}
                      <Link
                        href="/pages/about-us"
                        className="flex items-center gap-3 rounded-lg border border-transparent px-4 py-2 transition-all duration-200 hover:border-green-300 hover:bg-green-100"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm">
                          <Info className="h-4 w-4 stroke-[2.5]" />
                        </div>

                        <span className="text-sm font-medium">About Us</span>
                      </Link>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-indigo-950 border-1 rounded text-2xl p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div
          className="bg-gradient-to-b from-fuchsia-100 via-emerald-100 to-gray-200 rounded text-black px-4 pt-2 pb-6 md:hidden shadow-lg max-h-[calc(100vh-70px)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/policy"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Policy
              </Link>
            </li>

            {/* Mobile Services Dropdown */}
            <li>
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors ${activeDropdown === 'mobile-services' ? 'bg-blue-50' : ''
                  }`}
                onClick={() => toggleDropdown('mobile-services')}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-services' ? 'rotate-180' : ''
                  }`} />
              </button>
              {activeDropdown === 'mobile-services' && (
                <ul className="pl-4 mt-1 space-y-2">
                  <li>
                    <Link
                      href="/services/ati-teas"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ATI TEAS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/hesi-a2"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      HESI A2
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/ged"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      GED
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/assignments"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Assignments Help
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/tutoring"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tutoring
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Mobile Resources Dropdown */}
            <li>
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors ${activeDropdown === 'mobile-resources' ? 'bg-blue-50' : ''
                  }`}
                onClick={() => toggleDropdown('mobile-resources')}
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-resources' ? 'rotate-180' : ''
                  }`} />
              </button>
              {activeDropdown === 'mobile-resources' && (
                <ul className="pl-4 mt-1 space-y-2">
                  <li>
                    <Link
                      href="/resources/blog"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/resources/faq"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/resources/team"
                      className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Team
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="border-t border-gray-100 mt-2 pt-2">
              <Link
                href="/auth/login"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/auth/register"
                className="block py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                href="/pages/actions"
                className="block bg-blue-500 text-white px-4 py-2 rounded-lg text-center mt-2 font-medium shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      )}
      <SeekModal open={seekOpen} onClose={() => setSeekOpen(false)} />
    </header>
  );
}