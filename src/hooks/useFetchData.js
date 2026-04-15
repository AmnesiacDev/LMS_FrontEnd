import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useFetchData = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // If no token exists, we can't fetch protected route
      if (!token) {
         if (isMounted) {
            setLoading(false);
            setError("Authentication required.");
         }
         return;
      }

      try {
        setLoading(true);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch data');
        }

        if (isMounted) {
          setData(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, token]);

  return { data, loading, error };
};

export default useFetchData;
