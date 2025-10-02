'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

// Power Golf Carts FAQ content
const faqData = [
  {
    question: "Where is my order shipping from and how long will it take to receive my order?",
    answer: "Your items will be shipped out within 1-2 business days from Burnaby, BC, Canada. Usually after you place your order and the payment is confirmed, we will provide your shipping label number for trackable items within a day. Normally you will receive your order within 1-8 business days for most of the customers who live in Canada and United States, it depends on your location. We usually ship with the local carriers, e.g., UPS, FedEX, Canpar Express, USPS and Canada Post. For US customers, generally orders under $800 USD (not including shipping costs) are duty free. However, any taxes, customs or duty fees are the responsibility of the purchaser."
  },
  {
    question: "Will I receive a shipment tracking number?",
    answer: "Yes, for most of the trackable packages, tracking information is emailed after shipment is confirmed."
  },
  {
    question: "How does Power Golf Carts E-Cart slow down or stop on a hill?",
    answer: "These E-Carts have down hills slope control, they will slow down by themselves when they go down of the hills. Or you can use hand dial or remote control to slow or stop your E-Cart."
  },
  {
    question: "How do I park my E-Cart on a hill?",
    answer: "When you park your E-Cart on a hill, you should park it at a 90 degree angle to the slope, avoid parking the E-Cart facing up or down the hill."
  },
  {
    question: "Can I use my E-Cart in the rain?",
    answer: "Under normal conditions rain will not damage the E-Cart, but make sure the battery and socket are covered. When you hook up your battery on the E-Cart, please make sure the round, black socket is dry. If there is moisture inside the socket and you plug the battery into it, you can damage your battery and the E-Cart's controller. The battery in this case will not be covered under the warranty."
  },
  {
    question: "How do I clean my E-Cart?",
    answer: "The best way to clean the E-Cart is to wipe off any excess dirt, grass or mud with a wet towel. It will help to reduce the risk of damaging the electronics parts in the E-Cart. To clean the wheels, you can remove the both side wheels and rear wheel, rinse under the water or wipe with a wet towel. Do not use high pressure water to clean the E-Cart."
  },
  {
    question: "What do I do if there is a problem with my E-Cart?",
    answer: "If there are any problems contact us via Chat, email at info@powergolfcarts.com or text us at 1-604-319-4330. In most cases the problem can be solved with an easy-installed replacement component that will be shipped to you. In rare cases, you will have to ship the E-Cart to us for repair or replacement. Please check the specific warranty information on the specific product pages on our website."
  }
]

export default function FAQAccordion() {
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
    <div className="space-y-4">
      {/* FAQ Items */}
      <div className="space-y-3">
        {faqData.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset transition-colors"
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.has(index)}
            >
              <span className="font-medium text-gray-900 pr-4 text-sm md:text-base">
                {faq.question}
              </span>
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
  )
}
