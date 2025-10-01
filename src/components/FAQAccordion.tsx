'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

// Insanity Golf E-Cart FAQ content with bilingual support
const faqData = [
  {
    question: "Where is my order shipping from and how long will it take to receive my order?",
    questionFr: "D'où ma commande est-elle expédiée et combien de temps faudra-t-il pour recevoir ma commande?",
    answer: "Your items will be shipped out within 1-2 business days from Burnaby, BC, Canada. Usually after you place your order and the payment is confirmed, we will provide your shipping label number for trackable items within a day. Normally you will receive your order within 1-8 business days for most of the customers who live in Canada and United States, it depends on your location. We usually ship with the local carriers, e.g., UPS, FedEX, Canpar Express, USPS and Canada Post. For US customers, generally orders under $800 USD (not including shipping costs) are duty free. However, any taxes, customs or duty fees are the responsibility of the purchaser.",
    answerFr: "Vos articles seront expédiés sous 1 à 2 jours ouvrables depuis Burnaby, en Colombie-Britannique, au Canada. Généralement, après avoir passé votre commande et confirmé votre paiement, nous vous fournirons votre numéro d'étiquette d'expédition pour les articles traçables sous un jour. Normalement, vous recevrez votre commande dans un délai de 1 à 8 jours ouvrables pour la plupart des clients qui vivent au Canada et aux États-Unis, cela dépend de votre emplacement. Nous expédions généralement avec les transporteurs locaux, par exemple UPS, FedEX, Canpar Express, USPS et Postes Canada. Pour les clients américains, les commandes inférieures à 800 USD (hors frais de livraison) sont généralement exonérées de droits de douane. Toutefois, les taxes, frais de douane ou droits de douane sont à la charge de l'acheteur."
  },
  {
    question: "Will I receive a shipment tracking number?",
    questionFr: "Vais-je recevoir un numéro de suivi d'expédition?",
    answer: "Yes, for most of the trackable packages, tracking information is emailed after shipment is confirmed.",
    answerFr: "Oui, pour la plupart des colis traçables, les informations de suivi sont envoyées par courrier électronique une fois l'expédition confirmée."
  },
  {
    question: "How does Insanity Golf E-Cart slow down or stop on a hill?",
    questionFr: "Comment Insanity Golf E-Cart ralentit-il ou s'arrête-t-il sur une colline?",
    answer: "These E-Carts have down hills slope control, they will slow down by themselves when they go down of the hills. Or you can use hand dial or remote control to slow or stop your E-Cart.",
    answerFr: "Ces E-Carts disposent d'un contrôle de pente en descente, ils ralentiront d'eux-mêmes lorsqu'ils descendent les collines. Ou vous pouvez utiliser une molette ou une télécommande pour ralentir ou arrêter votre E-Cart."
  },
  {
    question: "How do I park my E-Cart on a hill?",
    questionFr: "Comment garer mon E-Cart sur une colline?",
    answer: "When you park your E-Cart on a hill, you should park it at a 90 degree angle to the slope, avoid parking the E-Cart facing up or down the hill.",
    answerFr: "Lorsque vous garez votre E-Cart sur une colline, vous devez le garer à un angle de 90 degrés par rapport à la pente, évitez de garer l'E-Cart face vers le haut ou vers le bas de la colline."
  },
  {
    question: "Can I use my E-Cart in the rain?",
    questionFr: "Puis-je utiliser mon E-Cart sous la pluie?",
    answer: "Under normal conditions rain will not damage the E-Cart, but make sure the battery and socket are covered. When you hook up your battery on the E-Cart, please make sure the round, black socket is dry. If there is moisture inside the socket and you plug the battery into it, you can damage your battery and the E-Cart's controller. The battery in this case will not be covered under the warranty.",
    answerFr: "Dans des conditions normales, la pluie n'endommagera pas l'E-Cart, mais assurez-vous que la batterie et la prise sont couvertes. Lorsque vous branchez votre batterie sur l'E-Cart, assurez-vous que la prise ronde noire est sèche. S'il y a de l'humidité à l'intérieur de la prise et que vous branchez la batterie dessus, vous pouvez endommager votre batterie et le contrôleur de l'E-Cart. Dans ce cas, la batterie ne sera pas couverte par la garantie."
  },
  {
    question: "How do I clean my E-Cart?",
    questionFr: "Comment nettoyer mon E-Cart?",
    answer: "The best way to clean the E-Cart is to wipe off any excess dirt, grass or mud with a wet towel. It will help to reduce the risk of damaging the electronics parts in the E-Cart. To clean the wheels, you can remove the both side wheels and rear wheel, rinse under the water or wipe with a wet towel. Do not use high pressure water to clean the E-Cart.",
    answerFr: "La meilleure façon de nettoyer l'E-Cart est d'essuyer tout excès de saleté, d'herbe ou de boue avec une serviette humide. Cela contribuera à réduire le risque d'endommager les composants électroniques de l'E-Cart. Pour nettoyer les roues, vous pouvez retirer les deux roues latérales et la roue arrière, les rincer sous l'eau ou les essuyer avec une serviette humide. N'utilisez pas d'eau à haute pression pour nettoyer l'E-Cart."
  },
  {
    question: "What do I do if there is a problem with my E-Cart?",
    questionFr: "Que dois-je faire en cas de problème avec mon E-Cart?",
    answer: "If there are any problems contact us via Chat, email at info@insanitygolf.ca or text us at 1-604-319-4330. In most cases the problem can be solved with an easy-installed replacement component that will be shipped to you. In rare cases, you will have to ship the E-Cart to us for repair or replacement. Please check the specific warranty information on the specific product pages on our website.",
    answerFr: "En cas de problème, contactez-nous via Chat, par e-mail à info@insanitygolf.ca ou par SMS au 1-604-319-4330. Dans la plupart des cas, le problème peut être résolu avec un composant de remplacement facile à installer qui vous sera expédié. Dans de rares cas, vous devrez nous renvoyer votre E-Cart pour réparation ou remplacement. Veuillez consulter les informations de garantie spécifiques sur les pages produit de notre site web."
  }
]

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const [language, setLanguage] = useState<'en' | 'fr'>('en')

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
      {/* Language Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex border-2 border-gray-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
              language === 'en'
                ? 'bg-white text-gray-900 shadow-md border border-gray-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
              language === 'fr'
                ? 'bg-white text-gray-900 shadow-md border border-gray-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🇫🇷 Français
          </button>
        </div>
      </div>

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
                {language === 'en' ? faq.question : faq.questionFr}
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
                  {language === 'en' ? faq.answer : faq.answerFr}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
