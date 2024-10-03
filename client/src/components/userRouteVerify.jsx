import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function UserRoute() {
//   const { currentUser } = useSelector((state) => state.user);
  const userToken = Cookies.get('accessToken'); // Assuming your user token is stored in a cookie called 'userToken'

  // Check if the user exists either in the Redux state or in cookies
  return userToken ? <Outlet /> : <Navigate to="/sign-in" />;
}
