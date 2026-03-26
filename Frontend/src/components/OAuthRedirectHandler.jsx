import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * This component handles the redirect from an OAuth provider (like Google).
 * It expects the backend to redirect back to this component's route
 * with a JWT token in the URL search parameters (e.g., /oauth/callback?token=...).
 */
const OAuthRedirectHandler = () => {
  const { loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }
    
    console.log('OAuth callback received token:', token ? 'Token present' : 'No token');
    
    if (token) {
      // This is the crucial call that updates the AuthContext
      loginWithToken(token)
        .then((result) => {
          if (result.success) {
            console.log('OAuth login successful, redirecting to dashboard');
            navigate('/dashboard', { replace: true }); // Redirect to dashboard on success
          } else {
            console.error('OAuth login failed:', result.error);
            navigate('/login?error=oauth_login_failed', { replace: true });
          }
        })
        .catch((error) => {
          console.error('OAuth login error:', error);
          navigate('/login?error=oauth_login_failed', { replace: true });
        });
    } else {
      console.error('No token received in OAuth callback');
      navigate('/login?error=no_token', { replace: true });
    }
  }, [loginWithToken, searchParams, navigate]);

  // You can return a loading spinner or a simple message here
  return <div>Please wait, authenticating...</div>;
};

export default OAuthRedirectHandler;