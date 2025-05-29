'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Trash2, Linkedin, Github, Instagram, MessageCircle, Globe, Pencil } from 'lucide-react';
import parse from 'html-react-parser';
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-md border border-blue-500/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-400">{title}</h3>
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm"
                  >
                    {confirmText}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm"
                  >
                    {cancelText}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm"
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

export default function ListTeamMember() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false,
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const router = useRouter();
  const MAX_DESCRIPTION_LENGTH = 100;

  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/verify-session/`, {
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

  useEffect(() => {
    if (userRole === 'anggota' || userRole === 'dosen') {
      const fetchTeamMembers = async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            throw new Error('No session token found');
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-team-members-list/?session_token=${encodeURIComponent(sessionToken)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (response.ok) {
            setTeamMembers(data.team_members);
          } else {
            console.error('Failed to fetch team members:', data.error);
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to fetch team members: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error fetching team members:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error fetching team members',
            isConfirm: false,
          });
        }
      };
      fetchTeamMembers();
    }
  }, [userRole]);

  const formatRole = (role) => {
    const roleMap = {
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

  const handleDeleteMember = (email) => {
    setDialogState({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete team member ${email}?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/delete-team-member/`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken, email }),
          });
          const data = await response.json();
          if (response.ok) {
            setTeamMembers(teamMembers.filter((member) => member.email !== email));
            setDialogState({
              isOpen: true,
              title: 'Success',
              message: 'Team member deleted successfully',
              isConfirm: false,
            });
          } else {
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to delete team member: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error deleting team member:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error deleting team member',
            isConfirm: false,
          });
        }
      },
    });
  };

  const handleEditMember = (member) => {
    router.push(`/edit-team-member?email=${encodeURIComponent(member.email)}`);
  };

  const toggleDescription = (email) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
      </div>

      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-32 lg:pt-36 max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center"
        >
          Team Members
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-blue-400">Search Members</h2>
          <input
            type="text"
            placeholder="Search by name, email, role, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            aria-label="Search team members"
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => {
              const isExpanded = expandedDescriptions[member.email];
              const strippedDescription = member.description.replace(/<[^>]+>/g, '');
              const isLongDescription = strippedDescription.length > MAX_DESCRIPTION_LENGTH;
              const displayDescription = isExpanded || !isLongDescription
                ? member.description
                : member.description.slice(0, member.description.indexOf(' ', MAX_DESCRIPTION_LENGTH)) + '...';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photo_url}
                        alt={`${member.name}'s photo`}
                        className="w-12 h-12 rounded-full object-cover border border-blue-500/20"
                        onError={(e) => (e.target.src = '/placeholder.png')}
                      />
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-blue-400">{member.name}</h3>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditMember(member)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                        title="Edit Member"
                        aria-label={`Edit team member ${member.email}`}
                      >
                        <Pencil size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteMember(member.email)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete Member"
                        aria-label={`Delete team member ${member.email}`}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 mb-2 capitalize">{formatRole(member.role)}</p>
                  <div className="text-xs sm:text-sm text-gray-400 mb-4">
                    {parse(displayDescription)}
                    {isLongDescription && (
                      <button
                        onClick={() => toggleDescription(member.email)}
                        className="text-blue-400 hover:underline ml-2 text-xs"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        aria-label="LinkedIn profile"
                      >
                        <Linkedin size={14} />
                        LinkedIn
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        aria-label="GitHub profile"
                      >
                        <Github size={14} />
                        GitHub
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        aria-label="Instagram profile"
                      >
                        <Instagram size={14} />
                        Instagram
                      </a>
                    )}
                    {member.whatsapp && (
                      <a
                        href={`https://wa.me/${member.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        aria-label="WhatsApp contact"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    )}
                    {member.portfolio_link && (
                      <a
                        href={member.portfolio_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        aria-label="Portfolio website"
                      >
                        <Globe size={14} />
                        Portfolio
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-gray-400 text-sm p-4"
            >
              No team members found
            </motion.div>
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