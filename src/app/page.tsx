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
    machine_learning: 'Machine Learning',
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
  const fullText = "Welcome to CoreDev";
  const DESCRIPTION_LIMIT = 100;

  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/verify-session/`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-projects-show/`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-team-members/`, {
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
    }, 80);
    return () => clearInterval(typingInterval);
  }, []);

  const toggleReadMore = (projectId: number) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleLearnMoreClick = (memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Learn More clicked for team member ID: ${memberId}`);
    window.location.href = `/team-members/${memberId}`;
  };

  return (
    <div className="min-h-screen font-inter text-gray-100 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 transition-colors duration-500">
      <div className="relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '5%', left: '5%' }}
          ></motion.div>
          <motion.div
            className="absolute w-80 h-80 bg-white-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ bottom: '10%', right: '10%' }}
          ></motion.div>
        </div>

        <Navbar />

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center max-w-5xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white-500 to-purple-500 animate-gradient">
              {typedText}
              <span className="animate-pulse text-cyan-400">|</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto"
            >
              Crafting cutting-edge digital experiences with passion and precision
            </motion.p>
            <div className="flex justify-center gap-4 sm:gap-6">
              <motion.a
                href="#projects"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                className={`inline-block bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer z-10 pointer-events-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Discover Our Work"
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Discover Our Work
              </motion.a>
              {isLoggedIn ? (
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer z-10 pointer-events-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Go to Dashboard"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </motion.a>
              ) : (
                <motion.a
                  href="/login"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer z-10 pointer-events-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Join Us"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  <LogIn size={18} />
                  Join Us
                </motion.a>
              )}
            </div>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-16 sm:py-24 bg-gray-900/40 backdrop-blur-lg relative overflow-hidden z-10">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
              animate={{ x: [-50, 50], y: [-50, 50], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '10%', left: '20%' }}
            ></motion.div>
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"
              animate={{ x: [50, -50], y: [50, -50], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{ bottom: '10%', right: '20%' }}
            ></motion.div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            Our Mission
          </motion.h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-200 text-center mb-12 max-w-3xl mx-auto"
            >
              We are driven to innovate, collaborate, and create digital solutions that empower businesses and transform lives.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: 'Innovation',
                  description: 'Pushing the boundaries of technology with creative and forward-thinking solutions.',
                  icon: '🚀',
                },
                {
                  title: 'Collaboration',
                  description: 'Building strong partnerships to deliver impactful and cohesive results.',
                  icon: '🤝',
                },
                {
                  title: 'Excellence',
                  description: 'Striving for perfection in every project, ensuring quality and precision.',
                  icon: '🏆',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0, 255, 255, 0.2)' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="text-4xl mb-4 text-center">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 text-center mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 text-center">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 sm:py-24 bg-gray-900/50 backdrop-blur-lg relative overflow-hidden z-10">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '15%', left: '15%' }}
            ></motion.div>
            <motion.div
              className="absolute w-80 h-80 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              style={{ bottom: '15%', right: '15%' }}
            ></motion.div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            Our Services
          </motion.h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-200 text-center mb-12 max-w-3xl mx-auto"
            >
              From cutting-edge web development to innovative AI solutions, we provide a wide range of services to bring your vision to life.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: 'Web Development',
                  description: 'Building responsive, high-performance websites with modern frameworks and technologies.',
                  icon: '💻',
                },
                {
                  title: 'Mobile Apps',
                  description: 'Creating seamless and intuitive mobile applications for iOS and Android platforms.',
                  icon: '📱',
                },
                {
                  title: 'AI Solutions',
                  description: 'Leveraging machine learning and AI to deliver intelligent, data-driven solutions.',
                  icon: '🤖',
                },
                {
                  title: 'UI/UX Design',
                  description: 'Designing user-friendly interfaces with stunning visuals and smooth interactions.',
                  icon: '🎨',
                },
                {
                  title: 'Cloud Solutions',
                  description: 'Providing scalable and secure cloud infrastructure for seamless operations.',
                  icon: '☁️',
                },
                {
                  title: 'Cybersecurity',
                  description: 'Ensuring robust protection with advanced security measures and threat detection.',
                  icon: '🔒',
                },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0, 255, 255, 0.2)' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="text-4xl mb-4 text-center">{service.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 text-center mb-3">{service.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 text-center">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            Meet Our Team
          </motion.h2>
          {isLoading ? (
            <div className="text-center text-gray-300 animate-pulse">Loading team members...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {teamMembers.length === 0 ? (
                <div className="text-center text-gray-300 col-span-full">No team members available.</div>
              ) : (
                teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative bg-gray-800/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <motion.div
                      className="relative mb-5"
                    >
                      <Image
                        src={member.photo_url || '/default-member.jpg'}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="rounded-full w-32 h-32 sm:w-48 sm:h-48 mx-auto object-cover border-4 border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors duration-300"
                      />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 text-center">{member.name}</h3>
                    <p className="text-sm sm:text-base text-gray-300 text-center mb-4">{formatRole(member.role)}</p>
                    <div className="flex justify-center gap-4 mb-5">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 cursor-pointer pointer-events-auto z-10"
                          aria-label={`LinkedIn profile for ${member.name}`}
                        >
                          <Linkedin size={22} />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 cursor-pointer pointer-events-auto z-10"
                          aria-label={`GitHub profile for ${member.name}`}
                        >
                          <Github size={22} />
                        </a>
                      )}
                    </div>
                    <motion.button
                      onClick={(e) => handleLearnMoreClick(member.id, e)}
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                      className={`block text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer z-10 pointer-events-auto w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={`View details for ${member.name}`}
                      disabled={isLoading}
                    >
                      Detail
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16 sm:py-24 bg-gray-900/30 backdrop-blur-lg z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            Our Projects
          </motion.h2>
          {isLoading ? (
            <div className="text-center text-gray-300 animate-pulse">Loading projects...</div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.length === 0 ? (
                <div className="text-center text-gray-300 col-span-full">No projects available.</div>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative bg-gray-800/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-cyan-500/20 hover:shadow-2xl transition-all duration-300 z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative w-full aspect-w-16 aspect-h-9 overflow-hidden">
                      <img
                        src={project.thumbnail_path || '/default-project.jpg'}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 sm:p-6 relative">
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-cyan-400">{project.name}</h3>
                      <p className="text-sm sm:text-base text-gray-300 mb-4">
                        {expandedProjects.includes(project.id)
                          ? project.description
                          : project.description.length > DESCRIPTION_LIMIT
                          ? `${project.description.slice(0, DESCRIPTION_LIMIT)}...`
                          : project.description}
                        {project.description.length > DESCRIPTION_LIMIT && (
                          <button
                            onClick={() => toggleReadMore(project.id)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 text-sm ml-2 cursor-pointer pointer-events-auto z-10"
                            aria-label={expandedProjects.includes(project.id) ? `Collapse description for ${project.name}` : `Expand description for ${project.name}`}
                          >
                            {expandedProjects.includes(project.id) ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </p>
                      <a
                        href={`/projects/${project.id}`}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 text-sm sm:text-base relative group cursor-pointer pointer-events-auto z-10"
                        aria-label={`View project ${project.name}`}
                      >
                        View Project
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            Get in Touch
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-6 sm:gap-10"
          >
            {[
              { href: '$', icon: <Github size={30} />, label: 'GitHub' },
              { href: '#', icon: <Linkedin size={30} />, label: 'LinkedIn' },
              { href: 'mailto:coredev.c@gmail.com', icon: <Mail size={30} />, label: 'Email' },
            ].map(({ href, icon, label }, index) => (
              <motion.a
                key={index}
                href={href}
                target={href.startsWith('http') ? '_blank' : '_self'}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.15, color: '#22d3ee' }}
                whileTap={{ scale: 0.95 }}
                className="relative text-gray-300 transition-colors duration-200 cursor-pointer z-10 pointer-events-auto"
                aria-label={`Contact us via ${label}`}
              >
                {icon}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">{label}</span>
              </motion.a>
            ))}
          </motion.div>
          <Footer />
        </section>
      </div>
    </div>
  );
}