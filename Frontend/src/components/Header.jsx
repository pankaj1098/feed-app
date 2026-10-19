import { useEffect, useRef } from "react";
import { CameraLogo, Icon } from "./Icons";
import ProfileDropdown from "./ProfileDropdown";
export default function Header({
  user,
  profileOpen,
  onProfileToggle,
  onProfileClose,
  onCreatePost,
  onMyProfile,
  onEditProfile,
  onMyPosts,
  onLogout,
}) {
  const profileRef = useRef(null);

  // Close the menu on a click outside it (the avatar button sits inside
  // profileRef, so clicking it still toggles) or when Escape is pressed.
  useEffect(() => {
    if (!profileOpen) return;
    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) onProfileClose();
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") onProfileClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen, onProfileClose]);

  return (
    <nav className="topbar">
      <a className="brand" href="#top" aria-label="Feedly home">
        <CameraLogo />
        <span>Feedly</span>
      </a>
      <div className="nav-actions">
        <button className="create-button" onClick={onCreatePost}>
          <strong>＋</strong> Create Post
        </button>
        <div className="profile-control" ref={profileRef}>
          <button
            className="profile-trigger"
            onClick={onProfileToggle}
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
          >
            {user?.avatar ? (
              <img
                className="account-avatar"
                src={user.avatar}
                alt={user.author}
              />
            ) : (
              <span
                className="account-avatar avatar-placeholder"
                aria-hidden="true"
              >
                <Icon name="profile" />
              </span>
            )}
            <Icon name="chevron" />
          </button>
          {profileOpen && (
            <ProfileDropdown
              user={user}
              onMyProfile={onMyProfile}
              onEditProfile={onEditProfile}
              onMyPosts={onMyPosts}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
