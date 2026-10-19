import { useRef, useState } from 'react'
import { CameraLogo, Icon } from './Icons'
import { posts } from '../data/posts'
import { CATEGORIES, EMOJI_CHOICES, categoryIcon } from '../data/categories'
import { resizeImage } from '../utils/resizeImage'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const CUSTOM_CATEGORY = '__custom__'
const MAX_TAGS = 10

const normalizeTag = value => value.trim().replace(/^#+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)

export default function CreatePostModal({ onClose, onCreate, post }) {
  const isEditing = Boolean(post)
  const inputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(post?.image || posts[0].image)
  const [imageFile, setImageFile] = useState(null)
  const [caption, setCaption] = useState(post?.caption || '')
  const [description, setDescription] = useState(post?.description || '')
  const initialCategory = post?.category || ''
  const isCustomInitially = Boolean(initialCategory) && !CATEGORIES.includes(initialCategory)
  const [categoryChoice, setCategoryChoice] = useState(isCustomInitially ? CUSTOM_CATEGORY : initialCategory)
  const [customCategory, setCustomCategory] = useState(isCustomInitially ? initialCategory : '')
  const [tags, setTags] = useState(post?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [emoji, setEmoji] = useState(post?.emoji || '')
  const previewCategory = categoryChoice === CUSTOM_CATEGORY ? customCategory.trim() : categoryChoice
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function addTags(text, current = tags) {
    const next = [...current]
    text.split(/[\s,]+/).map(normalizeTag).filter(Boolean).forEach(tag => {
      if (!next.includes(tag) && next.length < MAX_TAGS) next.push(tag)
    })
    return next
  }

  function commitTagInput() {
    if (!tagInput.trim()) return
    setTags(addTags(tagInput))
    setTagInput('')
  }

  function handleTagKeyDown(event) {
    if (['Enter', ',', ' '].includes(event.key)) {
      event.preventDefault()
      commitTagInput()
    } else if (event.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  async function chooseImage(event) {
    const picked = event.target.files?.[0]
    if (!picked) return
    setError('')
    try {
      const file = await resizeImage(picked)
      if (file.size > MAX_IMAGE_BYTES) return setError('This image is too large. Please choose one under 5MB.')
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } catch {
      setError('This image could not be read. Please choose a JPG, PNG or WebP file.')
    }
  }

  async function submitPost(event) {
    event.preventDefault()
    if (!isEditing && !imageFile) return setError('Please choose an image to publish your post.')
    if (!caption.trim()) return setError('Please add a caption for your post.')
    const category = (categoryChoice === CUSTOM_CATEGORY ? customCategory : categoryChoice).trim()
    if (categoryChoice === CUSTOM_CATEGORY && !category) return setError('Please type a custom category or pick one from the list.')
    const finalTags = addTags(tagInput)
    setTags(finalTags)
    setTagInput('')
    setIsSubmitting(true)
    setError('')
    try {
      await onCreate({ image: imageFile, caption: caption.trim(), description: description.trim(), category, tags: finalTags, emoji: emoji.trim() })
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
        <label className="field-label" htmlFor="emoji">Caption emoji <small>(shown at the end of the caption)</small></label>
        <div className="emoji-picker" role="group" aria-label="Caption emoji">
          <button type="button" className={`emoji-option none ${emoji ? '' : 'selected'}`} aria-pressed={!emoji} onClick={() => setEmoji('')}>None</button>
          {EMOJI_CHOICES.map(choice => <button key={choice} type="button" className={`emoji-option ${emoji === choice ? 'selected' : ''}`} aria-pressed={emoji === choice} aria-label={`Use ${choice}`} onClick={() => setEmoji(choice)}>{choice}</button>)}
          <input id="emoji" className="emoji-custom" value={EMOJI_CHOICES.includes(emoji) ? '' : emoji} maxLength="8" onChange={event => setEmoji(event.target.value)} placeholder="Other" aria-label="Type or paste any emoji" />
        </div>
        {caption.trim() && <div className="caption-preview" aria-label="Caption preview"><span className="post-category-icon"><Icon name={categoryIcon(previewCategory)} /></span><strong>{caption.trim()}</strong>{emoji && <span className="post-emoji">{emoji}</span>}</div>}
        <label className="field-label" htmlFor="description">Description</label><div className="text-field description-field"><Icon name="note" /><textarea id="description" value={description} maxLength="500" onChange={event => setDescription(event.target.value)} placeholder="Tell us more about this moment..." /><small>{description.length}/500</small></div>
        <label className="field-label" htmlFor="category">Category</label>
        <div className="category-row">
          <div className="text-field select-field">
            <Icon name="category" />
            <select id="category" value={categoryChoice} onChange={event => setCategoryChoice(event.target.value)}>
              <option value="">No category</option>
              {CATEGORIES.map(name => <option key={name} value={name}>{name}</option>)}
              <option value={CUSTOM_CATEGORY}>Custom…</option>
            </select>
            <Icon name="chevron" />
          </div>
          {categoryChoice === CUSTOM_CATEGORY && <div className="text-field custom-category-field"><Icon name="pencil" /><input aria-label="Custom category" value={customCategory} maxLength="30" autoFocus onChange={event => setCustomCategory(event.target.value)} placeholder="Type your own category" /></div>}
        </div>
        <label className="field-label" htmlFor="tags">Tags <small>({tags.length}/{MAX_TAGS})</small></label>
        <div className="text-field tags-field" onClick={() => document.getElementById('tags')?.focus()}>
          <Icon name="tag" />
          <div className="tag-chips">
            {tags.map(tag => <span key={tag} className="tag-chip">#{tag}<button type="button" aria-label={`Remove tag ${tag}`} onClick={() => setTags(tags.filter(item => item !== tag))}><Icon name="close" /></button></span>)}
            {tags.length < MAX_TAGS && <input id="tags" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={handleTagKeyDown} onBlur={commitTagInput} placeholder={tags.length ? 'Add another…' : 'Type a tag and press Enter, e.g. mountains'} />}
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-footer"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? (isEditing ? 'Saving…' : 'Publishing…') : (isEditing ? 'Save Changes' : 'Create Post')}</button></footer>
      </form>
    </section>
  </div>
}
