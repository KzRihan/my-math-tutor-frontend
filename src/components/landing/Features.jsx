import Card from '@/components/ui/Card';
import { FaCamera, FaRobot, FaChartBar, FaMagic, FaBullseye, FaChartLine } from 'react-icons/fa';

const features = [
  {
    icon: FaCamera,
    title: 'Snap to Solve',
    description: 'Take a photo of any math problem - printed or handwritten. Our AI instantly converts it to digital format.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaRobot,
    title: 'Socratic AI Tutor',
    description: 'Learn through guided discovery. Our AI asks the right questions to help you understand, never just gives answers.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: FaChartBar,
    title: 'Adaptive Learning',
    description: 'From Grade 1 to College - the platform adapts to your level and learning pace automatically.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: FaMagic,
    title: 'Step-by-Step Solutions',
    description: 'Watch problems break down into manageable steps with beautiful LaTeX rendering.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: FaBullseye,
    title: 'Personalized Practice',
    description: 'Get custom problems based on your weak areas. Master concepts with targeted exercises.',
    gradient: 'from-indigo-500 to-violet-500'
  },
  {
    icon: FaChartLine,
    title: 'Progress Tracking',
    description: 'Visualize your improvement with detailed analytics and mastery scores for each topic.',
    gradient: 'from-rose-500 to-pink-500'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge badge-primary mb-4">Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Excel in Math</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="default"
              interactive
              className="group"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-white`}>
                <feature.icon />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
