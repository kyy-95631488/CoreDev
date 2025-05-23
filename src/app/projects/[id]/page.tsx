'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Link2, ChevronLeft, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

// Define the Project interface
interface Project {
  id: number;
  name: string;
  description: string;
  thumbnail_path: string;
  start_date: string;
  end_date: string | null;
  frameworks: string[];
  preview_link: string | null;
  github_link: string | null;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost/v1/auth/get-project-by-id/?id=${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.project) {
          setProject(data.project);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'Ongoing';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen font-futura transition-colors duration-500 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="text-gray-100 relative overflow-hidden">
        {/* Animated background particles with low z-index */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
        </div>

        {/* Navbar with high z-index */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Main Content with top padding to avoid navbar overlap */}
        <section className="py-24 sm:py-28 max-w-5xl mx-auto px-4 relative z-10">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-300"
            >
              Loading project...
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400"
            >
              {error}
            </motion.div>
          ) : project ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Back Button */}
              <motion.div
                whileHover={{ x: -5 }}
                className="mb-6"
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back to Home
                </Link>
              </motion.div>

              {/* Project Header */}
              <div className="mb-8">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
                >
                  {project.name}
                </motion.h1>
              </div>

              {/* Project Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative mb-8 rounded-lg overflow-hidden border border-blue-500/20 shadow-lg"
              >
                <Image
                  src={project.thumbnail_path || '/default-project.jpg'}
                  alt={project.name}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
              </motion.div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="lg:col-span-2"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-4">Description</h2>
                  <p className="text-sm sm:text-base text-gray-300 mb-6">{project.description}</p>

                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-4">Technologies Used</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.frameworks.map((framework, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                      >
                        {framework}
                      </motion.span>
                    ))}
                  </div>

                  {(project.preview_link || project.github_link) && (
                    <div className="flex gap-4">
                      {project.preview_link && (
                        <motion.a
                          href={project.preview_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                        >
                          <Link2 size={20} />
                          Live Preview
                        </motion.a>
                      )}
                      {project.github_link && (
                        <motion.a
                          href={project.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
                        >
                          <Github size={20} />
                          GitHub
                        </motion.a>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="lg:col-span-1"
                >
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-blue-500/20">
                    <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <Calendar size={20} />
                      Project Timeline
                    </h2>
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-semibold">Start Date:</span> {formatDate(project.start_date)}
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      <span className="font-semibold">End Date:</span> {formatDate(project.end_date)}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </section>

        <Footer />
      </div>
    </div>
  );
}