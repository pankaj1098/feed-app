import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icons";
import { getProfile } from "../services/userApi";
import { getMyPosts } from "../services/postApi";

function formatJoined(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function MyProfilePage({ onBack }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function loadProfile() {
    setIsLoading(true);
    setError("");
    return Promise.all([getProfile(), getMyPosts().catch(() => [])])
      .then(([user, myPosts]) => {
        setProfile(user);
        setPosts(myPosts);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) {
    return <p className="profile-loading">Loading profile…</p>;
  }

  if (error || !profile) {
    return (
      <p className="form-error" role="alert">
        {error || "Unable to load profile"}
      </p>
    );
  }

  const hasLinks =
    profile.website ||
    profile.socialLinks?.linkedin ||
    profile.socialLinks?.github ||
    profile.socialLinks?.twitter;

  return (
    <>
      <section className="my-profile-page">
        <header className="profile-page-header">
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            aria-label="Go back"
          >
            <Icon name="arrowLeft" />
          </button>
          <h1>My Profile</h1>
        </header>

        <div className="profile-card">
          <div className="profile-cover" />

          <div className="profile-summary">
            <div className="profile-avatar-frame">
              {profile.avatar?.url ? (
                <img
                  src={profile.avatar.url}
                  alt={profile.fullName || profile.userName}
                />
              ) : (
                <span className="avatar-placeholder">
                  <Icon name="profile" />
                </span>
              )}
              <button
                type="button"
                className="avatar-edit-badge"
                onClick={() => navigate("/profile/edit")}
                aria-label="Edit profile"
              >
                <Icon name="camera" />
              </button>
            </div>

            <h2 className="profile-name">
              {profile.fullName || profile.userName}
            </h2>
            <p className="profile-handle">@{profile.userName}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}

            <div className="profile-meta">
              {profile.location && (
                <span>
                  <Icon name="location" />
                  {profile.location}
                </span>
              )}
              <span>
                <Icon name="calendar" />
                Joined {formatJoined(profile.createdAt)}
              </span>
            </div>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{posts.length}</strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Following</span>
            </div>
          </div>

          {hasLinks && (
            <div className="profile-about">
              <h3>About Me</h3>
              <div className="profile-links">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer">
                    <Icon name="link" />
                    Website
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="platform-badge linkedin">in</span>
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="platform-badge github">gh</span>
                    GitHub
                  </a>
                )}
                {profile.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="platform-badge twitter">tw</span>
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="profile-posts">
            <h3>My Posts</h3>
            {posts.length === 0 ? (
              <p className="profile-empty">You haven't posted anything yet.</p>
            ) : (
              <div className="profile-posts-grid">
                {posts.map((post) => (
                  <img
                    key={post._id}
                    src={post.image}
                    alt={post.caption || "Post"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
