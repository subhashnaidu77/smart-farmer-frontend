import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Modal from "../components/Modal";
import { authErrorToCopy } from "../utils/authErrorCopy";
import { retryWithBackoff } from "../utils/retry";

export default function PasswordReset() {
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/logo-light-theme.png" : "/logo-dark-theme.png";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const oobCode = params.get("oobCode");

  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  // Verify the code on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode || "");
        if (mounted) setVerified(true);
      } catch (err) {
        console.error("verifyPasswordResetCode error", err);
        if (mounted) {
          openModal({
            type: "error",
            title: "Invalid or expired link",
            message: "Your password reset link is invalid or has expired. Please request a new one.",
            onPrimaryAction: () => {
              setModalOpen(false);
              navigate("/forgot-password");
            },
          });
        }
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [oobCode, navigate]);

  const validate = () => {
    if (newPass.length < 8) return "Use at least 8 characters.";
    if (newPass !== confirmPass) return "Passwords do not match.";
    return null;
  };

  const doReset = async () => {
    await confirmPasswordReset(auth, oobCode, newPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const v = validate();
    if (v) {
      openModal({ type: "info", title: "Check your input", message: v });
      return;
    }

    setLoading(true);
    try {
      await retryWithBackoff(doReset);
      openModal({
        type: "success",
        title: "Password Updated",
        message: "Your password has been reset successfully. You can now log in.",
        primaryActionLabel: "Go to Login",
        onPrimaryAction: () => {
          setModalOpen(false);
          navigate("/login");
        },
      });
    } catch (err) {
      console.error("confirmPasswordReset error", err);
      openModal({
        type: "error",
        title: "Reset failed",
        message: authErrorToCopy(err?.code, "We couldn’t reset your password. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="card" style={{ maxWidth: 450, margin: "50px auto", padding: 24, textAlign: "center" }}>
        <p>Verifying your reset link…</p>
      </div>
    );
  }

  if (!verified) {
    // Modal already shown in effect; render a simple safe fallback.
    return null;
  }

  return (
    <div className="card" style={{ maxWidth: 450, margin: "50px auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Back to Landing Page */}
      <button className="btn btn-ghost" style={{ alignSelf: "flex-start", marginBottom: 10 }} onClick={() => navigate("/")}>
        ← Back to Landing Page
      </button>

      <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Reset Your Password</h2>

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div className="form-group" style={{ position: "relative" }}>
          <label>New Password</label>
          <input
            type={showNew ? "text" : "password"}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            autoComplete="new-password"
          />
          <span
            style={{ position: "absolute", right: 10, top: 38, cursor: "pointer" }}
            onClick={() => setShowNew((s) => !s)}
            aria-label={showNew ? "Hide password" : "Show password"}
            title={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <FiEyeOff /> : <FiEye />}
          </span>
          <small style={{ color: "var(--text-secondary, #64748b)" }}>
            Use at least 8 characters. A mix of letters, numbers, and symbols is recommended.
          </small>
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label>Confirm New Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
            autoComplete="new-password"
          />
          <span
            style={{ position: "absolute", right: 10, top: 38, cursor: "pointer" }}
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            title={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Updating…" : "Save and Relogin"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>
        Back to <Link to="/login">Login</Link>
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
