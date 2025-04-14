// Text Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    // Character count elements
    const letterCount = document.getElementById('letter-count');
    const wordCount = document.getElementById('word-count');
    const spaceCount = document.getElementById('space-count');
    const newlineCount = document.getElementById('newline-count');
    const specialCount = document.getElementById('special-count');
    
    // Table body elements
    const pronounTableBody = document.getElementById('pronoun-table-body');
    const prepositionTableBody = document.getElementById('preposition-table-body');
    const articleTableBody = document.getElementById('article-table-body');
    
    // Lists of pronouns, prepositions, and indefinite articles - EXACTLY matching readme.txt
    const pronouns = [
        // Personal pronouns
        'i', 'me', 'my', 'mine', 'myself',
        'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself',
        'we', 'us', 'our', 'ours', 'ourselves',
        'they', 'them', 'their', 'theirs', 'themselves',
        
        // Demonstrative pronouns
        'this', 'that', 'these', 'those',
        
        // Interrogative pronouns
        'who', 'whom', 'whose', 'which', 'what',
        'whoever', 'whomever', 'whatever', 'whichever',
        
        // Relative pronouns
        'who', 'whom', 'whose', 'which', 'that',
        
        // Indefinite pronouns
        'anybody', 'anyone', 'anything', 'each', 'either', 'everybody', 'everyone', 
        'everything', 'neither', 'nobody', 'no one', 'nothing', 'one', 'somebody', 
        'someone', 'something', 'both', 'few', 'many', 'several', 'all', 'any', 
        'most', 'none', 'some', 'more', 'other', 'others', 'another',
        
        // Reflexive pronouns
        'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves',
        
        // Reciprocal pronouns
        'each other', 'one another'
    ];
    
    const prepositions = [
        // Simple prepositions
        'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'amidst', 'among', 'amongst', 'around', 'at',
        'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'by',
        'concerning', 'considering', 'despite', 'down', 'during',
        'except', 'excepting', 'excluding', 'following', 'for', 'from',
        'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite',
        'out', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round',
        'save', 'since', 'than', 'through', 'throughout', 'till', 'to', 'toward', 'towards',
        'under', 'underneath', 'unlike', 'until', 'unto', 'up', 'upon', 'versus', 'via',
        'with', 'within', 'without',
        
        // Complex prepositions
        'according to', 'ahead of', 'apart from', 'as for', 'as of', 'as per', 'as regards',
        'aside from', 'back to', 'because of', 'close to', 'due to', 'except for',
        'far from', 'in addition to', 'in between', 'in case of', 'in front of',
        'in lieu of', 'in place of', 'in point of', 'in spite of', 'instead of',
        'near to', 'next to', 'on account of', 'on behalf of', 'on top of',
        'opposite to', 'out of', 'owing to', 'prior to', 'pursuant to',
        'regardless of', 'subsequent to', 'thanks to', 'together with', 'up to',
        'with regard to', 'with respect to'
    ];
    
    const indefiniteArticles = [
        // Basic indefinite articles
        'a', 'an',
        
        // Indefinite determiners
        'some', 'any', 'either', 'neither', 'each', 'every', 'certain',
        'another', 'other', 'whatever', 'whichever', 'several', 'many', 'few', 'much'
    ];
    
    // Add analyze button event listener
    analyzeBtn.addEventListener('click', function() {
        const text = textInput.value;
        
        if (text.trim() === '') {
            alert('Please enter some text to analyze.');
            return;
        }
        
        // Perform the analysis
        analyzeText(text);
    });
    
    // Function to analyze text
    function analyzeText(text) {
        // 1. Calculate character counts
        const counts = countCharacters(text);
        
        // Update character count elements
        letterCount.textContent = counts.letters;
        wordCount.textContent = counts.words;
        spaceCount.textContent = counts.spaces;
        newlineCount.textContent = counts.newlines;
        specialCount.textContent = counts.specialSymbols;
        
        // 2. Tokenize and count word occurrences
        const tokens = tokenizeText(text);
        
        // 3. Count pronouns, prepositions, and indefinite articles
        const pronounCounts = countWordGroup(tokens, pronouns);
        const prepositionCounts = countWordGroup(tokens, prepositions);
        const articleCounts = countWordGroup(tokens, indefiniteArticles);
        
        // 4. Display results in tables
        displayResults(pronounTableBody, pronounCounts);
        displayResults(prepositionTableBody, prepositionCounts);
        displayResults(articleTableBody, articleCounts);
        
        // Animate the results for visual feedback
        animateResults();
    }
    
    // Function to count characters
    function countCharacters(text) {
        return {
            letters: (text.match(/[a-zA-Z]/g) || []).length,
            words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
            spaces: (text.match(/\s/g) || []).length,
            newlines: (text.match(/\n/g) || []).length,
            specialSymbols: (text.match(/[^\w\s]/g) || []).length
        };
    }
    
    // Function to tokenize text into words (case insensitive)
    function tokenizeText(text) {
        // Convert to lowercase for case insensitivity
        const lowerText = text.toLowerCase();
        
        // Find multi-word phrases first
        const multiWordMatches = [];
        const multiWordPhrases = [
            ...pronouns.filter(p => p.includes(' ')),
            ...prepositions.filter(p => p.includes(' ')),
            ...indefiniteArticles.filter(a => a.includes(' '))
        ];
        
        // Search for multi-word phrases in the text
        multiWordPhrases.forEach(phrase => {
            let startPos = 0;
            while ((startPos = lowerText.indexOf(phrase, startPos)) !== -1) {
                multiWordMatches.push({
                    phrase: phrase,
                    start: startPos,
                    end: startPos + phrase.length
                });
                startPos += 1; // Advance by 1 to allow for overlapping matches
            }
        });
        
        // Sort matches by position to process in order
        multiWordMatches.sort((a, b) => a.start - b.start);
        
        // Process the single words (excluding parts already counted in multi-word phrases)
        const singleWordTokens = [];
        let lastEnd = 0;
        
        for (const match of multiWordMatches) {
            // Process text between the last match and this one
            if (match.start > lastEnd) {
                const segment = lowerText.substring(lastEnd, match.start);
                const words = segment
                    .replace(/[^\w\s']|_/g, ' ')  // Replace non-word chars with space (except apostrophe)
                    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
                    .trim()                      // Trim leading/trailing spaces
                    .split(/\s+/);               // Split by whitespace
                
                singleWordTokens.push(...words);
            }
            
            // Add the multi-word phrase as a token
            singleWordTokens.push(match.phrase);
            lastEnd = match.end;
        }
        
        // Process any remaining text after the last multi-word match
        if (lastEnd < lowerText.length) {
            const segment = lowerText.substring(lastEnd);
            const words = segment
                .replace(/[^\w\s']|_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .split(/\s+/);
            
            singleWordTokens.push(...words);
        }
        
        // If no multi-word matches were found, just process the entire text
        if (multiWordMatches.length === 0) {
            return lowerText
                .replace(/[^\w\s']|_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .split(/\s+/);
        }
        
        return singleWordTokens;
    }
    
    // Function to count occurrences of words from a specific group
    function countWordGroup(tokens, wordGroup) {
        const counts = {};
        
        // Initialize counts for all words in the group
        wordGroup.forEach(word => {
            counts[word] = 0;
        });
        
        // Count occurrences
        tokens.forEach(token => {
            if (wordGroup.includes(token)) {
                counts[token]++;
            }
        });
        
        // Sort by count (descending)
        return Object.entries(counts)
                    .filter(([_, count]) => count > 0)  // Only include words that appear at least once
                    .sort((a, b) => b[1] - a[1]);       // Sort by count (descending)
    }
    
    // Function to display results in a table
    function displayResults(tableBody, results) {
        // Clear previous results
        tableBody.innerHTML = '';
        
        // If no results found
        if (results.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = 'No occurrences found';
            cell.colSpan = 2;
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        // Add each result to the table
        results.forEach(([word, count]) => {
            const row = document.createElement('tr');
            
            const wordCell = document.createElement('td');
            wordCell.textContent = word;
            
            const countCell = document.createElement('td');
            countCell.textContent = count;
            
            row.appendChild(wordCell);
            row.appendChild(countCell);
            tableBody.appendChild(row);
        });
    }
    
    // Function to animate results for visual feedback
    function animateResults() {
        const resultCards = document.querySelectorAll('.result-card');
        const resultSections = document.querySelectorAll('.result-section');
        
        // Animate count cards
        resultCards.forEach((card, index) => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = 1;
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // Animate result sections
        resultSections.forEach((section, index) => {
            if (index > 0) { // Skip the first section (it contains the cards)
                section.style.opacity = 0;
                section.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    section.style.opacity = 1;
                    section.style.transform = 'translateY(0)';
                }, 300 + (100 * index));
            }
        });
    }
    
    // Add some sample text on double-click
    textInput.addEventListener('dblclick', function() {
        if (textInput.value.trim() === '') {
            textInput.value = getSampleText();
        }
    });
    
    // Function to get sample text
    function getSampleText() {
        return `The quick brown fox jumps over the lazy dog. This sentence contains many different pronouns and prepositions. It is often used as a pangram because it contains every letter of the English alphabet. Some people use it for typing practice, while others use it for font demonstrations.

She walked through the forest with her dog, looking for some mushrooms under the trees. He found himself lost in a maze of thoughts about their future. We must consider what they want before making any decisions.

In the morning, I will go to the store for some groceries. They were excited about their trip across the country. You should bring your umbrella because of the rain forecast.

The book was placed upon the shelf between two larger volumes. The cat ran beneath the table and hid behind the curtain. The bird flew over the house and into the trees beyond the garden.

She looked at him with curiosity, wondering what he was thinking about. The children played around the fountain during the hot summer day. A leaf fell from the tree and landed on my shoulder.

An elephant never forgets, or so they say. A dog is man's best friend. An apple a day keeps the doctor away. Some people prefer cats, while others prefer dogs.

This paragraph will serve as an example with more indefinite articles. A student wrote an essay about a historical event. Some researchers conducted a study on an interesting phenomenon.

According to one another, each other must come together with others. On account of this, in addition to that, ahead of the rest, thanks to your help, regardless of the difficulties, we succeeded.

You can add your own text here or analyze this sample to see how the tokenization and counting work for pronouns, prepositions, and indefinite articles.`;
    }
}); 