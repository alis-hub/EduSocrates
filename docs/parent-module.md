# GURUMERA
# PARENT MODULE
## Comprehensive Product Requirements, Functional Scope & Technical Design Foundation

**Document Version:** 1.0  
**Document Status:** Approved Functional Direction – Proposed Technical Specification  
**Product:** GuruMera – Discover the Why!  
**Module:** Parents & Guardians  
**Audience:** Product Owner, Software Architects, UI/UX Designers, Backend Engineers, Frontend Engineers, QA Engineers, AI Coding Agents

---

# DOCUMENT CONTROL

## 1. Purpose of This Document

This document defines the comprehensive functional and non-functional requirements for developing the Parent Module of GuruMera.

It establishes the product behavior, user journeys, feature requirements, access rules, business logic, data requirements, security expectations, and implementation boundaries.

It is intended to serve as the authoritative foundation for:

1. Detailed Low-Level Design (LLD).
2. Database design and entity relationships.
3. Backend API specifications.
4. Frontend application architecture.
5. UI/UX design and interaction specifications.
6. Role-based and relationship-based authorization.
7. Integration with existing GuruMera modules.
8. QA strategy and acceptance testing.
9. AI-coder implementation instructions.

The implementation must integrate with the existing GuruMera ecosystem rather than create a disconnected application.

## 2. Product Background

GuruMera is an AI-powered educational platform built around guided learning, conceptual understanding, and independent thinking.

Its educational philosophy is:

**Discover the Why!**

The Parent Module should extend this philosophy to parents and guardians by giving them meaningful visibility into their children's educational journey.

The purpose is not simply to display examination results or assignment completion records. It is to help parents understand:

- What their children are learning.
- How well they understand the concepts.
- Where they are performing well.
- Where they need additional support.
- How consistently they engage in learning.
- Whether they are developing independent learning skills.
- How parents can support their educational development.

The Parent Module must establish a constructive connection between students, parents, teachers, schools, and GuruMera.

---

# PART I – PRODUCT SCOPE AND ACCESS MODEL

# 3. Parent Module User Categories

The Parent Module must support two fundamentally different experiences.

## 3.1 Parent as a Visitor

A visitor is an unauthenticated individual who accesses the public GuruMera website and wants to explore the Parent Portal.

Examples:

- A parent evaluating GuruMera for their child.
- A parent whose school has not yet adopted GuruMera.
- A prospective customer interested in the platform.
- A parent who wants to understand the platform before approaching their school.

A visitor must not be permitted to create a real Parent account independently.

Instead, GuruMera must provide a dedicated Parent Demo environment containing synthetic information.

### Visitor capabilities

- Access the public Parent landing page.
- Read about Parent Portal capabilities.
- View product screenshots and demonstrations.
- Explore a fully populated Parent Demo.
- Navigate between demo children.
- Review sample assignments and grades.
- Explore academic performance.
- Explore concept mastery.
- Review sample learning activity.
- Review sample notifications.
- Read privacy and security information.
- Access FAQs and support information.
- Navigate to Parent Login.
- Accept a school invitation through a valid invitation link.

### Visitor restrictions

Visitors must not:

- Register themselves as real parents.
- Create production Parent accounts.
- Associate themselves with real students.
- Access real student records.
- Access real school information.
- Send messages to real teachers.
- Submit real parent-teacher meeting requests.
- Modify production academic information.
- Access school administration functionality.

The Parent Demo must be completely separated from production parent accounts and student information.

## 3.2 Parent as an Account Holder

An authenticated parent is an individual whose account has been created through a valid invitation issued by an authorized school administrator or authorized school representative.

An authenticated parent may be associated with one or more students.

The parent must only access students for whom an active and authorized parent-child association exists.

### Parent account capabilities

- View linked children.
- Switch between children's dashboards.
- Monitor assignments.
- View examination and assessment results.
- Monitor academic performance.
- View concept mastery information.
- Monitor learning activities.
- View authorized AI Tutor usage summaries.
- View teacher feedback.
- View attendance, where integrated.
- View school announcements.
- Receive notifications.
- Communicate with teachers, where enabled.
- Request parent-teacher meetings, where enabled.
- Manage profile information.
- Manage security settings.
- Manage notification preferences.
- Request account or association changes.
- Access help and support.

### Parent account restrictions

Parents must not:

- Create additional student accounts.
- Self-associate with students.
- Access students outside their authorized associations.
- Modify grades or assessment results.
- Modify teacher feedback.
- Modify student submissions.
- Change school records.
- Access teacher or administrator dashboards.
- Access other parents' information.
- Bypass school authorization.

Parent academic access should be read-only unless an explicitly authorized workflow provides otherwise.

---

# 4. Mandatory Parent Account Creation Policy

This is a fundamental architectural and business rule.

**All real Parent accounts must originate from school-issued invitations.**

Public self-registration for Parent accounts is prohibited.

## 4.1 Permitted account creation mechanism

The only permitted account creation workflow is:

1. Authorized school administrator identifies a student.
2. Administrator selects or enters the parent information.
3. Administrator generates an invitation.
4. GuruMera creates a secure invitation token.
5. GuruMera sends an invitation link to the parent's registered email.
6. Parent opens the invitation.
7. GuruMera validates the invitation.
8. Parent completes account setup.
9. Parent account is created or an existing account is linked.
10. Parent-child association becomes active.
11. Parent is redirected to the Parent Dashboard.

## 4.2 Prohibited mechanisms

The following must not create real Parent accounts:

- Public Parent Sign Up.
- Generic registration with Parent role selection.
- Public Google registration.
- Public Microsoft registration.
- LinkedIn registration.
- Student invitation codes that bypass school authorization.
- Email-domain matching alone.
- Manual parent-child association without school authorization.

Social authentication may be offered to an already invited parent as an authentication method, but it must never bypass the invitation requirement.

## 4.3 Public Parent Demo

The public Parent Demo is the only unauthenticated route to experience the Parent Portal.

It must use a dedicated synthetic environment with fictional records.

The demo must not use production school tenants or production student records.

---

# PART II – PUBLIC PARENT EXPERIENCE

# 5. Public Parent Landing Page

**Suggested URL:** `/parents`

The landing page must be designed specifically for parents and guardians.

Its purpose is to communicate GuruMera's educational value, explain the Parent Portal, establish trust, and encourage visitors to explore the demo.

## 5.1 Navigation

The main GuruMera navigation should include:

- Home
- For Students
- For Teachers
- For Schools
- For Parents
- Pricing
- About
- Login

The Parent section should have its own dedicated landing page.

## 5.2 Hero Section

Suggested headline:

**Your Child Deserves to Understand, Not Just Memorize.**

Supporting description:

"GuruMera helps students develop genuine understanding through guided discovery, interactive learning, and AI-powered tutoring that encourages independent thinking."

Primary CTA:

**Explore Parent Portal**

Secondary CTA:

**Already Invited? Accept Invitation**

A smaller option:

**Existing Parent? Sign In**

