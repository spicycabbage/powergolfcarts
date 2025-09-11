'use client'

import JsonLd from './JsonLd'

interface FAQSchemaProps {
  htmlContent: string
  pageUrl: string
}

export default function FAQSchema({ htmlContent, pageUrl }: FAQSchemaProps) {
  if (!htmlContent) return null

  // Parse FAQ content from HTML
  const parseFAQs = (html: string) => {
    const faqs: Array<{ question: string; answer: string }> = []
    
    try {
      // Create a temporary DOM element to parse HTML
      if (typeof window === 'undefined') return faqs
      
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
          answer += nextElement.textContent?.trim() + ' '
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
        const answer = dd?.textContent?.trim()
        
        if (question && answer && dd?.tagName === 'DD') {
          faqs.push({ question, answer })
        }
      })
      
      // Method 3: Look for strong/b tags followed by content (common pattern)
      const strongElements = tempDiv.querySelectorAll('strong, b')
      strongElements.forEach((strong) => {
        const question = strong.textContent?.trim()
        if (!question || question.length < 10) return // Skip if too short
        
        let answer = ''
        let nextNode = strong.nextSibling
        
        // Collect text until we hit another strong/b or significant break
        while (nextNode && nextNode !== strong.parentElement?.nextElementSibling) {
          if (nextNode.nodeType === Node.TEXT_NODE) {
            answer += nextNode.textContent?.trim() + ' '
          } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
            const element = nextNode as Element
            if (['STRONG', 'B'].includes(element.tagName)) break
            answer += element.textContent?.trim() + ' '
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
      
    } catch (error) {
      console.warn('Error parsing FAQ content:', error)
    }
    
    // Remove duplicates and filter out invalid entries
    const uniqueFAQs = faqs.filter((faq, index, arr) => 
      faq.question.length > 5 && 
      faq.answer.length > 10 &&
      arr.findIndex(f => f.question === faq.question) === index
    )
    
    return uniqueFAQs.slice(0, 20) // Limit to 20 FAQs
  }

  const faqs = parseFAQs(htmlContent)
  
  if (faqs.length === 0) return null

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq, index) => ({
      '@type': 'Question',
      '@id': `${pageUrl}#faq-${index + 1}`,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return <JsonLd data={faqSchema} />
}
