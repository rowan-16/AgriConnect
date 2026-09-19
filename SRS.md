# AgriConnect (Version 1.0) - Software Requirements Specification (SRS)

## 1. Introduction 

### 1.1 Purpose 
This document specifies the software requirements for AgriConnect (Version 1.0), a web-based platform that connects farmers directly with consumers and integrates AI/ML-driven crop advisory, market demand insight, weather guidance, and a conversational assistant. This SRS covers the complete scope of the platform as planned for the initial release: user management, farmer and customer portals, order and payment processing, administrative oversight, and the four AI/data-driven modules (crop recommendation, market demand insight, weather integration, and AI chatbot). It is intended to guide design, implementation, and testing for the full system and does not describe any external system with which the platform may later integrate beyond what is listed in Section 2.6 and Section 3. 

### 1.2 Document Conventions 
Functional requirements are uniquely identified using the format `REQ-<module number>.<sequence>`, for example `REQ-1.1` for the first requirement of the User Management Module. Requirements written in this document are considered mandatory ("shall") unless explicitly marked optional ("may") or deferred ("TBD"). Module names used throughout this document (e.g., Farmer Portal, AI Crop Recommendation Module) correspond to the ten modules defined in the project scope and are used consistently across Sections 2 through 4. No requirement priority is assumed to be inherited automatically from its parent feature; each functional requirement carries its own implicit priority as stated in the feature's Description and Priority subsection. 

### 1.3 Intended Audience and Reading Suggestions 
This document is intended for the project's student development team, project guide/reviewer, and any evaluators assessing the system for academic or demonstration purposes. Developers and testers should read Sections 3 and 4 closely, as these define interface and functional requirements to be implemented and verified. Project reviewers and guides may prefer to start with Section 1 (Introduction) and Section 2 (Overall Description) for context before reviewing detailed features in Section 4. The document is organized top-down: general context first (Sections 1–2), followed by external interfaces (Section 3), functional features by module (Section 4), and finally non-functional and supplementary requirements (Sections 5–6) and appendices. 

### 1.4 Product Scope 
Small and marginal farmers currently depend heavily on middlemen and mandis to sell their produce, which reduces their profit margins and leaves them with little visibility into fair pricing, seasonal demand, or optimal crop planning. Consumers, in turn, have limited access to fresh, traceable produce sourced directly from farmers. AgriConnect addresses this gap by providing a single web platform where farmers can list and sell produce directly to consumers, and where AI/ML techniques assist farmers in deciding what to grow, when to sow, and what is currently in demand — using inputs such as soil type, season, region, and real-time weather conditions. The platform's objectives are to:
- (a) Increase farmer income by removing intermediary markups, 
- (b) Give consumers access to fresh, traceable produce, and 
- (c) Support data-driven crop planning through a crop recommendation engine, market demand insights derived from the platform's own transaction data, weather integration, and an AI-powered chatbot for both farmer and customer support. 

