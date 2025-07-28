import React from "react";

export default function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      title: "How to Inspect Surplus Transformers",
      excerpt: "A step-by-step guide for contractors and buyers to safely evaluate used high-voltage transformers.",
      linkColor: "text-[#ef4744]"
    },
    {
      id: 2,
      title: "Top 5 Safety Tips for High Voltage Work",
      excerpt: "Essential safety practices for working with and around high-voltage equipment in the field.",
      linkColor: "text-[#ef4744]"
    },
    {
      id: 3,
      title: "Selling Surplus Gear: What You Need to Know",
      excerpt: "Best practices for listing, pricing, and closing deals on surplus industrial equipment.",
      linkColor: "text-[#f0b100]"
    }
  ];

  return (
    <section className="bg-neutral-50 px-4 lg:px-20 py-16">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-staatliches text-[#1b1b1b] text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
          From the Blog
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:h-64">
                <div className="bg-neutral-100 w-full lg:w-40 h-40 lg:h-full flex-shrink-0"></div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#1b1b1b] text-lg leading-7 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-neutral-600 leading-6 mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  <a href="#" className={`${post.linkColor} font-bold hover:underline`}>
                    Read More →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 