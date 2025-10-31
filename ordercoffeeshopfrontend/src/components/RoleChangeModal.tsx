import type { User } from '../types/user';

interface RoleChangeModalProps {
  user: User | null;
  currentUser: User | null;
  onClose: () => void;
  onRoleChange: (userId: number, newRole: User['role']) => void;
}

const RoleChangeModal = ({ user, currentUser, onClose, onRoleChange }: RoleChangeModalProps) => {
  if (!user) return null;

  let newRole = user.role;

  const handleSave = () => {
    onRoleChange(user.id, newRole);
    onClose();
  };

  const isCurrentUser = user.id === currentUser?.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Change Role for {user.fullname}</h2>
        <div className="mb-4">
          <p>Current Role: {user.role}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="role-select" className="block mb-2">New Role:</label>
          <select
            id="role-select"
            defaultValue={user.role}
            onChange={(e) => newRole = e.target.value as User['role']}
            className="w-full p-2 border rounded"
            disabled={isCurrentUser}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">Cancel</button>
          <button onClick={handleSave} disabled={isCurrentUser} className="px-4 py-2 rounded bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;
