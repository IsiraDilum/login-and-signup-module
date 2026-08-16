import { Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";

import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import ResetPassword from "./components/ResetPassword";

import LoginSuccess from "./components/LoginSuccess";

function App() {
        return (
            <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/login-success"
                        element={<LoginSuccess />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/verify-otp"
                        element={<VerifyOtp />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin"
                        element={<AdminPanel />}
                    />
            </Routes>
        );
}

export default App;