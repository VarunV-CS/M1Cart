import { useState, useEffect } from 'react';
import './VerificationModal.css';

function VerificationModal({ isOpen, onClose, onVerificationComplete }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Auto-focus first input on open
  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setError('');
      setSuccess(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and max 6 digits
    if (value === '' || (/^\d+$/.test(value) && value.length <= 6)) {
      setOtp(value);
      setError('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Import the verifyOTP function from api
      const { verifyOTP } = await import('../services/api');
      const response = await verifyOTP(otp);
      
      if (response.success) {
        setSuccess(true);
        // Notify parent component after a short delay to show success message
        setTimeout(() => {
          onVerificationComplete();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const { sendVerificationOTP } = await import('../services/api');
      await sendVerificationOTP();
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verification-modal-overlay" onClick={handleClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="verification-modal-close" onClick={handleClose} disabled={isVerifying}>
          ×
        </button>

        {success ? (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h2>Account Verified!</h2>
            <p>Your account has been successfully verified.</p>
          </div>
        ) : (
          <>
            <div className="verification-modal-header">
              <h2>Verify Your Account</h2>
              <p>Enter the 6-digit code sent to your email</p>
            </div>

            <form onSubmit={handleVerify} className="verification-form">
              <div className="otp-input-container">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="otp-input"
                  disabled={isVerifying}
                  autoFocus
                />
              </div>

              {error && <div className="verification-error">{error}</div>}

              <button 
                type="submit" 
                className="verify-btn"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>

              <div className="resend-section">
                <span className="resend-label">Didn't receive the code?</span>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isResending}
                >
                  {isResending 
                    ? 'Sending...' 
                    : resendTimer > 0 
                      ? `Resend in ${resendTimer}s` 
                      : 'Resend Code'
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default VerificationModal;

