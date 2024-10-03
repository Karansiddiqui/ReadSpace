import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function OnlyAdminPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  // outlet to access child of route
  return currentUser && currentUser.data.user?.isAdmin ? <Outlet /> : <Navigate to='/sign-in' />;
}