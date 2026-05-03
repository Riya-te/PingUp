import React from "react"
import { SignIn } from "@clerk/react"
import logoImage from "../assets/logo.svg"
import heroImage from "../assets/hero.png"
import communityImage from "../assets/group_users.png"

const Login = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Simple background elements - much lighter */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-screen flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-between gap-12">

            {/* Left Section - Hero Content */}
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <img src={logoImage} alt="PingUp logo" className="h-10 w-10" />
                <span className="text-lg font-bold uppercase tracking-widest text-white">pingup</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Social networking reimagined</p>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  More than just <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">friends</span>
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-gray-300 mx-auto lg:mx-0">
                  Connect with global communities, share moments, and stay inspired on PingUp.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto lg:mx-0">
                {[
                  { title: "Global communities", description: "Discover groups and trends from around the world." },
                  { title: "Live messaging", description: "Send fast, secure messages with smooth interactions." },
                  { title: "Premium experience", description: "Polished interface built for creators and developers." },
                  { title: "Safe authentication", description: "Clerk login keeps your account protected." },
                ].map((item) => (
                  <div key={item.title} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-5 text-gray-300">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* Community Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-4">
                  <img src={communityImage} alt="Community" className="h-16 w-16 rounded-2xl object-cover flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Trusted by creators</p>
                    <p className="text-sm font-bold text-white">12k+ developers connect daily</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Sign In Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                  {/* Content */}
                  <div className="p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Secure sign in</p>
                      <h2 className="mt-4 text-3xl font-black tracking-tight text-white">Welcome to PingUp</h2>
                      <p className="mt-3 text-sm leading-6 text-gray-300">Sign in with Google to continue to your feed</p>
                    </div>

                    {/* Sign In Form */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <SignIn
                        path="/"
                        routing="path"
                        redirectUrl="/feed"
                        appearance={{
                          elements: {
                            formButtonPrimary:
                              "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl w-full py-3 text-sm transition-all duration-300 shadow-lg",
                            card: "bg-transparent shadow-none border-0",
                            socialButtonsBlockButton:
                              "border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-300 shadow-sm",
                            dividerLine: "bg-white/10",
                            dividerText: "text-gray-300 text-sm",
                            formFieldInput:
                              "bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:bg-white/10 focus:border-cyan-400 transition-colors",
                            formFieldLabel: "text-white text-sm font-semibold",
                            footer: "hidden",
                          },
                        }}
                      />
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-sm text-white">✨ Mobile optimized</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">Works perfectly on all devices with smooth performance</p>
                    </div>
                  </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-gray-400 mt-6">
                  By signing in, you agree to our Terms and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
