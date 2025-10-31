import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-4xl font-bold text-amber-800 mb-4">404 - Not Found</h1>
    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/" className="px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors">
      Go to Home
    </Link>
  </div>
);

export default NotFound;