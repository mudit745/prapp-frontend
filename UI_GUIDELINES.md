# UI Guidelines

## Design Principles

### Dark Mode
- All components support dark mode
- Dark mode preference is saved in localStorage
- Toggle available in header (top right)
- Smooth transitions between modes

### Layout Structure
- **Sidebar**: Left navigation panel (collapsible on mobile)
- **Header**: Top bar with logo, dark mode toggle, user info
- **Main Content**: Scrollable content area
- **Footer**: Bottom footer with copyright and links

### Navigation
- Grouped by functionality:
  - **Main**: Dashboard, Master Data
  - **Procurement**: Requisitions, Purchase Orders, Invoices
  - **Reports**: Analytics, Reports
- Active page highlighted
- "Coming Soon" items marked with opacity

### Mobile Responsiveness
- Sidebar slides in/out on mobile
- Hamburger menu on mobile
- Responsive tables (horizontal scroll)
- Touch-friendly buttons and links
- Footer stacks on mobile

### Logo
- Clickable, links to dashboard
- Always visible in sidebar
- Icon + text combination

### Color Scheme
- Primary: Sky blue (#0ea5e9)
- Light mode: White backgrounds, gray text
- Dark mode: Gray-900 backgrounds, gray-100 text
- Consistent hover states

## Future Considerations

When adding new pages:
1. Use `<Layout>` component wrapper
2. Support dark mode colors
3. Ensure mobile responsiveness
4. Add to navigation groups in Layout.jsx
5. Use consistent spacing and typography
6. Test on mobile viewport