The hero section should visually demonstrate a parent reviewing their child's learning progress.

## 5.3 Why Parents Should Choose GuruMera

Introduce the main educational benefits.

### A. Understanding Over Memorization

GuruMera encourages students to understand concepts, reasoning, and underlying principles rather than simply memorizing answers.

### B. Guided AI Learning

The AI Tutor encourages students to think independently through questions, hints, explanations, and guided reasoning.

### C. Personalized Learning

Students can explore topics and subjects based on their learning requirements and progress.

### D. Continuous Practice

Flashcards, quizzes, knowledge maps, and other learning tools reinforce conceptual understanding.

### E. Academic Visibility

Parents can monitor assignments, grades, assessments, learning activity, and other school-authorized information.

## 5.4 How GuruMera Helps Your Child

Present the learning journey in a visual sequence:

1. Student selects a subject or concept.
2. GuruMera introduces the topic.
3. AI Tutor guides the student through questions.
4. Student explores concepts and develops understanding.
5. Student practices using quizzes and learning tools.
6. Relevant learning activities and assessment results are recorded.
7. Parents review authorized progress information.

## 5.5 Parent Portal Features

Introduce the following capabilities:

- Academic Overview.
- Assignments and Assessments.
- Subject-Wise Performance.
- Concept Mastery.
- Learning Activity.
- AI Tutor Usage Summary.
- Teacher Feedback.
- Attendance.
- Notifications.
- Parent-Teacher Communication.

Only advertise features that are available or clearly identify upcoming capabilities.

## 5.6 Parent Dashboard Preview

Display genuine GuruMera screenshots.

Recommended previews:

1. My Children.
2. Child Overview.
3. Academic Performance.
4. Assignments.
5. Concept Mastery.
6. Learning Activity.
7. Notifications.

Screenshots should use synthetic demonstration data.

## 5.7 Student Privacy and Safety

Provide a dedicated explanation covering:

- Parent authorization.
- Student information protection.
- School tenant isolation.
- Parent-child relationship verification.
- AI conversation privacy.
- Data retention.
- Data access.
- Account security.
- Data deletion policies.
- Applicable legal and regulatory commitments.

Do not make unsupported claims such as absolute privacy guarantees or certifications that have not been independently established.

## 5.8 Frequently Asked Questions

The public Parent page must contain a comprehensive FAQ section.

Recommended questions:

1. What is GuruMera?
2. How does GuruMera help students?
3. Does GuruMera provide direct answers?
4. How can parents monitor their children?
5. Can parents see assignments and examination results?
6. Can parents monitor concept mastery?
7. Can parents see AI Tutor activity?
8. How does GuruMera protect student information?
9. Can parents create accounts independently?
10. How do parents receive invitations?
11. What if my child's school does not use GuruMera?
12. Can one parent account support multiple children?
13. Can both parents access the same student?
14. Can parents communicate with teachers?
15. Is the Parent Portal free?
16. How can parents reset their password?
17. What happens when a child changes schools?
18. How can a parent request removal of an association?

The answer to the account registration question must clearly explain that real Parent accounts are created only through school-issued invitations.

## 5.9 Public Parent Page CTA

The landing page must provide three clear navigation options:

- Explore Parent Demo.
- Accept School Invitation.
- Parent Login.

There must be no public Parent Registration CTA.

---

# 6. Parent Demo Environment

The Parent Demo is a major product demonstration and customer acquisition feature.

It must provide an interactive experience rather than merely displaying screenshots.

**Suggested URL:** `/parent-demo`

Alternatively, the demo may be launched through a dedicated option on the login page.

## 6.1 Demo Access

Public visitors should be able to enter the Parent Demo without:

- Creating an account.
- Providing an email address.
- Providing a phone number.
- Creating a password.
- Receiving an invitation.
- Submitting personal information.

A visitor should be able to enter the demo with one action.

## 6.2 Demo Family

Create a realistic fictional family.

Suggested sample dataset:

**Parent:** Eleanor Chen

**School:** Horizon Academy – Demo Environment

**Child 1:** Alex Chen

- Grade 12.
- Section A.
- AP Physics 1.
- Calculus AB.
- Additional subjects.

**Child 2:** Emily Chen

- Grade 9.
- Section B.
- Mathematics.
- General Science.
- English.

The demo must support switching between both children.

## 6.3 Demo Academic Records

Populate realistic synthetic records for:

### Assignments

- Upcoming.
- Pending.
- Submitted.
- Graded.
- Overdue.
- Excused.

### Assessments

- Diagnostic quizzes.
- Class tests.
- Homework.
- Projects.
- Examinations.

### Academic Performance

- Subject-wise grades.
- Assessment history.
- Performance trends.
- Grade distributions.

### Concept Mastery

- Mastered concepts.
- Developing concepts.
- Concepts requiring practice.
- Concepts not yet assessed.

### Learning Activity

- Study sessions.
- Subjects explored.
- Topics discussed.
- Quizzes attempted.
- Flashcards reviewed.
- Knowledge maps explored.

### Teacher Feedback

- Positive feedback.
- Improvement recommendations.
- Assignment-related feedback.

### Attendance

- Present.
- Absent.
- Late.
- Excused.

### Notifications

- Assignment reminders.
- Grading updates.
- Teacher feedback.
- School announcements.
- Academic alerts.

## 6.4 Demo Functionality

The demo should allow visitors to:

- Select a child.
- Switch between children.
- Navigate all Parent Portal tabs.
- Filter sample assignments.
- Open assignment details.
- View sample grades.
- View performance charts.
- Explore concept mastery.
- Review learning activity.
- View notifications.
- Read sample teacher feedback.
- View sample attendance.
- Explore account settings in read-only demonstration mode.

## 6.5 Demo Restrictions

The demo must be completely separated from real production data.

Mandatory restrictions:

1. Demo users cannot access production student records.
2. Demo users cannot create production parent accounts.
3. Demo users cannot establish real parent-child associations.
4. Demo users cannot send real teacher messages.
5. Demo users cannot submit real meeting requests.
6. Demo users cannot modify real school records.
7. Demo users cannot access school administration.
8. Demo users cannot access production account settings.
9. Demo modifications must not affect production data.
10. Demo users cannot access another tenant's records.

The demo should display a persistent visual indicator:

**DEMO ENVIRONMENT – All information shown is fictional.**

## 6.6 Demo Reset

If interactive modifications are supported, provide a Reset Demo option.

The demo must use disposable or resettable state.

Prefer a dedicated synthetic dataset that can be restored without affecting any production information.

## 6.7 Demo Security

The demo must not be implemented by granting anonymous access to an ordinary production Parent account.

Use an isolated demo context with restricted permissions.

If a demo session is represented by a temporary authenticated identity, it must have a distinct role or authorization context, and all APIs must enforce demo isolation.

---

# PART III – SCHOOL-DRIVEN PARENT ONBOARDING

# 7. Parent Invitation Management

Parent account creation must be initiated by an authorized school administrator or authorized school representative.

## 7.1 School Administrator Navigation

