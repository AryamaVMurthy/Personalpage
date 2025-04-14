# Personal Website - Feature Documentation

## Assumptions and Implementation Details

This document outlines the assumptions made while implementing the user interaction tracking system and the text analyzer feature for the personal website.

## 1. User Interaction Tracking System

### General Assumptions
- All user interactions should be logged to the console in the format: `Timestamp, event type, event object`
- Timestamps include both ISO format and Indian Standard Time for better global/local reference
- Events from all DOM elements should be captured, regardless of visibility state
- Console logging is sufficient for this implementation (no server-side storage)

### Event Tracking Assumptions
- Clicks on all interactive elements should be tracked (navigation buttons, content panels, 3D objects)
- Element "viewing" occurs when an element becomes visible in the viewport (using IntersectionObserver)
- An element is considered "viewed" when at least 50% of it enters the viewport
- Hover events on 3D objects merit tracking as they represent significant user interest
- Page load and unload events should be tracked to mark session boundaries

### Element Identification Assumptions
- Elements should be identified by descriptive names rather than technical IDs or classes
- For unknown elements, a fallback description using tag name, ID, and classes is appropriate
- 3D objects should be identified by their panel ID when available
- If no specific identification is possible, a generic description is better than nothing

### Technical Assumptions
- The site will primarily be used on browsers that support modern JavaScript features
- IntersectionObserver API is available for tracking element visibility
- The browser will properly handle and display console logs in the expected format
- The tracking system should not interfere with normal website performance

## 2. Text Analyzer Feature

### General Assumptions
- The analyzer should process text input of potentially large size (10,000+ words)
- Analysis should be performed client-side without requiring server processing
- Results should be displayed on the same page as the input
- The UI should maintain the same futuristic theme as the main website

### Text Analysis Assumptions
- Words are defined as sequences of characters separated by whitespace
- Letters include only alphabetic characters (a-z, A-Z)
- Special symbols include any non-alphanumeric, non-whitespace characters
- Spaces include all whitespace characters except for newlines
- Newlines are counted separately from other whitespace

### Tokenization Assumptions
- Case is irrelevant for word identification (case-insensitive matching)
- Punctuation should be removed before tokenization (except apostrophes)
- Contractions (e.g., "don't") should be preserved as single tokens
- Multi-word phrases (like "according to") should be identified as single units
- Multiple consecutive whitespace characters should be treated as a single delimiter

### Word Classification Assumptions
- The lists of pronouns, prepositions, and indefinite articles are comprehensive but not exhaustive
- Words can belong to multiple categories (e.g., "that" can be both a pronoun and a conjunction)
- Only words that exactly match entries in our predefined lists will be counted
- Compound forms of prepositions (e.g., "onto") are treated as unique prepositions
- Indefinite articles include not just "a" and "an" but also similar determiners

#### Pronouns List
The text analyzer recognizes the following pronouns:
- Personal pronouns: 'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves'
- Demonstrative pronouns: 'this', 'that', 'these', 'those'
- Interrogative pronouns: 'who', 'whom', 'whose', 'which', 'what', 'whoever', 'whomever', 'whatever', 'whichever'
- Relative pronouns: 'who', 'whom', 'whose', 'which', 'that'
- Indefinite pronouns: 'anybody', 'anyone', 'anything', 'each', 'either', 'everybody', 'everyone', 'everything', 'neither', 'nobody', 'no one', 'nothing', 'one', 'somebody', 'someone', 'something', 'both', 'few', 'many', 'several', 'all', 'any', 'most', 'none', 'some', 'more', 'other', 'others', 'another'
- Reflexive pronouns: 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
- Reciprocal pronouns: 'each other', 'one another'

#### Prepositions List
The text analyzer recognizes the following prepositions:
- Simple prepositions: 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'amidst', 'among', 'amongst', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'throughout', 'till', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'unto', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without'
- Complex prepositions: 'according to', 'ahead of', 'apart from', 'as for', 'as of', 'as per', 'as regards', 'aside from', 'back to', 'because of', 'close to', 'due to', 'except for', 'far from', 'in addition to', 'in between', 'in case of', 'in front of', 'in lieu of', 'in place of', 'in point of', 'in spite of', 'instead of', 'near to', 'next to', 'on account of', 'on behalf of', 'on top of', 'opposite to', 'out of', 'owing to', 'prior to', 'pursuant to', 'regardless of', 'subsequent to', 'thanks to', 'together with', 'up to', 'with regard to', 'with respect to'

#### Indefinite Articles List
The text analyzer recognizes the following indefinite articles and similar determiners:
- Basic indefinite articles: 'a', 'an'
- Indefinite determiners: 'some', 'any', 'either', 'neither', 'each', 'every', 'certain', 'another', 'other', 'whatever', 'whichever', 'several', 'many', 'few', 'much'

### Technical Assumptions
- Regular expressions are sufficient for basic text analysis operations
- The browser can handle the memory requirements for processing large text inputs
- Animation effects should enhance user experience without impacting performance
- Sample text is useful for users to test the functionality without having to create their own

## 3. Integration Assumptions

- Both features should operate independently without interfering with each other
- The text analyzer should have its own dedicated page to avoid cluttering the main site
- User interaction tracking should apply to all pages including the text analyzer page
- Navigation between the main site and text analyzer should be intuitive and consistent
- The visual design language should remain consistent across all pages 