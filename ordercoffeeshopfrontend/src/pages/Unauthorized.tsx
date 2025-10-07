import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-amber-900 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
          <Link
            to="/login"
            className="block w-full border-2 border-amber-900 text-amber-900 hover:bg-amber-50 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