Add a dedicated Parent Management section to the School Administration Portal.

Suggested navigation:

- Students
- Parents & Guardians
- Parent Invitations
- Parent Associations
- Parent Communication
- Reports

## 7.2 Parent Invitation Creation

The school administrator should be able to create an invitation from:

- Individual Student Profile.
- Parent Management.
- Bulk Parent Invitation Workflow.

### Invitation fields

Required:

- Student.
- Parent Full Name.
- Parent Email Address.
- Relationship with Student.

Optional:

- Mobile Number.
- Secondary Contact Information.
- Access Permission Profile.

The school and tenant identifiers must be assigned by the backend from the authenticated administrator's context.

The frontend must not be trusted to provide an arbitrary tenant identifier.

## 7.3 Multiple Student Association

A parent may have multiple children.

The invitation workflow should support:

**Scenario A: New Parent**

The school issues an invitation to an email address that does not have an existing Parent account.

After acceptance, a new Parent account is created.

**Scenario B: Existing Parent**

The school issues another invitation to an email address that already belongs to a Parent account.

After acceptance, the additional child is associated with the existing account.

A duplicate Parent account must not be created.

The existing parent must verify ownership of the invited email address before accepting the additional association.

**Scenario C: Multiple Children in One Invitation**

The school may invite a parent for multiple children through one invitation workflow, provided the invitation is authorized for all listed students.

The acceptance process must clearly display every child covered by the invitation.

## 7.4 Invitation Generation

The backend must generate a cryptographically secure, unpredictable invitation token.

Requirements:

- Token must be unique.
- Token must be single-use.
- Token must expire.
- Token must be associated with a specific school.
- Token must be associated with an intended email address.
- Token must be associated with authorized student records.
- Token must be associated with an invitation creator.
- Token must not reveal student identifiers or sensitive information.
- Token must be stored securely, preferably as a cryptographic hash.
- Token must not be logged in plaintext.

Suggested validity period: 72 hours, configurable by authorized school policy.

## 7.5 Invitation Email

Suggested email subject:

**Invitation to Join GuruMera – [School Name]**

Email content:

Dear [Parent Name],

[School Name] has invited you to join GuruMera, our educational platform designed to help parents stay connected with their children's academic progress and learning journey.

Through your Parent Portal, you will be able to monitor authorized academic information, review assignments, view assessment results, and follow your child's learning progress.

To activate your Parent account, please use the secure invitation link below.

**Accept Invitation**

[Secure Invitation URL]

This invitation is intended for you and should not be shared with others.

Regards,

[School Name]  
GuruMera

The email should also include the invitation expiry date and contact details for the school.

## 7.6 Invitation Lifecycle

Supported statuses:

| Status | Meaning |
|---|---|
| Pending | Invitation created |
| Sent | Email sending successfully initiated |
| Delivered | Delivery confirmed, where supported |
| Accepted | Parent completed onboarding |
| Expired | Invitation expired |
| Revoked | Administrator cancelled invitation |
| Failed | Invitation delivery or processing failed |

The administrator should be able to:

- View invitation details.
- Resend an invitation.
- Revoke an invitation.
- Generate a replacement invitation.
- View acceptance status.
- Review invitation history.

Resending must not create uncontrolled duplicate invitations.

## 7.7 Parent Invitation Acceptance

Suggested URL:

`/parent/invitation/{token}`

When the invitation link is opened, the system must:

1. Receive the token.
2. Validate its format.
3. Retrieve the invitation using a secure token hash.
4. Verify the invitation status.
5. Verify expiration.
6. Verify revocation status.
7. Verify the intended email address.
8. Verify school and student associations.
9. Determine whether the parent already has an account.
10. Display the invitation details.
11. Allow the parent to continue with account activation.

The invitation link must not automatically activate an account merely because it was opened.

## 7.8 Parent Account Setup

For a new parent:

- Full Name.
- Invited Email Address (read-only).
- Password.
- Confirm Password.
- Terms acceptance.
- Privacy Policy acceptance.

The email address must remain locked to the invited address.

The system must verify email ownership through the secure invitation acceptance process or an additional email verification step.

For an existing parent:

- Authenticate the existing account.
- Verify the invited email address.
- Display the additional student association.
- Obtain explicit acceptance.
- Activate the additional association.

The system must not reset an existing parent's password during this process.

## 7.9 Invitation Completion

Upon successful completion:

1. Create the Parent account if it does not exist.
2. Assign the Parent role.
3. Activate the authorized parent-child associations.
4. Apply school-specific access permissions.
5. Mark the invitation as accepted.
6. Record the acceptance timestamp.
7. Record the invitation creator and accepting account.
8. Generate an audit event.
9. Send an invitation acceptance notification to the school.
10. Redirect the parent to the My Children page.

The account must not gain access to any other student records.

---

# PART IV – PARENT AUTHENTICATION AND ACCOUNT MANAGEMENT

# 8. Parent Login

The existing GuruMera login interface should be updated to accommodate the revised account policy.

## 8.1 Login Options

Support:

- Email and password.
- Google authentication for previously invited parents.
- Microsoft authentication for previously invited parents.
- Password recovery.
- MFA where required.

LinkedIn authentication is not a priority for the Parent experience and may be omitted if it does not serve an established product requirement.

## 8.2 Registration Options

For the Parent role:

- No public Sign Up.
- No generic Parent registration.
- No social registration without a valid invitation.
- Dedicated Accept School Invitation option.
- Dedicated Explore Parent Demo option.

The generic registration flow for students or other user types must not accidentally permit Parent role assignment.

## 8.3 Password Security

Recommended requirements:

- Minimum password length of 12 characters.
- Password strength feedback.
- Secure password hashing using an appropriate modern password-hashing algorithm.
- Rate limiting.
- Brute-force protection.
- Secure recovery workflow.
- Password reset notifications.
- Session invalidation after password changes where appropriate.

## 8.4 MFA

Support MFA for Parent accounts according to school policy and risk level.

Recommended methods:

- Email OTP.
- Authenticator application (future enhancement).

Security-sensitive operations should require reauthentication or step-up verification where appropriate.

## 8.5 Session Management

Parents should be able to:

- View active sessions.
- View recent logins.
- Logout from other devices.
- Change passwords.
- Receive security alerts.

---

# PART V – AUTHENTICATED PARENT PORTAL

# 9. Parent Dashboard Layout

After successful authentication, the parent should be redirected to the Parent Dashboard.

The existing GuruMera design should be retained as the visual foundation.

## 9.1 Header

Display:

- GuruMera Logo.
- Parent Role Indicator.
- Parent Name.
- Notification Icon.
- Profile Menu.
- Logout.

## 9.2 Main Navigation

Recommended navigation:

1. My Children.
2. Overview.
3. Assignments.
4. Academic Performance.
5. Concept Mastery.
6. Learning Activity.
7. Attendance.
8. Teacher Feedback.
9. Messages.
10. Notifications.
11. Help & Support.
12. Profile and Security.

