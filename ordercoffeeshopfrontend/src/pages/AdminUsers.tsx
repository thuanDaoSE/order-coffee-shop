import { useState, useEffect } from 'react';
import { userService, User, Page } from '../services/userService';
import RoleChangeModal from '../components/RoleChangeModal';
import { useAuth } from '../contexts/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [usersPage, setUsersPage] = useState<Page<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadUsers(searchTerm, currentPage);
  }, [searchTerm, currentPage]);

  const loadUsers = async (search: string, page: number) => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(search, page, 10);
      setUsersPage(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: User['role']) => {
    await userService.updateUserRole(userId, newRole);
    loadUsers(searchTerm, currentPage);
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      // await userService.deleteUser(userId); // Note: deleteUser is not implemented in this scenario
      alert(`User with id ${userId} would be deleted.`);
      loadUsers(searchTerm, currentPage);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      STAFF: 'bg-blue-100 text-blue-800',
      CUSTOMER: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">User Management</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : (
              usersPage?.content.map(user => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-lg font-medium text-gray-900">{user.fullname}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">{user.phone || '-'}</div>
                  <div className="flex justify-end gap-4">
                    <button onClick={() => openModal(user)} disabled={user.id === currentUser?.id} className="text-amber-600 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed">Change Role</button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  usersPage?.content.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullname}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => openModal(user)} disabled={user.id === currentUser?.id} className="text-amber-600 hover:text-amber-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">Change Role</button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{usersPage ? usersPage.number * usersPage.size + 1 : 0}</span> to <span className="font-medium">{usersPage ? Math.min((usersPage.number + 1) * usersPage.size, usersPage.totalElements) : 0}</span> of <span className="font-medium">{usersPage?.totalElements ?? 0}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!usersPage || currentPage >= usersPage.totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>

        {isModalOpen && (
          <RoleChangeModal
            user={selectedUser}
            currentUser={currentUser}
            onClose={closeModal}
            onRoleChange={handleRoleChange}
          />
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
