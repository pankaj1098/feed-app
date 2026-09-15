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
import MyProfilePage from "./components/MyProfilePage";
import EditProfilePage from "./components/EditProfilePage";
import { posts } from "./data/posts";
import {
  createPost,
  deletePost,
  getMyPosts,
  getPosts,
  updatePost,
} from "./services/postApi";
import { logoutUser } from "./services/authApi";
import { getProfile } from "./services/userApi";

const user = posts[0];
const toFeedPost = (post) => ({
  ...post,
  authorId: post.author?._id || post.author,
  author: post.author?.userName || user.author,
  avatar: post.author?.avatar?.url || user.avatar,
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

  async function handleLogout() {
    await logoutUser().catch(() => {});
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <main className="app-shell">
      <Header
        user={user}
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
      <Outlet />
    </main>
  );
}

function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [feedPosts, setFeedPosts] = useState(posts);
  const [currentUserId, setCurrentUserId] = useState(null);
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
    fetchPosts()
      .then((apiPosts) => setFeedPosts(apiPosts.map(toFeedPost)))
      .catch(() => {});
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
    await deletePost(post._id).catch(() => {});
    setFeedPosts((current) => current.filter((item) => item._id !== post._id));
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
        {feedPosts.map((post) => (
          <FeedCard
            key={post._id || post.title}
            post={post}
            isOwner={Boolean(currentUserId) && post.authorId === currentUserId}
            onEdit={setEditingPost}
            onDelete={handleDeletePost}
          />
        ))}
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
          />
        }
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
