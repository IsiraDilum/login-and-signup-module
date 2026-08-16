//src/components/Dashboard.jsx

import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch(
                "http://localhost:5000/api/auth/logout",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div>
            <h2>User Dashboard</h2>

            <p>Welcome {user?.username}</p>
            <p>Role: {user?.role}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;