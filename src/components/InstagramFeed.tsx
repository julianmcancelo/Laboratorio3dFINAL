'use client';

import { useEffect } from 'react';

export default function InstagramFeed() {
  useEffect(() => {
    // Cargar script de Instagram
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-16 px-4" style={{background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            📸 Síguenos en Instagram
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Descubre nuestros trabajos y novedades
          </p>
          <a
            href="https://www.instagram.com/laboratorio.3d/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @laboratorio.3d
          </a>
        </div>

        {/* Grid de posts de Instagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Post 1 - Embed real de Instagram */}
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
            <blockquote 
              className="instagram-media" 
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/6058102016/"
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '540px',
                minWidth: '326px',
                padding: 0,
                width: '99.375%'
              }}
            >
            </blockquote>
          </div>

          {/* Post 2 - Segundo reel */}
          <div className="rounded-xl overflow-hidden shadow-2xl hidden md:block" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
            <blockquote 
              className="instagram-media" 
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/DQfCWN_DshK/"
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '540px',
                minWidth: '326px',
                padding: 0,
                width: '99.375%'
              }}
            >
            </blockquote>
          </div>

          <div className="rounded-xl overflow-hidden shadow-2xl hidden lg:block" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
            <div className="aspect-square flex items-center justify-center">
              <a
                href="https://www.instagram.com/laboratorio.3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-all text-center p-8"
              >
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-lg font-semibold">Síguenos para más</p>
                <p className="text-sm text-gray-400 mt-2">Impresiones 3D</p>
              </a>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            ¿Te gusta lo que ves? 👀
          </p>
          <a
            href="https://www.instagram.com/laboratorio.3d/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105 text-lg shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
            }}
          >
            Seguir en Instagram
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
