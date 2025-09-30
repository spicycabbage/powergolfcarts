'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQ {
  question: string
  answer: string
}

interface FAQAccordionProps {
  htmlContent: string
}

export default function FAQAccordion({ htmlContent }: FAQAccordionProps) {
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

  // Parse FAQ content from HTML
  const parseFAQs = (html: string): FAQ[] => {
    const faqs: FAQ[] = []
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      
      // Method 1: Look for h2/h3 followed by p/div patterns
      const headings = tempDiv.querySelectorAll('h2, h3, h4')
      headings.forEach((heading) => {
        const question = heading.textContent?.trim()
        if (!question) return
        
        // Get the next sibling elements until we hit another heading
        let answer = ''
        let nextElement = heading.nextElementSibling
        
        while (nextElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
          answer += nextElement.outerHTML || nextElement.textContent || ''
          nextElement = nextElement.nextElementSibling
        }
        
        if (answer.trim()) {
          faqs.push({
            question: question,
            answer: answer.trim()
          })
        }
      })
      
      // Method 2: Look for dt/dd pairs (definition lists)
      const dts = tempDiv.querySelectorAll('dt')
      dts.forEach((dt) => {
        const question = dt.textContent?.trim()
        const dd = dt.nextElementSibling
        const answer = dd?.innerHTML?.trim()
        
        if (question && answer && dd?.tagName === 'DD') {
          faqs.push({ question, answer })
        }
      })
      
      // Method 3: Look for strong/b tags followed by content (common pattern)
      if (faqs.length === 0) {
        const strongElements = tempDiv.querySelectorAll('strong, b')
        strongElements.forEach((strong) => {
          const question = strong.textContent?.trim()
          if (!question || question.length < 10) return // Skip if too short
          
          let answer = ''
          let nextNode = strong.nextSibling
          
          // Collect HTML until we hit another strong/b or significant break
          while (nextNode && nextNode !== strong.parentElement?.nextElementSibling) {
            if (nextNode.nodeType === Node.TEXT_NODE) {
              answer += nextNode.textContent?.trim() + ' '
            } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
              const element = nextNode as Element
              if (['STRONG', 'B'].includes(element.tagName)) break
              answer += element.outerHTML + ' '
            }
            nextNode = nextNode.nextSibling
          }
          
          if (answer.trim() && answer.length > 20) {
            faqs.push({
              question: question,
              answer: answer.trim()
            })
          }
        })
      }
      
    } catch (error) {
      console.warn('Error parsing FAQ content:', error)
    }
    
    // Remove duplicates and filter out invalid entries
    const uniqueFAQs = faqs.filter((faq, index, arr) => 
      faq.question.length > 5 && 
      faq.answer.length > 10 &&
      arr.findIndex(f => f.question === faq.question) === index
    )
    
    return uniqueFAQs
  }

  const faqs = parseFAQs(htmlContent)

  if (faqs.length === 0) {
    // Fallback: render raw HTML if no FAQs could be parsed
    return (
      <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    )
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
            onClick={() => toggleItem(index)}
            aria-expanded={openItems.has(index)}
          >
            <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
            {openItems.has(index) ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          {openItems.has(index) && (
            <div className="px-6 pb-4">
              <div 
                className="text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
