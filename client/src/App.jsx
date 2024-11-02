import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute";
import CreatePost from "./pages/Create-updateBook";
import Search from "./pages/Search";
import NotFoundPage from "./pages/404PageNotFound";
import RentedBooks from "./pages/RentedBooks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrevHistory from "./pages/PrevHistory";
import ScrollToTop from "./components/ScrollToTop";
import AdminUserHistry from "./pages/AdminUserHistry";
import ScrollToTopWithClick from "./components/ScrollToTopWithClick";
import BookDetails from "./pages/BookDetail";
import Cart from "./pages/Cart";
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <ScrollToTopWithClick/>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/rentedBooks" element={<RentedBooks />} />
        <Route path="/book-detail/:id" element={<BookDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* <Route path="/dashboardUser" element={<Dashboar />} /> */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userRentHistory" element={<AdminUserHistry />} />
          <Route path="/prevHistory" element={<PrevHistory />} />
        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/create-book" element={<CreatePost />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}
