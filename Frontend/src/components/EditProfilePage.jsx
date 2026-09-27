import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Icon } from "./Icons";
import { getProfile, updateProfile } from "../services/userApi";

const EMPTY_FORM = {
  fullName: "",
  userName: "",
  bio: "",
  email: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  twitter: "",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { onProfileUpdated } = useOutletContext();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((user) => {
        setForm({
          fullName: user.fullName || "",
          userName: user.userName || "",
          bio: user.bio || "",
          email: user.email || "",
          location: user.location || "",
          website: user.website || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          twitter: user.socialLinks?.twitter || "",
        });
        setAvatarUrl(user.avatar?.url || "");
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  function chooseAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("Profile photo must be a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Profile photo must be 2MB or smaller.");
      return;
    }
    setError("");
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const updatedProfile = await updateProfile({
        ...form,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      });
      onProfileUpdated(updatedProfile);
      navigate("/profile");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="my-profile-page">
      <header className="profile-page-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/profile")}
          aria-label="Go back"
        >
          <Icon name="arrowLeft" />
        </button>
        <h1>Edit Profile</h1>
      </header>

      <div className="edit-profile-card">
        {isLoading ? (
          <p className="profile-loading">Loading profile…</p>
        ) : (
          <form className="profile-form" onSubmit={submit}>
            <div className="avatar-editor">
              <span className="field-label">Profile Photo</span>
              <div className="profile-avatar-frame">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" />
                ) : (
                  <span className="avatar-placeholder">
                    <Icon name="profile" />
                  </span>
                )}
                <button
                  type="button"
                  className="avatar-edit-badge"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change profile photo"
                >
                  <Icon name="camera" />
                </button>
              </div>
              <p className="avatar-hint">JPG, PNG or WebP (Max 2MB)</p>
              <button
                type="button"
                className="change-photo-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="camera" /> Change Photo
              </button>
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={chooseAvatar}
              />
            </div>

            <div className="form-grid">
              <label className="profile-field">
                <span className="field-label">Full Name</span>
                <input
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder="Your full name"
                />
              </label>
              <label className="profile-field">
                <span className="field-label">Username</span>
                <input
                  value={form.userName}
                  onChange={set("userName")}
                  placeholder="username"
                  required
                />
              </label>
            </div>

            <label className="profile-field">
              <span className="field-label field-label-row">
                Bio <small>{form.bio.length}/150</small>
              </span>
              <textarea
                value={form.bio}
                maxLength={150}
                onChange={set("bio")}
                placeholder="Tell people about yourself"
              />
            </label>

            <label className="profile-field">
              <span className="field-label">Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                required
              />
            </label>

            <div className="form-grid">
              <label className="profile-field">
                <span className="field-label">Location</span>
                <div className="input-with-icon">
                  <Icon name="location" />
                  <input
                    value={form.location}
                    onChange={set("location")}
                    placeholder="City, Country"
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="field-label">
                  Website <small>(optional)</small>
                </span>
                <div className="input-with-icon">
                  <Icon name="link" />
                  <input
                    value={form.website}
                    onChange={set("website")}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </label>
            </div>

            <div className="profile-field">
              <span className="field-label">
                Social Links <small>(optional)</small>
              </span>
              <div className="input-with-icon">
                <span className="platform-badge linkedin">in</span>
                <input
                  value={form.linkedin}
                  onChange={set("linkedin")}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="input-with-icon">
                <span className="platform-badge github">gh</span>
                <input
                  value={form.github}
                  onChange={set("github")}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="input-with-icon">
                <span className="platform-badge twitter">tw</span>
                <input
                  value={form.twitter}
                  onChange={set("twitter")}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <footer className="modal-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </button>
              <button
                className="submit-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
}
