import { useState, useEffect } from 'react'
import { File, Download, Trash2, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import { storage } from '../utils/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from '../utils/storage-placeholder'

export default function DocumentList({ prId, readOnly = false }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prId) {
      fetchDocuments()
    }
  }, [prId])

  const fetchDocuments = async () => {
    if (!prId) return
    
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`/api/v1/requisitions/${prId}/documents`)
      setDocuments(response.data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Failed to load documents')
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    setError('')

    const uploadPromises = files.map(async (file) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fileName = `pr-documents/${prId}/${docId}/${file.name}`
      const storageRef = ref(storage, fileName)

      try {
        const uploadTask = uploadBytesResumable(storageRef, file)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error('Upload error:', error)
              reject(error)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                
                // Save document metadata to backend
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                const docData = {
                  pr_id: prId,
                  document_name: file.name,
                  document_type: getDocumentType(file.name),
                  file_name: file.name,
                  file_size: file.size,
                  mime_type: file.type || 'application/octet-stream',
                  storage_path: fileName,
                  storage_url: downloadURL,
                  source: 'PR_SCREEN',
                  description: null
                }
                
                await axios.post('/api/v1/documents', docData, {
                  headers: {
                    'X-User-ID': user.employee_id || user.user_id || '',
                    'X-Tenant-ID': user.tenant_id || ''
                  }
                })
                
                resolve({ name: file.name, url: downloadURL })
              } catch (error) {
                console.error('Error saving document metadata:', error)
                reject(error)
              }
            }
          )
        })
      } catch (error) {
        console.error('Error uploading file:', error)
        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
      toast.success('Document(s) uploaded')
      await fetchDocuments() // Refresh list
    } catch (error) {
      const msg = 'Some files failed to upload. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleDelete = async (documentId, storagePath) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      // Delete from Firebase Storage
      if (storagePath) {
        try {
          const storageRef = ref(storage, storagePath)
          await deleteObject(storageRef)
        } catch (storageError) {
          console.error('Error deleting from storage:', storageError)
          // Continue with API deletion even if storage delete fails
        }
      }

      // Delete from database
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await axios.delete(`/api/v1/documents/${documentId}`, {
        headers: {
          'X-User-ID': user.employee_id || user.user_id || ''
        }
      })

      toast.success('Document deleted')
      await fetchDocuments() // Refresh list
    } catch (err) {
      console.error('Error deleting document:', err)
      setError('Failed to delete document')
      toast.error('Failed to delete document')
    }
  }

  const handleDownload = (url, fileName) => {
    window.open(url, '_blank')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getDocumentType = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return 'invoice'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    if (['doc', 'docx'].includes(ext)) return 'document'
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet'
    return 'other'
  }

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType?.includes('pdf')) return '📄'
    if (mimeType?.includes('image')) return '🖼️'
    if (mimeType?.includes('word') || fileName?.endsWith('.doc') || fileName?.endsWith('.docx')) return '📝'
    if (mimeType?.includes('excel') || fileName?.endsWith('.xls') || fileName?.endsWith('.xlsx')) return '📊'
    return '📎'
  }

  if (loading && documents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading documents...
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
            <File className="w-5 h-5" />
            Documents ({documents.length})
          </h3>
          <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
        </div>
        {!readOnly && (
          <label className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 cursor-pointer text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 font-medium text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3 font-medium text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-800 dark:text-blue-200">Uploading documents...</p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(doc.mime_type, doc.file_name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {doc.document_name || doc.file_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatFileSize(doc.file_size)}</span>
                    {doc.uploaded_by_name && (
                      <>
                        <span>•</span>
                        <span>Uploaded by {doc.uploaded_by_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.storage_url, doc.file_name)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(doc.document_id, doc.storage_path)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


