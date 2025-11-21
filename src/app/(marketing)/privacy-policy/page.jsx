"use client";

import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, FileCheck, EyeOff, Database, CheckCircle } from "lucide-react";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <div className="relative">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50 z-[-1]" />

        {/* Content */}
        <div className="max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 md:p-12"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-400 text-lg">
                Last Updated: April 18, 2025
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Introduction and Scope</h2>
                  <p className="text-gray-300">
                    Welcome to InvisiFeed ("InvisiFeed," "We," "Us," "Our"). This Privacy Policy governs the collection, use, disclosure, processing, and protection of information associated with your use of the InvisiFeed web application, platform, and related services (collectively, the "Service"). The Service is designed for freelancers, agencies, contractors, consultants, service providers, and similar entities ("User," "You," "Your," "Business User") to manage invoices, solicit feedback from their customers ("End-User," "Customer"), and analyze performance metrics.
                  </p>
                  <p className="text-gray-300 mt-4">
                    This Policy applies to information collected:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 mt-2">
                    <li>Directly from Business Users when they register for, access, or use the Service.</li>
                    <li>Automatically when Business Users interact with the Service.</li>
                    <li>From End-Users when they submit feedback through the forms generated via the Service, noting that such collection is designed to be anonymous with respect to the End-User's Personal Identifiable Information (PII).</li>
                    <li>Through any related communications or interactions with Us.</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    By registering for, accessing, or using the Service, You acknowledge that You have read, understood, and agree to the terms of this Privacy Policy and Our accompanying Terms of Service. If You do not agree with the practices described in this Policy, You must not use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. Definitions</h2>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>Personal Information (or PII):</strong> Information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular individual or household. For Business Users, this includes name, email address, business details, contact information, and potentially GSTIN. For End-Users submitting feedback via the Service, PII is not intentionally collected by InvisiFeed through the feedback form itself.</li>
                    <li><strong>Non-Personal Information:</strong> Information that cannot, on its own, be used to identify or contact a specific individual (e.g., aggregated data, anonymized usage statistics).</li>
                    <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing Personal Information. For the Personal Information of Business Users collected directly by InvisiFeed, We are the Data Controller. The Business User is generally the Data Controller for the Personal Information contained within the invoices they upload or create and relating to their End-Users.</li>
                    <li><strong>Data Processor:</strong> The entity that processes Personal Information on behalf of the Data Controller. InvisiFeed acts as a Data Processor for the Business User concerning the data contained within uploaded or created invoices and the feedback data linked to those invoices.</li>
                    <li><strong>Service Data:</strong> All electronic data, text, messages, communications, invoice documents (PDFs or other formats), feedback content, or other materials submitted to and stored within the Service by You, Your agents, and End-Users in connection with Your use of the Service. This includes invoice details, feedback ratings and comments, and Customer data potentially present within invoices uploaded by You.</li>
                    <li><strong>GSTIN:</strong> Goods and Services Tax Identification Number, as applicable under Indian law.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. Information We Collect</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Information Provided Directly by Business Users:</h3>
                      <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong>Account Registration:</strong> Name, email address, password, business name, type of service provided.</li>
                        <li><strong>Profile Information:</strong> Additional details You may choose to provide, such as contact information, address, logo, or other business-related details.</li>
                        <li><strong>Invoice Data (Uploaded or Created):</strong> When You upload existing invoice PDFs or use Our "Create Invoice" feature, You provide Service Data which may include Your business details, Your Customer's details (name, address, contact information – potentially constituting PII of the End-User), description of services/goods, pricing, dates, and payment terms. <strong>You are solely responsible for ensuring You have the legal right and necessary consents to provide and process any End-User PII contained within these invoices via Our Service.</strong></li>
                        <li><strong>GSTIN Information (Optional):</strong> If You choose to provide Your Goods and Services Tax Identification Number (GSTIN) and the associated registered name, We collect this information solely for the purpose of displaying it on invoices generated or processed through the Service as requested by You. <strong>You warrant that any GSTIN You provide is accurate, valid, belongs to Your registered business, and that You are authorized to use it.</strong></li>
                        <li><strong>Coupon Details:</strong> Information related to promotional offers or coupons You wish to embed alongside the feedback request.</li>
                        <li><strong>Communications:</strong> Information You provide when contacting Us for support, providing feedback about the Service, or other communications.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Information Collected from End-Users (Anonymously via Feedback Form):</h3>
                      <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong>Feedback Ratings:</strong> Customer Satisfaction, Communication, Quality of Service, Value for Money, Recommendation Likelihood, Overall Rating.</li>
                        <li><strong>Feedback Content:</strong> Qualitative feedback and suggestions provided in text fields.</li>
                        <li><strong>Metadata:</strong> The Service does not intentionally collect PII (like name, email, or specific identifiers) from End-Users directly through the feedback submission form generated via an invoice. The feedback mechanism is designed for anonymity from the perspective of InvisiFeed's direct data collection. However, standard technical information (e.g., IP address, browser type, device type, time of submission) may be logged automatically for security, anti-abuse, and operational purposes. This technical data is not directly linked to the End-User's identity within the feedback content accessible to the Business User.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Information Collected Automatically:</h3>
                      <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong>Usage Data:</strong> Information about how You interact with the Service, such as features accessed, buttons clicked, time spent on pages, frequency of logins, IP addresses, browser type, operating system, device identifiers, referring URLs, and crash data.</li>
                        <li><strong>Cookies and Similar Technologies:</strong> We use cookies (small text files stored on Your device) and similar tracking technologies (like web beacons or pixels) to operate and administer the Service, gather usage data, and improve Your experience. This includes session cookies (expire when You close Your browser) and persistent cookies (remain until deleted or expired). You can control cookie preferences through Your browser settings.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. How We Use Your Information</h2>
                  <p className="text-gray-300 mb-4">
                    We use the information collected for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>To Provide and Maintain the Service:</strong> Operate, maintain, and improve the features and functionality of InvisiFeed, including invoice processing, feedback link/QR code generation, feedback collection, dashboard analytics, and profile management.</li>
                    <li><strong>To Process Invoices and Feedback:</strong> Facilitate the uploading, creation, and processing of invoices; generate unique feedback links/QR codes; receive, store, and process End-User feedback on Your behalf.</li>
                    <li><strong>To Display Analytics and Insights:</strong> Aggregate and analyze feedback data to provide Business Users with dashboard visualizations (e.g., pie charts, line charts, average ratings, best/worst areas).</li>
                    <li><strong>To Provide AI-Driven Insights:</strong> Utilize aggregated and anonymized feedback data (primarily text content) to identify potential areas for improvement and excellence using artificial intelligence algorithms. The insights generated are presented to the respective Business User.</li>
                    <li><strong>To Personalize User Experience:</strong> Tailor content and features based on Your usage patterns or profile information.</li>
                    <li><strong>For Communication:</strong> Respond to Your inquiries, provide customer support, send administrative information (e.g., updates to terms, security alerts), and, if You opt-in, marketing communications.</li>
                    <li><strong>For Security and Fraud Prevention:</strong> Monitor for suspicious activities, prevent fraud, enforce our Terms of Service, protect the rights, property, and safety of InvisiFeed, our Users, and the public. This includes verifying account information and monitoring usage patterns.</li>
                    <li><strong>For Legal Compliance:</strong> Comply with applicable laws, regulations, legal processes (e.g., subpoenas, court orders), or governmental requests.</li>
                    <li><strong>For Research and Development:</strong> Analyze usage trends and feedback to understand user needs, improve existing features, and develop new products and services. Data used for this purpose is typically aggregated or anonymized.</li>
                    <li><strong>To Display GSTIN:</strong> If provided by You, display Your GSTIN and holder name on relevant invoices generated or processed through the Service.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Legal Basis for Processing</h2>
                  <p className="text-gray-300 mb-4">
                    Our legal basis for collecting and using the Personal Information described above will depend on the specific information and context:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>Performance of a Contract:</strong> Processing is necessary to provide the Service You requested and perform Our obligations under the Terms of Service (e.g., processing Your invoices, collecting feedback, displaying dashboards).</li>
                    <li><strong>Legitimate Interests:</strong> Processing is necessary for Our legitimate interests, provided these are not overridden by Your data protection interests or fundamental rights and freedoms (e.g., security, fraud prevention, analytics, service improvement, AI insights derived from aggregated data).</li>
                    <li><strong>Consent:</strong> Where required by law, or for specific purposes like optional marketing communications, We will rely on Your explicit consent. Business Users are responsible for obtaining necessary consent from their End-Users for processing any PII contained within the invoices they upload or create using the Service.</li>
                    <li><strong>Legal Obligation:</strong> Processing is necessary to comply with a legal obligation to which We are subject.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Data Sharing and Disclosure</h2>
                  <p className="text-gray-300 mb-4">
                    We do not sell Your Personal Information. We may share information under the following limited circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>With Service Providers:</strong> We may share information with third-party vendors, consultants, and other service providers who perform services on Our behalf (e.g., hosting providers, cloud storage, email service providers, analytics providers, potentially AI/ML platform providers for insight generation). These providers are contractually obligated to protect the information and use it only for the purposes for which it was disclosed.</li>
                    <li><strong>For Legal Reasons:</strong> We may disclose information if required by law, subpoena, or other legal process, or if We have a good faith belief that disclosure is reasonably necessary to (i) comply with a legal obligation, (ii) protect and defend Our rights or property, (iii) prevent or investigate possible wrongdoing in connection with the Service, (iv) protect the personal safety of Users of the Service or the public, or (v) protect against legal liability.</li>
                    <li><strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of Our business by another company, Your information may be transferred as part of that transaction. We will notify You via email and/or a prominent notice on Our Service of any change in ownership or uses of Your Personal Information.</li>
                    <li><strong>Aggregated or Anonymized Data:</strong> We may share aggregated or anonymized information that does not directly identify You with third parties for research, marketing, analytics, or other purposes.</li>
                    <li><strong>With Your Consent:</strong> We may share information with third parties when We have Your explicit consent to do so.</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <p className="text-yellow-400 font-medium">Important Note on Invoice Content:</p>
                    <p className="text-gray-300 mt-2">
                      The content of the invoices You upload or create, including any End-User PII contained therein, is processed by Us as a Data Processor on Your behalf. You, the Business User, are the Data Controller for this information and are responsible for its legality and compliance with applicable data protection laws, including obtaining any necessary consents from Your End-Users.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Data Security</h2>
                  <p className="text-gray-300">
                    We implement reasonable administrative, technical, and physical security measures designed to protect the information We collect from loss, misuse, unauthorized access, disclosure, alteration, and destruction. These measures include encryption (e.g., SSL/TLS for data in transit), access controls, regular security assessments, and secure data storage practices.
                  </p>
                  <p className="text-gray-300 mt-4">
                    However, please be aware that no security system is impenetrable. We cannot guarantee the absolute security of Your information. You are also responsible for maintaining the security of Your account credentials (username and password).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. Data Retention</h2>
                  <p className="text-gray-300">
                    We retain Personal Information collected from Business Users for as long as Your account is active or as needed to provide You with the Service. We may also retain Your information as necessary to comply with Our legal obligations, resolve disputes, enforce Our agreements, and for legitimate business purposes (e.g., backup, archival, fraud prevention).
                  </p>
                  <p className="text-gray-300 mt-4">
                    Feedback data submitted by End-Users is retained as long as the associated Business User's account is active or until the Business User chooses to reset their data using the provided functionality within the Service.
                  </p>
                  <p className="text-gray-300 mt-4">
                    You may request deletion of Your account and associated Personal Information by contacting Us. Please note that some information may remain in our backup archives for a limited period required by law or for legitimate business purposes even after Your account is deleted.
                  </p>
                  <p className="text-gray-300 mt-4">
                    The "Reset Data" feature allows Business Users to clear invoice and feedback records associated with their account from the primary operational database but may not immediately erase data from backups or logs, which are subject to separate retention schedules.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. Your Data Protection Rights</h2>
                  <p className="text-gray-300 mb-4">
                    Depending on Your location and applicable law (such as the GDPR or India's Digital Personal Data Protection Act, 2023, once fully effective), You may have the following rights regarding Your Personal Information held by InvisiFeed:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>Right to Access:</strong> Request access to the Personal Information We hold about You.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete Personal Information.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request deletion of Your Personal Information, subject to certain exceptions.</li>
                    <li><strong>Right to Restrict Processing:</strong> Request restriction of the processing of Your Personal Information under certain conditions.</li>
                    <li><strong>Right to Data Portability:</strong> Request a copy of Your Personal Information in a structured, commonly used, and machine-readable format.</li>
                    <li><strong>Right to Object:</strong> Object to the processing of Your Personal Information based on legitimate interests or for direct marketing purposes.</li>
                    <li><strong>Right to Withdraw Consent:</strong> If processing is based on consent, You have the right to withdraw Your consent at any time.</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    To exercise these rights, please contact Us using the details provided below. We may need to verify Your identity before processing Your request. We will respond to Your request within the timeframe required by applicable law.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. International Data Transfers</h2>
                  <p className="text-gray-300">
                    Your information, including Personal Information, may be transferred to — and maintained on — computers located outside of Your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in Your jurisdiction. If You are located outside India and choose to use the Service, please note that We transfer data, including Personal Information, to India and process it there. Our service providers may also be located in other countries. We will take appropriate safeguards to ensure that Your Personal Information remains protected in accordance with this Privacy Policy and applicable law (e.g., using Standard Contractual Clauses where required).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">11. Children's Privacy</h2>
                  <p className="text-gray-300">
                    The Service is not intended for or directed at individuals under the age of 18 (or the age of majority in their jurisdiction). We do not knowingly collect Personal Information from children. If We become aware that We have inadvertently collected Personal Information from a child without verification of parental consent, We will take steps to delete that information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">12. Cookies and Tracking Technologies</h2>
                  <p className="text-gray-300">
                    We use cookies and similar technologies for purposes such as authenticating users, remembering user preferences, analyzing site traffic and trends, and generally understanding the online behaviors and interests of people who interact with our Service. You can manage your cookie preferences through your web browser settings. Disabling certain cookies may affect the functionality of the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">13. Third-Party Links and Services</h2>
                  <p className="text-gray-300">
                    The Service may contain links to third-party websites or services that are not operated by Us (e.g., a link within a coupon offer). If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">14. Disclaimers and Limitation of Liability</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) User Responsibility for Content:</h3>
                      <p className="text-gray-300">
                        You, the Business User, are solely and exclusively responsible for the accuracy, legality, quality, integrity, and intellectual property ownership or right to use all Service Data You upload, create, or process using the Service. This includes, without limitation, the content of all invoices, the accuracy and validity of any GSTIN provided, and ensuring that You have obtained all necessary rights, permissions, and consents from Your End-Users to collect, share, and process their information (including PII) via the Service in compliance with all applicable laws (including data protection and privacy laws).
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) No Liability for Fraudulent Use:</h3>
                      <p className="text-gray-300">
                        InvisiFeed provides a platform and tools for invoice and feedback management. We do not verify the authenticity of the transactions represented in the invoices, the identity of the Business Users beyond basic account verification, or the validity of GSTIN information provided by Users. <strong>InvisiFeed expressly disclaims any and all liability for any fraudulent, illegal, or unauthorized use of the Service by You or any third party.</strong> This includes, but is not limited to, the creation or distribution of fake or fraudulent invoices, the misuse of GSTIN information (whether fake, stolen, or otherwise improperly used), or any misrepresentation made by a Business User to their End-Users or any other party. You agree to indemnify and hold harmless InvisiFeed against any claims arising from Your misuse of the Service or Your violation of applicable laws or third-party rights.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Platform Provider:</h3>
                      <p className="text-gray-300">
                        InvisiFeed acts solely as a technology platform provider. We are not a party to the transactions between Business Users and their End-Users. We do not endorse any Business User or guarantee the quality of their services.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">d) End-User Anonymity:</h3>
                      <p className="text-gray-300">
                        While the feedback form is designed not to collect End-User PII directly, the ultimate anonymity depends on the End-User not including identifying information in free-text fields and the inherent limitations of internet communication (potential logging of IP addresses for technical reasons). We are not liable if an End-User voluntarily discloses PII within the feedback content.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">15. Changes to This Privacy Policy</h2>
                  <p className="text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify You of any material changes by posting the new Privacy Policy on the Service, updating the "Effective Date" and "Last Updated" dates at the top, and/or by sending You an email or other notification. We encourage You to review this Privacy Policy periodically for any changes. Your continued use of the Service after any modifications indicates Your acceptance of the revised Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">16. Governing Law and Dispute Resolution</h2>
                  <p className="text-gray-300">
                    This Privacy Policy shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising out of or relating to this Privacy Policy or Your use of the Service shall be subject to the exclusive jurisdiction of the competent courts located in Indore, Madhya Pradesh, India.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">17. Contact Information</h2>
                  <p className="text-gray-300">
                    If You have any questions, concerns, or complaints about this Privacy Policy or Our data practices, or if You wish to exercise Your data protection rights, please contact Us at:
                  </p>
                  <p className="text-yellow-400 mt-4">
                    <Link href="mailto:invisifeed@gmail.com">
                      invisifeed@gmail.com
                    </Link>
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy; 