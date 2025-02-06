import React from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageContent } from '../types';

interface NavigationProps {
  content: LanguageContent['nav'];
  language: 'en' | 'ta';
  toggleLanguage: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  content,
  language,
  toggleLanguage,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const closeMenu = () => setIsMenuOpen(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu');
      if (menu && !menu.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src={language === 'en' ? '/eng_logo.png' : '/tam_logo.png'} 
              alt="Naeyam Logo" 
              className="h-10 w-auto transition-transform duration-300 hover:scale-105"
              loading="eager"
            />
            <span className="ml-3 text-xl font-bold text-primary">Naeyam</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'services', 'about', 'contact'].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-gray-600 hover:text-primary font-medium 
                  focus:outline-none focus:text-primary transition-colors duration-300"
                aria-label={content[item as keyof typeof content]}
              >
                {content[item as keyof typeof content]}
              </a>
            ))}
            <button
              onClick={toggleLanguage}
              className="btn-secondary"
              aria-label={`Switch to ${language === 'en' ? 'Tamil' : 'English'}`}
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-primary focus:outline-none focus:text-primary p-2"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {['home', 'services', 'about', 'contact'].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="block px-3 py-2 text-gray-600 hover:text-primary font-medium 
                  focus:outline-none focus:text-primary transition-colors duration-300"
                onClick={closeMenu}
              >
                {content[item as keyof typeof content]}
              </a>
            ))}
            <button
              onClick={() => {
                toggleLanguage();
                closeMenu();
              }}
              className="w-full text-left px-3 py-2 text-gray-600 hover:text-primary font-medium 
                focus:outline-none focus:text-primary transition-colors duration-300"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}