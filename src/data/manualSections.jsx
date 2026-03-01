import { Home, Shield, BarChart3, Database, ShoppingCart, Inbox, FileSpreadsheet, Settings, Users, FileText, Lightbulb, Download, HelpCircle, CheckCircle2, AlertCircle, XCircle, DollarSign, Clock, Search, Filter, SortAsc, SortDesc, ChevronRight, ChevronDown, Upload } from 'lucide-react'

export const manualSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Home size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Welcome!</strong> This guide will walk you through using the Procurement Application step-by-step. 
              You'll learn how to create purchase requests, manage approvals, track invoices, and view reports.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">What You Need</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✓ Web Browser</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chrome, Firefox, Safari, or Edge (latest version recommended)</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✓ User Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your email address registered in the system</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✓ Internet Connection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stable connection for accessing the application</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✓ Access URL</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Application URL provided by your administrator</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Step-by-Step: First Login</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Open the Application</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Open your web browser and navigate to the application URL provided by your administrator. 
                    The login page will appear automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Enter Your Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type your registered email address in the email field. 
                    <strong className="text-gray-900 dark:text-white"> Example:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">sarah.lim@org.sg</code>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Click Sign In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the "Sign in" button or press Enter. The system will validate your credentials and log you in.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Welcome to Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After successful login, you'll be automatically redirected to the Dashboard, your home page in the application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Understanding Your Role</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">👤 Requestor</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  You can create purchase requests, view your requests, and track their status through the approval process.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What you'll do:</strong> Create purchase requests for goods or services your department needs.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✅ Approver/Manager</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  You review and approve purchase requests in your Inbox. You can approve, reject, or request changes.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What you'll do:</strong> Review purchase requests and make approval decisions based on business needs and budget.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">📋 AP Team (Accounts Payable)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  You review invoices received from vendors and verify them against approved purchase requests.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What you'll do:</strong> Verify invoices match approved requests and approve them for payment processing.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Navigation Overview</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                The application has a sidebar menu on the left with the following main sections:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span><strong>Dashboard:</strong> Overview of your procurement activities and statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span><strong>Requests:</strong> Create and manage your purchase requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span><strong>Inbox:</strong> Review and approve pending tasks (for approvers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span><strong>Reports:</strong> View approved requests and track invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span><strong>Master Data:</strong> View reference data (departments, suppliers, products, etc.)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Tip:</strong> You can always return to this User Manual by clicking "User Manual" in the Help section of the sidebar menu.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'authentication',
      title: 'Login & Security',
      icon: <Shield size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Secure Access:</strong> The application uses email-based authentication. 
              Simply enter your registered email address to sign in - no password required for streamlined access.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">How to Log In</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Enter Your Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    On the login page, type your registered email address in the email field.
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Example:</strong> <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">sarah.lim@org.sg</code>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Click Sign In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the "Sign in" button or press Enter on your keyboard. 
                    The system will validate your email and log you in.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Access Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After successful login, you'll be automatically redirected to your Dashboard, 
                    where you can see your procurement overview and quick access to all features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Staying Logged In</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Your session remains active while you use the application:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>✓ You stay logged in as you navigate between pages</li>
                <li>✓ Your session continues while you work</li>
                <li>✓ No need to log in again during your work session</li>
                <li>✓ Session automatically ends when you close the browser or log out</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Logging Out</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                To log out securely:
              </p>
              <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                <li>Click your email address or user icon in the top navigation bar</li>
                <li>Click the <strong>"Logout"</strong> button</li>
                <li>You'll be redirected back to the login page</li>
              </ol>
              <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-red-300 dark:border-red-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>🔒 Security Tip:</strong> Always log out when you're done, especially if using a shared computer.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Troubleshooting Login Issues</h3>
            <div className="space-y-2">
              {[
                { issue: "Can't log in", solution: "Verify your email address is correct and registered in the system. Contact your administrator if you don't have an account." },
                { issue: "Redirected back to login", solution: "Your session may have expired. Try logging in again. If it persists, contact support." },
                { issue: "Email not recognized", solution: "Your email may not be registered yet. Contact your administrator to create your account." }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{item.issue}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: <BarChart3 size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Your Command Center:</strong> The Dashboard is your home page that gives you a quick overview of all your procurement activities. 
              It shows key metrics, trends, and quick access to main features.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Understanding Your Dashboard</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Key Performance Indicators (KPIs)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  At the top of the dashboard, you'll see four key metrics:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">Requests Completed</h5>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Total number of purchase requests that have been approved and completed. 
                      This shows your successful procurement activities.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Example:</strong> If you see "15", it means 15 requests have been fully processed.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">Pending For Action</h5>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Requests or tasks waiting for your action. This could be approvals, invoice reviews, or confirmations.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Example:</strong> If you see "3", you have 3 items in your Inbox that need attention.
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={20} className="text-red-600 dark:text-red-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">Rejected Requests</h5>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Total number of requests that were rejected. Useful for tracking rejection rates and understanding issues.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Example:</strong> If you see "2", 2 requests were rejected (you can view reasons in Reports).
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">Total Amount</h5>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Total value of all purchase requests. This helps track spending and budget usage.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Example:</strong> If you see "SGD 45,230.00", that's the total value of all your requests.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Visual Analytics & Charts</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  The dashboard includes several charts to help you understand trends and patterns:
                </p>
                <div className="space-y-2">
                  {[
                    { title: 'Status Breakdown', desc: 'Pie chart showing how many requests are in each status (Draft, Pending, Approved, Rejected)' },
                    { title: 'Total vs Completed', desc: 'Bar chart comparing total requests created vs successfully completed over time' },
                    { title: 'Status Trend', desc: 'Stacked bar chart showing how request statuses change month by month' },
                    { title: 'Average Processing Time', desc: 'Area chart showing how long it takes on average to process requests' },
                    { title: 'Monthly Amount Trend', desc: 'Line chart tracking spending trends - helps identify spending patterns' },
                    { title: 'Top Vendors', desc: 'List showing which vendors you purchase from most frequently' }
                  ].map((chart, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{chart.title}</h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{chart.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Time Period Filters</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Use the time period buttons at the top of the dashboard to view data for different time ranges:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Day', 'Week', 'Month', 'Year'].map((period) => (
                    <span key={period} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                      {period}
                    </span>
                  ))}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Example:</strong> Click "Month" to see all metrics and charts for the current month. 
                    Click "Year" to see annual trends and patterns.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Access Cards</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  The dashboard provides quick access cards to main features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                    <strong>Create New Request:</strong> Quick button to start creating a purchase request
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                    <strong>View Inbox:</strong> Direct link to your inbox for pending tasks
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                    <strong>View Reports:</strong> Access to reports and invoice tracking
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                    <strong>Master Data:</strong> View reference data (departments, suppliers, etc.)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Pro Tip:</strong> Check your dashboard regularly to stay on top of pending actions. 
              The "Pending For Action" metric is especially important - it tells you how many items need your attention.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'master-data',
      title: 'Master Data Reference',
      icon: <Database size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What is Master Data?</strong> Master Data is all the reference information used throughout the application - 
              departments, suppliers, products, account codes, etc. This is the "lookup data" you select from when creating requests.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Available Master Data Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Initiatives', desc: 'Projects or initiatives you can assign to requests' },
                { name: 'Departments', desc: 'Cost centers or departments (e.g., IT, Finance, HR)' },
                { name: 'Suppliers', desc: 'Vendors and suppliers you can purchase from' },
                { name: 'Products/Catalog', desc: 'Product catalog with items you can select' },
                { name: 'Account Codes', desc: 'GL codes for accounting and budget tracking' },
                { name: 'Employees', desc: 'List of employees who can create requests' }
              ].map((type) => (
                <div key={type.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{type.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">How to View Master Data</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Navigate to Master Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "Master Data" from the sidebar menu or dashboard quick access card.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Select Data Type</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click on the tab for the data type you want to view (e.g., "Suppliers", "Departments").
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Browse and Search</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the table to browse all records. You can:
                  </p>
                  <ul className="ml-4 mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Use the search box to find specific records</li>
                    <li>• Use column filters to narrow down results</li>
                    <li>• Click column headers to sort</li>
                    <li>• Adjust page size to see more or fewer records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Managing Master Data (For Administrators)</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> Creating and editing master data typically requires administrator permissions. 
                Most users will only view this data when selecting options in purchase requests.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Creating New Records</h4>
                <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                  <li>Click the <strong>"Create New"</strong> button (top right)</li>
                  <li>Fill in all required fields (marked with red *)</li>
                  <li>Fill in optional fields as needed</li>
                  <li>Click <strong>"Create"</strong> to save</li>
                </ol>
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                  <strong>Example:</strong> Adding a new supplier - enter supplier name, contact email, payment terms, etc.
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Editing Existing Records</h4>
                <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                  <li>Find the record in the table (use search or filters)</li>
                  <li>Click the <strong>"Edit"</strong> button for that row</li>
                  <li>Modify the fields you want to change</li>
                  <li>Click <strong>"Update"</strong> to save changes</li>
                </ol>
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                  <strong>Example:</strong> Updating a supplier's email address or payment terms.
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Why Master Data Matters</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Master Data ensures consistency across all purchase requests:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>✓ <strong>Standardization:</strong> Everyone uses the same department names, supplier names, etc.</li>
                <li>✓ <strong>Accuracy:</strong> Prevents typos and ensures correct data entry</li>
                <li>✓ <strong>Reporting:</strong> Consistent data makes reporting and analysis accurate</li>
                <li>✓ <strong>Validation:</strong> System ensures you can only select valid options</li>
                <li>✓ <strong>Efficiency:</strong> Dropdown selections are faster than typing</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'requisitions',
      title: 'Creating Purchase Requests',
      icon: <ShoppingCart size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What is a Purchase Request?</strong> A Purchase Request (PR) is your formal request to purchase goods or services. 
              Once approved, it becomes a Purchase Order (PO) that is sent to the vendor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Complete Guide: Creating Your First Purchase Request</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Start Creating a New Request</h4>
                </div>
                <div className="ml-13 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Action:</strong> Click "Requests" in the sidebar menu, then click the "Create New Request" button at the top right.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>💡 Tip:</strong> You can also access this from the Dashboard by clicking the "Create New Request" card.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-green-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Fill in Basic Information</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    The form is organized into collapsible sections. Start with the basic information:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Request Number</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Auto-generated by the system (you don't need to fill this)</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Request Date</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Automatically calculated (read-only)</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Requester <span className="text-red-500">*</span></h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Select your name from the dropdown</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Department <span className="text-red-500">*</span></h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Select your department (e.g., "IT Department")</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Lightbulb size={14} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">Click 💡 for AI suggestions</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Supplier</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Select the vendor/supplier (optional, can add later)</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Lightbulb size={14} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">Click 💡 for AI suggestions</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Priority</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Select: Low, Normal, High, or Urgent</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={18} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>AI Smart Suggestions:</strong> Look for the lightbulb icon (💡) next to fields like Department, Supplier, and Initiative. 
                        Click it to see AI-powered suggestions based on your previous requests. This saves time!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Add Line Items (What You're Purchasing)</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Line items are the individual products or services you want to purchase. You can add multiple items to one request.
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Step-by-Step: Adding a Line Item</h5>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex gap-2">
                        <span className="font-bold text-purple-600 dark:text-purple-400">a.</span>
                        <span>Click the <strong>"Add Entry Record"</strong> button</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-purple-600 dark:text-purple-400">b.</span>
                        <span>Fill in the line item details:</span>
                      </li>
                    </ol>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Description:</strong> What you're buying (e.g., "Office Chairs")
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Quantity:</strong> How many (e.g., 10)
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Unit of Measure:</strong> The unit (e.g., "EA" for Each, "KG" for Kilograms)
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Unit Price:</strong> Price per unit (e.g., 150.00)
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Account Code:</strong> GL code for accounting (e.g., "GL-5001")
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                        <strong>Line Amount:</strong> Auto-calculated (Quantity × Unit Price)
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Example:</strong> Buying 10 office chairs at $150 each = Line Amount of $1,500.00
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>✓ Multiple Line Items:</strong> You can add as many line items as needed. 
                      For example, you might need 10 chairs, 5 desks, and 2 printers in one request. 
                      Each item is a separate line item.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-orange-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Add Supporting Documents (Optional but Recommended)</h4>
                </div>
                <div className="ml-13 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Upload documents like quotes, specifications, or purchase justifications to support your request.
                  </p>
                  <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4">
                    <li>1. Click <strong>"Upload Document"</strong> button</li>
                    <li>2. Select files from your computer (PDF, Word, Excel, images)</li>
                    <li>3. Wait for upload to complete (progress bar shows status)</li>
                    <li>4. You can upload multiple documents</li>
                    <li>5. Remove any document by clicking the delete icon if needed</li>
                  </ol>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>💡 Best Practice:</strong> Always attach quotes or vendor emails when available. 
                      This helps approvers make faster decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-red-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Add Justification and Review</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Justification Field <span className="text-red-500">*</span></h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Explain why you need this purchase. Be specific and clear.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs text-gray-600 dark:text-gray-400">
                      <strong>Example:</strong> "Need to replace 10 broken office chairs in the IT department. 
                      Current chairs are causing back pain complaints. Budget approved by department head."
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Review Before Saving</h5>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>✓ Check that all required fields are filled (marked with red *)</li>
                      <li>✓ Verify line item quantities and prices are correct</li>
                      <li>✓ Confirm the total amount matches your expectations</li>
                      <li>✓ Review justification for clarity</li>
                      <li>✓ Ensure documents are uploaded if needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="border-l-4 border-indigo-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Save as Draft or Submit</h4>
                </div>
                <div className="ml-13 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click <strong>"Create Request"</strong> to save your purchase request.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Draft Status</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your request is saved as "Draft". You can edit it later, add more items, or make changes before submitting for approval.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">What Happens Next?</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Once you're ready, the request will go to your manager's Inbox for approval. 
                        You'll be able to track its status in the Requests page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Real-World Example Scenario</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Scenario: Sarah needs to buy office supplies</p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>1. Basic Info:</strong> Sarah selects herself as Requester, "IT Department" as Department, and "Normal" priority.</p>
                <p><strong>2. Line Items:</strong> She adds 3 items:
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>• 20 reams of A4 paper (Quantity: 20, UOM: Ream, Price: $8.50 each)</li>
                    <li>• 10 boxes of pens (Quantity: 10, UOM: Box, Price: $12.00 each)</li>
                    <li>• 5 staplers (Quantity: 5, UOM: EA, Price: $25.00 each)</li>
                  </ul>
                </p>
                <p><strong>3. Total Amount:</strong> System calculates: $170 + $120 + $125 = $415.00</p>
                <p><strong>4. Justification:</strong> "Monthly office supplies replenishment for IT department. Running low on paper and pens."</p>
                <p><strong>5. Documents:</strong> Sarah uploads the vendor quote PDF.</p>
                <p><strong>6. Save:</strong> Sarah clicks "Create Request" and the request is saved as Draft.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Understanding Request Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { status: 'Draft', color: 'gray', desc: 'You can still edit and make changes' },
                { status: 'Pending Approval', color: 'yellow', desc: 'Waiting for manager to review' },
                { status: 'Approved', color: 'green', desc: 'Approved! PO sent to vendor' },
                { status: 'Rejected', color: 'red', desc: 'Request was rejected (check comments)' },
                { status: 'Cancelled', color: 'gray', desc: 'Request was cancelled' }
              ].map((s) => (
                <div key={s.status} className={`p-3 bg-${s.color}-50 dark:bg-${s.color}-900/20 border border-${s.color}-200 dark:border-${s.color}-800 rounded`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-${s.color}-100 text-${s.color}-800 dark:bg-${s.color}-900 dark:text-${s.color}-200`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'inbox',
      title: 'Inbox & Approval Workflow',
      icon: <Inbox size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What is the Inbox?</strong> The Inbox is your task center where you review and approve purchase requests, 
              verify invoices, and handle other workflow tasks. Tasks appear here based on your role and permissions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Understanding Your Inbox</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">👤 For Managers/Approvers</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You see purchase requests waiting for your approval. Review them and approve or reject based on business needs.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">📋 For AP Team</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You see invoices received from vendors. Verify they match approved purchase requests before payment processing.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">✓ For Requesters</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You see confirmation tasks for invoices related to your purchase requests. Confirm details are correct.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Complete Guide: Approving a Purchase Request</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Access Your Inbox</h4>
                </div>
                <div className="ml-13 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click <strong>"Inbox"</strong> from the sidebar menu. You'll see a list of all pending tasks assigned to you.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>💡 Tip:</strong> Tasks are automatically filtered by your role. Managers see approval tasks, 
                      AP team sees invoice review tasks, and requesters see confirmation tasks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-green-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Select a Task to Review</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click on any task card from the left panel. The task details will open on the right side showing:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Request Information:</strong> Requester name, vendor, amount, date
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Justification:</strong> Why the purchase is needed
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Line Items:</strong> All items being purchased with quantities and prices
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Documents:</strong> Attached quotes, specifications, etc.
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Review the Request Details</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Carefully review all information before making a decision:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Checklist for Review:</h5>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        <span>Is the justification clear and reasonable?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        <span>Are the quantities and prices reasonable?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        <span>Is the vendor appropriate for this purchase?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        <span>Does it fit within budget and policy?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        <span>Are supporting documents attached (if needed)?</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>💡 Tip:</strong> Use the Process Tracking section to see the complete history of this request 
                      and understand where it is in the workflow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-orange-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Make Your Decision</h4>
                </div>
                <div className="ml-13 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Approve */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                        Approve the Request
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        If everything looks good, approve the request.
                      </p>
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <p><strong>Steps:</strong></p>
                        <ol className="ml-4 space-y-1 list-decimal">
                          <li>Add a comment (optional but recommended)</li>
                          <li>Click the <strong>"Approve Requisition"</strong> button</li>
                          <li>Confirm your decision</li>
                        </ol>
                      </div>
                      <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <strong>What happens next:</strong>
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400 ml-3">
                          <li>• System generates a Purchase Order (PO) number</li>
                          <li>• Request status changes to "Approved"</li>
                          <li>• Email is automatically sent to the vendor with PO details</li>
                          <li>• Vendor receives the PO and can start preparing the order</li>
                          <li>• Request moves to the next workflow step</li>
                        </ul>
                      </div>
                    </div>

                    {/* Reject */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <XCircle size={18} className="text-red-600 dark:text-red-400" />
                        Reject the Request
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        If the request doesn't meet requirements, reject it with a reason.
                      </p>
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <p><strong>Steps:</strong></p>
                        <ol className="ml-4 space-y-1 list-decimal">
                          <li>Add a <strong>rejection reason</strong> (required)</li>
                          <li>Click the <strong>"Reject"</strong> button</li>
                          <li>Confirm your decision</li>
                        </ol>
                      </div>
                      <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-red-300 dark:border-red-700">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <strong>What happens next:</strong>
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400 ml-3">
                          <li>• Request status changes to "Rejected"</li>
                          <li>• Requester is notified of the rejection</li>
                          <li>• Request stays in the Requests page (not deleted)</li>
                          <li>• Requester can view the rejection reason</li>
                          <li>• Workflow stops for this request</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Real-World Approval Scenario</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Scenario: Michael (Manager) reviews Sarah's office supplies request</p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>1. Michael opens Inbox:</strong> Sees 3 pending approval tasks, including Sarah's request for $415 office supplies.</p>
                <p><strong>2. Reviews details:</strong> 
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>• Request: 20 reams paper, 10 boxes pens, 5 staplers</li>
                    <li>• Total: $415.00</li>
                    <li>• Justification: "Monthly office supplies replenishment"</li>
                    <li>• Vendor quote attached</li>
                  </ul>
                </p>
                <p><strong>3. Decision:</strong> Everything looks good. Michael adds comment: "Approved - within monthly budget"</p>
                <p><strong>4. Clicks Approve:</strong> System generates PO-2024-0123, updates status to "Approved"</p>
                <p><strong>5. Email sent:</strong> Vendor receives email with PO number and order details</p>
                <p><strong>6. Task removed:</strong> Request disappears from Michael's inbox, moves to next workflow step</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Invoice Approval (For AP Team)</h3>
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                When vendors send invoices after receiving a PO, they appear in the AP Team's inbox for verification.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-800">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Step-by-Step: Verifying an Invoice</h5>
                  <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                    <li>Open the invoice task from your inbox</li>
                    <li>Review invoice details (amount, line items, vendor)</li>
                    <li>Compare invoice against the approved purchase request</li>
                    <li>Check that quantities and prices match</li>
                    <li>Verify invoice number and date</li>
                    <li>Click <strong>"Verify Invoice"</strong> if everything matches</li>
                    <li>Or <strong>"Reject"</strong> if there are discrepancies (add rejection reason)</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>⚠️ Important:</strong> If invoice amounts or items don't match the approved request, 
                    reject it with a clear explanation. The requester will be notified to resolve the issue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Understanding Process Tracking</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Each request shows a visual process tracker showing all workflow steps:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {[
                { step: 'REQUEST', desc: 'Request created by requester' },
                { step: 'APPROVAL', desc: 'Waiting for manager approval' },
                { step: 'PO_TO_SAP', desc: 'PO posted to SAP system' },
                { step: 'EMAIL_TRIGGER', desc: 'Email sent to vendor' },
                { step: 'VENDOR_INVOICE', desc: 'Vendor sends invoice' },
                { step: 'AP_REVIEW', desc: 'AP team verifies invoice' },
                { step: 'REQUESTER_APPROVAL', desc: 'Requester confirms invoice' },
                { step: 'POST_TO_SAP', desc: 'Invoice posted for payment' },
                { step: 'PAYMENT', desc: 'Payment processed' }
              ].map((s) => (
                <div key={s.step} className="p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-white">{s.step}</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reports & Invoice Tracking',
      icon: <FileSpreadsheet size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What are Reports?</strong> The Reports section shows all approved purchase requests and tracks their invoices. 
              You can see which items have been invoiced, which are pending, and track the complete invoice-to-payment cycle.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Understanding the Complete Invoice Workflow</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">The Complete Journey:</p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span><strong>Request Created:</strong> Requester creates a purchase request</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span><strong>Request Approved:</strong> Manager approves, system generates PO number</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span><strong>Email to Vendor:</strong> Vendor receives PO via email</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span><strong>Vendor Sends Invoice:</strong> Vendor replies with invoice(s)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                  <span><strong>Invoice Processing:</strong> OCR app processes invoice and creates invoice records</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">6.</span>
                  <span><strong>Invoice Approval:</strong> AP team reviews and approves invoices in Inbox</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">7.</span>
                  <span><strong>Payment Processing:</strong> Approved invoices are processed for payment</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>💡 Important:</strong> A vendor can send multiple invoices for one purchase request. 
                For example, they might send one invoice for some items and another invoice for other items. 
                The Reports section shows all invoices linked to each request.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Step-by-Step: Viewing Reports</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Access Reports</h4>
                </div>
                <div className="ml-13 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click <strong>"Reports"</strong> from the sidebar menu. You'll see a table of all approved purchase requests.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Note:</strong> Only approved requests with PO numbers appear in Reports. 
                      Draft or pending requests are not shown here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-green-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Filter and Search</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Use the filter panel to find specific requests:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Supplier Name:</strong> Type vendor name to filter
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Request Number:</strong> Search by PR number (e.g., PR-2024-0001)
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>PO Number:</strong> Search by PO number (e.g., PO-2024-0123)
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Invoice Number:</strong> Search by invoice number
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <strong>Date Range:</strong> Filter by request date
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>💡 Tip:</strong> You can combine multiple filters. Click "Clear Filters" to reset.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">View Request Details</h4>
                </div>
                <div className="ml-13 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click on any row in the reports table to see detailed information:
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">What You'll See:</h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-xs">📊 Invoice Summary Dashboard</h6>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <li>• <strong>Total Invoices:</strong> How many invoices received for this request</li>
                          <li>• <strong>Total Invoiced Amount:</strong> Sum of all invoice amounts</li>
                          <li>• <strong>Approved Amount:</strong> Amount from approved invoices</li>
                          <li>• <strong>Pending Amount:</strong> Amount from invoices awaiting approval</li>
                          <li>• <strong>Lines with Invoices:</strong> How many PR line items have invoices</li>
                          <li>• <strong>Lines without Invoices:</strong> Which items haven't been invoiced yet</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-xs">📋 PR Line Items & Invoice Status</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          For each line item in the purchase request, you'll see:
                        </p>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <li>• Line number and description</li>
                          <li>• Quantity, unit price, and line amount</li>
                          <li>• <strong>Invoice status:</strong> Has invoice or No invoice</li>
                          <li>• <strong>Total invoiced:</strong> How much has been invoiced for this line</li>
                          <li>• <strong>List of invoices:</strong> All invoices that include this line item</li>
                        </ul>
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            <strong>Example:</strong> If PR Line 1 is for 10 chairs at $150 each ($1,500), 
                            and vendor sends 2 invoices - one for 5 chairs ($750) and another for 5 chairs ($750), 
                            you'll see both invoices listed under Line 1.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-xs">🧾 All Invoices Section</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Complete list of all invoices received for this request:
                        </p>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <li>• Invoice number and date</li>
                          <li>• Invoice status (Submitted, Approved, Rejected)</li>
                          <li>• Total invoice amount</li>
                          <li>• Line items in the invoice</li>
                          <li>• Which PR lines each invoice line maps to</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Real-World Invoice Tracking Scenario</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Scenario: Tracking invoices for Sarah's office supplies request</p>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p><strong>Original Request (PR-2024-0001):</strong></p>
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>• Line 1: 20 reams paper - $170.00</li>
                    <li>• Line 2: 10 boxes pens - $120.00</li>
                    <li>• Line 3: 5 staplers - $125.00</li>
                    <li>• <strong>Total: $415.00</strong></li>
                  </ul>
                </div>
                <div>
                  <p><strong>Vendor sends 2 invoices:</strong></p>
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>• <strong>Invoice INV-001:</strong> 20 reams paper ($170) + 5 boxes pens ($60) = $230.00</li>
                    <li>• <strong>Invoice INV-002:</strong> 5 boxes pens ($60) + 5 staplers ($125) = $185.00</li>
                  </ul>
                </div>
                <div>
                  <p><strong>What Reports shows:</strong></p>
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>• <strong>Total Invoices:</strong> 2</li>
                    <li>• <strong>Total Invoiced:</strong> $415.00 (matches PR total)</li>
                    <li>• <strong>Line 1:</strong> Has invoice (INV-001) - $170 invoiced</li>
                    <li>• <strong>Line 2:</strong> Has invoices (INV-001 + INV-002) - $120 invoiced</li>
                    <li>• <strong>Line 3:</strong> Has invoice (INV-002) - $125 invoiced</li>
                    <li>• <strong>All lines invoiced:</strong> ✓ Complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Understanding Invoice Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { status: 'Submitted', color: 'yellow', desc: 'Invoice received, waiting for AP team review' },
                { status: 'Approved', color: 'green', desc: 'Invoice verified and approved for payment' },
                { status: 'Rejected', color: 'red', desc: 'Invoice rejected (check reason in details)' }
              ].map((s) => (
                <div key={s.status} className={`p-3 bg-${s.color}-50 dark:bg-${s.color}-900/20 border border-${s.color}-200 dark:border-${s.color}-800 rounded`}>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-${s.color}-100 text-${s.color}-800 dark:bg-${s.color}-900 dark:text-${s.color}-200`}>
                    {s.status}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Budget Tracking</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                The Reports section helps you track budget usage:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>• <strong>PR Total Amount:</strong> Original approved amount</li>
                <li>• <strong>Total Invoiced:</strong> How much has been invoiced so far</li>
                <li>• <strong>Remaining:</strong> Difference between PR total and invoiced amount</li>
                <li>• <strong>Lines without invoices:</strong> Items that haven't been invoiced yet (may be pending delivery)</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Additional Information Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Process Tracking History</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  See complete workflow history: when request was created, approved, when emails were sent, 
                  when invoices were received, and all approval steps.
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Audit Logs</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Complete audit trail of all changes: who made changes, when, and what was changed. 
                  Essential for compliance and troubleshooting.
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Related Documents</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  View and download all documents: original quotes, uploaded files, vendor emails, and invoice PDFs.
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Export Functionality</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Export report data to Excel for further analysis, reporting, or sharing with stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'business-rules',
      title: 'Business Rules Management',
      icon: <Settings size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">Business Rules Management allows administrators to configure system settings, automation rules, and business logic.</p>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">General Settings</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Company Information</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Configure company name, date format, timezone, and default currency.</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Request Settings</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Configure "Request Date (Days)" - the number of days from current date that new requests should have as their Request Date. Default is 15 days.</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This setting automatically calculates the Request Date for all new purchase requests.</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notifications</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Configure email preferences for different notification types</li>
              <li>Manage email templates for automated emails</li>
              <li>Create and edit email templates with variables</li>
              <li>Test email templates before activation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Automation Settings</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Configure default posting dates</li>
              <li>Set auto-approval limits</li>
              <li>Configure approval timeout periods</li>
              <li>Set OCR confidence thresholds for invoice processing</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Mapping</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Map purchase request fields to external systems or configure field relationships.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delegation of Authority</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Configure delegation rules to allow users to delegate approval authority to others for specific time periods.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Settings</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Configure which fields are enabled for AI-powered smart suggestions. Enable or disable AI suggestions for specific header and line item fields.</p>
          </div>
        </div>
      )
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: <Users size={20} />,
      content: (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> User Management is only available to users with <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">admin:users</code> permission.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Managing Users</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">View, create, edit, and manage user accounts. Assign roles and permissions to users.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Managing Roles</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Create and manage roles. Assign permissions to roles to control access.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Managing Permissions</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">View and manage granular permissions that control access to features.</p>
          </div>
        </div>
      )
    },
    {
      id: 'table-features',
      title: 'Table Features',
      icon: <FileText size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">All tables in the application support advanced features:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Search size={18} className="text-primary-600 dark:text-primary-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">Search</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Search box searches across all columns in real-time.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Filter size={18} className="text-primary-600 dark:text-primary-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">Filtering</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Column dropdown filters to narrow down results.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <SortAsc size={18} className="text-primary-600 dark:text-primary-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">Sorting</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Click column headers to sort ascending/descending.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-primary-600 dark:text-primary-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">Pagination</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Control page size and navigate through pages.</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Density Options</h3>
            <div className="flex gap-2">
              {['Compact', 'Comfortable', 'Spacious'].map((density) => (
                <span key={density} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  {density}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Select density from dropdown in table header to adjust row spacing.</p>
          </div>
        </div>
      )
    },
    {
      id: 'smart-suggestions',
      title: 'AI Smart Suggestions',
      icon: <Lightbulb size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Save Time with AI:</strong> The Smart Suggestions feature uses AI to learn from your previous purchase requests 
              and suggests the most likely values for common fields. This speeds up form filling significantly!
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">How Smart Suggestions Work</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Look for the Lightbulb Icon</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When creating a purchase request, look for the lightbulb icon (💡) next to fields like Department, Supplier, Initiative, and Account Code.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Click to See Suggestions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the lightbulb icon. The AI analyzes your previous purchase requests and suggests the most likely values based on:
                  </p>
                  <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Your most frequently used values</li>
                    <li>• Patterns in your request history</li>
                    <li>• Context from other fields you've already filled</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Apply a Suggestion</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A panel opens showing suggestions. Click on any suggestion to instantly apply it to the field. 
                    The panel closes automatically after selection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Fields with Smart Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { field: 'Department', desc: 'Suggests departments you use most often' },
                { field: 'Supplier', desc: 'Suggests vendors based on your purchase history' },
                { field: 'Initiative', desc: 'Suggests projects/initiatives you frequently associate with requests' },
                { field: 'Account Code', desc: 'Suggests GL codes you commonly use in line items' }
              ].map((item) => (
                <div key={item.field} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">{item.field}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Real-World Example</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Scenario:</strong> Sarah creates a new purchase request. She clicks the 💡 icon next to "Department".
              </p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>AI Analysis:</strong> The system looks at Sarah's last 20 purchase requests and finds:</p>
                <ul className="ml-6 space-y-1">
                  <li>• 15 requests used "IT Department"</li>
                  <li>• 3 requests used "Finance Department"</li>
                  <li>• 2 requests used "HR Department"</li>
                </ul>
                <p className="mt-2"><strong>Suggestions Shown:</strong></p>
                <ul className="ml-6 space-y-1">
                  <li>• <strong>IT Department</strong> (most likely - 75% of her requests)</li>
                  <li>• Finance Department</li>
                  <li>• HR Department</li>
                  <li>• All other departments (less likely)</li>
                </ul>
                <p className="mt-2"><strong>Sarah's Action:</strong> She clicks "IT Department" and it's instantly filled in. Saves time!</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Pro Tip:</strong> The more purchase requests you create, the smarter the suggestions become! 
              The AI learns your patterns and preferences over time, making suggestions more accurate.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'excel',
      title: 'Excel Import/Export',
      icon: <Download size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Exporting Data</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Navigate to any data table</li>
              <li>Click "Export Excel" button</li>
              <li>Excel file downloads with all current data and filters</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Importing Data</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Click "Download Template" to get the Excel template</li>
              <li>Fill in the template with your data</li>
              <li>Click "Import Excel" and select your file</li>
              <li>Review validation results and confirm import</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: <HelpCircle size={20} />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Work Smarter:</strong> These tips and best practices will help you use the application more efficiently 
              and avoid common mistakes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">General Productivity Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { tip: 'Use Search First', desc: 'Before scrolling through long lists, use the search box. It searches across all columns instantly.' },
                { tip: 'Apply Filters', desc: 'Use column filters to narrow down results. Much faster than scrolling through hundreds of records.' },
                { tip: 'Save as Draft', desc: "Don't rush! Save requests as drafts, review them later, and submit when ready." },
                { tip: 'Review Before Submit', desc: 'Always double-check quantities, prices, and totals before final submission.' },
                { tip: 'Use AI Suggestions', desc: 'Click the 💡 icon to get smart suggestions. Saves time on frequently used fields.' },
                { tip: 'Attach Documents', desc: 'Upload quotes, emails, or specifications. Helps approvers make faster decisions.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{item.tip}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Creating Purchase Requests</h3>
            <div className="space-y-3">
              {[
                { practice: 'Fill Header First', reason: 'Complete all header fields before adding line items. This ensures you have the right context (department, vendor, etc.) when selecting line item details.' },
                { practice: 'Verify Calculations', reason: 'Check that line amounts (Quantity × Unit Price) are correct and the total matches your expectations before saving.' },
                { practice: 'Clear Justification', reason: 'Write a clear, specific justification. Explain why the purchase is needed, not just what you\'re buying. This helps approvers understand the business need.' },
                { practice: 'Set Priority Correctly', reason: 'Use "Urgent" only for truly time-sensitive items. Most requests should be "Normal". Overusing "Urgent" reduces its impact.' },
                { practice: 'Don\'t Edit Request Date', reason: 'The Request Date is automatically calculated based on business rules. You don\'t need to (and can\'t) change it manually.' },
                { practice: 'Use Consistent Naming', reason: 'When entering descriptions, use consistent naming conventions. This helps with reporting and searching later.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">✓ {item.practice}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Inbox & Approval Best Practices</h3>
            <div className="space-y-3">
              {[
                { practice: 'Check Inbox Daily', reason: 'Review your inbox regularly to avoid delays. Pending approvals can block requesters from proceeding.' },
                { practice: 'Add Comments', reason: 'Always add comments when approving or rejecting. This provides context and helps requesters understand decisions.' },
                { practice: 'Review Completely', reason: 'Don\'t rush approvals. Review all line items, documents, and justification before making a decision.' },
                { practice: 'Check Process Tracking', reason: 'Use the process tracker to understand where a request is in the workflow and what happened at each step.' },
                { practice: 'Reject with Clear Reasons', reason: 'If rejecting, provide a clear, actionable reason. This helps requesters fix issues and resubmit correctly.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">✓ {item.practice}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Reports & Tracking</h3>
            <div className="space-y-3">
              {[
                { practice: 'Use Filters Effectively', reason: 'Combine multiple filters to find exactly what you need. For example, filter by supplier AND date range.' },
                { practice: 'Sort for Analysis', reason: 'Sort by amount to find largest purchases, or by date to see recent activity patterns.' },
                { practice: 'Review Invoice Status', reason: 'Regularly check which items have invoices and which are still pending. Follow up with vendors if needed.' },
                { practice: 'Export for Reporting', reason: 'Use the Export function to download data for Excel analysis, presentations, or external reporting.' },
                { practice: 'Check Audit Logs', reason: 'When troubleshooting issues, review audit logs to see what changed and when. Very helpful for resolving discrepancies.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">✓ {item.practice}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Common Mistakes to Avoid</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <div className="space-y-2">
                {[
                  'Entering wrong quantities or prices (always double-check)',
                  'Forgetting to add justification (required field)',
                  'Not attaching quotes when available (slows down approval)',
                  'Using wrong department or cost center (affects budget tracking)',
                  'Submitting without reviewing totals (can lead to incorrect amounts)',
                  'Not checking inbox regularly (causes delays for requesters)',
                  'Approving without reviewing all details (can approve incorrect requests)'
                ].map((mistake, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <XCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Remember:</strong> The application is designed to help you work efficiently. 
              Take advantage of features like AI suggestions, filters, and search to save time. 
              When in doubt, refer back to this User Manual or contact your administrator for help.
            </p>
          </div>
        </div>
      )
    }
]
