require('dotenv').config();
const puppeteerService = require('./services/puppeteerService');

async function debugDOMMonitoring() {
  console.log('🔍 Debugging DOM Monitoring Issues...\n');
  
  try {
    console.log('1️⃣ Launching browser...');
    await puppeteerService.launchBrowser({ headless: false });
    console.log('✅ Browser launched successfully');
    
    console.log('\n2️⃣ Navigating to target site...');
    await puppeteerService.navigateToUrl('https://smartclean-1333e.web.app');
    console.log('✅ Navigated to target site');
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n3️⃣ Debugging page elements...');
    const page = puppeteerService.page;
    
    // Check if elements exist with the selector
    const elementCount = await page.evaluate(() => {
      const selector = 'div[class*="space-y-1 max-h-64"] > :first-child';
      const elements = document.querySelectorAll(selector);
      console.log('🔍 Elements found with selector:', selector);
      console.log('📊 Count:', elements.length);
      
      elements.forEach((el, index) => {
        console.log(`Element ${index}:`, {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent.substring(0, 100) + '...'
        });
      });
      
      return elements.length;
    });
    
    console.log(`📊 Found ${elementCount} elements with the selector`);
    
    if (elementCount === 0) {
      console.log('❌ No elements found with the selector!');
      console.log('💡 This means the selector is not matching any elements on the page');
      console.log('💡 Try a different selector or check if the page has loaded completely');
      return;
    }
    
    console.log('\n4️⃣ Setting up DOM monitoring with debug...');
    
    // Enhanced debug version
    await page.evaluate(() => {
      const selector = 'div[class*="space-y-1 max-h-64"] > :first-child';
      
      console.log('🔍 Setting up DOM monitoring with selector:', selector);
      
      // Store initial elements and their content
      window.initialElements = Array.from(document.querySelectorAll(selector));
      window.initialContent = new Map();
      window.contentChanges = [];
      window.newElements = [];
      
      console.log('📋 Initial elements found:', window.initialElements.length);
      
      // Store initial content of each element
      window.initialElements.forEach((element, index) => {
        window.initialContent.set(element, {
          textContent: element.textContent,
          innerHTML: element.innerHTML,
          attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value }))
        });
        console.log(`📝 Element ${index} initial content stored:`, element.textContent.substring(0, 50));
      });
      
      // Set up MutationObserver for comprehensive monitoring
      window.domObserver = new MutationObserver((mutations) => {
        console.log('🔍 MutationObserver triggered with', mutations.length, 'mutations');
        
        mutations.forEach((mutation, index) => {
          console.log(`🔍 Mutation ${index}:`, {
            type: mutation.type,
            target: mutation.target.tagName,
            targetClass: mutation.target.className,
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length
          });
          
          // Monitor new elements being added
          if (mutation.type === 'childList') {
            console.log('📝 ChildList mutation detected');
            
            mutation.addedNodes.forEach((node, nodeIndex) => {
              console.log(`🆕 Added node ${nodeIndex}:`, {
                nodeType: node.nodeType,
                tagName: node.tagName || 'Text',
                className: node.className || 'N/A'
              });
              
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the new node matches our selector
                if (node.matches && node.matches(selector)) {
                  console.log('✅ New matching element added!');
                  const changeData = {
                    type: 'new_element',
                    element: node.outerHTML,
                    timestamp: Date.now()
                  };
                  console.log('📤 Calling onDomChange with:', changeData);
                  window.onDomChange(changeData);
                  window.newElements.push(changeData);
                } else {
                  console.log('❌ New node does not match selector');
                }
                
                // Check if any descendants match our selector
                const descendants = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                console.log(`🔍 Found ${descendants.length} descendants in new node`);
                
                descendants.forEach((descendant, descIndex) => {
                  if (!window.initialElements.includes(descendant)) {
                    console.log(`✅ New descendant element ${descIndex} found!`);
                    const changeData = {
                      type: 'new_descendant',
                      element: descendant.outerHTML,
                      timestamp: Date.now()
                    };
                    console.log('📤 Calling onDomChange with:', changeData);
                    window.onDomChange(changeData);
                    window.newElements.push(changeData);
                  }
                });
              }
            });
            
            // Monitor changes in existing elements
            mutation.removedNodes.forEach((node, nodeIndex) => {
              console.log(`🗑️  Removed node ${nodeIndex}:`, {
                nodeType: node.nodeType,
                tagName: node.tagName || 'Text'
              });
              
              if (node.nodeType === Node.ELEMENT_NODE) {
                const parent = mutation.target.closest(selector);
                if (parent && window.initialElements.includes(parent)) {
                  console.log('✅ Parent element found, checking for HTML changes');
                  const currentHTML = parent.innerHTML;
                  const initialHTML = window.initialContent.get(parent).innerHTML;
                  if (currentHTML !== initialHTML) {
                    console.log('🔄 HTML changed due to children update!');
                    const changeData = {
                      type: 'html_change',
                      oldValue: initialHTML,
                      newValue: currentHTML,
                      timestamp: Date.now()
                    };
                    console.log('📤 Calling onDomChange with:', changeData);
                    window.onDomChange(changeData);
                    window.contentChanges.push(changeData);
                    // Update stored HTML for future comparison
                    window.initialContent.get(parent).innerHTML = currentHTML;
                  }
                }
              }
            });
          }
          
          // Monitor content changes in existing elements
          if (mutation.type === 'characterData' || mutation.type === 'attributes') {
            console.log('📝 Content/Attribute mutation detected');
            const targetElement = mutation.target.closest(selector);
            if (targetElement && window.initialElements.includes(targetElement)) {
              console.log('✅ Target element found, checking for content changes');
              const currentContent = {
                textContent: targetElement.textContent,
                innerHTML: targetElement.innerHTML,
                attributes: Array.from(targetElement.attributes).map(attr => ({ name: attr.name, value: attr.value }))
              };
              
              const initialContent = window.initialContent.get(targetElement);
              if (initialContent) {
                // Check for text content changes
                if (currentContent.textContent !== initialContent.textContent) {
                  console.log('📝 Text content changed!');
                  const changeData = {
                    type: 'text_change',
                    oldValue: initialContent.textContent,
                    newValue: currentContent.textContent,
                    timestamp: Date.now()
                  };
                  console.log('📤 Calling onDomChange with:', changeData);
                  window.onDomChange(changeData);
                  window.contentChanges.push(changeData);
                }
                
                // Check for HTML content changes
                if (currentContent.innerHTML !== initialContent.innerHTML) {
                  console.log('🔄 HTML content changed!');
                  const changeData = {
                    type: 'html_change',
                    oldValue: initialContent.innerHTML,
                    newValue: currentContent.innerHTML,
                    timestamp: Date.now()
                  };
                  console.log('📤 Calling onDomChange with:', changeData);
                  window.onDomChange(changeData);
                  window.contentChanges.push(changeData);
                }
              }
            }
          }
        });
      });
      
      // Start observing with comprehensive options
      window.domObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true,
        characterDataOldValue: true
      });
      
      console.log('✅ Enhanced DOM monitoring started with comprehensive debugging');
      console.log('🔍 Now watching for mutations on:', document.body);
    });
    
    console.log('\n5️⃣ DOM monitoring is now active with debug logging!');
    console.log('👁️  Watch the browser console for detailed mutation logs');
    console.log('💡 Try interacting with the page to trigger DOM changes');
    console.log('💡 Look for logs starting with 🔍, 📝, 🆕, etc.');
    
    console.log('\n6️⃣ Waiting 30 seconds for you to interact with the page...');
    console.log('💡 The browser console should show detailed mutation information');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n7️⃣ Getting current DOM state...');
    const currentState = await puppeteerService.getAllDOMChanges();
    console.log('📋 Current state:', {
      initialElements: currentState.initialElementsCount,
      initialContent: currentState.initialContentCount,
      newElements: currentState.newElements.length,
      contentChanges: currentState.contentChanges.length
    });
    
    console.log('\n8️⃣ Stopping DOM monitoring...');
    await puppeteerService.stopDOMMonitoring();
    console.log('✅ DOM monitoring stopped');
    
    console.log('\n9️⃣ Closing browser...');
    await puppeteerService.closeBrowser();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 DOM monitoring debug completed!');
    console.log('💡 Check the browser console above for detailed mutation logs');
    console.log('💡 If you still don\'t see logs, the issue might be:');
    console.log('   - Selector not matching any elements');
    console.log('   - Page not fully loaded when monitoring starts');
    console.log('   - Elements changing outside the observed subtree');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    if (puppeteerService.isBrowserRunning()) {
      console.log('\n🔄 Closing browser due to error...');
      await puppeteerService.closeBrowser();
    }
    
    process.exit(1);
  }
}

debugDOMMonitoring();
