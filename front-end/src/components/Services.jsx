import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Bitcoin, Building2 } from 'lucide-react';

const services = [
  {
    id: 1,
    title: "Agriculture",
    icon: Sprout,
    description: "Investing in agriculture supports food production and distribution in a growing global economy, offering stable and long-term value."
  },
  {
    id: 2,
    title: "Cryptocurrency",
    icon: Bitcoin,
    description: "Trade cryptocurrencies through price movements without owning the asset. Enjoy competitive spreads and zero commission trading."
  },
  {
    id: 3,
    title: "Real Estate",
    icon: Building2,
    description: "Gain exposure to property markets through managed real estate investments focused on capital growth and income stability."
  }
];

const Services = () => {
  return (
    <section className="py-20 bg-white">
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
            Services We Offer
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Diversified investment opportunities built for long-term growth.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;