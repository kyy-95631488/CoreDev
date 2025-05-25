'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Github, Linkedin, Instagram, Globe, Phone } from 'lucide-react';
import parse from 'html-react-parser';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  description: string;
  short_story: string;
  photo_url: string;
  skills: string[];
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  whatsapp: string | null;
  portfolio_link: string | null;
}

const formatRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    android_developer: 'Android Developer',
    frontend: 'Frontend Developer',
    backend: 'Backend Developer',
    uiux: 'UI/UX Designer',
    qa: 'QA Tester',
    fullstack: 'Full Stack Developer',
    devops: 'DevOps Engineer',
  };
  return roleMap[role] || role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTextWithSymbols = (text: string): string => {

  const formattedText = text
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😔')
    .replace(/<3/g, '❤️')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, ' ')
    .replace(/\[paragraph\]/g, ' ');

  return `<p>${formattedText}</p>`;
};

export default function TeamMemberDetail() {
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const memberId = params.id;

  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!memberId || isNaN(Number(memberId))) {
        setError('Invalid team member ID');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-team/?id=${memberId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.team_member) {
          setTeamMember(data.team_member);
        } else {
          setError('Team member not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching team member:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team member details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMember();
  }, [memberId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (error || !teamMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
        <div className="text-center p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-indigo-500/20">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">{error || 'Team member not found'}</h2>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-indigo-500/50 transition-shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </motion.a>
        </div>
      </div>
    );
  }

  const aboutContent = formatTextWithSymbols(teamMember.description);
  const storyContent = formatTextWithSymbols(teamMember.short_story);

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 md:w-96 h-64 md:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '5%', left: '5%' }}></div>
        <div className="absolute w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '10%', right: '10%' }}></div>
      </div>

      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-32 lg:pt-36 max-w-6xl mx-auto relative z-10 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500"
        >
          {teamMember.name}&apos;s Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Profile Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/30 transition-shadow"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Profile</h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Image
                src={teamMember.photo_url || '/default-member.jpg'}
                alt={teamMember.name}
                width={224}
                height={224}
                className="rounded-xl w-full max-w-[200px] sm:max-w-[250px] mx-auto object-cover border border-indigo-500/30"
              />
            </motion.div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-white">{teamMember.name}</h3>
              <p className="text-sm text-gray-400">{formatRole(teamMember.role)}</p>
            </div>
          </motion.div>

          {/* Card 2: About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/30 transition-shadow"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">About</h2>
            <div className="overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800">
              <div className="text-sm text-gray-300 leading-relaxed">
                {parse(aboutContent)}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/30 transition-shadow"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {teamMember.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.1, backgroundColor: '#4f46e5' }}
                  className="px-3 py-1 bg-indigo-600/50 text-indigo-200 rounded-full text-sm font-medium transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/30 transition-shadow md:col-span-2 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Story</h2>
            <div className="overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800">
              <div className="text-sm text-gray-300 leading-relaxed">
                {parse(storyContent)}
              </div>
            </div>
          </motion.div>

          {/* Card 5: Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/30 transition-shadow md:col-span-2 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Connect</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              {teamMember.linkedin && (
                <motion.a
                  href={teamMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-gray-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </motion.a>
              )}
              {teamMember.github && (
                <motion.a
                  href={teamMember.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-gray-300 transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={24} />
                </motion.a>
              )}
              {teamMember.instagram && (
                <motion.a
                  href={teamMember.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-gray-300 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </motion.a>
              )}
              {teamMember.whatsapp && (
                <motion.a
                  href={`https://wa.me/${teamMember.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-gray-300 transition-colors"
                  aria-label="WhatsApp"
                >
                  <Phone size={24} />
                </motion.a>
              )}
              {teamMember.portfolio_link && (
                <motion.a
                  href={teamMember.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-gray-300 transition-colors"
                  aria-label="Portfolio"
                >
                  <Globe size={24} />
                </motion.a>
              )}
            </div>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/50 transition-shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </motion.a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}