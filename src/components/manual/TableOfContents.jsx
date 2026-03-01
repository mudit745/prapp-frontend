import { FileText } from 'lucide-react'

export default function TableOfContents({ sections, onSectionClick }) {
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText size={24} className="text-primary-600 dark:text-primary-400" />
        Table of Contents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
          >
            <div className="text-primary-600 dark:text-primary-400">
              {section.icon}
            </div>
            <span>{section.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
