import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Om <span className="text-blue-500">Mig</span>
        </h2>
        
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Jag är en passionerad frontend-utvecklare som bara är utexaminerad från en tvåårig frontend-utbildning. Min resa inom webbutveckling har drivits av en vilja att skapa intuitiva, tillgängliga och visuellt tilltalande digitala upplevelser.
          </p>
          
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Under min utbildning har jag fått omfattande kunskap om moderna webbtekniker och ramverk, med särskilt fokus på React och komponentbaserad utveckling. Jag har arbetat med flera projekt som hjälpt mig att utveckla starka problemlösningsfärdigheter och noggrannhet i detaljer.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300">
            På min fritid har jag utvecklat en djup förståelse för hur lokala LLM:er fungerar och har utforskat AI-utveckling. Jag är fascinerad av samspelet mellan frontend-utveckling och AI, och ser fram emot möjligheter där jag kan kombinera dessa färdigheter för att skapa innovativa lösningar.
          </p>
        </div>
      </div>
    </section>
  );
};


export default About;