The child-specific features should appear after a child has been selected.

Features that are unavailable for a school or student should be hidden or clearly marked as unavailable.

## 9.3 My Children

The existing My Children screen should be enhanced.

Each child card should show:

- Student Name.
- Profile Picture or Initials.
- School Name.
- Grade/Class.
- Section.
- Academic Year.
- Parent Relationship.
- Enrollment Status.

Optional summary:

- Average Score.
- Pending Assignments.
- Overdue Assignments.
- Recent Activity.

Selecting a child should open the individual dashboard.

## 9.4 Multiple Children

One Parent account must support multiple children.

The parent must be able to:

- View all linked children.
- Switch between children.
- Review individual academic information.
- Return to the My Children page.
- Receive child-specific notifications.
- Apply filters by child.

The system must never combine academic records from different students into a misleading aggregate.

Any family-level summary must clearly identify the underlying child records.

---

# 10. Child Dashboard – Overview

The Overview tab should provide a concise academic snapshot.

## 10.1 Student Information

Display:

- Student Name.
- School.
- Campus.
- Grade.
- Section.
- Academic Year.
- Class Teacher.
- Enrolled Subjects.

## 10.2 Summary KPI Cards

Recommended cards:

- Overall Average Score.
- Completed Assignments.
- Pending Assignments.
- Overdue Assignments.
- Upcoming Assessments.
- Subjects Requiring Attention.

Each KPI should be clickable where additional details exist.

## 10.3 Average Score Calculation

The application must clearly document how average scores are calculated.

Avoid simply averaging percentages when assessment weights differ.

The calculation should follow the school's grading configuration, assessment weights, and grading policy.

Where there is insufficient data, display:

"Not enough graded assessments yet."

## 10.4 Recent Assignments

Display the latest assignments with:

- Title.
- Subject.
- Assignment Type.
- Due Date.
- Submission Status.
- Marks.
- Teacher Feedback Availability.

## 10.5 Academic Alerts

Examples:

- Assignment overdue.
- Assessment due soon.
- Assignment graded.
- Teacher feedback available.
- Attendance alert.
- Significant performance change.

AI-generated recommendations must be clearly distinguished from official school alerts.

---

# 11. Assignment and Assessment Management

## 11.1 Assignment Listing

Each assignment should include:

- Assignment Title.
- Description.
- Subject.
- Class/Section.
- Teacher.
- Assigned Date.
- Due Date.
- Submission Date.
- Assignment Type.
- Status.
- Marks Obtained.
- Total Marks.

## 11.2 Assignment Statuses

Support:

- Upcoming.
- Pending.
- Submitted.
- Graded.
- Overdue.
- Excused.
- Cancelled.

Overdue status must be calculated using the assignment deadline, submission status, applicable school time zone, and approved deadline extensions.

A submitted assignment awaiting grading must not be incorrectly classified as overdue.

## 11.3 Assignment Filters

Provide filters for:

- Subject.
- Status.
- Assignment Type.
- Academic Term.
- Date Range.

Provide sorting by:

- Due Date.
- Assigned Date.
- Subject.
- Status.

## 11.4 Assignment Details

Selecting an assignment should display:

- Assignment Instructions.
- Subject.
- Teacher.
- Due Date.
- Submission Date.
- Submission Status.
- Marks.
- Teacher Feedback.
- Grading Rubric.
- Authorized Attachments.

Parent access is read-only.

## 11.5 Assessment History

Display:

- Quizzes.
- Tests.
- Examinations.
- Projects.
- Homework.
- Diagnostic Assessments.

Each record should include its result, date, subject, and relevant teacher feedback.

---

# 12. Academic Performance

## 12.1 Subject-Wise Performance

For each subject display:

- Subject Name.
- Teacher.
- Current Average.
- Previous Average.
- Performance Trend.
- Graded Assessments.
- Pending Assessments.
- Strengths.
- Areas Requiring Attention.

## 12.2 Performance Trends

Provide date filters:

- This Week.
- This Month.
- This Term.
- Current Academic Year.
- Previous Academic Year.

## 12.3 Visualizations

Recommended charts:

- Subject-Wise Performance.
- Performance Over Time.
- Assessment Score Distribution.
- Assignment Completion.
- Attendance Trend.

Charts must be based on actual recorded data.

## 12.4 Strengths and Weaknesses

Show evidence-backed observations.

Example:

**Strengths**
- Strong performance in Newton's Laws.
- Consistent results in Algebra.

**Needs Attention**
- Difficulty with Limits and Continuity.
- Inconsistent performance in Integration.

Each insight should identify its supporting assessments or learning evidence.

---

# 13. Concept Mastery

Concept Mastery is a key differentiator for GuruMera.

It should communicate whether students are developing conceptual understanding beyond examination scores.

## 13.1 Mastery Categories

Support:

- Mastered.
- Developing.
- Needs Practice.
- Not Yet Assessed.

## 13.2 Subject-Based Concept Listing

Display concepts grouped by subject.

Example:

**Physics – Newtonian Dynamics**

- Newton's First Law – Mastered.
- Newton's Second Law – Developing.
- Conservation of Momentum – Needs Practice.

## 13.3 Concept Details

Each concept should display:

- Concept Name.
- Subject.
- Mastery Status.
- Last Assessed Date.
- Practice Activity Count.
- Assessment Evidence.
- Recommended Revision.

## 13.4 Learning Gap Identification

Identify concepts that may require additional attention.

Provide recommendations such as:

- Revisit the lesson.
- Review a knowledge map.
- Complete a diagnostic quiz.
- Practice selected questions.
- Use flashcards.
- Ask the AI Tutor for another explanation.

Concept mastery must not be presented as a formal academic grade unless it has been formally assessed by the school.

AI-inferred mastery must be clearly labelled as an estimate.

---

# 14. Learning Activity

This section should provide parents with visibility into their children's learning engagement.

## 14.1 Learning Summary

Display:

- Number of Learning Sessions.
- Total Learning Time.
- Subjects Explored.
- Topics Studied.
- Quizzes Attempted.
- Flashcards Reviewed.
- Knowledge Maps Explored.
- Practice Activities Completed.

## 14.2 Activity Timeline

Display activities chronologically.

Example:

- 09:00 – Studied Newton's Laws.
- 09:25 – Completed Physics Practice Quiz.
- 10:00 – Reviewed Calculus Flashcards.

Use actual activity timestamps and the appropriate local time zone.

## 14.3 AI Tutor Usage Summary

Display authorized summaries:

- Number of Tutor Sessions.
- Subjects Discussed.
- Topics Explored.
- Practice Activities Generated.
- Learning Recommendations.
- Completed Learning Sessions.

Raw AI conversation transcripts must not automatically be exposed to parents.

Any detailed conversation access must follow transparent, age-appropriate privacy policies, school authorization, and applicable consent requirements.

## 14.4 Learning Consistency

Display:

- Weekly Learning Activity.
- Study Consistency.
- Completed Learning Goals.
- Subject Engagement.
- Learning Session Trends.

