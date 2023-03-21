---
layout: page
---
<div class="adoc">

## Introduction

As part of the management of the MVSP project, we need to ensure clear
guidelines are in place to manage areas of release, reference, contribution, and
partner management. With this in mind we would recommend the following steps be
taken in order to ensure the auditability of the underlying MVSP baseline, and
overall governance of the project moving forwards.

## Working Group Management

## Onboarding and Offboarding

The MVSP site has the official list of the working group members and as such the
information is stored in GitHub with the rest of the content. In order to become
a working group member a company must:

*   agree to list their company name and/or logo amongst the supporters on the
    MVSP website;
*   maintain at least two points of contact within their respective companies
    willing to participate in meetings;
*   agree to follow the change management process and the guidelines.

In order to withdraw membership information from the MVSP website, the member
must follow the change management process described further down in this
document. The change will be reflected upon the next release of MVSP.
    
If you'd like to join, please feel free to send an email to our mailing list:
mvsp@groups.io

### Working Group Meetings

A quarterly webinar will be held where any and all of the working group members
are welcome. Invitations will be sent out to the points of contacts. As members
are coming from multiple different time zones, the dates/times can vary to
better fit availability.

## Change Management Process

The MVSP documentation and website are currently planned to be hosted on Github
in a repository owned and managed by the MVSP working group, in order to allow
community commentary/contribution and easy adoption by interested third parties.

### Escalating a draft to release

When a new draft is completed and is ready for publication, the following steps
should be taken:

1.  A locked draft version should be created by the MVSP editors for final
    review.
2.  This version will be shared to the working group for input.
3.  The release wording is finalized by the editors. It may undergo a techwriter
    review for large-scale changes.
4.  Any significant changes from final review will be shared back to the working
    group for acceptance.
5.  Upon completion of this, the new version will be published and locked.

### Versioning

When releasing a new version of the MVSP (after appropriate review), the version
number should be set and locked within Github in order to ensure that references
to that revision of MVSP reference that release without any future
modifications. All releases should be maintained in a locked state once
published, with only typos being accepted to already published versions.

#### Version number

The version number should contain the date at which the draft was published as
live (e.g. 20201124) in order to ensure that it is clear when this version was
elevated from draft to full release.

### Submissions (Pull requests)

Pull requests should only be accepted against the current draft version and not
directly against a published version (with the exception of minor typos). After
the group has had the possibility to review PULL requests and sufficient
consensus is reached, PULL requests can be merged. Merging will need the general
consensus of the editorial team. In the event of a dispute over whether a
change should be incorporated, an additional ad hoc meeting of working group
members or editors may be called to discuss issues and reach reasonable
consensus.

#### External input

Input from external parties (outside the working group) should be reviewed by
the working group prior to being accepted.

### Release cadence

Releasing a new public version of the MVSP should be done on an annual basis,
with an official review starting 90 days prior to the expected release date.

For changes that are deemed as urgent and critical to the MVSP (e.g material
corrections), interim releases can be made on ad hoc basis to correct the
specific issue (larger-scale changes unrelated to the issue at hand should be
pushed back to the annual release and not integrated).

### Contribution Guidelines

MVSP is designed to be simple, understandable and minimalistic. It must be
considered that the goal is **not** to become another complex standard. Before
sending a PULL request contributors should always ask themselves the question:
_Could I consider a vendor secure if they did not comply with the control I am
adding?_ If the answer is yes, then the control should not be there.

</div>
