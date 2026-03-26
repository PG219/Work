import { useState, useEffect } from 'react';
import { getBackendUrl, BACKEND_URL } from '@/config/env';
import axios from 'axios';

const ExampleApiUsage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example API call using the configured backend URL
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the getBackendUrl helper function
      const response = await axios.get(getBackendUrl('/api/example'));
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log the backend URL in development
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Usage Example</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>Backend URL:</strong> {BACKEND_URL}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Example API URL:</strong> {getBackendUrl('/api/example')}
        </p>
      </div>

      <button
        onClick={fetchData}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test API Call'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExampleApiUsage; 