// Placeholder for Firebase Storage: uploads resolve to a placeholder URL; delete is a no-op.
// Replace with backend upload (e.g. POST /api/v1/documents) or BTP Object Store when ready.

export function ref(storage, path) {
  return { _path: path, _placeholder: true }
}

export function uploadBytesResumable(storageRef, file) {
  return {
    on: (event, next, error, complete) => {
      if (typeof complete === 'function') setTimeout(complete, 0)
    },
    snapshot: { ref: storageRef },
  }
}

export function getDownloadURL(storageRef) {
  const path = storageRef?._path || 'placeholder'
  return Promise.resolve(`https://placeholder.local/${encodeURIComponent(path)}`)
}

export function deleteObject(storageRef) {
  return Promise.resolve()
}
