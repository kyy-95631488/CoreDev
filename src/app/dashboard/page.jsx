'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, Users, UserPlus, FolderPlus, Trash2, Edit2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Custom Dialog Component with mobile-friendly adjustments
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

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
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

  // Fetch users for anggota or dosen roles
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
            setUsers(data.users);
          } else {
            console.error('Failed to fetch users:', data.error);
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

  // Fetch projects for chart
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
            console.error('Failed to fetch projects:', data.error);
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

  // Handle theme
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

  // Handle user deletion
  const handleDeleteUser = (email) => {
    setDialogState({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete user ${email}?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          const response = await fetch('https://hendriansyah.xyz/v1/auth/delete-user/', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken, email }),
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.filter((user) => user.email !== email));
            setDialogState({
              isOpen: true,
              title: 'Success',
              message: 'User deleted successfully',
              isConfirm: false,
            });
          } else {
            setDialogState({
              isOpen: true,
              title: 'Error',
              message: `Failed to delete user: ${data.error}`,
              isConfirm: false,
            });
          }
        } catch (err) {
          console.error('Error deleting user:', err);
          setDialogState({
            isOpen: true,
            title: 'Error',
            message: 'Error deleting user',
            isConfirm: false,
          });
        }
      },
    });
  };

  // Handle role editing
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleEditRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch('https://hendriansyah.xyz/v1/auth/update-role/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, email: selectedUser.email, role: newRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.email === selectedUser.email ? { ...user, role: newRole } : user
          )
        );
        setDialogState({
          isOpen: true,
          title: 'Success',
          message: 'Role updated successfully',
          isConfirm: false,
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setNewRole('');
      } else {
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: `Failed to update role: ${data.error}`,
          isConfirm: false,
        });
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Error updating role',
        isConfirm: false,
      });
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate number of team members with role 'anggota'
  const teamMembersCount = users.filter(user => user.role === 'anggota').length;

  // Process project data for chart
  const processProjectData = () => {
    const monthCounts = {};
    projects.forEach((project) => {
      const date = new Date(project.start_date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
    });

    // Generate last 12 months
    const labels = [];
    const data = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      labels.push(
        date.toLocaleString('default', { month: 'short', year: 'numeric' })
      );
      data.push(monthCounts[monthYear] || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Projects Added',
          data,
          fill: false,
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          tension: 0.1,
        },
      ],
    };
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

  if (!isLoggedIn) {
    return null; // Redirect handled by useEffect
  }

  if (userRole === 'user') {
    return (
      <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 pt-16 sm:pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center"
          >
            Welcome to CoreDev
          </motion.h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
      </div>

      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 md:pt-28 lg:pt-32 max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          Dashboard Overview
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm sm:text-base shadow-md w-full sm:w-auto"
            onClick={() => router.push('/add-member')}
          >
            <UserPlus size={18} />
            Add Member
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg font-semibold text-sm sm:text-base shadow-md w-full sm:w-auto"
            onClick={() => router.push('/add-project')}
          >
            <FolderPlus size={18} />
            Add Project
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {[
            { title: 'Active Projects', value: projects.length, icon: <FileText size={18} />, color: 'from-blue-600 to-blue-400' },
            { title: 'Team Members', value: teamMembersCount, icon: <Users size={18} />, color: 'from-purple-600 to-purple-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`p-4 sm:p-6 rounded-lg bg-gray-800/80 border border-blue-500/20 bg-gradient-to-r ${stat.color} shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-300">{stat.title}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="text-white/80">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-4 text-blue-400">Project Addition Activity</h2>
          <div className="bg-gray-800/80 rounded-lg p-4 sm:p-6 border border-blue-500/20 shadow-md">
            <Line
              data={processProjectData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: '#D1D5DB', font: { size: 12 } },
                  },
                  title: {
                    display: true,
                    text: 'Projects Added Per Month',
                    color: '#D1D5DB',
                    font: { size: 12, family: 'Futura, sans-serif' },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#D1D5DB', font: { size: 10 } },
                    grid: { color: '#374151' },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#D1D5DB', stepSize: 1, font: { size: 10 } },
                    grid: { color: '#374151' },
                  },
                },
              }}
              height={250}
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-blue-400">User List</h2>
            <input
              type="text"
              placeholder="Search by email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
              aria-label="Search users"
            />
          </div>
          <div className="bg-gray-800/80 rounded-lg border border-blue-500/20 shadow-md overflow-x-auto">
            <table className="w-full text-left min-w-[500px] sm:min-w-[600px]">
              <thead>
                <tr className="border-b border-blue-500/20">
                  <th className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">Email</th>
                  <th className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">Role</th>
                  <th className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">Verified</th>
                  <th className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">Last Login</th>
                  <th className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-blue-500/20 hover:bg-blue-500/10"
                    >
                      <td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.email}</td>
                      <td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.role}</td>
                      <td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.verified ? 'Yes' : 'No'}</td>
                      <td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.last_login || 'Never'}</td>
                      <td className="p-3 sm:p-4 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(user)}
                          className="text-blue-400 hover:text-blue-300 p-2"
                          title="Edit Role"
                          aria-label={`Edit role for ${user.email}`}
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteUser(user.email)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Delete User"
                          aria-label={`Delete user ${user.email}`}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-400 text-sm">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        <AnimatePresence>
          {isEditModalOpen && (
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
                  <h3 className="text-base sm:text-lg font-semibold text-blue-400">Edit Role for {selectedUser?.email}</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-200 p-2"
                    aria-label="Close edit modal"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  aria-label="Select user role"
                >
                  <option value="user">User</option>
                  <option value="anggota">Anggota</option>
                  <option value="dosen">Dosen</option>
                </select>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditRole}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-sm"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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