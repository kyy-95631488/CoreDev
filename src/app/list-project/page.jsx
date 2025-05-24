'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Edit2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', isConfirm = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gray-800 rounded-xl p-5 w-full max-w-[95vw] sm:max-w-md border border-blue-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-400">{title}</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 p-2"
                aria-label="Close dialog"
              >
                <X size={20} />
              </motion.button>
            </div>
            <p className="text-gray-300 text-sm sm:text-base mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isConfirm ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm shadow-sm"
                  >
                    {confirmText}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm shadow-sm"
                  >
                    {cancelText}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm shadow-sm"
                >
                  OK
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ListProject() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false,
  });
  const router = useRouter();

  // Check session token and fetch role
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        try {
          const response = await fetch('https://hendriansyah.xyz/v1/auth/verify-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken }),
          });
          const data = await response.json();
          if (response.ok && data.valid) {
            setIsLoggedIn(true);
            setUserRole(data.role);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('session_token');
            router.push('/login');
          }
        } catch (err) {
          console.error('Session check failed:', err);
          setIsLoggedIn(false);
          localStorage.removeItem('session_token');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  // Fetch projects
  useEffect(() => {
    if (userRole === 'anggota' || userRole === 'dosen') {
      const fetchProjects = async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            throw new Error('No session token found');
          }
          const response = await fetch(`https://hendriansyah.xyz/v1/auth/get-projects/?session_token=${encodeURIComponent(sessionToken)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (response.ok) {
            setProjects(data.projects);
          } else {
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to fetch projects: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error fetching projects:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error fetching projects',
            isConfirm: false,
          });
        }
      };
      fetchProjects();
    }
  }, [userRole]);

  // Handle delete project
  const handleDeleteProject = (projectId) => {
    setDialogState({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this project?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          const response = await fetch('https://hendriansyah.xyz/v1/auth/delete-project/', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken, project_id: projectId }),
          });
          const data = await response.json();
          if (response.ok) {
            setProjects(projects.filter((project) => project.id !== projectId));
            setDialogState({
              isOpen: true,
              title: 'Success',
              message: 'Project deleted successfully',
              isConfirm: false,
            });
          } else {
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to delete project: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error deleting project:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error deleting project',
            isConfirm: false,
          });
        }
      },
    });
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!isLoggedIn || !['anggota', 'dosen'].includes(userRole)) {
    return null;
  }

  return (
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-40 h-40 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ top: '5%', left: '5%' }}
        ></div>
        <div
          className="absolute w-40 h-40 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ bottom: '10%', right: '5%' }}
        ></div>
      </div>

      <Navbar />

      <main className="flex-grow p-4 sm:p-6 pt-24 sm:pt-28 md:pt-32 max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          Project List
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-400">All Projects</h2>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-100 border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm placeholder-gray-400"
            aria-label="Search projects"
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-800/80 rounded-lg border border-blue-500/30 p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-100">{project.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{project.description || 'No description'}</p>
                <div className="mt-3 text-xs sm:text-sm text-gray-300">
                  <p><span className="font-medium">Start:</span> {project.start_date}</p>
                  <p><span className="font-medium">End:</span> {project.end_date}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.push(`/edit-project/${project.id}`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-500"
                    aria-label={`Edit project ${project.name}`}
                  >
                    <Edit2 size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-red-500"
                    aria-label={`Delete project ${project.name}`}
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-400 text-sm p-6 bg-gray-800/80 rounded-lg border border-blue-500/30">
              No projects found
            </div>
          )}
        </motion.section>

        <CustomDialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          title={dialogState.title}
          message={dialogState.message}
          onConfirm={dialogState.onConfirm}
          isConfirm={dialogState.isConfirm}
        />
      </main>

      <Footer />
    </div>
  );
}