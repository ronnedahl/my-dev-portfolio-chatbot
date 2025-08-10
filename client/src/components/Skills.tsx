import React, { useEffect, useRef } from 'react';
import { SkillType } from '../types/types';

interface SkillCardProps {
  title: string;
  description: string;
}

const SkillCard: React.FC<SkillCardProps> = ({ title, description }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-t-4 border-blue-500 transition-all duration-500 ease-out opacity-0 translate-y-5 hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const Skills: React.FC = () => {
  const skillsData: SkillType[] = [
    {
      title: "UX/UI",
      description:
        "Gedigen kunskap inom UX/UI och designprinciper, med fokus på att skapa estetiskt tilltalande och användarvänliga digitala lösningar för olika plattformar.",
    },
    {
      title: "HTML & CSS och Tailwind",
      description:
        "Erfarenhet av att bygga responsiva och professionella webbplatser med HTML och CSS, anpassade för olika enheter och användarbehov.",
    },
    {
      title: "JavaScript",
      description:
        "Erfarenhet av att skapa dynamiska och interaktiva webbplatser med JavaScript, inklusive API-integrationer och användarvänliga funktioner.",
    },
    {
      title: "Agilt Arbete",
      description:
        "Van att arbeta i en agil miljö med Scrum-metodiken och GitHub för att samarbeta effektivt och leverera värdeskapande lösningar i team och projekt.",
    },
    {
      title: "Frontend Ramverk",
      description:
        "Djupgående kunskap i React och komponentbaserad utveckling för att bygga moderna webbapplikationer med hög prestanda och utmärkt användarupplevelse.",
    },
    {
      title: "Backend med Node.js",
      description:
        "Erfarenhet av att bygga robusta backend-lösningar med Node.js och att effektivt hantera API:er och databaser.",
    },
    {
      title: "Molnbaserad Utveckling",
      description:
        "Erfarenhet av driftsättning och utveckling i molnmiljöer med fokus på AWS Serverless-tjänster för säker, skalbar och effektiv hantering.",
    },
    {
      title: "UX/UI Fördjupning",
      description:
        "Avancerade färdigheter i Reacts Framer Motion, CSS och animeringar för att skapa dynamiska och engagerande användargränssnitt.",
    },
    {
      title: "Fullstack med TypeScript",
      description:
        "Erfarenhet av att utveckla fullstack-applikationer med TypeScript för att skapa robusta, typade och skalbara lösningar där frontend och backend samverkar.",
    },
    
  ];

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Mina <span className="text-blue-500">Kompetenser</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsData.map((skill, index) => (
            <SkillCard
              key={index}
              title={skill.title}
              description={skill.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;