'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserPlus, X, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import parse from 'html-react-parser';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const formatTextWithSymbols = (text) => {
  let formattedText = text
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😔')
    .replace(/<3/g, '❤️')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
    .replace(/\[paragraph\]/g, '</p><p>');

  if (!formattedText.startsWith('<p>')) {
    formattedText = `<p>${formattedText}</p>`;
  }

  return formattedText;
};

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

export default function AddTeamMember() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'android_developer',
    description: '',
    shortStory: '',
    linkedin: '',
    github: '',
    instagram: '',
    whatsapp: '',
    portfolioLink: '',
    photo: null,
    skills: [],
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  const availableSkills = [
    'JavaScript',
    'Next.js',
    'Laravel',
    'PHP',
    'Django',
    'Golang',
    'OOP',
    'MVP',
    'TensorFlow Lite',
    'Supabase',
    'Google Cloud',
    'Firebase',
    'Tailwind',
    'Kotlin',
    'Java Android',
    'Java Desktop',
    'Flutter',
    'Jetpack Compose',
    'React',
    'Node.js',
    'Python',
    'CSS',
    'HTML',
    'TypeScript',
    'SQL',
    'GraphQL',
    'UI/UX Design',
    'DevOps',
    'AWS',
    'Docker',
    'Testing',
  ];

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.shortStory.trim()) newErrors.shortStory = 'Short story is required';
    if (formData.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedin)) {
      newErrors.linkedin = 'Invalid LinkedIn URL';
    }
    if (formData.github && !/^https?:\/\/(www\.)?github\.com\/.*$/.test(formData.github)) {
      newErrors.github = 'Invalid GitHub URL';
    }
    if (formData.instagram && !/^https?:\/\/(www\.)?instagram\.com\/.*$/.test(formData.instagram)) {
      newErrors.instagram = 'Invalid Instagram URL';
    }
    if (formData.whatsapp && !/^\+?\d{10,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Invalid WhatsApp number';
    }
    if (formData.portfolioLink && !/^https?:\/\/.*$/.test(formData.portfolioLink)) {
      newErrors.portfolioLink = 'Invalid portfolio URL';
    }
    if (!formData.photo) newErrors.photo = 'Photo is required';
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, photo: 'Only JPEG, PNG, or GIF files are allowed' }));
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: 'Please upload a valid image file (JPEG, PNG, or GIF)',
          isConfirm: false,
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'File size must be less than 5MB' }));
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: 'File size must be less than 5MB',
          isConfirm: false,
        });
        return;
      }

      setFormData((prev) => ({ ...prev, photo: file }));
      setPreviewImage(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, photo: '' }));
    } else {
      setFormData((prev) => ({ ...prev, photo: null }));
      setPreviewImage(null);
    }
  };

  const handleSkillsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, skills: selectedOptions }));
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: '' }));
    }
  };

  const uploadPhoto = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('team-member-photos')
        .upload(`public/${fileName}`, file);

      if (error) {
        throw new Error(error.message);
      }

      const { data: urlData } = supabase.storage
        .from('team-member-photos')
        .getPublicUrl(`public/${fileName}`);

      if (!urlData.publicUrl) {
        throw new Error('Failed to retrieve public URL');
      }

      return urlData.publicUrl;
    } catch (err) {
      throw new Error('Failed to upload photo to Supabase: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        throw new Error('No session token found');
      }

      let photoUrl = '';
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo);
      }

      const formDataToSend = new FormData();
      formDataToSend.append('session_token', sessionToken);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('shortStory', formData.shortStory);
      formDataToSend.append('linkedin', formData.linkedin);
      formDataToSend.append('github', formData.github);
      formDataToSend.append('instagram', formData.instagram);
      formDataToSend.append('whatsapp', formData.whatsapp);
      formDataToSend.append('portfolioLink', formData.portfolioLink);
      formDataToSend.append('photo', photoUrl);
      formDataToSend.append('skills', JSON.stringify(formData.skills));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/add-team-member/`, {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        setDialogState({
          isOpen: true,
          title: 'Success',
          message: 'Team member added successfully',
          isConfirm: false,
          onConfirm: null,
        });
        setFormData({
          name: '',
          email: '',
          role: 'android_developer',
          description: '',
          shortStory: '',
          linkedin: '',
          github: '',
          instagram: '',
          whatsapp: '',
          portfolioLink: '',
          photo: null,
          skills: [],
        });
        setPreviewImage(null);
        setErrors({});
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: `Failed to add team member: ${data.error || 'Unknown error'}`,
          isConfirm: false,
          onConfirm: null,
        });
      }
    } catch (err) {
      console.error('Error adding team member:', err);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Error adding team member. Please try again.',
        isConfirm: false,
        onConfirm: null,
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
      </div>

      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-32 lg:pt-36 max-w-5xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center"
        >
          Add New Team Member
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" encType="multipart/form-data">
          {/* Card 1: Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md"
          >
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Profile Photo</h2>
            <div className="space-y-4">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Profile Photo"
              />
              {previewImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <img
                    src={previewImage}
                    alt="Photo preview"
                    className="w-full max-w-[300px] rounded-lg border border-blue-500/20"
                    style={{ objectFit: 'contain' }}
                  />
                </motion.div>
              )}
              {errors.photo && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {errors.photo}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Card 2: Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md"
          >
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter name"
                  aria-label="Name"
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.name}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter email"
                  aria-label="Email"
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.email}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  aria-label="Select team member role"
                >
                  <option value="android_developer">Android Developer</option>
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="machine_learning">Machine Learning</option>
                  <option value="uiux">UI/UX Designer</option>
                  <option value="qa">QA Tester</option>
                  <option value="fullstack">Full Stack Developer</option>
                  <option value="devops">DevOps Engineer</option>
                </select>
                {errors.role && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.role}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md"
          >
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Skills</h2>
            <div className="space-y-4">
              <select
                id="skills"
                name="skills"
                multiple
                value={formData.skills}
                onChange={handleSkillsChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Select skills"
                size="5"
              >
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
              {errors.skills && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {errors.skills}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Card 4: Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md md:col-span-2 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Bio</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter a brief description (e.g., I love coding! :) Use **bold** for emphasis, [paragraph] for new paragraphs)"
                  aria-label="Description"
                  rows="4"
                />
                {formData.description && (
                  <div className="mt-2 p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400">Preview:</p>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {parse(formatTextWithSymbols(formData.description))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Formatting: Gunakan <code>[paragraph]</code> untuk paragraf baru, <code>**text**</code> untuk teks tebal, <code>*text*</code> untuk miring, <code>:)</code> untuk 😊, <code>:(</code> untuk 😔, dan <code>&lt;3</code> untuk ❤️
                </p>

                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.description}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="shortStory" className="block text-sm font-medium text-gray-300 mb-1">
                  Short Story
                </label>
                <textarea
                  id="shortStory"
                  name="shortStory"
                  value={formData.shortStory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter a short story or bio (e.g., My journey began with **passion**! <3 Use [paragraph] for new paragraphs)"
                  aria-label="Short Story"
                  rows="4"
                />
                {formData.shortStory && (
                  <div className="mt-2 p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400">Preview:</p>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {parse(formatTextWithSymbols(formData.shortStory))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Formatting: Use <code>[paragraph]</code> for new paragraphs, <code>**text**</code> for bold, <code>*text*</code> for italic, <code>:)</code> for 😊, <code>:(</code> for 😔, <code>&lt;3</code> for ❤️
                </p>

                {errors.shortStory && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.shortStory}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 5: Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md md:col-span-2 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Social Links</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-1">
                  LinkedIn URL (optional)
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter LinkedIn URL"
                  aria-label="LinkedIn URL"
                />
                {errors.linkedin && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.linkedin}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-1">
                  GitHub URL (optional)
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter GitHub URL"
                  aria-label="GitHub URL"
                />
                {errors.github && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.github}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-1">
                  Instagram URL (optional)
                </label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter Instagram URL"
                  aria-label="Instagram URL"
                />
                {errors.instagram && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.instagram}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">
                  WhatsApp Number (optional)
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter WhatsApp number (e.g., +1234567890)"
                  aria-label="WhatsApp Number"
                />
                {errors.whatsapp && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.whatsapp}
                  </motion.p>
                )}
              </div>
              <div>
                <label htmlFor="portfolioLink" className="block text-sm font-medium text-gray-300 mb-1">
                  Personal Portfolio URL (optional)
                </label>
                <input
                  type="url"
                  id="portfolioLink"
                  name="portfolioLink"
                  value={formData.portfolioLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter personal portfolio URL"
                  aria-label="Personal Portfolio URL"
                />
                {errors.portfolioLink && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {errors.portfolioLink}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md md:col-span-2 lg:col-span-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus size={18} />
              {isSubmitting ? 'Adding...' : 'Add Team Member'}
            </motion.button>
          </motion.div>
        </form>

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