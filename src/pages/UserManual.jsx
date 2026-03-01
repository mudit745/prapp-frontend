import { useState } from 'react'
import { Book } from 'lucide-react'
import Layout from '../components/Layout'
import ManualSearch from '../components/manual/ManualSearch'
import TableOfContents from '../components/manual/TableOfContents'
import ManualSection from '../components/manual/ManualSection'
import ManualFooter from '../components/manual/ManualFooter'
import { manualSections } from '../data/manualSections.jsx'

export default function UserManual() {
  const [expandedSections, setExpandedSections] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = manualSections

  const filteredSections = searchTerm
    ? sections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sections

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <Book size={32} className="text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">User Manual</h1>
              <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
                Complete guide to using the Procurement Application
              </p>
            </div>
          </div>
        </div>

        <ManualSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <TableOfContents 
          sections={sections} 
          onSectionClick={(sectionId) => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setTimeout(() => {
              setExpandedSections(prev => ({ ...prev, [sectionId]: true }))
            }, 300)
          }}
        />

        <div className="space-y-6">
          {filteredSections.map((section) => (
            <ManualSection
              key={section.id}
              section={section}
              isExpanded={expandedSections[section.id]}
              onToggle={toggleSection}
            />
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No sections found matching your search.</p>
          </div>
        )}

        <ManualFooter />
      </div>
    </Layout>
  )
}

