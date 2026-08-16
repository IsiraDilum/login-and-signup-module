import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem(
                    "token",
                    data.accessToken
                );

                localStorage.setItem(
                    "refreshToken",
                    data.refreshToken
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                if (data.user.role === "admin") {
                    alert("Login as Admin");
                    navigate("/admin");
                } else {
                    alert("Login as User");
                    navigate("/dashboard");
                }
            }

        } catch (error) {
            console.error(error);
            alert("Server Error");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <br />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br />
                <br />

                <button type="submit">
                    Login
                </button>
            </form>
            <p>
                <Link to="/forgot-password">
                    Forgot Password?
                </Link>
            </p>
            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
            <button
                type="button"
                onClick={() => {
                    window.location.href =
                        "http://localhost:5000/api/auth/google";
                }}
            >
                Continue with Google
            </button>
        </div>
    );
}

export default Login;