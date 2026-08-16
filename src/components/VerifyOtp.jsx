import { useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

function VerifyOtp() {
    const [otp, setOtp] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "http://localhost:5000/api/auth/verify-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("OTP Verified");

            navigate("/reset-password", {
                state: { email, otp },
            });
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <h2>Verify OTP</h2>

            <form onSubmit={handleVerifyOtp}>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                        setOtp(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Verify OTP
                </button>
            </form>
        </div>
    );
}

export default VerifyOtp;