---
title: Unicode is only for plaintext
tags: []
summary: >-
  The Unicode Consortium rejected proposals for encoding a "external link sign"
  character, citing that it is not "an element of plain text". This precedent makes it unlikely that a proposal for a Unicode feed icon would be approved.
---

I wanted to get the Feed icon (<img src="https://upload.wikimedia.org/wikipedia/en/4/43/Feed-icon.svg" width="16" height="16"/>) into Unicode.
The Unicode Consortium has [a page about proposals](http://unicode.org/pending/proposals.html).
It notes:

> Before proceeding, ... Consult ... [the Archive of Nonapproval Notices](http://www.unicode.org/alloc/nonapprovals.html)
> to see if the character has already been considered but was disapproved for some reason.

One of these rejections is:

> 2012-2 EXTERNAL LINK SIGN
>
> Proposals to encode a character for the "external link sign",
> which is often seen as a graphic element indicating
> a link to a document located external to
> the website where the page using the external link sign resides.
> (See L2/06-268, L2/12-143, L2/12-169.)
>

The external link image (<img src="https://en.wikipedia.org/w/skins/Vector/images/external-link-ltr-icon.png?325de" />)
is like the feed icon:
it's an image used in hyperlinks on webpages,
to hint something about the content it links to.
Here's the Unicode Consortium's reason for rejection:

> Disposition:
> The UTC rejected the proposals to add "external link sign", most recently in L2/12-169.
> It is unclear that the entity in question is actually an element of plain text,
> given the inevitable connection to its function in linking to other documents,
> and thus its coexistence with markup for links.
>
> Furthermore, the existing widespread practice of
> representing this sign on web pages using images (often specified via CSS styles)
> would be unlikely to benefit from attempting to encode a character for this image.

These reasons for rejection would apply equally to the feed icon.
The rejection of the external link sets a precedent for the rejection of the feed icon.
Unicode decisions can be based on such precedents;
the non-approval page says:

> Occasionally, however, the UTC makes a formal decision to reject a character proposal,
> for a variety of architectural reasons,
> or because of other serious defects in the proposal.
> Such formal decisions result in a notice of non-approval posted on this page,
> and signal the intent of the UTC not to pursue further work on that proposal.
> In some instances such a formal decision is also designated by the UTC as constituting a precedent
> (see Section 10.6.2, "Precedents" in the UTC Procedures);
> any precedent would require a special majority in the UTC
> to be reconsidered for a change of decision at a later time.
> Any notices of non-approval which also constitute UTC precedents
> are explicitly identified as such in this archive.

I'm therefore deciding not to continue with the proposal of a Unicode feed icon.
I don't particularly agree with the Consortium's insistence on "plaintext",
but I don't fancy the chances of success,
considering the close comparison with the external link icon.
