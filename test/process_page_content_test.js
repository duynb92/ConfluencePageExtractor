const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const tableHelper = require('../helpers/table_helper.js');
const imageHelper = require('../helpers/image_helper.js');
const videoHelper = require('../helpers/video_helper.js');
const fs = require('fs');
const he = require('he');

// Mock the z.console.log function
global.z = {
	console: {
		log: console.log,
	},
};

// Mock image and video helpers
// imageHelper.replaceAcImages = () => {};
imageHelper.replaceAcEmoticons = () => {};

function options(preserveOrder) {
	return {
		ignoreAttributes: false,
		preserveOrder: preserveOrder,
		allowBooleanAttributes: true,
		alwaysCreateTextNode: true,
		trimValues: false,
		unpairedTags: ['br'],
	};
}

function parseXml(pageContent, preserveOrder) {
	const parser = new XMLParser(options(preserveOrder));
	return parser.parse(pageContent);
}

function processPageContent(folderName, pageContent, attachments) {
		const decodedHubSpotPageContent = he.decode(pageContent);
		const xmlElements = parseXml(decodedHubSpotPageContent, true);
		tableHelper.addTHeadToTables(xmlElements);
		imageHelper.replaceAcImages(folderName, xmlElements, attachments);
		imageHelper.replaceAcEmoticons(folderName, xmlElements, attachments);
		videoHelper.replaceEmbeddedVideos(folderName, xmlElements);

		const builder = new XMLBuilder(options(true));
		let newXml = builder.build(xmlElements);

		return newXml;
 }