Do not treat study duration alone as a measure of learning success.

---

# 15. Teacher Feedback

Parents should be able to view teacher feedback where authorized.

Feedback may relate to:

- Assignments.
- Assessments.
- Projects.
- Subject Performance.
- General Student Progress.

Each feedback record should contain:

- Teacher Name.
- Subject.
- Feedback Date.
- Feedback Content.
- Related Assignment or Assessment.

Feedback must remain unchanged from the official school record.

---

# 16. Parent-Teacher Communication

This feature may be implemented in a later phase but should be included in the architecture.

## 16.1 Communication Features

- View authorized teacher contact information.
- Send messages.
- Receive replies.
- View communication history.
- Receive message notifications.
- View message timestamps.

## 16.2 Communication Controls

- School-defined communication permissions.
- Teacher availability.
- Message retention.
- Abuse reporting.
- Audit logging.
- Appropriate privacy controls.

Parents must not be able to contact teachers outside the school's authorized communication workflow.

## 16.3 Meeting Requests

Where enabled, parents may request meetings.

Fields:

- Teacher.
- Subject.
- Preferred Date.
- Preferred Time.
- Meeting Type.
- Purpose.
- Additional Notes.

Statuses:

- Requested.
- Confirmed.
- Rescheduled.
- Cancelled.
- Completed.

The school must control meeting availability.

---

# 17. Attendance and School Information

These capabilities should be enabled when relevant school data is integrated.

## 17.1 Attendance

Display:

- Present Days.
- Absent Days.
- Late Arrivals.
- Excused Absences.
- Attendance Percentage.

Provide historical records and attendance trends.

## 17.2 School Information

Display:

- School.
- Campus.
- Academic Year.
- Grade.
- Section.
- Class Teacher.
- Enrolled Subjects.
- Academic Calendar.

## 17.3 School Announcements

Parents should receive school-specific announcements.

Examples:

- Examination Schedule.
- Holiday Notices.
- School Events.
- Parent-Teacher Meetings.
- Academic Calendar Updates.
- Important Administrative Notices.

Only announcements applicable to the linked student should be displayed.

---

# 18. Notifications

## 18.1 Notification Categories

### Academic Notifications

- Assignment Due.
- Assignment Overdue.
- Assignment Submitted.
- Assignment Graded.
- Assessment Results Published.
- Teacher Feedback Received.

### Learning Notifications

- Learning Milestone Achieved.
- Concept Requiring Revision.
- Learning Recommendation.
- Learning Progress Summary.

### School Notifications

- Attendance Alert.
- School Announcement.
- Academic Calendar Update.
- Parent-Teacher Meeting.

### Account Notifications

- Invitation Accepted.
- New Child Association.
- Association Revoked.
- Password Changed.
- Security Alert.
- New Login.

## 18.2 Notification Channels

Support:

- In-App.
- Email.
- Push Notifications (future).
- SMS (optional).

## 18.3 Notification Preferences

Parents should be able to configure:

- Notification Category.
- Preferred Channel.
- Frequency.
- Quiet Hours.
- Child-Specific Preferences.

Critical security notifications must not be disabled through normal notification preferences.

---

# 19. Parent Profile and Settings

## 19.1 Personal Information

- Full Name.
- Email.
- Mobile Number.
- Profile Picture.
- Preferred Language.
- Time Zone.

The verified login email must not be changed without a secure verification process.

## 19.2 Linked Children

Display:

- Student Name.
- School.
- Relationship.
- Association Status.
- Access Permissions.

Parents may request:

- Additional Child Association.
- Association Removal.
- Correction of Relationship Information.

Requests must be reviewed and authorized by the school.

## 19.3 Security Settings

- Change Password.
- MFA Configuration.
- Active Sessions.
- Recent Login History.
- Logout From Other Devices.
- Account Recovery.

## 19.4 Privacy Settings

Provide information and applicable controls for:

- Student Data Access.
- Learning Activity Visibility.
- AI Activity Visibility.
- Data Retention.
- Data Export.
- Account Deletion.
- Notification Preferences.

Some controls may be restricted by school policy and legal obligations.

---

# 20. Help and Support

Provide a dedicated Parent Help Center.

Features:

- FAQs.
- Parent User Guide.
- Video Tutorials.
- Submit Support Request.
- Track Support Requests.
- Report an Issue.
- Account Assistance.
- Invitation Assistance.

Support tickets should contain:

- Ticket Number.
- Subject.
- Description.
- Attachment.
- Submission Date.
- Status.
- Support Response.

---

# PART VI – SCHOOL ADMINISTRATION REQUIREMENTS

# 21. Parent Management for Schools

The Parent Module requires corresponding functionality in the School Administration Portal.

## 21.1 Parent Directory

Display:

- Parent Name.
- Email.
- Mobile Number.
- Linked Children.
- Relationship.
- Account Status.
- Invitation Status.
- Last Login.
- Association Date.

Provide search and filters.

## 21.2 Parent Invitation Management

Administrators should be able to:

- Create invitations.
- Send invitations.
- Resend invitations.
- Revoke invitations.
- View invitation status.
- Review expired invitations.
- Generate replacement invitations.
- Review invitation history.

## 21.3 Parent Associations

Administrators should be able to:

- Link parents to students.
- View all linked guardians.
- Manage relationships.
- Review association requests.
- Approve or reject requests.
- Suspend associations.
- Revoke associations.
- Review association history.

## 21.4 Bulk Invitations

Provide a controlled bulk invitation mechanism.

Possible input:

- CSV upload.
- Student selection.
- Parent email.
- Parent name.
- Relationship.

The system must validate:

- Student existence.
- Student tenant membership.
- Duplicate invitations.
- Email formatting.
- Existing parent accounts.
- Required fields.

The administrator must review the records before sending.

## 21.5 Parent Access Permissions

The school should be able to configure which parent features are available.

Suggested permission profiles:

**Standard Parent**
- Academic Overview.
- Assignments.
- Grades.
- Performance.
- Notifications.

**Extended Parent**
- Standard Parent features.
- Concept Mastery.
- Learning Activity.
- Teacher Feedback.

**Communication-Enabled Parent**
- Extended Parent features.
- Teacher Messaging.
- Meeting Requests.

Permissions must be enforced by the backend, not merely hidden in the interface.

---

# PART VII – DATA MODEL AND TECHNICAL DESIGN FOUNDATION

# 22. Core Data Entities

The following entities should form the foundation of the detailed database design.

These are logical entities, not final physical database schemas.

## 22.1 Parent

Suggested attributes:

- ParentId.
- UserId.
- FullName.
- Email.
- MobileNumber.
- ProfileImage.
- PreferredLanguage.
- TimeZone.
- AccountStatus.
- CreatedAt.
- UpdatedAt.

The Parent entity should be associated with the existing GuruMera user identity system.

Do not create a duplicate authentication system.

## 22.2 ParentInvitation

Suggested attributes:

