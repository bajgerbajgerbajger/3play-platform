'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { 
  HelpCircle, 
  Play, 
  CreditCard, 
  User, 
  Settings, 
  Mail
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

export default function HelpPage() {
  const faqs = [
    {
      id: 'item-1',
      question: 'How do I start watching on 3Play?',
      answer: 'To start watching, simply sign in to your 3Play account, browse our catalog of movies and series, and click on any title to start playing.',
      icon: Play
    },
    {
      id: 'item-2',
      question: 'How much does it cost?',
      answer: 'We offer various plans starting from our Free tier up to Family plans. Check our Pricing page for more details on current subscription options.',
      icon: CreditCard
    },
    {
      id: 'item-3',
      question: 'Can I watch on multiple devices?',
      answer: 'Yes! Depending on your subscription plan, you can stream on multiple devices simultaneously. Our Premium and Family plans support multi-device streaming.',
      icon: User
    },
    {
      id: 'item-4',
      question: 'How do I change my settings?',
      answer: 'You can access your account settings by clicking on your profile icon in the top right corner or selecting "Settings" from the sidebar.',
      icon: Settings
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12 px-4" suppressHydrationWarning>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-600/10 rounded-xl">
            <HelpCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Help Center</h1>
            <p className="text-zinc-400">Find answers to common questions and support.</p>
          </div>
        </div>

        <div className="space-y-8" suppressHydrationWarning>
          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <Accordion className="w-full space-y-4">
              {faqs.map((faq) => {
                const Icon = faq.icon;
                return (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <Icon className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="text-zinc-200 font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
            <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
            <p className="text-zinc-400 mb-6">
              Our support team is available 24/7 to help you with any issues or questions.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Contact Support
            </button>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
