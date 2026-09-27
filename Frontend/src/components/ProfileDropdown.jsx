import { Icon } from "./Icons";
const supportItems = [
  ["settings", "Settings"],
  ["help", "Help & Support"],
];
const MenuGroup = ({ items }) => (
  <div className="profile-menu-group">
    {items.map(([icon, label, onClick]) => (
      <button key={label} type="button" onClick={onClick}>
        <Icon name={icon} />
        {label}
      </button>
    ))}
  </div>
);
export default function ProfileDropdown({
  user,
  onMyProfile,
  onEditProfile,
  onMyPosts,
  onLogout,
}) {
  const mainItems = [
    ["profile", "My Profile", onMyProfile],
    ["pencil", "Edit Profile", onEditProfile],
    ["note", "My Posts", onMyPosts],
  ];
  return (
    <aside className="profile-dropdown" aria-label="Profile menu">
      <header className="dropdown-account">
        {user?.avatar ? (
          <img src={user.avatar} alt="" />
        ) : (
          <span className="profile-icon-placeholder" aria-hidden="true">
            <Icon name="profile" />
          </span>
        )}
        <div className="dropdown-account-info">
          <strong>{user?.author || "Your account"}</strong>
          <span>{user?.email || ""}</span>
        </div>
      </header>
      <MenuGroup items={mainItems} />
      {/* <MenuGroup items={supportItems} /> */}
      <div className="profile-menu-group logout">
        <button type="button" onClick={onLogout}>
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}