- InvitationId.
- TenantId.
- InvitedEmail.
- InvitedParentName.
- InvitationTokenHash.
- CreatedBy.
- CreatedAt.
- ExpiresAt.
- Status.
- AcceptedAt.
- AcceptedBy.
- RevokedAt.
- RevocationReason.

## 22.3 ParentInvitationStudent

Supports one invitation covering one or more students.

Attributes:

- InvitationStudentId.
- InvitationId.
- StudentId.
- Relationship.
- RequestedPermissionProfile.

## 22.4 ParentStudentAssociation

Attributes:

- AssociationId.
- TenantId.
- ParentId.
- StudentId.
- Relationship.
- AssociationStatus.
- PermissionProfileId.
- CreatedBy.
- ApprovedBy.
- CreatedAt.
- ActivatedAt.
- RevokedAt.

## 22.5 ParentPermissionProfile

Attributes:

- PermissionProfileId.
- TenantId.
- ProfileName.
- Description.
- IsActive.

## 22.6 ParentPermission

Attributes:

- PermissionId.
- PermissionProfileId.
- FeatureCode.
- AccessLevel.
- IsEnabled.

## 22.7 ParentNotification

Attributes:

- NotificationId.
- ParentId.
- StudentId.
- NotificationType.
- Title.
- Message.
- RelatedEntityType.
- RelatedEntityId.
- CreatedAt.
- ReadAt.
- DeliveryStatus.

## 22.8 ParentNotificationPreference

Attributes:

- PreferenceId.
- ParentId.
- NotificationCategory.
- Channel.
- Frequency.
- IsEnabled.
- QuietHoursStart.
- QuietHoursEnd.

## 22.9 ParentCommunication

Attributes:

- CommunicationId.
- TenantId.
- ParentId.
- TeacherId.
- StudentId.
- Subject.
- MessageReference.
- Status.
- CreatedAt.
- UpdatedAt.

## 22.10 ParentSupportTicket

Attributes:

- TicketId.
- ParentId.
- TenantId.
- Subject.
- Description.
- Status.
- Priority.
- CreatedAt.
- UpdatedAt.

## 22.11 ParentAuditLog

Attributes:

- AuditId.
- TenantId.
- ParentId.
- Action.
- EntityType.
- EntityId.
- Timestamp.
- IPAddress.
- DeviceInformation.
- Result.

Audit records must be protected against unauthorized alteration.

## 22.12 Demo Entities

Demo data should be maintained separately from production entities or isolated through a dedicated demo data context.

Suggested entities:

- DemoFamily.
- DemoParent.
- DemoStudent.
- DemoAssignment.
- DemoAssessment.
- DemoPerformance.
- DemoConceptMastery.
- DemoLearningActivity.
- DemoAttendance.
- DemoNotification.

The implementation should avoid using production Parent or Student records for public demonstrations.

## 22.13 Existing GuruMera Entities

The final LLD must identify and reuse existing entities wherever possible:

- User.
- Role.
- Tenant/School.
- Student.
- Class.
- Section.
- Subject.
- Teacher.
- Assignment.
- Submission.
- Assessment.
- Grade.
- Feedback.
- Attendance.
- Learning Activity.
- AI Tutor Session.

Do not introduce duplicate versions of existing entities without a documented architectural reason.

---

# PART VIII – API DESIGN FOUNDATION

# 23. API Functional Groups

The final LLD must define REST API contracts, request validation, response structures, error handling, authentication requirements, and authorization policies.

The following endpoints are logical examples.

Exact route naming may follow existing GuruMera API conventions.

## 23.1 Public Parent APIs

- GET `/api/public/parents`
- GET `/api/public/parents/features`
- GET `/api/public/parents/faqs`

## 23.2 Parent Demo APIs

- POST `/api/demo/parent/session`
- GET `/api/demo/parent/family`
- GET `/api/demo/parent/children`
- GET `/api/demo/parent/children/{id}/overview`
- GET `/api/demo/parent/children/{id}/assignments`
- GET `/api/demo/parent/children/{id}/performance`
- GET `/api/demo/parent/children/{id}/mastery`
- GET `/api/demo/parent/children/{id}/activity`
- GET `/api/demo/parent/children/{id}/attendance`
- GET `/api/demo/parent/notifications`
- POST `/api/demo/parent/reset`

All demo endpoints must enforce demo isolation.

## 23.3 Parent Invitation APIs

- POST `/api/school/parent-invitations`
- POST `/api/school/parent-invitations/bulk`
- GET `/api/school/parent-invitations`
- GET `/api/school/parent-invitations/{id}`
- POST `/api/school/parent-invitations/{id}/resend`
- POST `/api/school/parent-invitations/{id}/revoke`

## 23.4 Invitation Acceptance APIs

- GET `/api/public/parent-invitations/validate/{token}`
- POST `/api/public/parent-invitations/accept`
- POST `/api/public/parent-invitations/verify-email`

Sensitive token handling must be designed carefully.

Do not expose the raw invitation token through logs, analytics, error messages, or unrelated API responses.

## 23.5 Authenticated Parent APIs

- GET `/api/parent/profile`
- PUT `/api/parent/profile`
- GET `/api/parent/children`
- GET `/api/parent/children/{id}/overview`
- GET `/api/parent/children/{id}/assignments`
- GET `/api/parent/children/{id}/assignments/{assignmentId}`
- GET `/api/parent/children/{id}/assessments`
- GET `/api/parent/children/{id}/performance`
- GET `/api/parent/children/{id}/mastery`
- GET `/api/parent/children/{id}/activity`
- GET `/api/parent/children/{id}/attendance`
- GET `/api/parent/children/{id}/feedback`
- GET `/api/parent/children/{id}/announcements`

Every child-specific endpoint must validate the authenticated parent's active association with the requested student.

## 23.6 Notification APIs

- GET `/api/parent/notifications`
- PATCH `/api/parent/notifications/{id}/read`
- PATCH `/api/parent/notifications/read-all`
- GET `/api/parent/notification-preferences`
- PUT `/api/parent/notification-preferences`

## 23.7 Communication APIs

- GET `/api/parent/messages`
- POST `/api/parent/messages`
- GET `/api/parent/messages/{id}`
- POST `/api/parent/meetings`
- GET `/api/parent/meetings`

These APIs must be enabled only where school permissions allow.

## 23.8 Account and Association APIs

- GET `/api/parent/associations`
- POST `/api/parent/associations/requests`
- GET `/api/parent/associations/requests`
- POST `/api/parent/associations/requests/{id}/cancel`
- GET `/api/parent/security/sessions`
- POST `/api/parent/security/logout-other-sessions`
- POST `/api/parent/account/deletion-request`

Parent association requests must be subject to school approval.

---

# PART IX – SECURITY AND PRIVACY

# 24. Authorization Architecture

The Parent Module must use multiple layers of authorization.

Authentication alone is not sufficient.

Every protected operation must validate:

1. User identity.
2. Account status.
3. Parent role.
4. Active parent-child association.
5. Tenant boundary.
6. Feature permission.
7. Requested record ownership or association.
8. Applicable school policies.