### 1.5 References 
- IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830-1998), used as the structural basis for this document. 
- Crop Recommendation Dataset, Kaggle (public dataset used to train the AI Crop Recommendation Module's classification model). 
- OpenWeatherMap API Documentation — https://openweathermap.org/api 
- Razorpay / Stripe Payment Gateway API Documentation (test/sandbox mode) 
- Project module scope document: "Final Module List (Scoped for Implementation)" — internal project artifact defining the ten modules referenced throughout this SRS. 

---

## 2. Overall Description  

### 2.1 Product Perspective 
AgriConnect is a new, self-contained web application; it is not a follow-on to an existing product and does not replace an existing system. It consists of a browser-based front end used by three user classes (Farmer, Customer, Admin), a back-end application server exposing REST APIs, a relational/application database, and a set of AI/ML components (a trained classification model for crop recommendation, a rules/statistics-based trend engine for market demand, and an LLM-powered chatbot) that are invoked by the back end. The system also consumes one external service — a public weather API — and integrates with a payment gateway operating in test/sandbox mode. At a high level, the Farmer Portal and Customer Portal are the two primary user-facing subsystems, both sitting on top of a shared Order & Payment Module and User Management Module, with the Admin Panel providing oversight across all of them, and the AI/Data-Driven Modules acting as shared services consumed by both portals and the chatbot. 

### 2.2 Product Functions 
The major functions the product must perform, organized by module:
- **User Management**: Role-based registration and login for Farmer, Customer, and Admin; JWT-based authentication; profile management and password reset. 
- **Farmer Portal**: Create/edit/delete crop listings; accept, reject, or fulfill orders; view a sales and earnings dashboard. 
- **Customer Portal**: Browse, search, and filter crop listings; cart and checkout; track orders and view order history; rate and review farmers. 
- **Order & Payment**: Manage the full order lifecycle (placed → confirmed → delivered); process payments via a gateway in test mode; generate invoices. 
- **Admin Panel**: Verify/approve farmer accounts; manage master data (crop types, regions); view platform-wide analytics; monitor transactions and disputes. 
- **AI Crop Recommendation**: Recommend suitable crops and an estimated success likelihood from soil type, region, and season, using a trained classification model. 
- **Market Demand Insight**: Surface trending/high-demand crops from the platform's own historical sales data using simple trend analysis. 
- **Weather Integration**: Display real-time weather data alongside crop recommendations to support sowing/harvesting decisions. 
- **AI Chatbot**: Answer farmer and customer queries, grounded in context from the crop recommendation, market insight, weather, and order modules. 
- **Notifications**: Send in-app and email notifications for order status changes and other basic alerts. 

### 2.3 User Classes and Characteristics 
| User Class | Description | Characteristics |
|---|---|---|
| **Farmer** | Registers to list and sell crops directly to consumers. | Frequent use during harvest and sowing seasons; primary user of AI crop recommendation, weather, and market insight features; technical expertise ranges from low to moderate, so the interface should be simple, intuitive, and mobile-friendly. |
| **Customer** | Browses and purchases produce directly from farmers. | Frequently uses product browsing, search, shopping cart, checkout, and order tracking features; expects a familiar e-commerce experience; moderate technical expertise assumed. |
| **Admin** | Platform operator responsible for verification, master data management, and overall system oversight. | Least frequent but highest-privilege user; manages approvals, analytics dashboards, user accounts, transactions, and dispute resolution; assumed to have higher technical familiarity with the platform. |

### 2.4 Operating Environment 
- **Client**: Any modern desktop or mobile web browser (Chrome, Firefox, Edge, Safari — latest two major versions) with an internet connection. 
- **Server**: A Node.js/Express application server hosted on a cloud platform or local server. 
- **Database**: Relational database (MySQL/PostgreSQL) or NoSQL storage for users, listings, orders, and transaction history. 
- **AI/ML runtime**: A Python-based service (Flask/FastAPI or TypeScript simulation engine) hosting the trained classification model. 
- **External services**: OpenWeatherMap API for weather data; payment gateway (Razorpay or Stripe) operating in test/sandbox mode; LLM provider for the AI Chatbot Module. 

### 2.5 Design and Implementation Constraints 
- The AI Crop Recommendation Module must be trained on a public dataset (e.g., Kaggle crop-recommendation dataset). 
- The Market Demand Insight Module relies on transaction data generated within the platform itself using moving volume analysis. 
- Payment processing uses sandbox/test-mode credentials only. 
- Authentication uses JSON Web Tokens (JWT). 
- The AI Chatbot Module grounds queries against internal data sources before generating natural language responses. 

### 2.6 User Documentation 
In-app onboarding guides, PDF user manuals, and context-sensitive tooltips across crop listing, checkout, and AI recommendation interfaces. 

---

## 3. External Interface Requirements  

### 3.1 User Interfaces 
- **Farmer Interface**: Dashboard for managing crop listings, orders, and earnings; dedicated screens for AI crop recommendations, weather guidance, and chatbot assistance. 
- **Customer Interface**: Storefront browse/search with filters (crop type, region, price), cart & checkout, order history/tracking, and farmer review forms. 
- **Admin Interface**: Verification queue for pending farmer accounts, master data management screens, dispute monitoring, and platform analytics dashboards. 

### 3.2 Hardware Interfaces 
The system is accessed standard client devices (desktops, laptops, tablets, smartphones) via modern web browsers. 

### 3.3 Software Interfaces  
| Interface | Purpose | Data Exchanged |
|---|---|---|
| OpenWeatherMap API | Supplies weather data for Weather Integration Module. | Request: Location/Region<br>Response: Temperature, humidity, rain, forecast (JSON). |
| Payment Gateway (Razorpay/Stripe Test Mode) | Processes payments in Order & Payment Module. | Request: Order amount, currency, customer details<br>Response: Payment status, transaction ID. |
| LLM API / Chatbot Engine | Natural language responses for AI Chatbot Module. | Request: User query + context (Recs, Weather, Orders)<br>Response: Grounded AI response (JSON/Text). |
| Application Database | Stores user profiles, listings, orders, and reviews. | Structured SQL/NoSQL entities. |
| AI/ML Model Service | Hosts trained model for crop recommendation. | Request: Soil, region, season, climate<br>Response: Recommended crops with confidence scores. |

---

## 4. System Features 

### 4.1 User Management Module
- **REQ-1.1**: The system shall allow a new user to register as a Farmer or Customer, capturing name, email, phone number, password, and role. 
- **REQ-1.2**: The system shall require Admin approval before a Farmer account can create crop listings. 
- **REQ-1.3**: The system shall authenticate users via email/phone and password and issue a signed JWT upon successful login. 
- **REQ-1.4**: The system shall allow a logged-in user to view and edit their profile details. 
- **REQ-1.5**: The system shall provide a password reset mechanism via a time-limited email link or OTP. 
- **REQ-1.6**: The system shall reject login attempts with invalid credentials and display a generic error message without revealing whether email or password was incorrect. 

### 4.2 Farmer Portal
- **REQ-2.1**: The system shall allow a verified Farmer to add a crop listing with name, quantity available, price per unit, harvest date, and image. 
- **REQ-2.2**: The system shall allow a Farmer to edit or delete their own crop listings, but not those of other Farmers. 
- **REQ-2.3**: The system shall allow a Farmer to view incoming orders and accept, reject, or mark them fulfilled. 
- **REQ-2.4**: The system shall update listing quantity automatically when an order is accepted and prevent over-ordering. 
- **REQ-2.5**: The system shall display a sales/earnings dashboard summarizing total orders, revenue, and top-selling crops. 

### 4.3 Customer Portal
- **REQ-3.1**: The system shall allow a Customer to browse active crop listings and search/filter by crop name, region, and price range. 
- **REQ-3.2**: The system shall provide a shopping cart that persists selected items until checkout or abandonment. 
- **REQ-3.3**: The system shall allow a Customer to complete checkout, creating an order passed to the Order & Payment Module. 
- **REQ-3.4**: The system shall allow a Customer to view status and history of all past and current orders. 
- **REQ-3.5**: The system shall allow a Customer to submit a rating (1–5 stars) and optional written review for a Farmer after order delivery. 

### 4.4 Order and Payment Module
- **REQ-4.1**: The system shall support an order lifecycle: `placed` → `confirmed` → `delivered` (plus `rejected`/`cancelled`). 
- **REQ-4.2**: The system shall integrate with a payment gateway (Razorpay or Stripe) in test/sandbox mode to process payments and handle callbacks. 
- **REQ-4.3**: The system shall not transition an order to `confirmed` unless payment has been successfully authorized by the gateway. 
- **REQ-4.4**: The system shall automatically generate a downloadable invoice (PDF or equivalent) once an order reaches `delivered` status. 
- **REQ-4.5**: The system shall log all order state transitions with a timestamp for audit and dispute monitoring. 

### 4.5 Admin Panel
- **REQ-5.1**: The system shall present Admins with a queue of pending Farmer registrations for approval or rejection. 
- **REQ-5.2**: The system shall allow Admins to manage master data such as crop types and supported regions. 
- **REQ-5.3**: The system shall provide an analytics dashboard showing total users, total sales, and top-performing crops over a selectable time range. 
- **REQ-5.4**: The system shall provide a view for monitoring transactions and flagged disputes, allowing an Admin to mark a dispute as resolved. 
- **REQ-5.5**: The system shall restrict Admin Panel access to users with the Admin role only. 

### 4.6 AI Crop Recommendation Module
- **REQ-6.1**: The system shall accept soil type, region, and season as input for crop recommendation. 
- **REQ-6.2**: The system shall return one or more recommended crops with estimated success likelihood using a trained classification model. 
- **REQ-6.3**: The system shall validate model accuracy against the public crop recommendation dataset. 
- **REQ-6.4**: The system shall handle invalid or missing input by returning a clear error rather than a fabricated recommendation. 
- **REQ-6.5**: The system shall make crop recommendations available to the AI Chatbot Module as contextual input. 

### 4.7 Market Demand Insight Module
- **REQ-7.1**: The system shall compute trending/high-demand crops using the platform's historical order data. 
- **REQ-7.2**: The system shall display trend results ranked by relative demand (percentage change in order volume). 
- **REQ-7.3**: The system shall recalculate market demand insights on a scheduled batch basis. 
- **REQ-7.4**: The system shall clearly indicate when insufficient transaction data exists to produce a meaningful trend. 
- **REQ-7.5**: The system shall make market demand insights available to the AI Chatbot Module as contextual input. 

### 4.8 Weather Integration Module
- **REQ-8.1**: The system shall retrieve current weather conditions (temp, humidity, precipitation, forecast) from OpenWeatherMap. 
- **REQ-8.2**: The system shall display weather data alongside AI crop recommendations on the Farmer dashboard. 
- **REQ-8.3**: The system shall cache weather responses for a short interval (15–30 minutes) to reduce redundant API calls. 
- **REQ-8.4**: The system shall degrade gracefully (showing "weather unavailable") if the API is unreachable. 
- **REQ-8.5**: The system shall make current weather data available to the AI Chatbot Module as contextual input. 

### 4.9 AI Chatbot Module
- **REQ-9.1**: The system shall provide a chatbot interface accessible to both Farmer and Customer roles. 
- **REQ-9.2**: The system shall route Farmer queries related to crop advice, weather, or platform help to appropriate context sources (Modules 6, 7, 8). 
- **REQ-9.3**: The system shall route Customer queries related to finding produce, order status, or navigation to appropriate data sources (Customer Portal, Order & Payment Module). 
- **REQ-9.4**: The system shall clearly indicate when it cannot ground a response in available data and shall not fabricate details. 
- **REQ-9.5**: The system shall log chatbot conversations for quality review. 

### 4.10 Notification Module
- **REQ-10.1**: The system shall generate an in-app notification whenever an order transitions between lifecycle states. 
- **REQ-10.2**: The system shall send an email notification for order confirmation, order delivery, and Farmer account approval/rejection. 
- **REQ-10.3**: The system shall allow a user to view a list of recent in-app notifications marked read or unread. 
- **REQ-10.4**: The system shall not send duplicate notifications for the same event/state transition. 

---

## 5. Nonfunctional Requirements 

### 5.1 Performance Requirements 
- Crop listing search/filter response within 2 seconds under normal load. 
- AI Crop Recommendation within 3 seconds of valid input. 
- Weather data rendering within 2 seconds with background cache refresh. 
- Batch market trend recalculations complete within 5 minutes without degrading web performance. 

### 5.2 Safety & Integrity Requirements 
- Payment authorization confirmation required before order status updates to `confirmed` or `delivered`. 

### 5.3 Security Requirements 
- Password storage using one-way salted hashing (e.g. bcrypt). 
- JWT-based authentication with expiration handling. 
- Strict server-side and client-side access control for Admin Panel. 
- HTTPS encryption for all client-server communications. 
- Server-side storage of external API keys. 

### 5.4 Software Quality Attributes 
- **Usability**: Mobile-friendly, simple forms, clear error guidance. 
- **Reliability**: Graceful degradation, explicit error feedback, retry options. 
- **Maintainability**: Decoupled AI/ML services accessible via REST/JSON interfaces. 
- **Scalability**: Modular design permitting independent module deployment. 

---

## 6. Appendices

### Appendix A: Glossary
- **Farmer**: Admin-verified user who lists and sells agricultural produce. 
- **Customer / Buyer**: User who browses, purchases, tracks, and reviews produce. 
- **Admin**: System operator managing approvals, master data, and dispute resolution. 
- **JWT**: JSON Web Token for stateless authorization. 
- **Mandi**: Traditional physical agricultural marketplace with middlemen. 

### Appendix B: Key Entity Models & Relationships
Entities: User, FarmerProfile, CropListing, Order, OrderItem, PaymentRecord, Review, Notification, ChatLog.
