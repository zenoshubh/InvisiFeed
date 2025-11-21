"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Linkedin, Github, Twitter, Coffee } from "lucide-react";

const creators = [
  {
    name: "Shubh Verma",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/zenoshubh",
    github: "https://github.com/zenoshubh",
    twitter: "https://twitter.com/zenoshubh",
    bmc: "https://buymeacoffee.com/zenoshubh",
    description: "",
  },
  {
    name: "Sneha Sharma",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/celersneha/",
    github: "https://github.com/celersneha",
    twitter: "https://twitter.com/celersneha",
    bmc: "https://buymeacoffee.com/celersneha",

    description: "",
  },
];

const socialMediaIcons = [
  { id: "github", icon: Github, label: "GitHub" },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { id: "twitter", icon: Twitter, label: "Twitter" },
  { id: "bmc", icon: Coffee, label: "Buy Me a Coffee" },
];

export default function SocialMediaPopup({
  isOpen,
  onClose,
  initialSocialMedia,
}) {
  const [socialMediaSwitch, setSocialMediaSwitch] = useState(
    initialSocialMedia || "github"
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSocialMediaSwitch(initialSocialMedia || "github");
      setSelectedIndex(
        socialMediaIcons.findIndex(
          (icon) => icon.id === (initialSocialMedia || "github")
        )
      );
    }
  }, [isOpen, initialSocialMedia]);

  const handleSocialMediaChange = (id, index) => {
    setSocialMediaSwitch(id);
    setSelectedIndex(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0A0A0A] rounded-xl border border-yellow-400/20 p-4 max-w-[85vw] w-full max-h-[85vh] flex flex-col justify-between relative overflow-hidden md:max-w-[40vw]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-yellow-400/10 transition-colors z-10"
            >
              <X className="h-4 w-4 text-yellow-400" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent"
              >
                Meet Our Creators
              </motion.h2>
            </div>

            {/* Switch Social Media Icons */}
            <div className="flex justify-center mb-4 relative">
              <div className="flex items-center space-x-1 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-full p-0.5 border border-yellow-400/10">
                {socialMediaIcons.map(({ id, icon: Icon, label }, index) => (
                  <button
                    key={id}
                    onClick={() => handleSocialMediaChange(id, index)}
                    className={`relative px-3 py-1.5 rounded-full transition-colors ${
                      selectedIndex === index
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {selectedIndex === index && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-yellow-400/10 rounded-full"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {creators.map((creator, index) => (
                <motion.div
                  key={creator.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 p-3 hover:border-yellow-400/20 transition-all duration-300 group hover:shadow-lg hover:shadow-yellow-400/5"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-xs text-gray-400">{creator.role}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {creator.description}
                      </p>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={socialMediaSwitch}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {socialMediaSwitch === "github" && (
                            <a
                              href={creator.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Github className="h-3 w-3" />
                              <span className="text-xs">Connect on GitHub</span>
                            </a>
                          )}
                          {socialMediaSwitch === "linkedin" && (
                            <a
                              href={creator.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Linkedin className="h-3 w-3" />
                              <span className="text-xs">
                                Connect on LinkedIn
                              </span>
                            </a>
                          )}
                          {socialMediaSwitch === "twitter" && (
                            <a
                              href={creator.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Twitter className="h-3 w-3" />
                              <span className="text-xs">
                                Connect on Twitter
                              </span>
                            </a>
                          )}
                          {socialMediaSwitch === "bmc" && (
                            <a
                              href={creator.bmc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Coffee className="h-3 w-3" />
                              <span className="text-xs">
                                Support <span>{creator.name}</span>{" "}
                              </span>
                            </a>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-500">
                Follow us to stay updated with our latest developments and
                insights
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
