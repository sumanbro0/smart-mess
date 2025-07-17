import React from "react";
import {
  Utensils,
  Coffee,
  ChefHat,
  QrCode,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";
const Cover = () => {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ height: "100dvh", maxHeight: "100dvh" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)] animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,206,84,0.2),transparent_50%)] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Floating particles - responsive positioning */}
      <div
        className="absolute top-10 sm:top-20 left-4 sm:left-10 w-1 sm:w-2 h-1 sm:h-2 bg-yellow-400 rounded-full animate-bounce opacity-60"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-20 sm:top-40 right-8 sm:right-16 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-60"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute bottom-16 sm:bottom-32 left-10 sm:left-20 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-purple-400 rounded-full animate-bounce opacity-60"
        style={{ animationDelay: "2.5s" }}
      ></div>

      {/* Top accent bar with gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full h-full px-4 sm:px-6 p-4">
        {/* Main title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-2 sm:mb-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent leading-tight">
            Smart Mess
          </h1>
          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-wide">
              MENU
            </h2>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
              <Sparkles
                className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6 text-yellow-400 animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-pink-500"></div>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
            <div className="w-12 sm:w-20 md:w-28 h-px bg-gradient-to-r from-pink-500 to-purple-500"></div>
            <Star
              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center max-w-xs sm:max-w-md lg:max-w-xl mb-6 sm:mb-8">
          <p className="text-sm sm:text-base md:text-lg lg:text-lg text-gray-300 font-medium leading-relaxed">
            Experience the future of dining with our
            <span className="text-yellow-400 font-semibold">
              {" "}
              QR-powered
            </span>{" "}
            menu system
          </p>
          <p className="text-xs sm:text-sm md:text-base text-secondary mt-1 sm:mt-2 font-light">
            Seamless • Modern • Efficient
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-4 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl xl:max-w-2xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <QrCode className="w-6 h-6 sm:w-8 md:w-10 lg:w-10 sm:h-8 md:h-10 lg:h-10 text-yellow-400 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-3" />
            <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm md:text-base">
              QR Menu
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm">Instant access</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Clock className="w-6 h-6 sm:w-8 md:w-10 lg:w-10 sm:h-8 md:h-10 lg:h-10 text-pink-400 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-3" />
            <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm md:text-base">
              Real-time
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm">Live updates</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-6 h-6 sm:w-8 md:w-10 lg:w-10 sm:h-8 md:h-10 lg:h-10 text-purple-400 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-3" />
            <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm md:text-base">
              Smart
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm">AI powered</p>
          </div>
        </div>
      </div>

      {/* Bottom section with QR code */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black/50 to-transparent pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 md:pb-6">
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4 border border-white/30">
              <QrCode className="w-8 h-8 sm:w-10 md:w-12 lg:w-12 sm:h-10 md:h-12 lg:h-12 text-white animate-pulse" />
            </div>
            <p className="text-white/80 text-xs sm:text-sm font-medium px-4 text-center">
              Scan to Begin Your Culinary Journey
            </p>
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"></div>
    </div>
  );
};

export default Cover;
