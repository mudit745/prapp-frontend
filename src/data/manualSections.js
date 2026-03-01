import { Home, Shield, BarChart3, Database, ShoppingCart, Inbox, FileSpreadsheet, Settings, Users, FileText, Lightbulb, Download, HelpCircle, CheckCircle2, AlertCircle, XCircle, DollarSign, Clock } from 'lucide-react'

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
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">What You Need</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">✓ Web Browser</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chrome, Firefox, Safari, or Edge (latest version recommended)</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">✓ User Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your email address registered in the system</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">✓ Internet Connection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stable connection for accessing the application</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">✓ Access URL</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Application URL provided by your administrator</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Step-by-Step: First Login</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">1</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Open the Application</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Open your web browser and navigate to the application URL provided by your administrator. 
                    The login page will appear automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">2</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Enter Your Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type your registered email address in the email field. 
                    <strong className="text-gray-900 dark:text-white"> Example:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">sarah.lim@org.sg</code>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">3</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Click Sign In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the "Sign in" button or press Enter. The system will validate your credentials and log you in.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">4</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Welcome to Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After successful login, you'll be automatically redirected to the Dashboard, your home page in the application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Understanding Your Role</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">👤 Requestor</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  You can create purchase requests, view your requests, and track their status through the approval process.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What you'll do:</strong> Create purchase requests for goods or services your department needs.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">✅ Approver/Manager</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  You review and approve purchase requests in your Inbox. You can approve, reject, or request changes.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What you'll do:</strong> Review purchase requests and make approval decisions based on business needs and budget.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-3">📋 AP Team (Accounts Payable)</h4>
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
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Navigation Overview</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-3xl">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                The application has a sidebar menu on the left with the following main sections:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                  <span><strong>Dashboard:</strong> Overview of your procurement activities and statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                  <span><strong>Requests:</strong> Create and manage your purchase requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                  <span><strong>Inbox:</strong> Review and approve pending tasks (for approvers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                  <span><strong>Reports:</strong> View approved requests and track invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
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
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">How to Log In</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-lg">1</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Enter Your Email</h4>
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
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-medium text-lg">2</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Click Sign In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the "Sign in" button or press Enter on your keyboard. 
                    The system will validate your email and log you in.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-lg">3</div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Access Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After successful login, you'll be automatically redirected to your Dashboard, 
                    where you can see your procurement overview and quick access to all features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Staying Logged In</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-3xl border border-gray-200 dark:border-gray-600">
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
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Logging Out</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
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
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Troubleshooting Login Issues</h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="space-y-4">
              {[
                { issue: "Can't log in", solution: "Verify your email address is correct and registered in the system. Contact your administrator if you don't have an account." },
                { issue: "Redirected back to login", solution: "Your session may have expired. Try logging in again. If it persists, contact support." },
                { issue: "Email not recognized", solution: "Your email may not be registered yet. Contact your administrator to create your account." }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">{item.issue}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ]