The backend must never trust a student ID, parent ID, tenant ID, or permission profile merely because it was submitted by the frontend.

## 24.1 Parent Data Isolation

Parents must only access information associated with their own authorized children.

The application must prevent:

- Horizontal privilege escalation.
- Cross-student access.
- Cross-parent access.
- Cross-tenant access.
- Unauthorized direct object reference.
- API parameter manipulation.
- Unauthorized data exports.

## 24.2 Tenant Isolation

All school-related parent records must remain within their tenant.

Tenant identity should be derived from the authenticated school context and validated against the relevant student and association records.

Database-level isolation policies should be considered where supported by the existing architecture.

## 24.3 Demo Isolation

Demo access must never provide access to production records.

Use separate data, restricted authorization, and clearly identifiable demo sessions.

## 24.4 Invitation Security

- Secure random token generation.
- Token hashing at rest.
- Single-use validation.
- Expiration.
- Revocation.
- Rate limiting.
- Email binding.
- Secure transport.
- Audit logging.
- Protection against replay.
- Protection against token leakage.

Invitation pages should also use appropriate protections against accidental token disclosure through third-party analytics, referrer headers, or external resources.

## 24.5 Child Privacy

The system must define different visibility levels for:

- Official academic records.
- Teacher feedback.
- Learning activity summaries.
- AI Tutor metadata.
- Raw AI conversations.
- Private student communications.

Raw AI conversations should not automatically be exposed to parents.

The school must define age-appropriate policies and any applicable consent requirements.

## 24.6 Compliance

The implementation should be designed to support applicable privacy and child-protection requirements.

Any claims regarding FERPA, COPPA, or other regulatory compliance must be validated against actual product operations, contracts, technical controls, and legal obligations.

---

# PART X – USER EXPERIENCE AND UI REQUIREMENTS

# 25. Design Principles

The Parent Module should follow the existing GuruMera design language.

The existing Parent screens already establish a foundation:

1. My Children.
2. Individual Child Coursework Dashboard.

These should be enhanced rather than replaced without reason.

## 25.1 Visual Design

Maintain:

- Clean layouts.
- Consistent typography.
- Existing brand colors.
- Rounded cards.
- Subtle shadows.
- Clear status indicators.
- Responsive layouts.
- Consistent spacing.
- Accessible contrast.

## 25.2 Child Selection Screen

Enhance existing child cards to display:

- Student Name.
- Profile Image.
- School.
- Grade.
- Section.
- Academic Year.
- Relationship.
- Enrollment Status.
- Relevant academic summary.

## 25.3 Child Dashboard

Use a tab-based layout:

- Overview.
- Assignments.
- Performance.
- Concept Mastery.
- Learning Activity.
- Attendance.
- Feedback.

The layout should remain simple and avoid overwhelming parents.

## 25.4 Assignment Cards

Assignment cards should show:

- Title.
- Subject.
- Assignment Type.
- Status.
- Due Date.
- Score, where available.

Selecting a card should reveal details.

## 25.5 Mobile Responsiveness

The Parent Portal must work on:

- Desktop.
- Laptop.
- Tablet.
- Mobile phones.

On smaller screens:

- Stack summary cards.
- Collapse navigation.
- Maintain readable charts.
- Use accessible touch targets.
- Avoid horizontal overflow.
- Keep important notifications visible.

## 25.6 Accessibility

Target WCAG 2.2 AA.

Support:

- Keyboard navigation.
- Accessible labels.
- Screen readers.
- Sufficient color contrast.
- Clear validation errors.
- Accessible charts and tables.
- Non-color-only status indicators.

---

# PART XI – NON-FUNCTIONAL REQUIREMENTS

# 26. Performance

The Parent Portal should:

- Load dashboards efficiently.
- Paginate assignment and activity records.
- Avoid unnecessarily loading large histories.
- Cache appropriate read-only data.
- Optimize charts.
- Avoid duplicate API requests.
- Support efficient filtering.

Performance should be measured against defined targets in the LLD and tested under realistic concurrency.

# 27. Reliability

The application must handle:

- Failed API requests.
- Expired sessions.
- Invalid invitations.
- Expired invitations.
- Revoked associations.
- Email delivery failures.
- Missing academic records.
- Partial data availability.
- Temporary service outages.

Provide clear error messages and retry mechanisms.

# 28. Auditability

Record security-sensitive and administrative actions.

Examples:

- Invitation Created.
- Invitation Sent.
- Invitation Accepted.
- Invitation Revoked.
- Parent Account Created.
- Association Activated.
- Association Revoked.
- Parent Login.
- Failed Login.
- Sensitive Record Access.
- Data Export.
- Account Deletion Request.

# 29. Maintainability

The implementation should:

- Follow existing GuruMera architectural conventions.
- Reuse common components.
- Avoid duplicate business logic.
- Use modular services.
- Separate demo and production contexts.
- Maintain clear API contracts.
- Provide structured logging.
- Include automated tests.
- Include database migrations.
- Document configuration and deployment.

---

# PART XII – IMPLEMENTATION PHASES

# 30. Development Roadmap

## Phase 1 – Foundation and Essential Parent Experience

Deliver:

1. Public Parent Landing Page.
2. Parent Demo Environment.
3. Synthetic Demo Dataset.
4. Parent Login.
5. School-Driven Invitation Generation.
6. Invitation Email.
7. Invitation Validation.
8. Invitation Acceptance.
9. New Parent Account Creation.
10. Existing Parent Association.
11. My Children.
12. Child Overview.
13. Assignment Monitoring.
14. Assessment Results.
15. Basic Academic Performance.
16. Parent Profile.
17. Basic Notifications.
18. Access Control.
19. Audit Logging.

**Outcome:** A fully functional Parent Portal with secure school-controlled onboarding and public demo access.

## Phase 2 – Academic Intelligence

Deliver:

1. Subject-Wise Performance.
2. Performance Trends.
3. Concept Mastery.
4. Learning Activity.
5. AI Tutor Usage Summary.
6. Strengths and Weaknesses.
7. Learning Recommendations.
8. Teacher Feedback.
9. Advanced Notifications.
10. Notification Preferences.

**Outcome:** Parents can understand their children's actual learning progress.

## Phase 3 – School and Parent Engagement

Deliver:

1. Parent-Teacher Messaging.
2. Meeting Requests.
3. Attendance Integration.
4. School Announcements.
5. Multiple Guardian Management.
6. Advanced Parent Permissions.
7. School Calendar.
8. Support Tickets.
9. Parent Communication History.

**Outcome:** Improved engagement between parents and schools.

## Phase 4 – Advanced Educational Intelligence

Deliver:

1. AI-Powered Academic Insights.
2. Personalized Learning Recommendations.
3. Learning Gap Indicators.
4. Longitudinal Academic Analysis.
5. Cross-Subject Insights.
6. Advanced Parent Reports.
7. Personalized Parent Guidance.

**Outcome:** A comprehensive educational intelligence experience for parents.

