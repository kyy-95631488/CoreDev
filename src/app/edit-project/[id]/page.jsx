'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { FolderPlus, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CustomDialog = ({ isOpen, onClose, title, message, isConfirm = false, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-blue-500/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-400">{title}</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </motion.button>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex gap-4">
              {isConfirm ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold"
                  >
                    {confirmText}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(75, 85, 99, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold"
                  >
                    {cancelText}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold"
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

export default function EditProject() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamMembers: [],
    thumbnail: null,
    thumbnailUrl: '',
    frameworks: [],
    previewLink: '',
    githubLink: '',
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    isConfirm: false,
    onConfirm: null,
  });
  const router = useRouter();
  const { id } = useParams();

  const frameworkOptions = [
    'Java NetBeans',
    'Java Android',
    'Kotlin',
    'React',
    'Next.js',
    'Supabase',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Node.js',
    'Express.js',
    'Django',
    'Flask',
    'Spring Boot',
    'Ruby on Rails',
    'Laravel',
    'Angular',
    'Vue.js',
    'Svelte',
    'Firebase',
    'AWS',
    'GraphQL',
    'Docker',
    'Kubernetes',
  ];

  // Check session and fetch project data
  useEffect(() => {
    const checkSessionAndFetchProject = async () => {
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
            // Fetch project data
            const projectResponse = await fetch(`https://hendriansyah.xyz/v1/auth/get-project/?session_token=${encodeURIComponent(sessionToken)}&project_id=${id}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            const projectData = await projectResponse.json();
            if (projectResponse.ok) {
              setFormData({
                name: projectData.project.name || '',
                description: projectData.project.description || '',
                startDate: projectData.project.start_date || '',
                endDate: projectData.project.end_date || '',
                teamMembers: projectData.project.team_members || [],
                thumbnail: null,
                thumbnailUrl: projectData.project.thumbnail_path || '',
                frameworks: projectData.project.frameworks || [],
                previewLink: projectData.project.preview_link || '',
                githubLink: projectData.project.github_link || '',
              });
              setThumbnailPreview(projectData.project.thumbnail_path || null);
            } else {
              setDialogState({
                isOpen: true,
                title: 'Error',
                message: `Failed to fetch project: ${projectData.error}`,
                isConfirm: false,
              });
              router.push('/list-project');
            }
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('session_token');
            router.push('/login');
          }
        } catch (err) {
          console.error('Session or project fetch failed:', err);
          setIsLoggedIn(false);
          localStorage.removeItem('session_token');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };
    checkSessionAndFetchProject();
  }, [router, id]);

  // Fetch users for team member selection
  useEffect(() => {
    if (userRole === 'anggota' || userRole === 'dosen') {
      const fetchUsers = async () => {
        try {
          const response = await fetch('https://hendriansyah.xyz/v1/auth/get-users/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(data.users.filter(user => user.role === 'anggota'));
          } else {
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to fetch users: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error fetching users:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error fetching users',
            isConfirm: false,
          });
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'frameworks') {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setFormData((prev) => ({ ...prev, frameworks: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: 'Please upload a valid image file',
          isConfirm: false,
        });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailUrl: '',
      }));
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setFormData((prev) => ({ ...prev, thumbnail: null, thumbnailUrl: '' }));
      setThumbnailPreview(null);
    }
  };

  // Handle team member selection
  const handleTeamMemberChange = (email) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(email)
        ? prev.teamMembers.filter((member) => member !== email)
        : [...prev.teamMembers, email],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const sessionToken = localStorage.getItem('session_token');
    const submissionData = new FormData();
    submissionData.append('project_id', id);
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('startDate', formData.startDate);
    submissionData.append('endDate', formData.endDate);
    submissionData.append('teamMembers', JSON.stringify(formData.teamMembers));
    submissionData.append('frameworks', JSON.stringify(formData.frameworks));
    submissionData.append('previewLink', formData.previewLink);
    submissionData.append('githubLink', formData.githubLink);
    submissionData.append('session_token', sessionToken);
    if (formData.thumbnail) {
      submissionData.append('thumbnail', formData.thumbnail);
    } else {
      submissionData.append('thumbnail_path', formData.thumbnailUrl);
    }

    try {
      const response = await fetch('https://hendriansyah.xyz/v1/auth/update-project/', {
        method: 'PUT',
        body: submissionData,
      });
      const data = await response.json();
      if (response.ok) {
        setDialogState({
          isOpen: true,
          title: 'Success',
          message: 'Project updated successfully',
          isConfirm: false,
        });
        setTimeout(() => router.push('/list-project'), 1500);
      } else {
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: `Failed to update project: ${data.error}`,
          isConfirm: false,
        });
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Error updating project',
        isConfirm: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 transition-colors duration-500 flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
      </div>

      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pt-24 sm:pt-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl z-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center">
            Edit Project
          </h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Card 1: Project Details */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project description"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Card 2: Project Dates */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Project Dates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Project Links */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Project Links</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="previewLink" className="block text-sm font-medium text-gray-300 mb-2">
                    Preview Link
                  </label>
                  <input
                    type="url"
                    id="previewLink"
                    name="previewLink"
                    value={formData.previewLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter preview link (e.g., https://project-demo.com)"
                  />
                </div>
                <div>
                  <label htmlFor="githubLink" className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Link
                  </label>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter GitHub link (e.g., https://github.com/username/repo)"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Frameworks & Technologies */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Frameworks & Technologies</h2>
              <div>
                <label htmlFor="frameworks" className="block text-sm font-medium text-gray-300 mb-2">
                  Select Frameworks
                </label>
                <select
                  id="frameworks"
                  name="frameworks"
                  multiple
                  value={formData.frameworks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48"
                >
                  {frameworkOptions.map((framework) => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple frameworks
                </p>
                {formData.frameworks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.frameworks.map((framework) => (
                      <span
                        key={framework}
                        className="px-2 py-1 bg-blue-600/50 text-white text-sm rounded-full"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card 5: Thumbnail */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Project Thumbnail</h2>
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Thumbnail
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {thumbnailPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <p className="text-sm text-gray-300 mb-2">Thumbnail Preview:</p>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Card 6: Team Members */}
            <div className="bg-gray-800/80 rounded-lg p-6 border border-blue-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Team Members</h2>
              <div className="max-h-48 overflow-y-auto bg-gray-700/50 rounded-lg border border-blue-500/20 p-4">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-2 py-2"
                    >
                      <input
                        type="checkbox"
                        id={`member-${user.email}`}
                        checked={formData.teamMembers.includes(user.email)}
                        onChange={() => handleTeamMemberChange(user.email)}
                        className="h-5 w-5 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`member-${user.email}`} className="text-gray-300">
                        {user.email}
                      </label>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400">No team members available</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FolderPlus size={20} />
              {isLoading ? 'Updating...' : 'Update Project'}
            </motion.button>
          </motion.form>
        </motion.div>

        <CustomDialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          title={dialogState.title}
          message={dialogState.message}
          isConfirm={dialogState.isConfirm}
          onConfirm={dialogState.onConfirm}
        />
      </main>

      <Footer />
    </div>
  );
}