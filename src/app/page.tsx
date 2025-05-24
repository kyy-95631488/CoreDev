/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Linkedin, Mail, LogIn, LayoutDashboard } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

interface Project {
  id: number;
  name: string;
  description: string;
  thumbnail_path: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  photo_url: string;
  linkedin: string | null;
  github: string | null;
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

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);
  const fullText = "Welcome to Our CoreDev";
  const DESCRIPTION_LIMIT = 100;

  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        setIsLoading(true);
        try {
          const response = await fetch('https://hendriansyah.xyz/v1/auth/verify-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken }),
          });

          const data = await response.json();
          if (response.ok && data.valid) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('session_token');
          }
        } catch (err) {
          console.error('Session check failed:', err);
          setIsLoggedIn(false);
          localStorage.removeItem('session_token');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://hendriansyah.xyz/v1/auth/get-projects-show/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects((data.projects || []) as Project[]);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://hendriansyah.xyz/v1/auth/get-team-members/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTeamMembers((data.team_members || []) as TeamMember[]);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, []);

  const toggleReadMore = (projectId: number) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="min-h-screen font-futura transition-colors duration-500 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="text-gray-100 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
        </div>

        <Navbar />

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center pt-16 px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {typedText}
              <span className="animate-pulse">|</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-300"
            >
              A dynamic team crafting innovative web solutions together
            </motion.p>
            <div className="flex justify-center gap-4">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-base sm:text-lg shadow-lg"
              >
                Explore Our Work
              </motion.a>
              {isLoggedIn ? (
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: isLoading ? 1 : 1.1, boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-base sm:text-lg shadow-lg"
                >
                  <LayoutDashboard size={20} className="inline" />
                  Dashboard
                </motion.a>
              ) : (
                <motion.a
                  href="/login"
                  whileHover={{ scale: isLoading ? 1 : 1.1, boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-500 hover:to-blue-500 transition-all duration-300 text-base sm:text-lg shadow-lg"
                >
                  <LogIn size={20} className="inline" />
                  Join Us
                </motion.a>
              )}
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 sm:py-20 max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            About Our Team
          </motion.h2>
          {isLoading ? (
            <div className="text-center text-gray-300">Loading team members...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teamMembers.length === 0 ? (
                <div className="text-center text-gray-300 col-span-full">No team members available.</div>
              ) : (
                teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="flex flex-col items-center bg-gray-800/40 backdrop-blur-md rounded-lg p-6 border border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className="relative mb-4"
                    >
                      <Image
                        src={member.photo_url || '/default-member.jpg'}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="rounded-full w-40 h-40 sm:w-60 sm:h-60 object-cover border-4 border-blue-500/50"
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-spin-slow"></div>
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-semibold text-blue-400">{member.name}</h3>
                    <p className="text-base sm:text-lg text-gray-300 mb-4">{formatRole(member.role)}</p>
                    <div className="flex gap-4 mb-4">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                    <motion.a
                      href={`/team-members/${member.id}`}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm sm:text-base shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                    >
                      Detail
                    </motion.a>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16 sm:py-20 bg-gray-900/50 backdrop-blur-sm">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Our Projects
          </motion.h2>
          {isLoading ? (
            <div className="text-center text-gray-300">Loading projects...</div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.length === 0 ? (
                <div className="text-center text-gray-300 col-span-full">No projects available.</div>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="relative bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-blue-500/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative w-full aspect-w-16 aspect-h-9">
                      <img
                        src={project.thumbnail_path || '/default-project.jpg'}
                        alt={project.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-400">{project.name}</h3>
                      <p className="text-sm sm:text-base text-gray-300 mb-4">
                        {expandedProjects.includes(project.id)
                          ? project.description
                          : project.description.length > DESCRIPTION_LIMIT
                          ? `${project.description.slice(0, DESCRIPTION_LIMIT)}...`
                          : project.description}
                        {project.description.length > DESCRIPTION_LIMIT && (
                          <button
                            onClick={() => toggleReadMore(project.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors text-sm ml-2"
                          >
                            {expandedProjects.includes(project.id) ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </p>
                      <a
                        href={`/projects/${project.id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base relative group"
                      >
                        View Project
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 sm:py-20 max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Get in Touch
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-6 sm:gap-8"
          >
            {[
              { href: '#', icon: <Github size={28} />, label: 'GitHub' },
              { href: '#', icon: <Linkedin size={28} />, label: 'LinkedIn' },
              { href: 'mailto:#', icon: <Mail size={28} />, label: 'Email' },
            ].map(({ href, icon, label }, index) => (
              <motion.a
                key={index}
                href={href}
                target={href.startsWith('http') ? '_blank' : '_self'}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="relative text-gray-300 hover:text-blue-400 transition-colors"
              >
                {icon}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
              </motion.a>
            ))}
          </motion.div>
          <Footer />
        </section>
      </div>
    </div>
  );
}