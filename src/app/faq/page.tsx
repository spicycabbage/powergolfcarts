'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'FAQ | Godbud.cc',
  description: 'Frequently asked questions about our cannabis products, shipping, and services.',
  alternates: {
    canonical: '/faq',
  },
}

// Edit your FAQ content here
const faqData = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept Interac e-Transfer and Bitcoin payments."
  },
  {
    question: "Do you ship nationwide?",
    answer: "Yes, we ship discreetly to all provinces and territories in Canada where cannabis is legal."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping (2-4 business days) costs $18. Or you can choose Purolator Express (1-3 business days) for $40. We offer free standard shipping if your order is $175 or more."
  },
  {
    question: "Is my order discreetly packaged?",
    answer: "Absolutely! All orders are shipped in plain, unmarked packaging with no indication of contents for complete privacy."
  },
  {
    question: "Are all products lab tested?",
    answer: "Yes, all of our cannabis products undergo rigorous third-party lab testing for potency, pesticides, and contaminants."
  },
  {
    question: "What is your return policy?",
    answer: "Due to the nature of cannabis products, we cannot accept returns. However, if you receive damaged or incorrect items, please contact us within 48 hours."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email to monitor your package's progress."
  },
  {
    question: "How do the loyalty points work?",
    answer: "You earn 1 point for every dollar spent. Points can be redeemed for discounts on future orders. Check your account dashboard to see your current balance."
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>
      </section>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset transition-colors"
                  onClick={() => toggleItem(index)}
                  aria-expanded={openItems.has(index)}
                >
                  <span className="font-medium text-gray-900 pr-4 text-sm md:text-base">{faq.question}</span>
                  {openItems.has(index) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.has(index) && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="text-gray-700 pt-3">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



