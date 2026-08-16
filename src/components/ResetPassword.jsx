import { useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

function ResetPassword() {

    const [newPassword, setNewPassword] =
        useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const { email, otp } =
    location.state || {};

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "http://localhost:5000/api/auth/reset-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword,
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Password Reset Successful");
            navigate("/login");
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>

            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) =>
                        setNewPassword(
                            e.target.value
                        )
                    }
                />

                <br /><br />

                <button type="submit">
                    Reset Password
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;