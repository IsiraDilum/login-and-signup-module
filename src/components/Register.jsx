//src/components/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Registration Successful");

                setUsername("");
                setEmail("");
                setPassword("");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Server Error");
        }
    };

    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <br />
                <br />

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
                    Register
                </button>
            </form>
            <p>
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;