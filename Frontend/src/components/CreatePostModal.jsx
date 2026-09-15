import { useRef, useState } from 'react'
import { CameraLogo, Icon } from './Icons'
import { posts } from '../data/posts'

export default function CreatePostModal({ onClose, onCreate, post }) {
  const isEditing = Boolean(post)
  const inputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(post?.image || posts[0].image)
  const [imageFile, setImageFile] = useState(null)
  const [caption, setCaption] = useState(post?.caption || '')
  const [description, setDescription] = useState(post?.description || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  async function submitPost(event) {
    event.preventDefault()
    if (!isEditing && !imageFile) return setError('Please choose an image to publish your post.')
    if (!caption.trim()) return setError('Please add a caption for your post.')
    setIsSubmitting(true)
    setError('')
    try {
      await onCreate({ image: imageFile, caption: caption.trim(), description: description.trim() })
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={event => event.stopPropagation()}>
      <header className="modal-header"><div className="modal-title"><div className="modal-logo"><CameraLogo /></div><div><h1 id="create-title">{isEditing ? 'Edit Post' : 'Create Post'}</h1><p>{isEditing ? 'Update your moment' : 'Share your moment with the world'}</p></div></div><button className="close-modal" onClick={onClose} aria-label="Close post form"><Icon name="close" /></button></header>
      <form onSubmit={submitPost}>
        <label className="field-label">Image</label><div className="upload-zone">{imagePreview && <div className="image-preview"><img src={imagePreview} alt="Selected post" /><button type="button" className="remove-image" onClick={() => { setImagePreview(''); setImageFile(null) }} aria-label="Remove image"><Icon name="close" /></button></div>}<div className="upload-info"><Icon name="upload" /><span>Drag &amp; drop an image here, or</span><button type="button" onClick={() => inputRef.current?.click()}>Choose file</button></div><p>Supports: JPG, PNG, WebP · Max size: 5MB</p><input ref={inputRef} className="file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} /></div>
        <label className="field-label" htmlFor="caption">Caption</label><div className="text-field caption-field"><Icon name="pencil" /><input id="caption" value={caption} maxLength="100" onChange={event => setCaption(event.target.value)} placeholder="Give your post a catchy title..." /><small>{caption.length}/100</small></div>
        <label className="field-label" htmlFor="description">Description</label><div className="text-field description-field"><Icon name="note" /><textarea id="description" value={description} maxLength="500" onChange={event => setDescription(event.target.value)} placeholder="Tell us more about this moment..." /><small>{description.length}/500</small></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-footer"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? (isEditing ? 'Saving…' : 'Publishing…') : (isEditing ? 'Save Changes' : 'Create Post')}</button></footer>
      </form>
    </section>
  </div>
}
