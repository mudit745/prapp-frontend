import { HelpCircle } from 'lucide-react'

export default function ManualFooter() {
  return (
    <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        <p className="font-medium">Last Updated: January 2025 | Version 3.0</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
          <HelpCircle size={20} className="text-primary-600 dark:text-primary-400" />
          Need More Help?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          If you can't find what you're looking for in this manual:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 dark:text-primary-400 font-medium">•</span>
            <span>Contact your system administrator for account or access issues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 dark:text-primary-400 font-medium">•</span>
            <span>Check the application's built-in help tooltips and field labels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 dark:text-primary-400 font-medium">•</span>
            <span>Review error messages for specific guidance on issues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 dark:text-primary-400 font-medium">•</span>
            <span>Ask your team members or manager for workflow guidance</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
