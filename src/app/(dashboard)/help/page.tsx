import { HelpCircle, Book, MessageCircle, Mail, ExternalLink, ChevronRight } from 'lucide-react'

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of MyReDeal 2.0',
    icon: Book,
    href: '#',
  },
  {
    title: 'Contact Support',
    description: 'Reach out to our team for help',
    icon: MessageCircle,
    href: '#',
  },
  {
    title: 'Email Support',
    description: 'tc@myredeal.com',
    icon: Mail,
    href: 'mailto:tc@myredeal.com',
  },
]

const faqs = [
  {
    question: 'How do I create a new deal?',
    answer: 'Navigate to the Deals page and click "New Deal". Fill in the property address, select the deal side (Buy, Sell, Dual, or Referral), and add the agents involved.',
  },
  {
    question: 'How do deal milestones work?',
    answer: 'Each deal progresses through customizable milestones. As a TC, you can update milestone status, which automatically triggers notifications to relevant parties.',
  },
  {
    question: 'Can I manage multiple organizations?',
    answer: 'Yes! MyReDeal supports multi-tenant operations. You can switch between organizations from the settings page.',
  },
  {
    question: 'How does the communication system work?',
    answer: 'All emails and messages linked to a deal are automatically tracked in the Communications tab. Each communication gets a unique ID for easy reference.',
  },
]

export default function HelpPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">Help & Support</h1>
        <p className="text-sm text-brand-text-muted mt-1">Find answers and get help</p>
      </div>

      {/* Quick Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {resources.map((resource) => (
          <a
            key={resource.title}
            href={resource.href}
            className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm hover:border-brand-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <resource.icon className="h-5 w-5 text-brand-primary" />
              </div>
              <ExternalLink className="h-4 w-4 text-brand-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm font-semibold text-brand-text">{resource.title}</h3>
            <p className="text-xs text-brand-text-muted mt-1">{resource.description}</p>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm">
        <div className="p-6 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-text-muted" />
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-brand-border">
          {faqs.map((faq) => (
            <div key={faq.question} className="p-6">
              <h3 className="text-sm font-semibold text-brand-text mb-2 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-brand-primary" />
                {faq.question}
              </h3>
              <p className="text-sm text-brand-text-secondary pl-6">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
