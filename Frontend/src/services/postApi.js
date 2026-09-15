const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export async function getPosts() {
  const { posts } = await request('/posts')
  return posts
}

export async function getMyPosts() {
  const { posts } = await request('/my-posts')
  return posts
}

export async function createPost({ image, caption, description }) {
  const formData = new FormData()
  formData.append('image', image)
  formData.append('caption', caption)
  formData.append('description', description)
  const { post } = await request('/create-post', { method: 'POST', body: formData })
  return post
}

export async function updatePost(id, { image, caption, description }) {
  const formData = new FormData()
  if (image) formData.append('image', image)
  if (caption !== undefined) formData.append('caption', caption)
  if (description !== undefined) formData.append('description', description)
  const { post } = await request(`/posts/${id}`, { method: 'PATCH', body: formData })
  return post
}

export async function deletePost(id) {
  await request(`/posts/${id}`, { method: 'DELETE' })
}
