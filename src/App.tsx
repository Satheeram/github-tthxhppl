import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { en } from './locales/en';
import { ta } from './locales/ta';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { ServiceSection } from './components/ServiceSection';
import { CONTACT_INFO, IMAGES } from './constants';
import { LanguageContent } from './types';

function App() {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const content: LanguageContent = {
    ...(language === 'en' ? en : ta),
    nav: {
      ...(language === 'en' ? en.nav : ta.nav),
      language
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          content={content.nav}
          language={language}
          toggleLanguage={toggleLanguage}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

        <Hero 
          content={content.hero} 
          language={language}
          services={content.services.items}
        />

        <Services content={content.services} />

        {/* Service Sections */}
        {content.services.items.map((service) => (
          <ServiceSection
            key={service.id}
            service={service}
            language={language}
          />
        ))}
        
        {/* About Section */}
        <section id="about" className="py-20 bg-white" aria-labelledby="about-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src={IMAGES.ABOUT}
                  alt="Healthcare team"
                  className="rounded-2xl shadow-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-2xl bg-primary/10 hover:bg-primary/0 transition-colors duration-300"></div>
              </div>
              <div>
                <h2 id="about-title" className="text-3xl font-bold mb-6 text-primary">
                  {content.about.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">{content.about.content}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20" aria-labelledby="contact-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="contact-title" className="text-3xl font-bold text-center mb-12 text-primary">
              {content.contact.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card flex items-center space-x-4">
                <MapPin className="h-6 w-6 text-accent flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-600">{content.contact.address}</span>
              </div>
              <div className="card flex items-center space-x-4">
                <Phone className="h-6 w-6 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`tel:${CONTACT_INFO.PHONE}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {content.contact.phone}
                </a>
              </div>
              <div className="card flex items-center space-x-4">
                <Mail className="h-6 w-6 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`mailto:${CONTACT_INFO.EMAIL}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {content.contact.email}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-white py-12" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center mb-6">
              <img 
                src={language === 'en' ? '/eng_logo.png' : '/tam_logo.png'} 
                alt="Naeyam Logo" 
                className="h-12 w-auto"
                loading="lazy"
              />
              <span className="ml-2 text-xl font-bold">Naeyam</span>
            </div>
            <p className="text-primary-100">© {new Date().getFullYear()} Naeyam. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;