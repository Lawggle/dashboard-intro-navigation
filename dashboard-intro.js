// Import Shepherd and FloatingUI offset middleware
import Shepherd from "https://cdn.jsdelivr.net/npm/shepherd.js@14.5.1/dist/esm/shepherd.mjs";
import {
  offset,
  autoPlacement,
  shift,
  limitShift,
} from "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.12/+esm";

// Wait for page to load
document.addEventListener("DOMContentLoaded", function () {
  // Check if user has already seen the tour
  async function checkIfShouldRunTour() {
    try {
      if (typeof window.$memberstackDom !== "undefined") {
        const { data: member } =
          await window.$memberstackDom.getCurrentMember();

        if (member) {
          const memberJson = await window.$memberstackDom.getMemberJSON();

          // Only run tour if hasLoggedInBefore is null, undefined, or false
          if (memberJson.data.hasLoggedInBefore === true) {
            console.log("User has already seen the tour, skipping...");
            return false;
          }
        }
      }
      return true; // Run tour for new users or when memberstack is not available
    } catch (error) {
      console.error("Error checking tour status:", error);
      return true; // Run tour on error to be safe
    }
  }

  // Initialize tour only if conditions are met
  checkIfShouldRunTour().then((shouldRun) => {
    console.log("🎭 Tour should run:", shouldRun);
    if (!shouldRun) {
      console.log("❌ Tour cancelled - user has already seen it");
      return;
    }

    console.log("✅ Initializing tour for new user");

    // Define images for each step
    const stepImages = {
      "my-stats":
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840c55429d39846de609_my%20stats%20-%20same%20size.png",
      "competitive-metrics":
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840c0bf2b62b4e1c4401_competetive%20metrics%20-%20same%20size.png",
      messages:
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840cfd1c52a0f1fe7901_my%20messages%20-%20same%20size.png",
      profile:
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840c1f61f57b2dfa0fc5_my%20profile%20v2%20-%20same%20size.png",
      feedback:
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840c39a3256bbc8a4899_Feedback%20-%20same%20size.png",
      "ai-recommendations":
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840cda7e8c62b51e7f94_AI%20recommendations%20-%20same%20size.png",
      "lawggle-challenges":
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840c55429d39846de609_my%20stats%20-%20same%20size.png", // Mock image for now
      "ai-assistant":
        "https://cdn.prod.website-files.com/67e360f08a15ef65d8814b41/6894840cc82a629eb2488fbd_my%20assistant%20v2%20-%20same%20size.png",
    };

    // Helper function to create intro content with image and step numbers
    function createIntroContent(
      title,
      description,
      imageKey,
      stepNumber = null,
      totalSteps = null
    ) {
      const stepCounter = `${stepNumber}/${totalSteps}`;

      return `
          <div class="custom-intro-content">
            <div class="custom-step-counter">${stepCounter} Steps</div>
            <div class="image-side">
              <div class="intro-image-container">
                <img src="${stepImages[imageKey]}" alt="${title}" class="intro-step-image" />
              </div>
            </div>
            <div class="content-side">
              <h3 class="intro-title">${title}</h3>
              <p class="intro-description">${description}</p>
            </div>
          </div>
        `;
    }

    // Helper function to create combined intro content for multiple sections with step numbers
    function createCombinedIntroContent(
      sections,
      stepNumber = null,
      totalSteps = null
    ) {
      const sectionsHtml = sections
        .map(
          (section) => `
          <div class="custom-intro-content">
            <div class="custom-step-counter">${stepNumber}/${totalSteps} Steps</div>
            <div class="image-side">
              <div class="intro-image-container">
                <img src="${stepImages[section.imageKey]}" alt="${
            section.title
          }" class="intro-step-image" />
              </div>
            </div>
            <div class="content-side">
              <h3 class="intro-title">${section.title}</h3>
              <p class="intro-description">${section.description}</p>
            </div>
          </div>
        `
        )
        .join('<hr class="intro-divider">');

      return sectionsHtml;
    }

    // Helper function to manage z-index for AI recommendation sections
    function manageAIRecZIndex(stepId, action) {
      const aiRecElements = ["#ai-rec-section", "#locked-ai-rec"];

      aiRecElements.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          if (
            action === "increase" &&
            (stepId === "ai-recommendations" ||
              stepId === "ai-recommendations-locked" ||
              stepId === "ai-recommendations-mobile" ||
              stepId === "ai-recommendations-essential-mobile")
          ) {
            element.style.zIndex = "99999";
            console.log(
              `Increased z-index for ${selector} during step: ${stepId}`
            );
          } else if (action === "reset") {
            element.style.zIndex = "auto";
            console.log(`Reset z-index for ${selector} after step: ${stepId}`);
          }
        }
      });
    }

    // Click dashboard button to start in the right section
    const dashboardBtn = document.getElementById("dashboard-btn");
    if (dashboardBtn) {
      dashboardBtn.click();
    }

    // Define step configurations
    const advancedUserSteps = [
      {
        id: "my-stats",
        title: "My Statistics (1/8)",
        text: createIntroContent(
          "My Statistics",
          "Your personal performance dashboard. Track your response times, conversion rates, and other key metrics that matter. Consider it your practice's vital signs – because you can't improve what you don't measure.",
          "my-stats",
          1,
          8
        ),
        attachTo: {
          element: "#my-stats-btn",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "competitive-metrics",
        title: "Competitive Metrics (2/8)",
        text: createIntroContent(
          "Competitive Metrics",
          "Where you see how you measure up against opposing counsel (on the platform, that is). Consider this your performance review against the competition. Nothing motivates quite like seeing exactly where you rank in the pecking order. Time to raise the bar.",
          "competitive-metrics",
          2,
          8
        ),
        attachTo: {
          element: "#c-metrics-button",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "my-messages",
        title: "My Messages (3/8)",
        text: createIntroContent(
          "My Messages",
          "Where potential clients become actual clients. This is your direct line to every match – respond promptly, professionally, and persuasively. Think of each message as a mini consultation. First responses make lasting impressions, so make them count.",
          "messages",
          3,
          8
        ),
        attachTo: {
          element: "#my-messages-btn",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "profile",
        title: "Profile Settings Page (4/8)",
        text: createIntroContent(
          "Profile Settings Page",
          "Your profile settings – think of it as your opening statement to potential clients. This is where matches play judge and jury, deciding which lawyer to call. Make your case compelling: the more detail you provide, the stronger your appeal. Consider it due diligence for your own practice.",
          "profile",
          4,
          8
        ),
        attachTo: {
          element: "#profile-btn",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "feedback",
        title: "Feedback (5/8)",
        text: createIntroContent(
          "Feedback",
          "Where your objections and observations help shape our case. We're in beta, which means your input isn't just welcome – it's critical evidence. Spotted a bug? Found an error? Have a suggestion? File it here. Consider yourself co-counsel in building a better platform. We review every submission like it's a Supreme Court brief.",
          "feedback",
          5,
          8
        ),
        attachTo: {
          element: "#feedback-section",
          on: "auto",
        },
        classes: "custom-shepherd-step feedback-step-wide",
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-recommendations",
        title: "AI Recommendations (6/8)",
        text: createIntroContent(
          "AI Recommendations",
          "Your personalized practice improvement plan, refreshed every 5 days. Our AI reviews your profile like opposing counsel would – finding every gap and weak point. Complete these suggestions to boost your profile strength score and completion percentage. Note: changes won't reflect immediately; think of it as a 5-day review period. The higher your score, the more compelling your case to potential clients.",
          "ai-recommendations",
          6,
          8
        ),
        attachTo: {
          element: "#ai-rec-section",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "lawggle-challenges",
        title: "Lawggle Challenges (7/8)",
        text: createIntroContent(
          "Lawggle Challenges",
          "Test your legal knowledge and compete with other lawyers in our interactive challenge system. Earn points, climb leaderboards, and showcase your expertise across different practice areas. Think of it as continuing legal education that's actually engaging – where learning meets competition.",
          "lawggle-challenges",
          7,
          8
        ),
        attachTo: {
          element: "#lawggle-challenges",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-assistant",
        title: "AI Assistant (8/8)",
        text: createIntroContent(
          "AI Assistant",
          "Your digital associate, minus the billable hours. While it can't access your dashboard data, it can guide you through platform features, draft documents, brainstorm strategies, or answer virtually any question. Think of it as having a knowledgeable colleague on call 24/7 – one who never takes vacation or needs coffee. From contract templates to case law queries, just ask.",
          "ai-assistant",
          8,
          8
        ),
        attachTo: {
          element: "#ai-bot-btn",
          on: "top",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Done!",
            action() {
              return this.complete();
            },
          },
        ],

        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware - it was overriding the "left" placement
          ],
        },
      },
    ];

    const advancedMobileUserSteps = [
      {
        id: "stats-menu-mobile",
        title: "Statistics & Metrics (1/7)",
        text: createCombinedIntroContent(
          [
            {
              title: "My Statistics",
              description:
                "Your personal performance dashboard. Track your response times, conversion rates, and other key metrics that matter. Consider it your practice's vital signs – because you can't improve what you don't measure.",
              imageKey: "my-stats",
            },
            {
              title: "Competitive Metrics",
              description:
                "Where you see how you measure up against opposing counsel (on the platform, that is). Consider this your performance review against the competition. Nothing motivates quite like seeing exactly where you rank in the pecking order. Time to raise the bar.",
              imageKey: "competitive-metrics",
            },
          ],
          1,
          7
        ),
        attachTo: {
          element: "#stats-menu-list",
          on: "bottom",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "feedback-mobile",
        title: "Feedback (2/7)",
        text: createIntroContent(
          "Feedback",
          "Where your objections and observations help shape our case. We're in beta, which means your input isn't just welcome – it's critical evidence. Spotted a bug? Found an error? Have a suggestion? File it here. Consider yourself co-counsel in building a better platform. We review every submission like it's a Supreme Court brief.",
          "feedback",
          2,
          7
        ),
        attachTo: {
          element: "#feedback-section",
          on: "bottom",
        },
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware - it was overriding the "bottom" placement
          ],
        },
        scrollTo: {
          behavior: "smooth",
          block: "end", // Show top of element instead of centering
          inline: "nearest",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "my-messages-mobile",
        title: "My Messages (3/7)",
        text: createIntroContent(
          "My Messages",
          "Where potential clients become actual clients. This is your direct line to every match – respond promptly, professionally, and persuasively. Think of each message as a mini consultation. First responses make lasting impressions, so make them count.",
          "messages",
          3,
          7
        ),
        attachTo: {
          element: "#my-messages-btn",
          on: "top",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-recommendations-mobile",
        title: "AI Recommendations (4/7)",
        text: createIntroContent(
          "AI Recommendations",
          "Your personalized practice improvement plan, refreshed every 5 days. Our AI reviews your profile like opposing counsel would – finding every gap and weak point. Complete these suggestions to boost your profile strength score and completion percentage. Note: changes won't reflect immediately; think of it as a 5-day review period. The higher your score, the more compelling your case to potential clients.",
          "ai-recommendations",
          4,
          7
        ),
        attachTo: {
          element: "#ai-rec-section",
          on: "top",
        },
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware and kept only offset
          ],
        },
        scrollTo: {
          behavior: "smooth",
          block: "start", // Show top of element instead of centering
          inline: "nearest",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "profile-mobile",
        title: "Profile Settings Page (5/7)",
        text: createIntroContent(
          "Profile Settings Page",
          "Your profile settings – think of it as your opening statement to potential clients. This is where matches play judge and jury, deciding which lawyer to call. Make your case compelling: the more detail you provide, the stronger your appeal. Consider it due diligence for your own practice.",
          "profile",
          5,
          7
        ),
        attachTo: {
          element: "#profile-btn",
          on: "bottom",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "lawggle-challenges-mobile",
        title: "Lawggle Challenges (6/7)",
        text: createIntroContent(
          "Lawggle Challenges",
          "Test your legal knowledge and compete with other lawyers in our interactive challenge system. Earn points, climb leaderboards, and showcase your expertise across different practice areas. Think of it as continuing legal education that's actually engaging – where learning meets competition.",
          "lawggle-challenges",
          6,
          7
        ),
        attachTo: {
          element: "#lawggle-challenges",
          on: "bottom",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-assistant-mobile",
        title: "AI Assistant (7/7)",
        text: createIntroContent(
          "AI Assistant",
          "Your digital associate, minus the billable hours. While it can't access your dashboard data, it can guide you through platform features, draft documents, brainstorm strategies, or answer virtually any question. Think of it as having a knowledgeable colleague on call 24/7 – one who never takes vacation or needs coffee. From contract templates to case law queries, just ask.",
          "ai-assistant",
          7,
          7
        ),
        attachTo: {
          element: "#ai-bot-btn",
          on: "top",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Done!",
            action() {
              return this.complete();
            },
          },
        ],
      },
    ];

    const essentialUserSteps = [
      {
        id: "my-stats-locked",
        title: "My Stats (1/8)",
        text: createIntroContent(
          "My Stats",
          "Your personal performance dashboard. Track your response times, conversion rates, and other key metrics that matter. Consider it your practice's vital signs – because you can't improve what you don't measure. Time to see the evidence of your efforts.",
          "my-stats",
          1,
          8
        ),
        attachTo: {
          element: "#my-stats-btn-locked",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "competitive-metrics-locked",
        title: "Competitive Metrics (2/8)",
        text: createIntroContent(
          "Competitive Metrics",
          "Where you see how you measure up against opposing counsel (on the platform, that is). Consider this your performance review against the competition. Nothing motivates quite like seeing exactly where you rank in the pecking order. Time to raise the bar.",
          "competitive-metrics",
          2,
          8
        ),
        attachTo: {
          element: "#c-metrics-button-locked",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "my-messages-essential",
        title: "My Messages (3/8)",
        text: createIntroContent(
          "My Messages",
          "Where potential clients become actual clients. This is your direct line to every match – respond promptly, professionally, and persuasively. Think of each message as a mini consultation. First responses make lasting impressions, so make them count.",
          "messages",
          3,
          8
        ),
        attachTo: {
          element: "#my-messages-btn",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "profile-essential",
        title: "Profile Settings Page (4/8)",
        text: createIntroContent(
          "Profile Settings Page",
          "Your profile settings – think of it as your opening statement to potential clients. This is where matches play judge and jury, deciding which lawyer to call. Make your case compelling: the more detail you provide, the stronger your appeal. Consider it due diligence for your own practice.",
          "profile",
          4,
          8
        ),
        attachTo: {
          element: "#profile-btn",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "feedback-essential",
        title: "Feedback (5/8)",
        text: createIntroContent(
          "Feedback",
          "Where your objections and observations help shape our case. We're in beta, which means your input isn't just welcome – it's critical evidence. Spotted a bug? Found an error? Have a suggestion? File it here. Consider yourself co-counsel in building a better platform. We review every submission like it's a Supreme Court brief.",
          "feedback",
          5,
          8
        ),
        attachTo: {
          element: "#feedback-section",
          on: "auto",
        },
        classes: "custom-shepherd-step feedback-step-wide",
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 16, crossAxis: 0 }),
            // Removed shift middleware to respect the "bottom" placement
          ],
        },
        scrollTo: {
          behavior: "smooth",
          block: "start", // Show top of element instead of centering
          inline: "nearest",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-recommendations-locked",
        title: "AI Recommendations (6/8)",
        text: createIntroContent(
          "AI Recommendations",
          "Your personalized practice improvement plan, refreshed every 5 days. Our AI reviews your profile like opposing counsel would – finding every gap and weak point. Complete these suggestions to boost your profile strength score and completion percentage. Note: changes won't reflect immediately; think of it as a 5-day review period. The higher your score, the more compelling your case to potential clients.",
          "ai-recommendations",
          6,
          8
        ),
        attachTo: {
          element: "#locked-ai-rec",
          on: "left",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "lawggle-challenges-essential",
        title: "Lawggle Challenges (7/8)",
        text: createIntroContent(
          "Lawggle Challenges",
          "Test your legal knowledge and compete with other lawyers in our interactive challenge system. Earn points, climb leaderboards, and showcase your expertise across different practice areas. Think of it as continuing legal education that's actually engaging – where learning meets competition.",
          "lawggle-challenges",
          7,
          8
        ),
        attachTo: {
          element: "#lawggle-challenges",
          on: "right",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-assistant-essential",
        title: "AI Assistant (8/8)",
        text: createIntroContent(
          "AI Assistant",
          "Your digital associate, minus the billable hours. While it can't access your dashboard data, it can guide you through platform features, draft documents, brainstorm strategies, or answer virtually any question. Think of it as having a knowledgeable colleague on call 24/7 – one who never takes vacation or needs coffee. From contract templates to case law queries, just ask.",
          "ai-assistant",
          8,
          8
        ),
        attachTo: {
          element: "#ai-bot-btn",
          on: "top",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Done!",
            action() {
              return this.complete();
            },
          },
        ],
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware - it was overriding the "left" placement
          ],
        },
      },
    ];

    const essentialMobileUserSteps = [
      {
        id: "stats-menu-essential-mobile",
        title: "Statistics & Metrics (1/7)",
        text: createCombinedIntroContent(
          [
            {
              title: "My Statistics",
              description:
                "Your personal performance dashboard. Track your response times, conversion rates, and other key metrics that matter. Consider it your practice's vital signs – because you can't improve what you don't measure.",
              imageKey: "my-stats",
            },
            {
              title: "Competitive Metrics",
              description:
                "Where you see how you measure up against opposing counsel (on the platform, that is). Consider this your performance review against the competition. Nothing motivates quite like seeing exactly where you rank in the pecking order. Time to raise the bar.",
              imageKey: "competitive-metrics",
            },
          ],
          1,
          7
        ),
        attachTo: {
          element: "#stats-menu-list",
          on: "bottom",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "feedback-essential-mobile",
        title: "Feedback (2/7)",
        text: createIntroContent(
          "Feedback",
          "Where your objections and observations help shape our case. We're in beta, which means your input isn't just welcome – it's critical evidence. Spotted a bug? Found an error? Have a suggestion? File it here. Consider yourself co-counsel in building a better platform. We review every submission like it's a Supreme Court brief.",
          "feedback",
          2,
          7
        ),
        attachTo: {
          element: "#feedback-section",
          on: "top",
        },
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware - it was overriding the "bottom" placement
          ],
        },
        scrollTo: {
          behavior: "smooth",
          block: "end", // Show top of element instead of centering
          inline: "nearest",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "my-messages-essential-mobile",
        title: "My Messages (3/7)",
        text: createIntroContent(
          "My Messages",
          "Where potential clients become actual clients. This is your direct line to every match – respond promptly, professionally, and persuasively. Think of each message as a mini consultation. First responses make lasting impressions, so make them count.",
          "messages",
          3,
          7
        ),
        attachTo: {
          element: "#my-messages-btn",
          on: "top",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-recommendations-essential-mobile",
        title: "AI Recommendations (4/7)",
        text: createIntroContent(
          "AI Recommendations",
          "Your personalized practice improvement plan, refreshed every 5 days. Our AI reviews your profile like opposing counsel would – finding every gap and weak point. Complete these suggestions to boost your profile strength score and completion percentage. Note: changes won't reflect immediately; think of it as a 5-day review period. The higher your score, the more compelling your case to potential clients.",
          "ai-recommendations",
          4,
          7
        ),
        attachTo: {
          element: "#locked-ai-rec",
          on: "top",
        },
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            // Removed shift middleware and kept only offset
          ],
        },
        scrollTo: {
          behavior: "smooth",
          block: "start", // Show top of element instead of centering
          inline: "nearest",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "profile-essential-mobile",
        title: "Profile Settings Page (5/7)",
        text: createIntroContent(
          "Profile Settings Page",
          "Your profile settings – think of it as your opening statement to potential clients. This is where matches play judge and jury, deciding which lawyer to call. Make your case compelling: the more detail you provide, the stronger your appeal. Consider it due diligence for your own practice.",
          "profile",
          5,
          7
        ),
        attachTo: {
          element: "#profile-btn",
          on: "bottom",
        },
        beforeShowPromise: function () {
          return handleMobileMenuForStep(this);
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "lawggle-challenges-essential-mobile",
        title: "Lawggle Challenges (6/7)",
        text: createIntroContent(
          "Lawggle Challenges",
          "Test your legal knowledge and compete with other lawyers in our interactive challenge system. Earn points, climb leaderboards, and showcase your expertise across different practice areas. Think of it as continuing legal education that's actually engaging – where learning meets competition.",
          "lawggle-challenges",
          6,
          7
        ),
        attachTo: {
          element: "#lawggle-challenges",
          on: "bottom",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Next →",
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        id: "ai-assistant-essential-mobile",
        title: "AI Assistant (7/7)",
        text: createIntroContent(
          "AI Assistant",
          "Your digital associate, minus the billable hours. While it can't access your dashboard data, it can guide you through platform features, draft documents, brainstorm strategies, or answer virtually any question. Think of it as having a knowledgeable colleague on call 24/7 – one who never takes vacation or needs coffee. From contract templates to case law queries, just ask.",
          "ai-assistant",
          7,
          7
        ),
        attachTo: {
          element: "#ai-bot-btn",
          on: "top",
        },
        buttons: [
          {
            text: "← Back",
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
          },
          {
            text: "Done!",
            action() {
              return this.complete();
            },
          },
        ],
      },
    ];

    // Function to preload all images for smooth transitions
    function preloadImages() {
      const imageUrls = Object.values(stepImages);
      const promises = imageUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image();

          // Set a longer timeout for mobile devices
          const timeout = isMobileDevice() ? 8000 : 5000;

          const timeoutId = setTimeout(() => {
            console.warn(`Image ${index + 1} preload timeout: ${url}`);
            reject(new Error(`Timeout loading ${url}`));
          }, timeout);

          img.onload = () => {
            clearTimeout(timeoutId);
            console.log(`✅ Preloaded image ${index + 1}: ${url}`);
            resolve(url);
          };

          img.onerror = () => {
            clearTimeout(timeoutId);
            console.error(`❌ Failed to preload image ${index + 1}: ${url}`);
            reject(new Error(`Failed to load ${url}`));
          };

          // Add cache-busting for mobile to prevent stale cache issues
          if (isMobileDevice()) {
            img.src = url + "?mobile=" + Date.now();
          } else {
            img.src = url;
          }
        });
      });

      return Promise.allSettled(promises);
    }

    // Function to initialize step images with smooth loading
    function initializeStepImages() {
      const imageContainers = document.querySelectorAll(
        ".shepherd-element .intro-image-container"
      );

      console.log("Image containers found:", imageContainers.length);

      if (imageContainers.length > 0) {
        imageContainers.forEach((imageContainer, index) => {
          try {
            // Find the image inside the container
            const image = imageContainer.querySelector(".intro-step-image");
            if (image) {
              // Set up smooth loading
              const imageUrl = image.src;

              // Force image reload on mobile to prevent caching issues
              if (isMobileDevice()) {
                image.src = "";
                setTimeout(() => {
                  image.src = imageUrl;
                }, 10);
              }

              // If image is already loaded (from preload), show it immediately
              if (image.complete && image.naturalHeight !== 0) {
                image.classList.add("loaded");
                imageContainer.classList.add("loaded");
                console.log(`Step image ${index + 1} already loaded`);
              } else {
                // Otherwise wait for load
                image.addEventListener("load", () => {
                  image.classList.add("loaded");
                  imageContainer.classList.add("loaded");
                  console.log(`Step image ${index + 1} loaded successfully`);
                });

                image.addEventListener("error", () => {
                  console.error(
                    `Error loading step image ${index + 1}:`,
                    image.src
                  );
                  // On mobile, try reloading the image once more
                  if (isMobileDevice() && !image.dataset.retried) {
                    image.dataset.retried = "true";
                    setTimeout(() => {
                      image.src = imageUrl;
                    }, 500);
                  } else {
                    // Still show as loaded to hide spinner
                    image.classList.add("loaded");
                    imageContainer.classList.add("loaded");
                  }
                });

                // Mobile timeout fallback - show image after 2 seconds regardless
                if (isMobileDevice()) {
                  setTimeout(() => {
                    if (!image.classList.contains("loaded")) {
                      console.log(
                        `Mobile fallback: Showing image ${
                          index + 1
                        } after timeout`
                      );
                      image.classList.add("loaded");
                      imageContainer.classList.add("loaded");
                    }
                  }, 2000);
                }
              }

              console.log(`Step image ${index + 1} initialized successfully`);
            }
          } catch (error) {
            console.error(`Error initializing step image ${index + 1}:`, error);
          }
        });
      } else {
        console.warn("No image containers found in current step");
      }
    }

    // Function to apply left-to-right animation to shepherd element
    function applyShepherdSlideAnimation() {
      const shepherdElement = document.querySelector(".shepherd-element");
      if (shepherdElement) {
        // Add the slide-in class
        shepherdElement.classList.add("shepherd-slide-in");

        // Remove the class after animation completes
        setTimeout(() => {
          shepherdElement.classList.remove("shepherd-slide-in");
        }, 500);

        console.log("Applied left-to-right animation to shepherd element");
      }
    }

    // Handle mobile menu opening for specific steps
    function handleMobileMenuForStep(currentStep) {
      return new Promise((resolve) => {
        if (currentStep && isMobileDevice()) {
          const mobileStepElementsWithMenuClick = [
            "#my-messages-btn",
            "#profile-btn",
            "#stats-menu-list",
          ];

          const allMobileStepElements = [
            "#stats-menu-list",
            "#feedback-section-container",
            "#my-messages-btn",
            "#ai-rec-section",
            "#profile-btn",
            "#ai-bot-btn",
            "#my-stats-btn-locked",
            "#c-metrics-button-locked",
            "#feedback-section",
            "#locked-ai-rec",
          ];

          // Get the correct step element using Shepherd's API
          console.log("📱 Mobile step: Current step:", currentStep);
          const stepElement = currentStep.attachTo?.element;
          console.log("📱 Mobile step: Current step element:", stepElement);

          if (allMobileStepElements.includes(stepElement)) {
            console.log(
              "📱 Mobile step: Now on mobile step, applying mobile logic for:",
              stepElement
            );

            // Only click mobile menu for specific steps
            if (mobileStepElementsWithMenuClick.includes(stepElement)) {
              const mobileMenuBtn = document.getElementById("mobile-menu-btn");
              if (mobileMenuBtn) {
                console.log(
                  "📱 Mobile step: Clicking mobile menu button for:",
                  stepElement
                );
                mobileMenuBtn.click();

                // Wait 600ms for menu animation/rendering before resolving
                setTimeout(() => {
                  console.log("📱 Mobile menu opened, proceeding with step");
                  resolve();
                }, 600);
              } else {
                console.warn(
                  "📱 Mobile step: Mobile menu button not found for:",
                  stepElement
                );
                resolve();
              }
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    // Function to check if device is mobile
    function isMobileDevice() {
      return window.innerWidth <= 768;
    }

    // Function to prevent scrolling during tour
    function preventWheelScroll(e) {
      if (Shepherd.activeTour) {
        const tooltip = document.querySelector(".shepherd-element");
        const tooltipText = document.querySelector(".shepherd-text");

        // Allow scrolling if the wheel event is within the tooltip content
        if (tooltip && tooltip.contains(e.target)) {
          // Check if tooltip content is scrollable
          if (
            tooltipText &&
            tooltipText.scrollHeight > tooltipText.clientHeight
          ) {
            return; // Allow scrolling within tooltip
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    function preventTouchScroll(e) {
      if (Shepherd.activeTour) {
        const tooltip = document.querySelector(".shepherd-element");
        const tooltipText = document.querySelector(".shepherd-text");

        // Allow touch scrolling if the touch event is within the tooltip content
        if (tooltip && tooltip.contains(e.target)) {
          // Check if tooltip content is scrollable
          if (
            tooltipText &&
            tooltipText.scrollHeight > tooltipText.clientHeight
          ) {
            return; // Allow scrolling within tooltip
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    // Create the tour instance
    let tour;

    // Function to get conditional floating UI options based on screen size
    function getDefaultFloatingUIOptions() {
      const isLargeScreen = window.innerWidth > 768;
      const middleware = [offset({ mainAxis: 16, crossAxis: 0 })];

      // Only add shift with padding for large screens to prevent touching edges
      if (isLargeScreen) {
        middleware.push(
          shift({
            padding: 20, // Space from viewport edges in pixels
            limiter: limitShift(),
            crossAxis: true,
          })
        );
      } else {
        middleware.push(
          shift({
            padding: 10, // Space from viewport edges in pixels
            limiter: limitShift(),
            crossAxis: true,
          })
        );
      }

      return { middleware };
    }

    try {
      if (typeof window.$memberstackDom !== "undefined") {
        window.$memberstackDom
          .getCurrentMember()
          .then(function ({ data: member }) {
            if (member) {
              console.log("Member is logged in:", member);
              const membershipPlan = member.planConnections[0];
              console.log("Current membership plan:", membershipPlan);

              if (membershipPlan) {
                const membershipPlanId = membershipPlan.planId;
                console.log("Current membership ID:", membershipPlanId);

                const advancedMembershipPlanIds = [
                  "pln_lawggle-advanced-v2-r74e0sgz",
                  "pln_lawggle-advanced-v2-a6t0erf",
                ];

                let steps;
                if (advancedMembershipPlanIds.includes(membershipPlanId)) {
                  steps = isMobileDevice()
                    ? advancedMobileUserSteps
                    : advancedUserSteps;
                } else {
                  steps = isMobileDevice()
                    ? essentialMobileUserSteps
                    : essentialUserSteps;
                }

                // Create tour with the appropriate steps
                tour = new Shepherd.Tour({
                  useModalOverlay: true,
                  exitOnEsc: false,
                  keyboardNavigation: false,
                  tourName: "dashboard-intro",
                  defaultStepOptions: {
                    classes: "custom-shepherd-step",
                    scrollTo: { behavior: "smooth", block: "center" },
                    cancelIcon: {
                      enabled: false,
                    },
                    arrow: true,
                    floatingUIOptions: getDefaultFloatingUIOptions(),
                    // Add smooth transition timing
                    advanceOn: {
                      selector: ".shepherd-button",
                      event: "click",
                    },
                  },
                });

                // Add all steps to the tour
                steps.forEach((step) => {
                  // Ensure the first step doesn't have a back button
                  if (step === steps[0] && step.buttons) {
                    step.buttons = step.buttons.filter(
                      (button) => !button.text.includes("Back")
                    );
                  }
                  tour.addStep(step);
                });

                // Set up event handlers with smooth transitions
                tour.on("show", (event) => {
                  console.log("Step shown:", event.step.id);

                  // Reset all AI rec sections first (cleanup from previous steps)
                  manageAIRecZIndex("", "reset");

                  // Then increase z-index for AI rec sections if this is their step
                  manageAIRecZIndex(event.step.id, "increase");

                  // Check if this step requires mobile menu opening
                  const stepElement = event.step.options.attachTo?.element;
                  const mobileStepElementsWithMenuClick = [
                    "#my-messages-btn",
                    "#profile-btn",
                    "#stats-menu-list",
                  ];

                  const needsMobileMenu =
                    isMobileDevice() &&
                    mobileStepElementsWithMenuClick.includes(stepElement);

                  // Delay image initialization based on whether mobile menu needs to open
                  const imageInitDelay = needsMobileMenu ? 750 : 150; // 750ms for mobile menu steps, 150ms for others

                  setTimeout(initializeStepImages, imageInitDelay);

                  // Apply left-to-right animation to the entire shepherd element
                  // Add extra delay for first step to avoid conflicts with Shepherd's initial animation
                  const isFirstStep = event.step.id === steps[0].id;
                  const animationDelay = isFirstStep
                    ? imageInitDelay + 300
                    : imageInitDelay + 50;
                  setTimeout(applyShepherdSlideAnimation, animationDelay);
                });

                // Preload images before starting tour
                console.log("🖼️ Preloading images...");
                preloadImages()
                  .then((results) => {
                    const successful = results.filter(
                      (result) => result.status === "fulfilled"
                    ).length;
                    const failed = results.filter(
                      (result) => result.status === "rejected"
                    ).length;
                    console.log(
                      `✅ Preloaded ${successful} images successfully, ${failed} failed`
                    );

                    // Start the tour after preloading
                    setTimeout(() => {
                      tour.start();

                      // Prevent scrolling for all devices
                      document.addEventListener("wheel", preventWheelScroll, {
                        passive: false,
                      });
                      document.addEventListener(
                        "DOMMouseScroll",
                        preventWheelScroll,
                        { passive: false }
                      );
                      document.addEventListener(
                        "touchmove",
                        preventTouchScroll,
                        {
                          passive: false,
                        }
                      );
                    }, 500); // Reduced delay since images are preloaded
                  })
                  .catch((error) => {
                    console.warn(
                      "Some images failed to preload, starting tour anyway",
                      error
                    );
                    // Start tour even if preloading fails
                    setTimeout(() => {
                      tour.start();

                      document.addEventListener("wheel", preventWheelScroll, {
                        passive: false,
                      });
                      document.addEventListener(
                        "DOMMouseScroll",
                        preventWheelScroll,
                        { passive: false }
                      );
                      document.addEventListener(
                        "touchmove",
                        preventTouchScroll,
                        {
                          passive: false,
                        }
                      );
                    }, 4000);
                  });

                tour.on("complete", () => {
                  console.log("Tour completed");

                  // Reset z-index for AI rec sections when tour completes
                  manageAIRecZIndex("", "reset");

                  // Remove scroll prevention
                  document.removeEventListener("wheel", preventWheelScroll);
                  document.removeEventListener(
                    "DOMMouseScroll",
                    preventWheelScroll
                  );
                  document.removeEventListener("touchmove", preventTouchScroll);

                  // Update memberstack data
                  // Uncomment when ready to track completion
                  const memberstack = window.$memberstackDom;
                  memberstack
                    .getCurrentMember()
                    .then(async ({ data: member }) => {
                      if (member) {
                        let memberJson = await memberstack.getMemberJSON();
                        memberJson.hasLoggedInBefore = true;
                        const updatedJson = await memberstack.updateMemberJSON({
                          json: memberJson,
                        });
                        console.log("Member JSON updated:", updatedJson);
                      }
                    });
                });

                tour.on("cancel", () => {
                  console.log("Tour cancelled");

                  // Reset z-index for AI rec sections when tour is cancelled
                  manageAIRecZIndex("", "reset");

                  // Remove scroll prevention
                  document.removeEventListener("wheel", preventWheelScroll);
                  document.removeEventListener(
                    "DOMMouseScroll",
                    preventWheelScroll
                  );
                  document.removeEventListener("touchmove", preventTouchScroll);

                  // Update memberstack data
                  // Uncomment when ready to track completion
                  const memberstack = window.$memberstackDom;
                  memberstack
                    .getCurrentMember()
                    .then(async ({ data: member }) => {
                      if (member) {
                        let memberJson = await memberstack.getMemberJSON();
                        memberJson.hasLoggedInBefore = true;
                        const updatedJson = await memberstack.updateMemberJSON({
                          json: memberJson,
                        });
                        console.log("Member JSON updated:", updatedJson);
                      }
                    });
                });
              } else {
                console.warn(
                  "Member is logged in but has no active membership plan."
                );
              }
            } else {
              console.log("No member is logged in.");
            }
          })
          .catch(function (error) {
            console.error("Error retrieving MemberStack member:", error);
          });
      } else {
        console.log("No member is logged in.");
      }
    } catch (error) {
      console.error("Error in MemberStack membership check:", error);
    }
  }); // End of checkIfShouldRunTour().then()
});
