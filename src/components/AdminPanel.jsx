import { useEffect, useState } from "react";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/auth/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setUsers(data);
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h2>Admin Panel</h2>

            <table border="1">
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
                </thead>

                <tbody>
                {users.map((user) => (
                    <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPanel;