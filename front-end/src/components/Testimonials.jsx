import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Michael R.",
    role: "Forex Trader",
    feedback: "TradeX makes investing straightforward and transparent. Withdrawals are fast and the platform feels secure.",
    rating: 5
  },
  {
    id: 2,
    name: "Aisha K.",
    role: "Crypto Investor",
    feedback: "I appreciate how clear everything is. No hidden fees, no confusion. Just clean investing.",
    rating: 5
  },
  {
    id: 3,
    name: "Daniel T.",
    role: "Portfolio Manager",
    feedback: "The diversification options and professional approach really set TradeX apart.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Investors Say
          </h2>
          <p className="text-lg text-gray-600">
            Trusted by traders and investors worldwide.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-10 h-10 text-blue-600 fill-blue-100" />
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Feedback */}
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.feedback}"
              </p>

              {/* Author Info */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-600">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;