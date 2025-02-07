import React from 'react';
import { Users, Heart, Shield } from 'lucide-react';
import { LanguageContent } from '../types';
import { IMAGES } from '../constants';

interface AboutProps {
  content: LanguageContent['about'];
}

export const About: React.FC<AboutProps> = ({ content }) => {
  return (
    <section id="about" className="py-20 bg-background" aria-labelledby="about-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={IMAGES.ABOUT}
                alt="Medical team discussion"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
            </div>
            
            {/* Stats Cards */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md">
              <div className="grid grid-cols-3 gap-4 bg-surface p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary/5 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-bold text-2xl text-primary">4+</div>
                  <div className="text-sm text-text-secondary">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-secondary/5 rounded-full">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="font-bold text-2xl text-primary">100+</div>
                  <div className="text-sm text-text-secondary">Patients</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-accent/5 rounded-full">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div className="font-bold text-2xl text-primary">5+</div>
                  <div className="text-sm text-text-secondary">Years</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-12">
            <h2 
              id="about-title"
              className="text-3xl font-bold text-primary mb-6"
            >
              {content.title}
            </h2>
            <div className="prose prose-lg">
              <p className="text-text-secondary leading-relaxed mb-6">
                {content.content}
              </p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <div className="bg-surface p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/5 rounded-full mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Our Mission</h3>
                <p className="text-text-secondary">
                  To provide accessible, compassionate healthcare services that enhance the quality of life for our community.
                </p>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-secondary/5 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Our Vision</h3>
                <p className="text-text-secondary">
                  To be the most trusted healthcare partner, delivering exceptional care with empathy and excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};