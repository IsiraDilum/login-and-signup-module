import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "http://localhost:5000/api/auth/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            navigate("/verify-otp", {
                state: { email },
            });
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>

            <form onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Send OTP
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;