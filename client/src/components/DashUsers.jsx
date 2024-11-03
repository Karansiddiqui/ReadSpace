import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ReactSpinner } from "../components/ReactSpinner";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/getAllUser`);
        const response = await res.json();

        if (res.ok) {
          setUsers(response.data.users);
          setLoading(false);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.data.user?.isAdmin) {
      fetchUsers();
    }
  }, []);
  if (isLoading) return <ReactSpinner />;
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 mt-20">
      {currentUser?.data.user?.isAdmin && users.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell className="text-center">
                Date created
              </Table.HeadCell>
              <Table.HeadCell className="text-center">Username</Table.HeadCell>
              <Table.HeadCell className="text-center">Email</Table.HeadCell>
              <Table.HeadCell className="text-center">Admin</Table.HeadCell>
              <Table.HeadCell className="text-center">
                Book history
              </Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className="divide-y" key={user._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-[rgb(14,16,19)]">
                  <Table.Cell className="text-center align-middle">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>

                  <Table.Cell className="text-center align-middle">
                    {user.username}
                  </Table.Cell>

                  <Table.Cell className="text-center align-middle">
                    {user.email}
                  </Table.Cell>

                  <Table.Cell className="flex justify-center items-center">
                    {user.isAdmin ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </Table.Cell>

                  <Table.Cell className="text-center align-middle">
                    {user.isAdmin ? null : (
                      <h1
                        onClick={() =>
                          navigate(`/userRentHistory`, {
                            state: { userId: user?._id },
                          })
                        }
                        className="text-blue-500 cursor-pointer"
                      >
                        View
                      </h1>
                    )}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (

        <p className="text-xl text-gray-500 flex items-center justify-center h-[600px] w-[1600px]">
          <ReactSpinner size="xl" />
        </p>
      )}
      {users.length === 0 && (
        <p>You have no users yet!</p>
      )}
    </div>
  );
}
