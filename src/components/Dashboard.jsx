//src/components/Dashboard.jsx
function Dashboard() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <div>
            <h2>User Dashboard</h2>

            <p>
                Welcome {user?.username}
            </p>

            <p>
                Role: {user?.role}
            </p>
        </div>
    );
}

export default Dashboard;