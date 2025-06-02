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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center gap-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-4 h-4 bg-blue-400 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
    />
    <motion.div
      className="w-4 h-4 bg-blue-500 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
    />
    <motion.div
      className="w-4 h-4 bg-blue-600 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
    />
  </motion.div>
);

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
  const [requestRole, setRequestRole] = useState('anggota');
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false,
  });
  const [isRequestDisabled, setIsRequestDisabled] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const router = useRouter();

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
      const fetchUsers = async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            throw new Error('No session token found');
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-users/?session_token=${encodeURIComponent(sessionToken)}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
            },
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

  useEffect(() => {
    if (userRole === 'anggota' || userRole === 'dosen') {
      const fetchProjects = async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            throw new Error('No session token found');
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/get-projects/?session_token=${encodeURIComponent(sessionToken)}`, {
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

  const handleDeleteUser = (email) => {
    setDialogState({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete user ${email}?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/delete-user/`, {
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

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleEditRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/update-role/`, {
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

  const handleRequestRole = async () => {
    setIsRequestLoading(true);
    setIsRequestDisabled(true);
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/request-role/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, requested_role: requestRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setDialogState({
          isOpen: true,
          title: 'Success',
          message: 'Role request sent successfully to anggota users',
          isConfirm: false,
        });
        setCooldownSeconds(30);
      } else {
        setDialogState({
          isOpen: true,
          title: 'Error',
          message: data.error,
          isConfirm: false,
        });
        if (!data.error.includes('Please wait') && !data.error.includes('Maximum 3 role requests')) {
          setIsRequestDisabled(false);
        }
      }
    } catch (err) {
      console.error('Error sending role request:', err);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Error sending role request',
        isConfirm: false,
      });
      setIsRequestDisabled(false);
    } finally {
      setIsRequestLoading(false);
    }
  };

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setIsRequestDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamMembersCount = users.filter((user) => user.role === 'anggota').length;

  const processProjectData = () => {
    const monthCounts = {};
    projects.forEach((project) => {
      const date = new Date(project.start_date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
    });

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
    return null;
  }

  if (userRole === 'user') {
    return (
      <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 sm:pt-28 md:pt-32">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center mb-6"
          >
            Welcome to CoreDev
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 items-center relative"
          >
            <select
              value={requestRole}
              onChange={(e) => setRequestRole(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-100 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              aria-label="Select requested role"
              disabled={isRequestLoading || isRequestDisabled}
            >
              <option value="anggota">Anggota</option>
              <option value="dosen">Dosen</option>
            </select>
            <motion.button
              whileHover={{ scale: (isRequestLoading || isRequestDisabled) ? 1 : 1.05 }}
              whileTap={{ scale: (isRequestLoading || isRequestDisabled) ? 1 : 0.95 }}
              onClick={handleRequestRole}
              disabled={isRequestLoading || isRequestDisabled}
              className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg font-semibold text-sm relative overflow-hidden ${
                isRequestLoading || isRequestDisabled
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`}
            >
              <AnimatePresence>
                {isRequestLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <LoadingSpinner />
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {isRequestDisabled && cooldownSeconds > 0
                      ? `Wait ${cooldownSeconds}s`
                      : 'Request Role'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </main>
        <CustomDialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          title={dialogState.title}
          message={dialogState.message}
          onConfirm={dialogState.onConfirm}
          isConfirm={dialogState.isConfirm}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-futura bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ top: '10%', left: '10%' }}
        ></div>
        <div
          className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ bottom: '20%', right: '15%' }}
        ></div>
      </div>

      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 pt-28 sm:pt-32 md:pt-36 lg:pt-40 max-w-7xl mx-auto relative z-10">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg font-semibold text-sm sm:text-base shadow-md w-full sm:w-auto"
            onClick={() => router.push('/list-project')}
          >
            <FileText size={18} />
            List Project
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-400 text-white rounded-lg font-semibold text-sm sm:text-base shadow-md w-full sm:w-auto"
            onClick={() => router.push('/list-member')}
          >
            <Users size={18} />
            List Member
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
            <table className="w-full text-left min-w-[500px]">
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
                  filteredUsers.map((user, index) => (<motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-blue-500/20 hover:bg-blue-500/10"><td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.email}</td><td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.role}</td><td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.verified}</td><td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm">{user.last_login || 'Never'}</td><td className="p-3 sm:p-4 flex gap-2"><motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(user)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                      title="Edit Role"
                      aria-label={`Edit role for ${user.email}`}
                    >
                      <Edit2 size={16} />
                    </motion.button><motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user.email)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete User"
                      aria-label={`Delete user ${user.email}`}
                    >
                      <Trash2 size={16} />
                    </motion.button></td></motion.tr>))
                ) : (<tr><td colSpan="5" className="p-4 text-center text-gray-400 text-sm">No users found</td></tr>)}
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