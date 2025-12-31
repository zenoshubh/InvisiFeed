"use client";

import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, FileCheck, EyeOff, Database, CheckCircle } from "lucide-react";
import Link from "next/link";

const TermsOfService = () => {
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
                Terms of Service
              </h1>
              <p className="text-gray-400 text-lg">
                Last Updated: April 18, 2025
              </p>
            </div>

            {/* Important Notice */}
            <div className="mb-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <p className="text-yellow-400 font-medium text-center">
                PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY ACCESSING, REGISTERING FOR, OR USING THE INVISIFEED SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE, INCLUDING THE REFERENCED PRIVACY POLICY. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE SERVICE.
              </p>
              <p className="text-yellow-400 font-medium text-center mt-4">
                IF YOU ARE ENTERING INTO THIS AGREEMENT ON BEHALF OF A COMPANY, BUSINESS, OR OTHER LEGAL ENTITY, YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND SUCH ENTITY AND ITS AFFILIATES TO THESE TERMS, IN WHICH CASE THE TERMS "YOU" OR "YOUR" SHALL REFER TO SUCH ENTITY AND ITS AFFILIATES.
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="flex flex-col gap-8">
                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Definitions</h2>
                  <p className="text-gray-300 mb-4">
                    Capitalized terms used herein shall have the meanings set forth in this Section or as defined elsewhere in this Agreement. Terms not defined here but defined in the InvisiFeed Privacy Policy shall have the meanings ascribed to them therein.
                  </p>
                  <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2">
                    <li><strong>"Agreement"</strong> means these Terms of Service, including any referenced policies (such as the Privacy Policy) and any future amendments.</li>
                    <li><strong>"Content"</strong> means any data, information, text, documents (including invoices in PDF or other formats), graphics, images, feedback, suggestions, comments, or other materials uploaded, submitted, created, posted, generated, stored, or displayed by a User on or through the Service.</li>
                    <li><strong>"End-User"</strong> or <strong>"Customer"</strong> means the client or customer of the Business User who receives communications (such as invoices with feedback links) generated via the Service and may provide feedback.</li>
                    <li><strong>"Feedback Mechanism"</strong> means the functionality within the Service that allows Users to generate a unique link and/or QR code, typically embedded in or accompanying an invoice, through which End-Users can submit feedback.</li>
                    <li><strong>"GSTIN"</strong> means the Goods and Services Tax Identification Number under Indian law.</li>
                    <li><strong>"InvisiFeed," "We," "Us,"</strong> or <strong>"Our"</strong> refers to the owner and operator of the InvisiFeed platform.</li>
                    <li><strong>"Intellectual Property Rights"</strong> means all patent rights, copyright rights, mask work rights, moral rights, rights of publicity, trademark, trade dress and service mark rights, goodwill, trade secret rights, and other intellectual property rights as may now exist or hereafter come into existence, and all applications therefore and registrations, renewals, and extensions thereof, under the laws of any state, country, territory, or other jurisdiction.</li>
                    <li><strong>"Privacy Policy"</strong> means the InvisiFeed Privacy Policy, available at [Insert Link to Your Privacy Policy], as may be updated from time to time.</li>
                    <li><strong>"Service"</strong> means the InvisiFeed web application, platform, features, tools, websites, APIs, and related services provided by Us, including but not limited to invoice uploading, invoice creation, Feedback Mechanism generation, feedback collection, dashboard analytics, AI-driven insights, profile management, and data management tools.</li>
                    <li><strong>"User," "You," "Your,"</strong> or <strong>"Business User"</strong> means the individual (freelancer, consultant, etc.) or entity (agency, contractor, etc.) that registers for or uses the Service.</li>
                    <li><strong>"User Account"</strong> means the account established by a User to access and use the Service.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. Description of Service</h2>
                  <p className="text-gray-300">
                    InvisiFeed provides a platform designed to assist Business Users in managing customer interactions by:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2 mt-2">
                    <li>Allowing Users to upload existing customer invoices or create new invoices using templates provided within the Service.</li>
                    <li>Enabling Users to optionally embed coupons or promotional offers within the communication sent to End-Users.</li>
                    <li>Generating a unique Feedback Mechanism (link/QR code) associated with an invoice, intended to solicit feedback from the User's End-Users.</li>
                    <li>Collecting feedback submitted by End-Users through the Feedback Mechanism. This feedback is designed to be anonymous from the perspective of InvisiFeed's direct collection of End-User PII.</li>
                    <li>Presenting aggregated and individual feedback data, along with analytical insights (including AI-generated suggestions), to the Business User via a dashboard.</li>
                    <li>Providing tools for managing User profiles and resetting stored invoice and feedback data.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. Eligibility and Account Registration</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Eligibility:</h3>
                      <p className="text-gray-300">
                        To use the Service, You must be at least 18 years old and capable of forming a binding contract under applicable law. If You are using the Service on behalf of an entity, You represent and warrant that You have the authority to bind that entity to this Agreement. The Service is intended for professional and business use only.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Registration:</h3>
                      <p className="text-gray-300">
                        You must register for a User Account to access most features of the Service. You agree to provide accurate, current, and complete information during the registration process and to update such information promptly to keep it accurate, current, and complete.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Account Security:</h3>
                      <p className="text-gray-300">
                        You are solely responsible for safeguarding Your User Account password and for any activities or actions under Your User Account, whether or not You have authorized such activities or actions. You agree to notify InvisiFeed immediately of any unauthorized use of Your User Account or any other breach of security. InvisiFeed cannot and will not be liable for any loss or damage arising from Your failure to comply with these security obligations.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. User Conduct and Responsibilities</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Compliance with Laws:</h3>
                      <p className="text-gray-300">
                        You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations, including but not limited to tax laws, data protection laws (such as the Information Technology Act, 2000, its rules, the Digital Personal Data Protection Act, 2023, and GDPR if applicable), consumer protection laws, and regulations regarding invoicing and financial record-keeping in Your jurisdiction.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Accuracy of Information:</h3>
                      <p className="text-gray-300">
                        You are solely responsible for the accuracy, quality, integrity, legality, reliability, and appropriateness of all Content You submit, upload, or create using the Service. This includes, without limitation:
                      </p>
                      <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2 mt-2">
                        <li>The accuracy and completeness of details in invoices You upload or create.</li>
                        <li>The validity, accuracy, and rightful ownership/authorization to use any GSTIN You provide for display on invoices. <strong>Providing false, inaccurate, or unauthorized GSTIN information is strictly prohibited and may result in immediate account termination and potential legal consequences for You.</strong></li>
                        <li>Ensuring You have obtained all necessary rights, permissions, and consents from Your End-Users before including any of their Personal Information within invoices processed through the Service.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Prohibited Activities:</h3>
                      <p className="text-gray-300">
                        You agree not to engage in any of the following prohibited activities:
                      </p>
                      <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2 mt-2">
                        <li>Using the Service for any fraudulent, unlawful, deceptive, or malicious purpose, including creating or distributing fake, misleading, or fraudulent invoices.</li>
                        <li>Using the Service to transmit unsolicited commercial email (spam) or bulk communications.</li>
                        <li>Uploading, transmitting, or distributing any Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                        <li>Uploading or transmitting viruses, worms, Trojan horses, corrupted files, or any other malicious code or software intended to damage or alter a computer system or data.</li>
                        <li>Attempting to gain unauthorized access to the Service, other User Accounts, or computer systems or networks connected to the Service.</li>
                        <li>Interfering with, disrupting, or creating an undue burden on servers or networks connected to the Service.</li>
                        <li>Using the Service to infringe upon the Intellectual Property Rights of InvisiFeed or any third party.</li>
                        <li>Misrepresenting Your identity or affiliation with any person or entity.</li>
                        <li>Using any information obtained from the Service (other than Your own Content) for purposes other than Your internal business analysis and improvement as intended by the Service.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">d) Responsibility for End-User Interactions:</h3>
                      <p className="text-gray-300">
                        You are solely responsible for Your interactions with Your End-Users. InvisiFeed is not a party to any transaction or relationship between You and Your End-Users. InvisiFeed does not verify or endorse Your services or the content of Your communications with End-Users.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">e) Tool Provider Only:</h3>
                      <p className="text-gray-300">
                        You acknowledge that InvisiFeed provides tools and a platform for invoice and feedback management. InvisiFeed is not a financial advisor, tax consultant, or legal counsel. Any insights, including AI-generated suggestions, are provided for informational purposes only and should not be solely relied upon for business decisions. You are responsible for seeking independent professional advice as needed.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Service Functionality Specifics</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Invoice Processing:</h3>
                      <p className="text-gray-300">
                        When You upload or create an invoice, the Service processes it to potentially add the Feedback Mechanism and/or coupons as requested by You. You retain ownership of Your invoice Content.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Feedback Mechanism:</h3>
                      <p className="text-gray-300">
                        The Service generates unique links/QR codes. You are responsible for distributing these to Your End-Users appropriately.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Anonymous Feedback:</h3>
                      <p className="text-gray-300">
                        The Feedback Mechanism is designed to collect End-User feedback without requesting PII directly from the End-User by InvisiFeed. However, You acknowledge that End-Users may voluntarily include identifying information in free-text fields, and standard technical metadata (like IP addresses) may be logged for operational purposes as described in the Privacy Policy.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">d) Dashboard and Analytics:</h3>
                      <p className="text-gray-300">
                        The dashboard provides visualizations and analysis based on the feedback data collected for Your account. AI-identified areas are suggestions based on algorithmic analysis of aggregated feedback text and may not be exhaustive or perfectly accurate.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">e) Data Reset:</h3>
                      <p className="text-gray-300">
                        The data reset feature allows You to clear certain operational data associated with Your account but is subject to limitations described in the Privacy Policy regarding backups and logs.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">f) Sample Invoices:</h3>
                      <p className="text-gray-300">
                        Sample invoices provided are for demonstration and testing purposes only. You may not use them for actual commercial transactions.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Intellectual Property Rights</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) InvisiFeed IP:</h3>
                      <p className="text-gray-300">
                        As between You and InvisiFeed, InvisiFeed owns all right, title, and interest in and to the Service, including all related Intellectual Property Rights. This Agreement does not grant You any rights to use InvisiFeed's trademarks, logos, domain names, or other brand features. The Service is protected by copyright, trademark, and other laws of India and foreign countries.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) User Content:</h3>
                      <p className="text-gray-300">
                        As between You and InvisiFeed, You retain ownership of all right, title, and interest in and to Your Content. However, You grant InvisiFeed a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform Your Content solely to the extent necessary to provide, maintain, and improve the Service, and as otherwise permitted by the Privacy Policy and this Agreement. This license includes the right for InvisiFeed to aggregate and anonymize Your Content (including feedback data) for analytics, AI model training, and service improvement purposes, provided such aggregated data does not identify You or Your End-Users.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Feedback:</h3>
                      <p className="text-gray-300">
                        If You provide InvisiFeed with any suggestions, ideas, improvements, or other feedback regarding the Service ("Feedback"), You hereby grant InvisiFeed a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, fully paid-up license to use, reproduce, perform, display, modify, create derivative works from, distribute, and otherwise exploit such Feedback for any purpose without restriction or compensation to You.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Fees and Payment</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Current Use:</h3>
                      <p className="text-gray-300">
                        Access to and use of the Service may currently be provided free of charge or on a trial basis.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Right to Introduce Fees:</h3>
                      <p className="text-gray-300">
                        InvisiFeed reserves the right to introduce fees for the use of the Service or certain features thereof, or to implement subscription plans, at any time in its sole discretion.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Notice of Fees:</h3>
                      <p className="text-gray-300">
                        If InvisiFeed introduces fees, We will provide You with advance notice of such fees and the applicable payment terms. Your continued use of the fee-based Service or features after the effective date of the fee changes constitutes Your agreement to pay the updated fees.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. Third-Party Services and Links</h2>
                  <p className="text-gray-300">
                    The Service may contain links to third-party websites, services, or resources that are not owned or controlled by InvisiFeed. InvisiFeed does not endorse and is not responsible or liable for the availability, accuracy, content, products, or services of such third parties. You acknowledge sole responsibility for and assume all risk arising from Your use of any third-party websites, services, or resources.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. Disclaimers of Warranties</h2>
                  <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg mb-4">
                    <p className="text-yellow-400 font-medium">
                      THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INVISIFEED EXPLICITLY DISCLAIMS ANY AND ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT, TITLE, OR NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.
                    </p>
                  </div>
                  <p className="text-gray-300">
                    INVISIFEED MAKES NO WARRANTY THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, BE AVAILABLE ON AN UNINTERRUPTED, SECURE, OR ERROR-FREE BASIS, OR THAT THE INFORMATION OR RESULTS OBTAINED THROUGH THE SERVICE (INCLUDING ANALYTICS AND AI-DRIVEN INSIGHTS) WILL BE ACCURATE, RELIABLE, COMPLETE, OR CURRENT.
                  </p>
                  <p className="text-gray-300 mt-4">
                    INVISIFEED MAKES NO WARRANTY AND EXPLICITLY DISCLAIMS ALL LIABILITY REGARDING THE ACCURACY, VALIDITY, LEGALITY, OR AUTHENTICITY OF ANY CONTENT (INCLUDING INVOICES AND GSTIN INFORMATION) UPLOADED, CREATED, OR PROVIDED BY USERS. WE DO NOT VERIFY USER-PROVIDED INFORMATION.
                  </p>
                  <p className="text-gray-300 mt-4">
                    NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM INVISIFEED OR THROUGH THE SERVICE, WILL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. Limitation of Liability</h2>
                  <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg mb-4">
                    <p className="text-yellow-400 font-medium">
                      TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL INVISIFEED, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR:
                    </p>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2">
                    <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF INVISIFEED HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING OUT OF OR RELATING TO THIS AGREEMENT OR YOUR USE OF, OR INABILITY TO USE, THE SERVICE;</li>
                    <li>ANY DAMAGES ARISING FROM YOUR PROVISION OF INACCURATE, FALSE, MISLEADING, OR UNAUTHORIZED INFORMATION OR CONTENT, INCLUDING BUT NOT LIMITED TO INVALID OR FRAUDULENT GSTIN;</li>
                    <li>ANY DAMAGES ARISING FROM YOUR CREATION, USE, OR DISTRIBUTION OF FRAUDULENT, ILLEGAL, OR MISLEADING INVOICES OR COMMUNICATIONS VIA THE SERVICE;</li>
                    <li>ANY DAMAGES ARISING FROM YOUR FAILURE TO OBTAIN NECESSARY CONSENTS OR COMPLY WITH APPLICABLE LAWS REGARDING END-USER DATA;</li>
                    <li>ANY DAMAGES ARISING FROM ANY TRANSACTION, INTERACTION, OR DISPUTE BETWEEN YOU AND YOUR END-USERS OR ANY OTHER THIRD PARTY;</li>
                    <li>ANY DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT;</li>
                    <li>THE COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES.</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    IN NO EVENT SHALL THE TOTAL AGGREGATE LIABILITY OF INVISIFEED AND ITS AFFILIATES ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE SERVICE EXCEED THE GREATER OF (I) THE TOTAL AMOUNT PAID BY YOU TO INVISIFEED FOR THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (II) ONE THOUSAND INDIAN RUPEES (INR 1000.00), IF YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO INVISIFEED.
                  </p>
                  <p className="text-gray-300 mt-4">
                    THE LIMITATIONS OF LIABILITY SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN INVISIFEED AND YOU. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU TO THE EXTENT PROHIBITED BY LAW.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">11. Indemnification</h2>
                  <p className="text-gray-300">
                    You agree to defend, indemnify, and hold harmless InvisiFeed, its affiliates, licensors, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2 mt-2">
                    <li>Your violation of this Agreement or Your use of the Service, including, but not limited to, Your Content;</li>
                    <li>Your provision of inaccurate, false, fraudulent, or unauthorized information, including GSTIN;</li>
                    <li>Your creation or distribution of illegal or fraudulent invoices or communications;</li>
                    <li>Your failure to obtain necessary consents or rights related to End-User data or other Content;</li>
                    <li>Any use of the Service's content, services, and products other than as expressly authorized in this Agreement;</li>
                    <li>Your violation of any applicable law or regulation or the rights of any third party (including End-Users' privacy or data protection rights);</li>
                    <li>Any dispute or issue between You and any third party, including Your End-Users.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">12. Term and Termination</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Term:</h3>
                      <p className="text-gray-300">
                        This Agreement commences on the date You first accept it (e.g., by registering or using the Service) and continues until terminated by either You or InvisiFeed.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Termination by You:</h3>
                      <p className="text-gray-300">
                        You may terminate this Agreement at any time by closing Your User Account and ceasing all use of the Service.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Termination by InvisiFeed:</h3>
                      <p className="text-gray-300">
                        We may suspend or terminate Your access to and use of the Service, including Your User Account, at Our sole discretion, at any time and without notice or liability to You, including if:
                      </p>
                      <ul className="list-disc list-inside text-gray-300 flex flex-col gap-2 mt-2">
                        <li>You breach any term of this Agreement.</li>
                        <li>You engage in fraudulent, illegal, or harmful activities.</li>
                        <li>Providing the Service to You is no longer commercially viable for Us.</li>
                        <li>Required by law.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">d) Effect of Termination:</h3>
                      <p className="text-gray-300">
                        Upon termination of this Agreement: (i) Your right to access and use the Service will immediately cease; (ii) You remain liable for all obligations accrued prior to termination; (iii) We may delete Your User Account and Content associated with it, subject to the data retention practices outlined in Our Privacy Policy; (iv) Provisions of this Agreement that, by their nature, should survive termination shall survive, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">13. Privacy Policy</h2>
                  <p className="text-gray-300">
                    Your use of the Service is also governed by Our Privacy Policy, which is incorporated herein by reference. By using the Service, You consent to the collection, use, and disclosure of Your information as described in the Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">14. Modifications to Terms</h2>
                  <p className="text-gray-300">
                    InvisiFeed reserves the right, at its sole discretion, to modify or replace this Agreement at any time. If a revision is material, We will provide reasonable notice prior to any new terms taking effect (e.g., by posting a notice on the Service website or sending an email to the address associated with Your User Account). What constitutes a material change will be determined at Our sole discretion. By continuing to access or use the Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, You must stop using the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">15. Governing Law and Dispute Resolution</h2>
                  <p className="text-gray-300">
                    This Agreement and any dispute arising out of or related to it or the Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. The parties irrevocably agree that the courts located in Indore, Madhya Pradesh, India shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with this Agreement or its subject matter or formation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">16. Miscellaneous</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">a) Entire Agreement:</h3>
                      <p className="text-gray-300">
                        This Agreement, together with the Privacy Policy and any other legal notices published by InvisiFeed on the Service, constitutes the entire agreement between You and InvisiFeed concerning the Service and supersedes all prior or contemporaneous understandings and agreements, whether written or oral.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">b) Severability:</h3>
                      <p className="text-gray-300">
                        If any provision of this Agreement is held to be invalid or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, or severed if modification is not possible, and the remaining provisions of this Agreement will remain in full force and effect.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">c) Waiver:</h3>
                      <p className="text-gray-300">
                        No waiver of any term of this Agreement shall be deemed a further or continuing waiver of such term or any other term, and InvisiFeed's failure to assert any right or provision under this Agreement shall not constitute a waiver of such right or provision.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">d) Assignment:</h3>
                      <p className="text-gray-300">
                        You may not assign or transfer this Agreement, by operation of law or otherwise, without InvisiFeed's prior written consent. Any attempt by You to assign or transfer this Agreement, without such consent, will be null and void. InvisiFeed may freely assign or transfer this Agreement without restriction.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">e) Notices:</h3>
                      <p className="text-gray-300">
                        Any notices or other communications provided by InvisiFeed under this Agreement will be given: (i) via email to the address associated with Your User Account; or (ii) by posting to the Service.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">f) Headings:</h3>
                      <p className="text-gray-300">
                        The section headings in this Agreement are for convenience only and have no legal or contractual effect.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">17. Contact Information</h2>
                  <p className="text-gray-300">
                    If You have any questions about these Terms of Service, please contact Us at:
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

export default TermsOfService; 