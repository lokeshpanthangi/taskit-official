
import { Navigate } from 'react-router-dom';

const Index = () => {
  // This page redirects to login
  return <Navigate to="/login" replace />;
};

export default Index;