---

# PART XIII – QA AND ACCEPTANCE CRITERIA

# 31. Functional Acceptance Criteria

The Parent Module must not be considered complete until the following requirements pass testing.

## Public Visitor

- Public visitors can access the Parent landing page.
- Visitors can launch the Parent Demo without registration.
- Demo contains realistic synthetic information.
- Visitors can switch between demo children.
- All relevant demo screens are navigable.
- Demo is visibly identified.
- Demo cannot access production data.
- Demo cannot create real parent associations.
- No public Parent registration option exists.

## School Invitation

- Authorized administrators can create invitations.
- Invitations are linked to the intended email.
- Invitations are linked to authorized students.
- Invitation tokens are secure.
- Expired invitations are rejected.
- Revoked invitations are rejected.
- Used invitations cannot be reused.
- Parents cannot change the invited email during activation.
- Existing parents can accept additional child invitations.
- Duplicate accounts are prevented.
- Invitation events are audited.

## Parent Authentication

- Invited parents can create accounts.
- Non-invited users cannot create Parent accounts.
- Social authentication cannot bypass invitation requirements.
- Password recovery works securely.
- MFA works where configured.
- Parent sessions can be managed.

## Parent Dashboard

- Parents see only linked children.
- Multiple children are supported.
- Child switching works correctly.
- Assignment records are accurate.
- Overdue assignments are identified correctly.
- Assessment scores reflect official records.
- Average calculations follow the grading policy.
- Performance charts use actual data.
- Concept mastery is appropriately labelled.
- Learning activity reflects actual recorded events.
- Teacher feedback is read-only.
- Notifications are delivered appropriately.

## Authorization and Privacy

- Parents cannot access unrelated students.
- Parents cannot access unrelated tenants.
- Direct API requests are authorized.
- Unauthorized data exports are blocked.
- Association revocation removes access.
- Demo and production contexts are isolated.
- Sensitive actions are audited.
- Account deletion and data requests follow applicable policies.

## User Experience

- Desktop interface works.
- Tablet interface works.
- Mobile interface works.
- Forms have proper validation.
- Loading and error states are handled.
- Empty states are meaningful.
- Navigation is consistent.
- Accessibility requirements are tested.

---

# PART XIV – DELIVERABLES REQUIRED FROM THE TECHNICAL DESIGN PHASE

# 32. Low-Level Design Deliverables

The engineering team or AI coding agent must produce the following before full implementation.

## 32.1 Architecture

- System context diagram.
- Component architecture.
- Parent module integration diagram.
- Authentication and authorization flow.
- Invitation workflow diagram.
- Demo isolation architecture.
- Data flow diagrams.

## 32.2 Database

- Complete ER diagram.
- Logical database schema.
- Physical database schema.
- Primary and foreign keys.
- Unique constraints.
- Indexes.
- Tenant isolation strategy.
- Migration scripts.
- Data retention strategy.

## 32.3 Backend

- API specification.
- Request and response schemas.
- Service layer design.
- Repository design.
- Authorization middleware.
- Invitation service.
- Notification service.
- Demo service.
- Audit service.
- Error handling.

## 32.4 Frontend

- Page inventory.
- Route definitions.
- Component hierarchy.
- UI wireframes.
- State management design.
- API integration design.
- Responsive behavior.
- Loading and error states.

## 32.5 Security

- Threat model.
- Permission matrix.
- Parent-child authorization rules.
- Invitation security design.
- Demo isolation controls.
- Tenant isolation controls.
- Audit logging strategy.
- Privacy requirements.

## 32.6 QA

- Functional test cases.
- API test cases.
- Security test cases.
- Invitation lifecycle tests.
- Multi-child tests.
- Multi-guardian tests.
- Tenant isolation tests.
- Demo isolation tests.
- Performance tests.
- Accessibility tests.

---

# PART XV – FINAL PRODUCT DECISIONS

# 33. Non-Negotiable Requirements

The following requirements define the approved product direction and must not be changed without explicit product-owner approval.

| No. | Decision |
|---|---|
| 1 | Public visitors cannot self-register as parents. |
| 2 | Real Parent accounts must originate from school-issued invitations. |
| 3 | Invitation links must be secure, single-use, and expiring. |
| 4 | School authorization is required for parent-child association. |
| 5 | An existing parent may accept invitations for additional children. |
| 6 | Duplicate parent accounts must be avoided. |
| 7 | Public visitors receive a dedicated Parent Demo. |
| 8 | Demo data must be fictional. |
| 9 | Demo and production data must be isolated. |
| 10 | Demo users cannot access production student records. |
| 11 | Parent academic access is read-only. |
| 12 | Parent access is limited to authorized children. |
| 13 | Multiple children are supported. |
| 14 | Multiple authorized guardians are supported. |
| 15 | Every protected API validates parent-child authorization. |
| 16 | Academic insights must be based on actual evidence. |
| 17 | AI-inferred mastery must be distinguished from official assessment results. |
| 18 | Raw AI conversations are not automatically exposed to parents. |
| 19 | School-specific permissions control available features. |
| 20 | Existing GuruMera functionality and data structures should be reused wherever appropriate. |

---

# 34. Product Success Criteria

The Parent Module should be evaluated against the following outcomes:

### Visitor Experience

- A prospective parent understands GuruMera's educational value.
- A visitor can explore the Parent Portal without registration.
- The demo demonstrates realistic functionality.
- Parents understand how to obtain legitimate account access.

### Parent Experience

- Parents can easily access their children's records.
- Parents can understand academic progress.
- Parents can identify areas requiring attention.
- Parents can monitor assignments and assessments.
- Parents can understand learning activity.
- Parents can communicate with schools where enabled.

### School Experience

- Schools can manage parent invitations.
- Schools can control parent-child associations.
- Schools can configure permissions.
- Schools can review invitation and association history.
- Schools can manage multiple guardians.

### Security Experience

- Unauthorized parent registration is prevented.
- Parent-child access is properly verified.
- Student information remains isolated.
- Demo access is separated from production.
- Sensitive operations are auditable.

---

# 35. Final Product Vision

The GuruMera Parent Module should be more than an academic monitoring dashboard.

It should provide parents with the information and understanding required to become constructive participants in their children's education.

The experience should be built around three responsibilities:

**MONITOR**

Keep parents informed about assignments, assessments, grades, attendance, and school activities.

**UNDERSTAND**

Help parents understand conceptual mastery, academic strengths, learning gaps, and progress over time.

**SUPPORT**

Give parents meaningful recommendations, teacher communication, and opportunities to support their children's learning.

The distinction between a visitor and an authenticated parent must remain clear throughout the entire product.

A visitor should be able to experience GuruMera through a realistic demonstration environment.

An authenticated parent should receive secure, authorized, and meaningful access to their children's actual educational information.

**The ultimate objective is to help parents answer one important question:**

*Is my child actually learning and understanding, rather than simply completing assignments and memorizing answers?*

---

# END OF DOCUMENT

**GuruMera – Discover the Why!**