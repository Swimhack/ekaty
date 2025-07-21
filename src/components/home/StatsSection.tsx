import { Users, Star, MapPin, ChefHat } from 'lucide-react'

interface StatsSectionProps {
  restaurantCount: number
  reviewCount: number
}

export default function StatsSection({ restaurantCount, reviewCount }: StatsSectionProps) {
  const stats = [
    {
      icon: ChefHat,
      value: restaurantCount.toLocaleString(),
      label: 'Restaurants',
      description: 'Local dining establishments'
    },
    {
      icon: Star,
      value: reviewCount.toLocaleString(),
      label: 'Reviews',
      description: 'Honest community feedback'
    },
    {
      icon: Users,
      value: '12,000+',
      label: 'Community Members',
      description: 'Active local food lovers'
    },
    {
      icon: MapPin,
      value: '20+',
      label: 'Katy Areas',
      description: 'Neighborhoods covered'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-ekaty-500 to-ekaty-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Trusted by the Katy Community
          </h2>
          <p className="text-xl text-ekaty-100 max-w-3xl mx-auto">
            Join thousands of locals who rely on eKaty.com for their dining decisions
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon size={32} className="text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-ekaty-100">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Community features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Verified Reviews
            </h3>
            <p className="text-ekaty-100">
              All reviews come from real customers with verified dining experiences
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Local Focus
            </h3>
            <p className="text-ekaty-100">
              Dedicated exclusively to Katy's dining scene and local favorites
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Community Driven
            </h3>
            <p className="text-ekaty-100">
              Built by locals, for locals, with insights you won't find anywhere else
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}