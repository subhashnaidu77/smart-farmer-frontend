import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/Modal";
import { authErrorToCopy } from "../utils/authErrorCopy";
import { retryWithBackoff } from "../utils/retry";

export default function ForgotPassword() {
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/logo-light-theme.png" : "/logo-dark-theme.png";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalTitle, setModalTitle] = useState();
  const [modalMsg, setModalMsg] = useState("");
  const [primaryLabel, setPrimaryLabel] = useState("OK");
  const [primaryAction, setPrimaryAction] = useState(() => () => setModalOpen(false));

  const openModal = ({ type, title, message, primaryActionLabel = "OK", onPrimaryAction }) => {
    setModalType(type);
    setModalTitle(title);
    setModalMsg(message);
    setPrimaryLabel(primaryActionLabel);
    setPrimaryAction(() => onPrimaryAction || (() => setModalOpen(false)));
    setModalOpen(true);
  };

  const doSend = async () => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await retryWithBackoff(doSend);
      openModal({
        type: "success",
        title: "Email sent",
        message: "If an account exists for that address, we’ve sent a reset link. Please check your inbox.",
        onPrimaryAction: () => {
          setModalOpen(false);
          navigate("/login");
        },
      });
    } catch (err) {
      openModal({
        type: "error",
        title: "Reset error",
        message: authErrorToCopy(err?.code, "We couldn’t send the reset link. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 450, margin: "50px auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Back to Landing Page */}
      <button className="btn btn-ghost" style={{ alignSelf: "flex-start", marginBottom: 10 }} onClick={() => navigate("/")}>
        ← Back to Landing Page
      </button>

      <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Forgot Password</h2>

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>
        Remembered your password? <Link to="/login">Back to Login</Link>
      </p>

      <Modal
        show={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMsg}
        primaryActionLabel={primaryLabel}
        onPrimaryAction={primaryAction}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
