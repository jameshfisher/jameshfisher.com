export default `<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-90722538-1', 'auto');
ga('send', 'pageview');
</script>

<script>
if (window.navigator && window.navigator.serviceWorker) {
window.navigator.serviceWorker.register("/service-worker.js");
}
</script>

<script>
document.addEventListener("DOMContentLoaded", () =>
Array.prototype.forEach.call(
  document.getElementsByClassName("answer"),
  el => el.addEventListener("click", () => el.classList.add("revealed"))));
</script>

<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('phc_PKc1zrAAIg02QKem1HI66te3pOr7ZalApxNTymy7gcN',{api_host:'https://app.posthog.com'})
</script>

<script>
posthog.onFeatureFlags(() => {
  const hireMeCvLinkVariant = posthog.getFeatureFlag('hire-me-cv-link');
  console.log({ hireMeCvLinkVariant });
  if (hireMeCvLinkVariant === 'test') {
    const cvLinks = document.getElementsByClassName('cv-link');
    for (let i = 0; i < cvLinks.length; i++) {
      cvLinks[i].innerText = 'Hire Me';
    }
  }

  const showLinkSummariesVariant = posthog.getFeatureFlag('show-link-summaries');
  console.log({ showLinkSummariesVariant });
  if (showLinkSummariesVariant === 'test') {
    document.body.classList.remove('experiment-dont-show-link-summaries');
  }

  const colorWashVariant = posthog.getFeatureFlag('color-wash');
  console.log({ colorWashVariant });
  if (colorWashVariant === 'test') {
    document.body.classList.add('experiment-color-wash');
  }
})
</script>
`;
