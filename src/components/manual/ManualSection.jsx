import { ChevronDown, ChevronRight } from 'lucide-react'

export default function ManualSection({ section, isExpanded, onToggle }) {
  return (
    <div
      id={section.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl"
    >
      <button
        onClick={() => onToggle(section.id)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            {section.icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
            {section.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
              Click to collapse
            </span>
          )}
          {isExpanded ? (
            <ChevronDown size={24} className="text-gray-400" />
          ) : (
            <ChevronRight size={24} className="text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="pt-6">
            {section.content}
          </div>
        </div>
      )}
    </div>
  )
}
