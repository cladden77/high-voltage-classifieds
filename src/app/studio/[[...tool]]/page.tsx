/**
 * This route provides access to the Sanity Studio for content management.
 * Since the managed studio is not set up, this page provides instructions.
 */

export const dynamic = 'force-static';

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sanity Studio Access
          </h1>
          
          <div className="space-y-4 text-gray-600">
            <p>
              To access your Sanity Studio for content management:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Option 1: Create Managed Studio
              </h3>
              <p className="text-sm text-blue-800">
                1. Go to <a href="https://sanity.io/manage" className="underline">sanity.io/manage</a><br/>
                2. Create a new project or select existing<br/>
                3. Access your studio from there
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">
                Option 2: Local Development
              </h3>
              <p className="text-sm text-green-800">
                Run <code className="bg-gray-100 px-1 rounded">npx sanity dev</code> in your project directory
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Current Setup
              </h3>
              <p className="text-sm text-yellow-800">
                • Project ID: <code className="bg-gray-100 px-1 rounded">e25wrks8</code><br/>
                • Dataset: <code className="bg-gray-100 px-1 rounded">production</code><br/>
                • Blog posts are working and fetching from Sanity
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
