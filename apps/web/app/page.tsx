import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Users, Shield, Zap } from "lucide-react"

export default async function Page() {
  const user = await currentUser()

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navbar />
      <Hero />

      {/* Features Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Intelligence</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Smart task creation, predictive insights, and automated workflows powered by multiple AI providers.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-Time Collaboration</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Live cursors, instant notifications, and seamless team communication in one unified workspace.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-300">
                SSO integration, role-based permissions, and comprehensive audit trails for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
