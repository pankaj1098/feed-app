import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { categoryIcon } from "../data/categories";

export default function FeedCard({ post, isOwner, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef(null);

  // Close the options menu on a click outside it (the ⋮ button is inside
  // menuRef, so it still toggles) and close menu or dialog on Escape.
  useEffect(() => {
    if (!menuOpen && !confirmingDelete) return;
    function handlePointerDown(event) {
      if (menuOpen && !menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setConfirmingDelete(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, confirmingDelete]);

  function handleEdit() {
    setMenuOpen(false);
    onEdit(post);
  }

  function confirmDelete() {
    setConfirmingDelete(false);
    onDelete(post);
  }

  return (
    <article className="post-card">
      <header className="post-author">
        {post.avatar && !avatarFailed ? (
          <img
            src={post.avatar}
            alt={`${post.author} profile`}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span
            className="profile-icon-placeholder post-avatar-placeholder"
            aria-hidden="true"
          >
            <Icon name="profile" />
          </span>
        )}
        <div>
          <h2>{post.author}</h2>
          <p>
            {post.time}
            {post.category && (
              <>
                <b>•</b>
                <span>{post.category}</span>
              </>
            )}
          </p>
        </div>
        {isOwner && (
          <div className="post-options-control" ref={menuRef}>
            <button
              className="post-options"
              aria-label={`More options for ${post.title}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="post-options-menu" role="menu">
                <button type="button" role="menuitem" onClick={handleEdit}>
                  <Icon name="pencil" />
                  Edit Post
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmingDelete(true);
                  }}
                >
                  <Icon name="trash" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <img className="post-image" src={post.image} alt="" />
      <div className="post-content">
        <h1 className="post-title">
          <span className="post-category-icon" aria-hidden="true">
            <Icon name={categoryIcon(post.category)} />
          </span>
          <span className="post-title-text">
            {post.title}
            {post.emoji && <span className="post-emoji"> {post.emoji}</span>}
          </span>
        </h1>
        <p className="post-copy">{post.copy}</p>
        {post.tags?.length > 0 && (
          <div className={`tags ${post.tone}`}>
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
      {confirmingDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setConfirmingDelete(false)}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="confirm-delete-title">Delete post?</h2>
            <p>Are you sure you want to delete this post? This can't be undone.</p>
            <footer className="confirm-dialog-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </footer>
          </section>
        </div>
      )}
    </article>
  );
}
