// Use dynamic imports to avoid conflicts when multiple scenes are on the same page
// import Bird from "../../../animals/Bird.zcomp";
// import { initialize } from "@zcomponent/three";
// import { started, launched } from "@zcomponent/core";

console.log('Bird.ts script loaded');

let isSceneInitialized = false;
let sceneInstance: any = null;

// Function to show loading bar
async function showLoadingBar(): Promise<void> {
    const loadingOverlay = document.getElementById('loadingBarOverlay');
    const loadingBarFill = document.getElementById('loadingBarFill') as HTMLElement;
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    // Animate the loading bar over 1.5 seconds
    const duration = 1500; // milliseconds
    const steps = 30;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
        const progress = (i / steps) * 100;
        if (loadingBarFill) {
            loadingBarFill.style.width = `${progress}%`;
        }
        await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    
    // Hide the loading bar after completion
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
}

// Function to show error popup
function showErrorPopup(message: string): void {
    const errorPopup = document.getElementById('errorPopup');
    const errorMessage = document.getElementById('errorMessage');
    const errorCloseButton = document.getElementById('errorCloseButton');
    const loadingOverlay = document.getElementById('loadingBarOverlay');
    
    // Hide loading bar if it's showing
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
    
    if (errorPopup && errorMessage) {
        errorMessage.textContent = message;
        errorPopup.classList.add('active');
        
        // Close button handler
        if (errorCloseButton) {
            const closeHandler = () => {
                errorPopup.classList.remove('active');
                errorCloseButton.removeEventListener('click', closeHandler);
            };
            errorCloseButton.addEventListener('click', closeHandler);
        }
        
        // Also close when clicking outside
        const clickOutsideHandler = (e: MouseEvent) => {
            if (e.target === errorPopup) {
                errorPopup.classList.remove('active');
                errorPopup.removeEventListener('click', clickOutsideHandler);
            }
        };
        errorPopup.addEventListener('click', clickOutsideHandler);
    }
}

// Function to initialize the scene (called only when button is clicked)
async function initializeBirdScene() {
    if (isSceneInitialized) {
        console.log('Scene already initialized, skipping...');
        return sceneInstance;
    }
    
    // Get UI elements first (before loading bar)
    const sceneButton = document.querySelector('[data-scene="Bird"]') as HTMLButtonElement;
    const loadingText = document.querySelector('.loading-text') as HTMLElement;
    
    console.log('🚀 Starting Bird scene loading...');
    
    // Update UI to show loading state
    if (sceneButton) {
        sceneButton.disabled = true;
        sceneButton.textContent = 'Loading...';
    }
    
    if (loadingText) {
        loadingText.textContent = 'Loading AR scene...';
        loadingText.style.display = 'block';
        loadingText.style.color = '#6ae5e0';
    }
    
    // Start loading bar animation in parallel (don't await it)
    showLoadingBar();
    
    // Safety timeout - reset UI after 5 seconds if something goes wrong
    const safetyTimeout = setTimeout(() => {
        console.warn('⚠️ Safety timeout triggered - resetting UI');
        showErrorPopup('❌ AR loading timed out. This feature may not be supported on desktop browsers. Please try on a mobile device.');
        if (sceneButton) {
            sceneButton.disabled = false;
            sceneButton.textContent = 'Take a photo with me';
        }
        if (loadingText) {
            loadingText.style.display = 'none';
        }
        const loadingOverlay = document.getElementById('loadingBarOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        isSceneInitialized = false;
    }, 5000);
    
    try {
        console.log('🔧 Initializing Bird scene...');
        
        // Dynamically import to avoid custom element conflicts
        const { default: Bird } = await import("/animals/Bird.zcomp");
        const { initialize } = await import("@zcomponent/three");
        const { started: startedFn, launched: launchedFn } = await import("@zcomponent/core");
        
        // Initialize the Bird scene without launch button (auto-launch)
        sceneInstance = await initialize(Bird, {});
        
        console.log('✅ Bird scene initialized successfully!');
        isSceneInitialized = true;
        
        // Clear safety timeout since initialization succeeded
        clearTimeout(safetyTimeout);
        
        // Set up lifecycle handlers
        launchedFn(sceneInstance.contextManager).then(() => {
            console.log('🚀 Scene LAUNCHED - auto-launching after initialization');
        }).catch(err => {
            console.error('❌ Launch failed:', err);
            showErrorPopup('❌ Failed to launch AR experience. This feature may not be supported on desktop browsers. Please try on a mobile device.');
            
            // Reset UI
            if (sceneButton) {
                sceneButton.disabled = false;
                sceneButton.textContent = 'Take a photo with me';
            }
            if (loadingText) {
                loadingText.style.display = 'none';
            }
        });
        
        startedFn(sceneInstance.contextManager).then(() => {
            console.log('🎬 Scene STARTED - AR experience running');
            
            // Hide the splash screen when AR starts
            const splash = document.querySelector('.splash') as HTMLElement;
            if (splash) {
                console.log('🎭 Hiding splash screen...');
                splash.style.display = 'none';
            }
        }).catch(err => {
            console.error('❌ Start failed:', err);
            showErrorPopup('❌ Failed to start AR experience. This feature may not be supported on desktop browsers. Please try on a mobile device.');
            
            // Reset UI
            if (sceneButton) {
                sceneButton.disabled = false;
                sceneButton.textContent = 'Take a photo with me';
            }
            if (loadingText) {
                loadingText.style.display = 'none';
            }
        });
        
        return sceneInstance;
        
    } catch (error) {
        console.error('❌ Error initializing Bird scene:', error);
        isSceneInitialized = false;
        
        // Clear safety timeout
        clearTimeout(safetyTimeout);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Show error popup
        showErrorPopup(`❌ AR initialization failed: ${errorMessage}. This feature may not be supported on desktop browsers. Please try on a mobile device.`);
        
        // Reset UI
        if (sceneButton) {
            sceneButton.disabled = false;
            sceneButton.textContent = 'Take a photo with me';
        }
        
        if (loadingText) {
            loadingText.style.display = 'none';
        }
        
        // Don't throw - let the UI reset properly
        return null;
    }
}

// Set up button click handler when DOM is ready
function setupSceneButton() {
    const sceneButton = document.querySelector('[data-scene="Bird"]') as HTMLButtonElement;
    const loadingText = document.querySelector('.loading-text') as HTMLElement;
    
    if (sceneButton) {
        // Hide initial loading text and enable button
        if (loadingText) {
            loadingText.style.display = 'none';
        }
        
        sceneButton.disabled = false;
        sceneButton.textContent = 'Take a photo with me';
        
        // Add click handler to load scene
        sceneButton.addEventListener('click', async () => {
            if (!isSceneInitialized) {
                try {
                    await initializeBirdScene();
                } catch (error) {
                    console.error('Failed to initialize scene on button click:', error);
                }
            }
        });
        
        console.log('✅ Scene button ready - scene will load when clicked');
    }
}

// Initialize button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSceneButton);
} else {
    setupSceneButton();
}