import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);

            alert("Google Login Successful");

            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, []);

    return <h2>Logging in...</h2>;
}

export default LoginSuccess;