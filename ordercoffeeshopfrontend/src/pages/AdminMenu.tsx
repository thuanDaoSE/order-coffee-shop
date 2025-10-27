import { Link } from 'react-router-dom';

const AdminMenu = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Menu Management (Placeholder)</h1>
        <p className="text-gray-600">This section will be used for managing menu categories and structure.</p>
        <Link to="/admin/products" className="text-blue-600 hover:underline">Go to Product Management</Link>
      </div>
    </div>
  );
};

export default AdminMenu;