import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import FeedCard from "./components/FeedCard";
import CreatePostModal from "./components/CreatePostModal";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import MyProfilePage from "./components/MyProfilePage";
import EditProfilePage from "./components/EditProfilePage";
import {
  createPost,
  deletePost,
  getMyPosts,
  getPosts,
  updatePost,
} from "./services/postApi";
import { logoutUser } from "./services/authApi";
import { getProfile } from "./services/userApi";

const toFeedPost = (post) => ({
  ...post,
  authorId: post.author?._id || post.author,
  author: post.author?.userName || "Unknown user",
  avatar: post.author?.avatar?.url || "",
  time: post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "Just now",
  category: "Nature",
  tone: "violet",
  tags: [],
  title: post.caption || post.title,
  copy: post.description || post.copy || "",
});

function RequireAuth({ children }) {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const headerUser = profile
    ? {
        author: profile.fullName || profile.userName,
        avatar: profile.avatar?.url,
        email: profile.email,
      }
    : null;

  async function handleLogout() {
    await logoutUser().catch(() => {});
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <main className="app-shell">
      <Header
        user={headerUser}
        profileOpen={profileOpen}
        onProfileToggle={() => setProfileOpen((open) => !open)}
        onCreatePost={() => {
          setProfileOpen(false);
          navigate("/posts", { state: { openCreate: true } });
        }}
        onMyProfile={() => {
          setProfileOpen(false);
          navigate("/profile");
        }}
        onMyPosts={() => {
          setProfileOpen(false);
          navigate("/posts", { state: { myPostsOnly: true } });
        }}
        onEditProfile={() => {
          setProfileOpen(false);
          navigate("/profile/edit");
        }}
        onLogout={handleLogout}
      />
      <Outlet context={{ onProfileUpdated: setProfile }} />
    </main>
  );
}

function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [feedError, setFeedError] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(
    Boolean(location.state?.myPostsOnly),
  );

  useEffect(() => {
    getProfile()
      .then((profile) => setCurrentUserId(profile._id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPosts = showMyPosts ? getMyPosts : getPosts;
    setIsLoadingPosts(true);
    setFeedError("");
    fetchPosts()
      .then((apiPosts) => setFeedPosts(apiPosts.map(toFeedPost)))
      .catch((error) => {
        setFeedPosts([]);
        setFeedError(error.message || "Unable to load posts. Please try again.");
      })
      .finally(() => setIsLoadingPosts(false));
  }, [showMyPosts]);

  useEffect(() => {
    if (location.state?.openCreate || location.state?.myPostsOnly) {
      if (location.state.openCreate) setIsCreating(true);
      if (location.state.myPostsOnly) setShowMyPosts(true);
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  async function handleCreatePost(payload) {
    const post = await createPost(payload);
    setFeedPosts((current) => [toFeedPost(post), ...current]);
  }

  async function handleUpdatePost(payload) {
    const updated = await updatePost(editingPost._id, payload);
    setFeedPosts((current) =>
      current.map((post) =>
        post._id === updated._id ? toFeedPost(updated) : post,
      ),
    );
  }

  async function handleDeletePost(post) {
    setDeleteError("");
    try {
      await deletePost(post._id);
      setFeedPosts((current) =>
        current.filter((item) => item._id !== post._id),
      );
    } catch (error) {
      setDeleteError(error.message || "Unable to delete post. Please try again.");
    }
  }

  return (
    <>
      {showMyPosts && (
        <div className="feed-filter-banner">
          <span>Showing your posts</span>
          <button type="button" onClick={() => setShowMyPosts(false)}>
            Back to Feed
          </button>
        </div>
      )}
      <section className="feed" id="top" aria-label="Social feed">
        {deleteError && (
          <p className="form-error" role="alert">
            {deleteError}
          </p>
        )}
        {feedError ? (
          <p className="form-error" role="alert">
            {feedError}
          </p>
        ) : isLoadingPosts ? (
          <p className="profile-loading">Loading posts…</p>
        ) : feedPosts.length === 0 ? (
          <p className="profile-empty">No posts to show yet.</p>
        ) : (
          feedPosts.map((post) => (
            <FeedCard
              key={post._id || post.title}
              post={post}
              isOwner={Boolean(currentUserId) && post.authorId === currentUserId}
              onEdit={setEditingPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </section>
      {isCreating && (
        <CreatePostModal
          onClose={() => setIsCreating(false)}
          onCreate={handleCreatePost}
        />
      )}
      {editingPost && (
        <CreatePostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onCreate={handleUpdatePost}
        />
      )}
    </>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onSignup={() => navigate("/signup")}
            onLogin={() => navigate("/posts")}
            onForgotPassword={() => navigate("/forgot-password")}
          />
        }
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage onBackToLogin={() => navigate("/login")} />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage onReset={() => navigate("/posts")} />}
      />
      <Route
        path="/signup"
        element={
          <SignupPage
            onLogin={() => navigate("/login")}
            onSignup={() => navigate("/posts")}
          />
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/posts" element={<FeedPage />} />
        <Route
          path="/profile"
          element={<MyProfilePage onBack={() => navigate("/posts")} />}
        />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={localStorage.getItem("token") ? "/posts" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
