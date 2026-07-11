import type { User } from "../App";
import Sidebar from "../Components/Sidebar";
import type { ToastProps } from "../Components/Toast";

interface DashboardProps {
  loggedinUser: User | null;
  setToastMessage: (message: ToastProps) => void;
}

const Dashboard = ({ loggedinUser, setToastMessage }: DashboardProps) => {
  const navigateToLogin = () => {
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        navigateToLogin();
        setToastMessage({ message: data.message, severity: "success" });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <Sidebar />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
