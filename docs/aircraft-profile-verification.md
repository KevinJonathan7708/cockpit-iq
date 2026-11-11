# Aircraft profile source and verification record

## Current status

**Coursework source documented; real-aircraft status unverified.** This is a Web Technology simulation, not an aircraft or flight-training project. No real airplane or flight instructor is required for the course demo. The example values are mapped below to an archived Cessna 172S POH/AFM copy. That old copy has not been confirmed current or applicable to any individual airplane, so the app must remain marked unverified and must not be used for flight.

## Classroom source used

The source is a [Cessna Model 172S POH/FAA Approved AFM, publication 172SPHUS](https://www.northcoastair.com/documents/Cessna%20172S%20POH.pdf). The copy identifies Model 172S airplanes 172S8001 and on and includes Section 4 Revision 4 pages dated 30 May 2000. It is an archived copy, not confirmation of the latest manual revision.

| Project value | Cessna POH reference | Value shown in the project |
| --- | --- | --- |
| Rotation reference | Section 4, Normal Takeoff, p. 4-15 | 55 KIAS |
| Takeoff climb range | Section 4, Normal Takeoff, p. 4-15 | 70–80 KIAS |
| Safe flap reference | Section 4, Short Field Takeoff, p. 4-16 | Retract flaps slowly after 60 KIAS |
| Takeoff flap setting | Section 4, Before Takeoff / Normal Takeoff, p. 4-15 | 10° (within the stated 0°–10° range) |
| Approach range | Section 4, Airspeeds for Normal Operation, p. 4-5; Normal Landing, p. 4-17 | 60–70 KIAS with flaps down |
| Landing flap setting | Section 4, Short Field Landing, p. 4-17 | 30° full flaps |

The website abbreviates and combines checklist ideas for a coding demo. For example, it shows the short-field 60 KIAS flap-retraction reference in the same simplified takeoff sequence as the normal climb range. It is not a complete or approved C172S checklist.

## Where to get the correct manual

For this course demo, the archived copy above is enough to document where the example values came from. No flight instructor review is required. If the app is ever changed to claim applicability to a real airplane, use that airplane's current AFM/POH, installed-equipment supplements, and placards. Textron Aviation provides Cessna owner/operator manuals through its [1View technical publications service](https://1view.txtav.com/); access may require an account and the appropriate manual subscription.

The FAA explains that an AFM/POH may contain information specific to an individual airplane, such as installed equipment. The project therefore does not call the model reference "verified" for an actual airplane. See the [FAA Pilot's Handbook of Aeronautical Knowledge, Chapter 9](https://www.faa.gov/sites/faa.gov/files/11_phak_ch9.pdf).

## Record location and status

The source title, revision note, model applicability, and page references are recorded in `js/procedures.js` under `profile.verification`. This document provides the human-readable source map. No registration number or personal information is needed for the course demo.

The JavaScript record uses these fields. This is a format example only; the placeholders are not evidence and must not be used to mark a profile verified:

```js
verification: {
  status: "unverified",
  manualTitle: "[approved manual title]",
  manualRevision: "[revision and date]",
  aircraftApplicability: "[model, applicable serial range, and relevant configuration]",
  supplements: ["[applicable supplement and revision]"],
  references: [
    { topic: "targets.rotation", section: "[manual section]", page: "[page]" },
    { topic: "takeoff.steps", section: "[manual section]", page: "[page]" }
  ],
  reviewerRole: "",
  reviewedOn: "",
  note: "Classroom source references are recorded, but this old manual copy is not confirmed current or applicable to a specific airplane. This profile is not verified for flight."
}
```

Keep `status` as `"unverified"` for this classroom demo. The checklist is simplified, so do not describe it as a verified aircraft checklist. Do not change the status to `"verified"` based only on this archived copy.

The index, dashboard, and trainer read this status and note from `js/procedures.js`. The unverified state is shown in the warning color. The verified state receives verified styling only after the record passes the profile's required-field checks.

| Field | Value |
| --- | --- |
| Verification status | Unverified for any real airplane |
| Classroom source | Cessna 172S POH/FAA AFM, publication 172SPHUS |
| Source copy | Section 4 Revision 4 pages dated 30 May 2000; current status not checked |
| Model scope | 172S8001 and on; no individual airplane/configuration checked |
| Supplements / placards | Not checked; not needed for this classroom-only example |
| Source references | Values mapped to Sections 4 pages 4-5 and 4-15 to 4-17 above |
| Flight instructor review | Not required for the Web Technology course demo |
| Open limitation | Do not use or describe as verified for real flight |

Do not change the status to verified. Do not copy full manual pages into the application; the document identifier and section/page references are enough for this project.

## Limits of this source check

- The cited POH copy is old; its current revision status was not checked.
- Its aircraft applicability and installed-equipment supplements were not checked against an individual airplane.
- The website's shortened takeoff and landing sequences are classroom examples, not copied or approved aircraft checklists.
- The glide and density-altitude calculators use generic assumptions, not verified C172S performance data.

For this course project, no flight-instructor review is required. Keep the profile generic and unverified. Anyone using an actual aircraft must follow its current approved AFM/POH and obtain qualified flight instruction.
