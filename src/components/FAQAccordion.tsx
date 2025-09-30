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

  // Parse FAQ content from HTML - multiple methods to catch different formats
  const parseFAQs = (html: string): FAQ[] => {
    const faqs: FAQ[] = []
    
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      
      // Method 1: Look for headings (h1-h6) followed by content
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading) => {
        const question = heading.textContent?.trim()
        if (!question || question.length < 5) return
        
        // Collect all content until the next heading
        let answer = ''
        let nextElement = heading.nextElementSibling
        
        while (nextElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
          answer += nextElement.outerHTML || ''
          nextElement = nextElement.nextElementSibling
        }
        
        if (answer.trim()) {
          faqs.push({
            question: question,
            answer: answer.trim()
          })
        }
      })
      
      // Method 2: If no headings found, look for paragraphs with question marks
      if (faqs.length === 0) {
        const paragraphs = tempDiv.querySelectorAll('p')
        for (let i = 0; i < paragraphs.length - 1; i++) {
          const p = paragraphs[i]
          const question = p.textContent?.trim()
          
          if (question && question.includes('?') && question.length > 10) {
            // Collect next paragraphs as answer until we hit another question
            let answer = ''
            let j = i + 1
            
            while (j < paragraphs.length) {
              const nextP = paragraphs[j]
              const nextText = nextP.textContent?.trim()
              
              if (nextText && nextText.includes('?') && nextText.length > 10) {
                break // Found next question
              }
              
              answer += nextP.outerHTML
              j++
            }
            
            if (answer.trim()) {
              faqs.push({ question, answer: answer.trim() })
            }
          }
        }
      }
      
      // Method 3: Look for strong/bold text followed by content
      if (faqs.length === 0) {
        const strongElements = tempDiv.querySelectorAll('strong, b')
        strongElements.forEach((strong) => {
          const question = strong.textContent?.trim()
          if (!question || question.length < 10) return
          
          // Get the parent paragraph and everything after it until next strong
          let answer = ''
          let currentElement = strong.parentElement
          
          if (currentElement) {
            // Get remaining content in current paragraph after the strong tag
            let nextSibling = strong.nextSibling
            while (nextSibling) {
              if (nextSibling.nodeType === Node.TEXT_NODE) {
                answer += nextSibling.textContent || ''
              } else if (nextSibling.nodeType === Node.ELEMENT_NODE) {
                const elem = nextSibling as Element
                if (['STRONG', 'B'].includes(elem.tagName)) break
                answer += elem.outerHTML
              }
              nextSibling = nextSibling.nextSibling
            }
            
            // Get next sibling elements until we hit another strong/bold
            let nextElement = currentElement.nextElementSibling
            while (nextElement) {
              if (nextElement.querySelector('strong, b')) break
              answer += nextElement.outerHTML
              nextElement = nextElement.nextElementSibling
            }
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

  // If no FAQs could be parsed, show the raw content
  if (faqs.length === 0) {
    return (
      <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    )
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
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
              <div 
                className="text-gray-700 prose prose-sm max-w-none pt-3"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
