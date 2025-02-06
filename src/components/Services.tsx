import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LanguageContent } from '../types';

interface ServicesProps {
  content: LanguageContent['services'];
}

export const Services: React.FC<ServicesProps> = ({ content }) => {
  if (!content || !content.items) {
    return null;
  }

  const scrollToService = (serviceId: string) => {
    const element = document.getElementById(serviceId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20" aria-labelledby="services-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="services-title" className="text-3xl font-bold text-center mb-12 text-primary">
          {content.title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.items.map((service) => (
            <button 
              key={service.id}
              onClick={() => scrollToService(service.id)}
              className="group text-left"
            >
              <div className="card h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                </div>
                <div className="flex items-center text-primary group-hover:text-accent transition-colors">
                  <span className="font-medium">Learn More</span>
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};