// Test data
const sampleHtml = `
<p>Choosing the right project management software can either empower your team or hold them back. If you&rsquo;re torn between Jira vs Trello, you&rsquo;re not alone. Both are project and task management tools built by Atlassian. But their differences are more than skin-deep.</p>
<p>Jira is a powerful project management tool built for software development teams and complex project workflows. It&rsquo;s best known for its issue tracking features, time tracking, and support for Agile methodologies like Scrum and Kanban.</p>
<p>Trello, on the other hand, is a user-friendly tool designed around Kanban boards. It simplifies task management for individuals and small teams working on straightforward projects with clear due dates.</p>
<p>In this blog, we&rsquo;ll explore the key features, ideal use cases, and how Jira and Trello compare across core areas. We&rsquo;ll also help you decide which tool is best for your team.</p>
<h2>Why people love Jira</h2>
<blockquote>
<p>&ldquo;Creating epics to represent key goals and tasks helps to have a specific order of what has been done. It allows us to assign tasks or &quot;user stories&quot; to each team member by setting deadlines and priorities. Tracking the progress of each project allows us to identify problems and make adjustments on the fly.&rdquo; - Kim R, Information Security Architect, <a href="https://www.capterra.com/p/19319/JIRA/reviews/">review on Capterra</a>.</p></blockquote>
<p><a href="https://resources.agileops.vn/blog/jira-la-gi">Jira</a> was originally built for engineers but today, with the addition of Jira Work Management, it also serves business teams looking for structure and scalability. From Agile sprint planning to structured workflows, it offers the flexibility and depth that both software and business teams increasingly rely on. Here&rsquo;s what teams love most:</p>
<ul>
<li>
<p>Built for Agile and Scrum methodologies;</p></li>
<li>
<p>Excellent for bug tracking and issue tracking;</p></li>
<li>
<p>Highly customizable workflows;</p></li>
<li>
<p>Seamless integration with Atlassian tools and dev platforms.</p></li></ul><ac:image ac:align="center" ac:layout="center" ac:original-height="1080" ac:original-width="2064" ac:custom-width="true" ac:alt="Jira features overview.mp4" ac:width="760"><ri:attachment ri:filename="Jira features overview.mp4" ri:version-at-save="2" /></ac:image>
<p style="text-align: center;"><em><ac:inline-comment-marker ac:ref="15ff00fe-b12a-4fee-ae47-62fd09d1ab8b">Explore Jira&rsquo;s core features</ac:inline-comment-marker></em></p>
<p>Đ&acirc;y là video nè hehehe</p><ac:image ac:align="center" ac:layout="center" ac:original-height="1080" ac:original-width="2064" ac:custom-width="true" ac:alt="Jira_features_overview.mp4" ac:width="760"><ri:attachment ri:filename="Jira_features_overview.mp4" ri:version-at-save="1" /><ac:caption>
<p>test alt</p></ac:caption></ac:image>
<p /><ac:image ac:align="center" ac:layout="center" ac:original-height="1080" ac:original-width="2064" ac:custom-width="true" ac:alt="Jira features overview.mp4" ac:width="760"><ri:attachment ri:filename="Jira features overview.mp4" ri:version-at-save="2" /></ac:image>
<p />
<h2>Why people love Trello</h2>
<p><a href="https://resources.agileops.vn/blog/trello-la-gi">Trello</a> wins over users with its simplicity. For teams that want to stay organized without complexity, it&rsquo;s an ideal fit. It works across industries from design teams to operations. Here&rsquo;s why users keep coming back:</p>
<ul>
<li>
<p>Simple, user-friendly interface;</p></li>
<li>
<p>Ideal for small teams and non-technical users;</p></li>
<li>
<p>Kanban boards make progress easy to track at a glance;</p></li>
<li>
<p>Fast onboarding and minimal training required.</p></li></ul>
<blockquote>
<p>&ldquo;After five years of use, Trello remains one of the most user-friendly and visually intuitive project management tools I&rsquo;ve worked with. The drag-and-drop Kanban board style makes it effortless to organize tasks and workflows, whether for solo projects or team collaboration. I also appreciate how it has steadily improved with features like templates, calendar views, and power-ups that adapt to both simple and complex workflows.&rdquo; - Mohamed, Co-founder &amp; COO, GO Platform, <a href="https://www.g2.com/products/trello/reviews">review on G2</a>.</p></blockquote>
<h2>Feature comparison: Jira vs Trello</h2>
<h3>What they have in common </h3>
<p>Even though Jira and Trello serve different purposes, they share a core set of functionalities that make them powerful project management solutions:</p>
<ul>
<li>
<p>Boards, lists, and card/issue-based formats</p></li>
<li>
<p>Drag-and-drop workflows</p></li>
<li>
<p>Checklists and subtasks</p></li>
<li>
<p>Team and workspace organization</p></li>
<li>
<p>Automation rules</p></li>
<li>
<p>Templates for common use cases</p></li>
<li>
<p>Multiple views: calendar, board, and timeline</p></li>
<li>
<p>Filters and advanced search</p></li></ul>
<h3>Where Jira vs Trello differ</h3>
<p>While Jira and Trello may appear similar at a glance, their differences become clear as soon as your projects grow in complexity. Let&rsquo;s break down where these tools really diverge and what it means for your team&rsquo;s day-to-day experience.</p>
<table data-table-width="760" data-layout="default" ac:local-id="3713f791-4a8c-4836-94b5-7c9c16f3447f"><colgroup><col style="width: 241.0px;" /><col style="width: 256.0px;" /><col style="width: 261.0px;" /></colgroup>
<tbody>
<tr>
<th>
<p style="text-align: center;"><strong>Feature</strong></p></th>
<th>
<p style="text-align: center;"><strong>Trello (Personal productivity)</strong></p></th>
<th>
<p style="text-align: center;"><strong>Jira (Team projects)</strong></p></th></tr>
<tr>
<td>
<p>Prebuilt templates for task planning</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Workflow automation</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Kanban-style task board</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Project timeline view</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Structured list layout</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Calendar-based scheduling</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Visual customization (backgrounds, colors)</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Atlassian Intelligence</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Third-party apps and integrations</p></td>
<td>
<p style="text-align: center;">✅ 210+ Power-Ups</p></td>
<td>
<p style="text-align: center;">✅ 3,000+ apps and integrations</p></td></tr>
<tr>
<td>
<p>External collaboration</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">❌</p></td></tr>
<tr>
<td>
<p>View same cards in multiple boards</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">❌</p></td></tr>
<tr>
<td>
<p>Geographic map view</p></td>
<td>
<p style="text-align: center;">✅</p></td>
<td>
<p style="text-align: center;">❌</p></td></tr>
<tr>
<td>
<p>Gantt chart and dependency mapping</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Agile backlog management</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Workflow designer tool</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Advanced automation rules</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Custom task types</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Multi-level issue hierarchy</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Team-level roadmaps and project linking</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Advanced reporting</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Forms</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>OKRs and goal tracking</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Company-managed projects</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr>
<tr>
<td>
<p>Admin testing environment (sandbox) and version control</p></td>
<td>
<p style="text-align: center;">❌</p></td>
<td>
<p style="text-align: center;">✅</p></td></tr></tbody></table>
<p><strong>Ease of use</strong></p>
<ul>
<li>
<p><em>Jira</em>: Jira requires more upfront setup and training, especially for teams unfamiliar with Agile practices. However, that complexity enables advanced project configurations and team governance. Teams working on technical or cross-functional projects will benefit from its power and structure.</p></li>
<li>
<p><em>Trello</em>: Trello excels in simplicity. Its intuitive Kanban interface makes it easy for anyone technical or not to get started. No training required. Teams can jump in and begin organizing workflows immediately. This makes Trello ideal for small teams, freelancers, or departments like marketing and HR.</p></li></ul>
<p><strong>Task management</strong></p>
<ul>
<li>
<p><em>Jira</em>: Offers a full hierarchy of tasks, epics, stories, bugs, subtasks with status flows and dependencies. This makes it easy to break down complex development projects into manageable parts, then track them across sprints and releases.</p></li></ul><ac:image ac:align="center" ac:layout="center" ac:original-height="548" ac:original-width="1200" ac:custom-width="true" ac:alt="AgileOps - Track bugs easily with Jira" ac:width="760"><ri:attachment ri:filename="Blog - Jira vs Trello 1.png" ri:version-at-save="2" /></ac:image>
<p style="text-align: center;"><em>Track bugs easily with Jira</em></p>
<ul>
<li>
<p><em>Trello</em>: Tasks are represented as cards, which can be customized and moved between lists. It's great for visual tracking but lacks hierarchy. Everything sits at the same level unless extended via Power-Ups.</p></li></ul>
<p><strong>Customization and automation</strong></p>
<ul>
<li>
<p><em>Jira</em>: Allows custom workflows, screen configurations, permission schemes, and automation using JQL (Jira Query Language). You can build conditional logic into project flows, ensuring everything from compliance to team notifications is handled automatically. Learn more about how <a href="https://resources.agileops.vn/en/blog/jira-automation-rules">Jira automation rules</a> work.</p></li>
<li>
<p><em>Trello</em>: Offers &ldquo;Power-Ups&rdquo; to extend functionality like calendar views, integrations, and custom fields. Butler automation helps automate recurring actions, though options are more limited than Jira.</p></li></ul><ac:image ac:align="center" ac:layout="center" ac:original-height="548" ac:original-width="1200" ac:custom-width="true" ac:alt="AgileOps - Boost your boards with Trello Power-Ups" ac:width="760"><ri:attachment ri:filename="Blog - Jira vs Trello 8 .png" ri:version-at-save="1" /></ac:image>
<p style="text-align: center;"><em>Boost your boards with Trello Power-Ups</em></p>
<p><strong>Integrations</strong></p>
<ul>
<li>
<p><em>Jira</em>: Built for team coordination at scale. It integrates deeply with tools developers use like Bitbucket, GitHub, and Jenkins and offers full Atlassian ecosystem support with Confluence, Opsgenie, and Statuspage.</p></li>
<li>
<p><em>Trello</em>: Connects easily with productivity tools like Slack, Google Drive, Zoom, and Zapier. Most integrations are designed to support collaboration and visibility.</p></li></ul>
<p><strong>Reporting and analytics</strong></p>
<ul>
<li>
<p><em>Jira</em>: Offers built-in Agile reporting with velocity charts, sprint burndowns, control charts, and more. These are crucial for teams tracking sprint progress or optimizing delivery. For project managers, Jira&rsquo;s dashboards and filters allow granular tracking by priority, type, or assignee. These insights are vital for sprint reviews, retrospectives, and long-term planning.</p></li></ul><ac:image ac:align="center" ac:layout="center" ac:original-height="548" ac:original-width="1200" ac:custom-width="true" ac:alt="AgileOps - Get insights fast with Jira reports" ac:width="760"><ri:attachment ri:filename="Blog - Jira vs Trello 2.png" ri:version-at-save="1" /></ac:image>
<p style="text-align: center;"><em>Get insights fast with Jira reports</em></p>
<ul>
<li>
<p><em>Trello</em>: Comes with basic activity tracking. With Power-Ups, you can access charts or connect to third-party tools like Dashboards or Planyway. It&rsquo;s not designed for deep data analysis.</p></li></ul>
<p><strong>Use cases</strong></p>
<ul>
<li>
<p><em>Jira</em>: Ideal for software development, DevOps, IT service management, and any structured team workflow where tracking scope, status, blockers, and reports is essential.</p></li>
<li>
<p><em>Trello</em>: Best for content calendars, campaign planning, hiring pipelines, or daily task tracking. It&rsquo;s a flexible visual tool for managing linear projects with few dependencies.</p></li></ul>
<p><strong>Scalability</strong></p>
<ul>
<li>
<p><em>Jira</em>: Designed to scale. It supports thousands of users across global teams, and admins can enforce consistent governance without limiting team agility.</p></li>
<li>
<p><em>Trello</em>: Perfect for small to mid-sized teams. But as your workflow becomes more complex, Trello can require extensive add-ons or workarounds.</p></li></ul>
<p><strong>Pricing </strong></p>
<table data-table-width="722" data-layout="center" ac:local-id="f8e7c4df-e74d-4f6f-962f-ffe03de95c8a"><colgroup><col style="width: 173.0px;" /><col style="width: 220.0px;" /><col style="width: 325.0px;" /></colgroup>
<tbody>
<tr>
<th>
<p style="text-align: center;"><strong>Plan</strong></p></th>
<th>
<p style="text-align: center;"><strong>Jira</strong></p></th>
<th>
<p style="text-align: center;"><strong>Trello</strong></p></th></tr>
<tr>
<td>
<p style="text-align: center;">Free plan</p></td>
<td>
<p style="text-align: center;">Free forever for 10 users</p></td>
<td>
<p style="text-align: center;">Free for up to 10 collaborators</p></td></tr>
<tr>
<td>
<p style="text-align: center;">Standard plan</p></td>
<td>
<p style="text-align: center;">$7.53 user/month</p></td>
<td>
<p style="text-align: center;">$5/user/month</p></td></tr>
<tr>
<td>
<p style="text-align: center;">Premium plan</p></td>
<td>
<p style="text-align: center;">$13.53/user/month</p></td>
<td>
<p style="text-align: center;">$10/user/month</p></td></tr>
<tr>
<td>
<p style="text-align: center;">Enterprise plan</p></td>
<td>
<p style="text-align: center;">Custom pricing</p></td>
<td>
<p style="text-align: center;">$17.50USD user/month (billed annually)</p></td></tr></tbody></table>
<p>Both tools offer generous free plans, but as needs grow, Jira becomes more cost-effective for development-heavy environments, while Trello scales nicely for cross-functional planning.</p>
<h2>7 questions to help you choose the right tool</h2>
<p>Still unsure which one to choose? These questions can guide you:</p>
<ol start="1">
<li>
<p>Does your team follow Agile or Scrum?</p></li>
<li>
<p>Are you managing a complex development project?</p></li>
<li>
<p>Do you need sprint planning, epics, or bug tracking?</p></li>
<li>
<p>Do you need robust time tracking and analytics?</p></li>
<li>
<p>Is your team non-technical or focused on creative work?</p></li>
<li>
<p>Do you want a tool that's easy to learn and quick to roll out without training?</p></li>
<li>
<p>Are drag-and-drop visuals more important than reporting?</p></li></ol>
<p>If you answered mostly &ldquo;yes&rdquo; to 1 to 4: Jira is likely your best fit.<br />If you answered mostly &ldquo;yes&rdquo; to 5 to 7: Trello might be a better starting point.</p>
<h2>Frequently asked questions when choosing between Jira vs Trello</h2>
<ol start="1">
<li>
<p><strong>Can you use both Jira and Trello together?</strong><br />Yes. Trello cards can sync with Jira issues using Atlassian Power-Ups or third-party integrations, making cross-team collaboration easy.</p></li>
<li>
<p><strong>Is Jira better than Trello for Agile project management?</strong><br />Absolutely. Jira supports Scrum boards, epics, sprints, burndown charts, and Agile reporting natively.</p></li>
<li>
<p><strong>Is Trello good for software development?</strong><br />It works for lightweight or non-technical dev tasks. For full-scale development, Jira is the better option.</p></li>
<li>
<p><strong>Does Trello have features like sprint planning and burndown charts?</strong><br />Not by default. You&rsquo;ll need to use Power-Ups or switch to Jira for these features.</p></li>
<li>
<p><strong>Which tool is better for small teams?</strong><br />Trello is great for small teams thanks to its simplicity and affordability.</p></li>
<li>
<p><strong>Can I migrate from Trello to Jira later?</strong><br />Yes. Atlassian offers tools to import Trello boards into Jira.</p></li></ol>
<h2>Ready to choose? Let AgileOps help you move forward with confidence</h2>
<p>If your team needs a lightweight, visual approach to manage content calendars, event planning, or task tracking, Trello is your go-to project management tool. If you're working on more structured workflows whether you're in software development, operations, or business management, Jira offers the scalability, reporting, and process control to support your goals.</p>
<p>At <a href="https://agileops.vn/en/">AgileOps</a>, we help companies across Asia Pacific implement and scale Atlassian tools for their unique needs. As an <a href="https://agileops.vn/en/services/atlassian">Atlassian Gold Solution Partner</a>, we offer consulting, setup, training, and governance support to help you get the most out of Jira and Trello.</p>
<p>Still undecided? Let&rsquo;s talk about your workflow and we&rsquo;ll help you choose the right solution.</p>`;

// Run the test
console.log('Running test with sample HTML table...\n');
try {
	const result = processPageContent('TEST-123', sampleHtml, []);
	fs.writeFileSync('result.xml', result);
	// console.log(result);
	console.log('\nTest completed successfully!');
	// write result to file
} catch (error) {
	console.error('Error processing content:', error);
}
