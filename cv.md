---
layout: "layouts/minimal"
author: "jim"
title: "Jim Fisher – Product Engineer"
---

<style>
  .summary {
    font-weight: 600;
  }

  .hide-details .details {
    display: none;
  }

  .hide-details .summary {
    font-weight: normal;
  }
</style>

**Let's build an amazing product and a profitable business!
Just give me customer contact and let me iterate.**
I've spent 12+ years in **full-stack dev.**
TypeScript, React, Postgres, AWS, etc.,
but I'm not fussy.
I've spent 5+ years in **product management,**
including Pusher Channels ($12M ARR),
and my two startups, [Vidrio](https://vidrio.netlify.app/) and [TigYog](https://tigyog.app/).

<div class="noprint" style="margin: 2em auto;">
  <a href="mailto:jameshfisher+work@gmail.com?subject=Let%27s%20build%20an%20amazing%20product%21&body=Hey%20Jim%2C%0A%0A" style="text-decoration: none; color: black; padding: 0.5em; border-radius: 0.4em; border: 3px solid black; border-bottom-width: 5px; font-size: 1.2em; font-weight: 600;">Get in touch! 👋</a>
</div>

* Location: London, UK
* Email: [jameshfisher@gmail.com](mailto:jameshfisher@gmail.com)
* Website: [jameshfisher.com](https://jameshfisher.com)

<div class="noprint">
  <form autocomplete>
    <label>
      <input type="checkbox" name="hidedetails" onchange="document.body.classList.toggle('hide-details', this.checked)"/>
      <strong>TL;DR I don't want your life story</strong>
    </label>
  </form>
</div>

## Experience

<span class="details">Feb </span>2023 – current:
<span class="summary">
Senior engineer at [Slite](https://slite.com/).
Slite lets employees document their knowledge, and search all company knowledge across Slack, Google Drive, etc.
I helped build Slite's AI writing and AI search features, maintained their rich text editor, and built several tools for faster product iteration.
</span>

<div class="details">

* Helped build **[Slite Ask](https://slite.com/ask)**, which is like Google Search for your company wiki, Slack, task-tracker etc. I built the iteration loop for improving answer quality: a set of test cases, with one-click reporting to add a bad answer to the test set, all graded using [promptfoo](https://github.com/promptfoo/promptfoo) and manually written rubrics. I used this to reduce hallucination and improve citation accuracy.
* Built **[AI Improve](https://slite.slite.page/p/JHQ7KXTnDXHdZQ)**, an editor feature that lets you improve your writing. I framed AI Improve as automating [_How People Read Online_](https://www.nngroup.com/articles/how-people-read-online/), the authority on optimizing web content for scanning. Uses GPT-4, a few prompting tricks, and operational transforms. Also built **[magic document formatter](https://slite.com/micro-apps/document-formatter/)**, a public variant that builds upon [Slite's free public templates](https://slite.com/templates).
* **Built [Slite Labs](https://www.linkedin.com/posts/christophepasquier_introducing-slite-labs-for-years-activity-7141337040926756864-SMSw/)**, which lets users try out experimental product improvements. Quickly adopted internally.
* **Built Slite's internal A/B test framework.** Assigns users to groups by hash; otherwise re-uses existing product analytics tools.
* Maintained Slite's rich text editor, which uses [Slate](https://docs.slatejs.org/).

</div>

2021 – current:
<span class="summary">
CEO at [TigYog](https://tigyog.app/), my own app and company.
TigYog lets you write interactive online courses.
</span>
<span class="details">
Details on request.
</span>

<span class="details">Apr. </span>2020 – <span class="details">Feb. </span>2021:
<span class="summary">
CEO at [Vidrio](https://vidrio.netlify.app/),
my own app and company.
</span>
Vidrio lets you make presentations with a screen recording and webcam.
Grew the company from $0 revenue to a maximum of $1600/month.
<span class="details">
Built macOS and Windows versions,
built website and marketing,
et cetera.
Key tech:
[Swift](https://www.swift.org/),
[Electron](https://www.electronjs.org/),
[WebGL](https://en.wikipedia.org/wiki/WebGL).
</span>

<span class="details">Jun. </span>2018 – <span class="details">Apr. </span>2020:
<span class="summary">Technical Product Manager for [Pusher Channels](https://pusher.com/channels)
at [Pusher](https://pusher.com/).</span>
Companies use Pusher Channels to add realtime features to their apps
(e.g. chat messages, or New York Times live election night charts).
I moved into product management
to help grow the product.
During my time we grew from ~$8M ARR to ~$12M ARR.
<span class="details">
We had very limited resources and this was
an exercise in growing a product without adding new features.
I was the key link between Engineering, Sales and Marketing,
and the public representative of the product in many sales opportunities.
</span>

<span class="details">Mar. </span>2016 – <span class="details">Jun. </span>2018:
<span class="summary">
Software Engineer at [Pusher](https://pusher.com/).
</span>

* <span class="details">Mar. </span>2016 - 2018:
  <span class="summary">
  Engineer on the [Pusher Channels](https://pusher.com/channels) team,
  working on scalability and reliability.
  </span>
  <span class="details">
  [The system typically delivered 200,000 messages every second](https://making.pusher.com/how-pusher-channels-has-delivered-10000000000000-messages/).
  I was on the on-call rota.
  Key server-side tech:
  [Ruby on Rails](https://rubyonrails.org/),
  [Redis](https://redis.io/),
  [MySQL](https://en.wikipedia.org/wiki/MySQL),
  [Puppet](https://puppet.com/),
  [Ansible](https://www.ansible.com/),
  [AWS](https://aws.amazon.com/),
  [Kafka](https://kafka.apache.org/).
  Also maintained several client libraries.
  </span>
* <span class="details">Mar. – Jun. </span>2016:
  <span class="summary">
  Adding message history to [Pusher Channels](https://pusher.com/channels)
  using Haskell and Raft.
  </span>
  <span class="details">
  Channels used [Redis Pub/Sub](https://redis.io/topics/pubsub) as a message bus,
  but this has no message history.
  Pusher had built a replacement
  using [Raft](https://raft.github.io/) implementation for consistency and availability.
  This was written in [Haskell](https://www.haskell.org/).
  I researched high latencies in the system,
  [finding that the root cause was garbage collection in GHC](https://making.pusher.com/latency-working-set-ghc-gc-pick-two/).
  This finding went surprisingly viral
  and also sort of killed the whole project.
  Key tech:
  [Haskell (GHC)](https://www.haskell.org/),
  [QuickCheck](https://en.wikipedia.org/wiki/QuickCheck).
  </span>
* 2016 - 2017:
  <span class="summary">
  Engineer on the [Pusher Beams](https://pusher.com/beams) team,
  building the initial product.
  </span>
  <span class="details">
  Companies use Beams to send push notifications
  to Apple, Android and web clients.
  Key tech:
  [Go](https://go.dev/),
  [Postgres](https://www.postgresql.org/).
  Also built several client libraries.
  </span>
* Public representation of Pusher:
  gave [talks at conferences](/speaking);
  maintained [Pusher's engineering blog](https://making.pusher.com/)
  and wrote posts;
  organized [Pusher's meetup](https://www.meetup.com/the-realtime-guild/);
  ran our coding bootcamp for Sales and Marketing employees.

<span class="details">May </span>2014 – <span class="details">Feb. </span>2016:
<span class="summary">
Software Pilot at [Trifork](http://www.trifork.com/),
consulting with many global clients.
</span>
Trifork is an international software consultancy
and "pilot" is a funny word for consultant.
Projects included:

* 2015-16:
  <span class="summary">
  Worked with [Container Solutions](https://www.container-solutions.com/)
  and [Cisco Cloud Services](https://www.cisco.com/c/en_uk/solutions/cloud/index.html)
  on open-source cloud computing systems.
  </span>
  <span class="details">
  [OpenStack](https://www.openstack.org/) (cloud resource management),
  [Mesos](https://mesos.apache.org/) (a Kubernetes also-ran),
  [Mantl](https://github.com/mantl/mantl) and
  [DC/OS](https://dcos.io/) (layers on top of Mesos).
  Worked on official Mesos integrations, including
  [ElasticSearch for Mesos](https://github.com/mesos/elasticsearch) and
  [Logstash for Mesos](https://github.com/mesos/logstash).
  </span>
* 2015:
  <span class="summary">
  Built a recommender system at large global bookmaker.
  </span>
  <span class="details">
  For example, if you bet on Tottenham,
  perhaps you'll want to bet against Arsenal.
  Key tech:
  [Neo4j](https://neo4j.com/).
  </span>
* 2014:
  <span class="summary">
  Rebuilt the account system at a large global bookmaker,
  solving its scalability problems.
  </span>
  <span class="details">
  Account activity at a bookmaker is extremely spiky:
  think of betting during the Grand National!
  Key tech:
  [Java Spring](https://en.wikipedia.org/wiki/Spring_Framework),
  [Symfony](https://symfony.com/),
  [Riak](https://riak.com/riak/),
  [AngularJS](https://angularjs.org/),
  [Puppet](https://puppet.com/).
  The system integrated with [CAS](https://www.apereo.org/projects/cas) for authentication.
  </span>


<span class="details">Jan. – May </span>2014:
<span class="summary">
Software Engineer at [Arqiva WiFi](https://web.archive.org/web/20140326072920/http://arqivawifi.com/internet-access-wireless-services-providers/).
</span>
<span class="details">
Arqiva provided white-label public WiFi (e.g. the free public WiFi at Heathrow airport).
Our team rebuilt the 'captive portal'
(that annoying login page you see when you connect to free public WiFi).
I created the feature that gave you free public WiFi access
if you were willing to download an app or watch a video.
I wrote the functional and performance tests for the captive portal using [JMeter](https://jmeter.apache.org/).
(On the side,
I also built Arqiva's revenue tracker,
which gathered messy revenue data from heterogeneous, ancient sources.)
Key tech:
[PHP](https://www.php.net/) and
[MySQL](https://en.wikipedia.org/wiki/MySQL).
</span>

<span class="details">May </span>2012 – <span class="details">Sep </span>2013:
<span class="summary">
Software Developer at [YUDU Media](https://www.yudu.com/),
leading a team of four.
</span>
<span class="details">
Traditional publishers use YUDU to create online facsimiles of their magazines and books
(think: PDF reader on steroids with cool "page turn" animations).
I worked alongside the team at [Softwire](https://www.softwire.com/),
a software consultancy.
I worked in product management, design, development, and maintenance.
I maintained the two front-ends,
a [Flash](https://en.wikipedia.org/wiki/Adobe_Flash) version for the web,
and an [Adobe AIR](https://en.wikipedia.org/wiki/Adobe_AIR) version for desktop, Android, OS X, and iOS.
I also led a major redesign of [the management interface](https://publisher.yudu.com/).
Key tech:
[Java Spring](https://en.wikipedia.org/wiki/Spring_Framework);
[Ramaze](https://github.com/Ramaze/ramaze) (a dead fork of [Ruby on Rails](https://en.wikipedia.org/wiki/Ruby_on_Rails));
[Oracle](https://en.wikipedia.org/wiki/Oracle_Database),
[MySQL](https://en.wikipedia.org/wiki/MySQL),
[jQuery](https://jquery.com/),
[Bootstrap](https://getbootstrap.com/).
</span>

2006 – 2014:
<span class="summary">
Director and Secretary of [Lexden Montessori](https://web.archive.org/web/20210306074024/https://lexdenmontessori.com/).
</span>
<span class="details">
Lexden Montessori was a nursery in Colchester.
I started the nursery with my mum in 2006.
I worked in business planning,
market research and advertising,
administration and secretarial duties,
and web design and maintenance for [lexdenmontessori.com](https://web.archive.org/web/20210306074024/https://lexdenmontessori.com/),
including an online fee calculator.
</span>

2012 – 2013:
<span class="summary">
Branding, marketing consultancy, and web design
for [The Gilgil Trust](https://web.archive.org/web/20130602133801/http://www.gilgiltrust.org.uk/whatwedo.php).
</span>
<span class="details">
The Gilgil Trust provided young people around the town of Gilgil in Kenya
with shelter, health-care, and help in their education and careers.
</span>

2010:
<span class="summary">
Branding for [Pembroke House](https://pembrokehouse.sc.ke/).
</span>
<span class="details">
Pembroke House is a private Kenyan prep school.
As of 2021, they're still using the logo and brand that I designed.
In the words of their Commercial Director,
'James has worked with me on new brand designs
for Harambee Schools Kenya (see below), a charity,
and Pembroke House school, a prep school.
In both cases his work was of the highest quality,
and reflected a passion for design,
but also for getting under the skin of the organisation he is designing for.
I wouldn't hesitate to use James again for any design projects that I might have.'
</span>

2010:
<span class="summary">
Award-winning brand and web design for [Harambee Schools Kenya](https://web.archive.org/web/20120723045033/http://www.hsk.org.uk/).
</span>
<span class="details">
HSK is a charity building schools around Gilgil in rural Kenya.
[GWS Media gave the website an award](https://web.archive.org/web/20120628010313/http://onlinemarketing.gwsmedia.com/2010/11/2nd-objective-of-charity-website-design.html),
commending its 'plain, clear English; striking design, and beautiful images.'
The new branding and website brought in at least **£53,000 of funding**,
including from UBM (the global media and comms giant)
and [HSBC](https://www.hsbc.co.uk/), who made HSK their official corporate charity after finding the website.
</span>

2009:
<span class="summary">
Software Developer at [Caring Homes](https://www.caringhomes.org/).
</span>
<span class="details">
Caring Homes is a large UK group of care homes.
Developed an internal system
for managing care homes and CSCI reports
Key tech:
[Django](https://www.djangoproject.com/)
and [Postgres](https://www.postgresql.org/).
</span>

## Education

2010–12:
<span class="summary">
M.Sc. with distinction
in [Computing Science](https://www.imperial.ac.uk/study/pg/computing/computing/)
at [Imperial College](https://www.imperial.ac.uk/).
</span>
<span class="details">
In my individual project,
['Verifying a balanced-tree index implementation in VeriFast'](https://jameshfisher.github.io/presentation/pres.html),
I implemented [left-leaning red-black trees](https://en.wikipedia.org/wiki/Left-leaning_red%E2%80%93black_tree)
in C,
then proved key properties of it using [VeriFast](https://people.cs.kuleuven.be/~bart.jacobs/verifast/)
and [separation logic](https://en.wikipedia.org/wiki/Separation_logic).
</span>

2006–9:
<span class="summary">
B.A. with first-class honors
in [History](https://www.york.ac.uk/history/undergraduate/)
at the [University of York](https://www.york.ac.uk/).
</span>
<span class="details">
My dissertation was about robots.
</span>

2004–6:
<span class="summary">
Six A-levels.
</span>
<span class="details">
At [Colchester Royal Grammar School](https://www.crgs.co.uk/).
History (A),
Computing (A),
General Studies (A),
Physics (B),
Mathematics (B),
Art and Design (B)
(actually this last one was at
[Grey Friars Community College](https://web.archive.org/web/20070301140932/http://colchesteracc.essexcc.gov.uk/)).</span>

<p class="details">
  2002–4: Eleven GCSEs at Colchester Royal Grammar School.
</p>

Other courses:

* <span class="details">Apr. </span>2021:
  [_TensorFlow 2 for Deep Learning_](https://www.coursera.org/specializations/tensorflow2-deeplearning)
  on [Coursera](https://www.coursera.org/).
  <span class="details">
  Consists of
  [_Getting started with TensorFlow 2_](https://www.coursera.org/learn/getting-started-with-tensor-flow2)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_getting_started_with_tensorflow_2.pdf)</span>
  and
  [_Customising your models with TensorFlow 2_](https://www.coursera.org/learn/customising-models-tensorflow2)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_customizing_your_models_with_tensorflow_2.pdf)</a></span>.
* <span class="details">Apr. </span>2021:
  [_Probability Theory, Statistics and Exploratory Data Analysis_](https://www.coursera.org/learn/probability-theory-statistics)
  on [Coursera](https://www.coursera.org/)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_probability_theory.pdf)</span>.
* <span class="details">Mar.–Apr. </span>2021:
  [_Mathematics for Machine Learning_](https://www.coursera.org/specializations/mathematics-machine-learning)
  on [Coursera](https://www.coursera.org/).
  <span class="details">
  Consists of
  [_Linear Algebra_](https://www.coursera.org/learn/linear-algebra-machine-learning)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_mathematics_for_machine_learning_linear_algebra.pdf)</span>,
  [_Multivariate Calculus_](https://www.coursera.org/learn/multivariate-calculus-machine-learning)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_mathematics_for_machine_learning_multivariate_calculus.pdf)</span>, and
  [_Principal Components Analysis_](https://www.coursera.org/learn/pca-machine-learning)<span class="noprint"> [(certificate)](/assets/certificates/2021_coursera_mathematics_for_machine_learning_pca.pdf)<span>.
  </span>
* <span class="details">Jan.–Apr. </span>2013:
  [_Programming Languages_](https://www.coursera.org/learn/programming-languages)
  on [Coursera](https://www.coursera.org/)<span class="noprint"> [(certificate)](/assets/certificates/2013_coursera_proglang.pdf)</span>.
* <span class="details">Sep.–Dec. </span>2012:
  [_Functional Programming Principles in Scala_](https://www.coursera.org/learn/scala-functional-programming)
  on [Coursera](https://www.coursera.org/)<span class="noprint"> [(certificate)](/assets/certificates/2012_coursera_scala.pdf)</span>.
