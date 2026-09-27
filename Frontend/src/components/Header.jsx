import { CameraLogo, Icon } from "./Icons";
import ProfileDropdown from "./ProfileDropdown";
export default function Header({
  user,
  profileOpen,
  onProfileToggle,
  onCreatePost,
  onMyProfile,
  onEditProfile,
  onMyPosts,
  onLogout,
}) {
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
        <div className="profile-control">
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
