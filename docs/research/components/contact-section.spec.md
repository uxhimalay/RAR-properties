# ContactSection Specification

## Overview
- **Target file:** `src/components/sections/ContactSection.tsx` (client — form state: radio selection, focus)
- **Screenshot:** `docs/design-references/full-desktop-1440.png` (y 7591–8328)
- **Interaction model:** form interactions (input focus shadow, radio-pill selection, submit hover); text reveal on heading; underline hover on phone/email links.

## Shared primitives
- `TextReveal` (default) for the heading and paragraph; `FadeUp` for form blocks.
- Icons: `InstagramIcon`, `LinkedinIcon`, `PinterestIcon`, `BehanceIcon` from `@/components/icons`.
- Content: `CONTACT` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section class="section-width flex items-start justify-between">                                     // 1317 x 737
  <div class="flex h-[737px] flex-1 flex-col items-start justify-between">                            // Left 658 x 737
    <div class="flex flex-col items-start gap-3 overflow-clip">                                       // Heading 658 x 175
      <TextReveal as="h2" text="LET'S TALK ABOUT YOUR PROJECTS" class="max-w-[395px] font-display text-[40px] font-medium uppercase leading-[56px] tracking-[-1.2px] text-ink"/>   // 2 lines
      <TextReveal as="p" text={CONTACT.paragraph} class="font-display text-[16px] font-medium capitalize leading-[25.6px] tracking-[-0.32px] text-ink-2"/>                      // 658 wide, 2 lines (Title Case)
    </div>
    <div class="flex w-full flex-col items-start gap-6">                                              // Contact Info 658 x 133, gap 24
      <div class="flex w-full items-center gap-[10px] overflow-clip">                                 // row 1
        <div class="flex flex-1 flex-col items-start gap-[6px]">                                       // Phone Number 324 x 51
          <p class="text-[16px] font-medium leading-6 text-ink">Phone Number</p>
          <LineLink href="tel:+6281234567890">+62 812 3456 7890</LineLink>                             // 12px/18px/500; 1px underline slides in from left on hover
        </div>
        <div class="flex flex-1 flex-col items-start gap-[6px]">                                       // Email
          <p ...>Email</p>
          <LineLink href="mailto:hello@arkana.studio">hello@arcspherestudio.ae</LineLink>
        </div>
      </div>
      <div class="flex w-full items-center gap-[10px] overflow-clip">                                 // row 2
        <div class="flex flex-1 flex-col items-start gap-[6px]">                                       // Social Media 324 x 58
          <p ...>Social Media</p>
          <div class="flex items-start gap-3">                                                          // Logo Icon row: 4 x 28px, gap 12
            <a href="https://instagram.com" target="_blank" class="h-7 w-7 p-[2.5px] text-ink"><InstagramIcon class="h-full w-full"/></a>
            <a href="https://linkedin.com" ...><LinkedinIcon/></a>  <a href="https://pinterest.com" ...><PinterestIcon/></a>  <a href="https://behance.com" class="h-7 w-7 text-ink"><BehanceIcon class="h-full w-full"/></a>
          </div>
        </div>
        <div class="flex flex-1 flex-col items-start gap-[6px]">                                       // Address
          <p ...>Address</p>
          <p class="text-[12px] font-medium capitalize leading-[15.6px] tracking-[-0.3px] text-ink">Dubai-based architecture and interior design studio</p>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-1 flex-col items-start gap-14 overflow-clip">                                 // Right Side 658
    <form class="flex w-full flex-col items-start gap-7 overflow-hidden" onSubmit={preventDefault}>    // gap 28
      <p class="text-[20px] font-medium leading-6 tracking-[-0.4px] text-ink">Enter Your Details</p>
      <div class="flex w-full flex-col items-start gap-6">                                             // Form-List gap 24
        <Field placeholder="Full Name" name="Name" type="text" required/>                              // 658 x 55
        <Field placeholder="Email" name="Email" type="email" required/>
        <Field placeholder="Phone Number" name="Phone Number" type="tel" required/>
        <SelectField name="Location" options=[...]/>                                                   // 658 x 48
        <RadioGroup label="Project Type" options={["Residential","Commercial"]}/>                      // 658 x 76
        <Field placeholder="Your Location" name="Location" type="text" required/>
        <RadioGroup label="Project Scale" options={4 options}/>                                        // 658 x 132 (2 rows)
        <button type="submit" class="h-10 w-full rounded-[10px] bg-ink text-[14px] font-semibold leading-[16.8px] text-white transition-colors duration-200 hover:bg-[rgba(64,54,48,0.85)]">Submit</button>
      </div>
    </form>
  </div>
</section>
```
### Field (text input)
- Wrapper: `relative flex w-full items-center overflow-hidden pt-3 pb-4` (padding 12px 0 16px, height 55), bottom border via `after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink` (1px rgb(79,71,66)); `transition: box-shadow 0.3s cubic-bezier(0.44,0,0.56,1)`; when the input is focused (`focus-within`) add `box-shadow: rgba(0,0,0,0.18) 0 0.6px 0.6px -1.25px, rgba(0,0,0,0.16) 0 2.29px 2.29px -2.5px, rgba(0,0,0,0.06) 0 10px 10px -3.75px`.
- Input: `w-full bg-transparent font-display text-[18px] font-normal leading-[27px] tracking-[-0.3px] text-[#0d0d0d] outline-none placeholder:text-[#6b6b6b]`; height 27px; no border.
### SelectField
- `<select class="h-12 w-full appearance-none bg-transparent pt-3 pb-4 font-inter text-[17px] font-normal leading-[20.4px] text-[#6b6b6b] outline-none">` with the same 1px bottom border (wrapper `after:`). Options: "Select Service...", then `CONTACT.form.serviceSelect.options`. Selected option text color rgb(0,0,0).
### RadioGroup (custom pills)
- `<div class="flex w-full flex-col gap-4">` label `<span class="font-inter text-[17px] font-normal leading-[20.4px] tracking-[-0.17px] text-[#6b6b6b]">`; options `<div class="flex flex-wrap gap-4">` each `<button type="button" role="radio" aria-checked class="flex h-10 items-center justify-center rounded-[999px] border px-[14px] font-inter text-[14px] font-medium leading-[14px] tracking-[-0.14px] transition-[background-color,border-color,color] duration-[180ms]" style="flex: 0 0 calc(50% - 8px)">`.
  - idle: bg rgba(79,71,66,0.12); border 1px rgba(79,71,66,0.16); text rgb(79,71,66). Hover: unchanged.
  - selected: bg rgb(79,71,66); border 1px rgb(204,204,194); text rgb(239,237,233).
### LineLink (phone/email)
- `<a class="group flex flex-col items-center gap-[2px] overflow-hidden">` label `text-[12px] font-medium leading-[18px] text-ink whitespace-pre`; underline wrap `relative h-px w-full overflow-hidden` with bar `absolute inset-y-0 left-0 w-full bg-ink -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)]`.

## Tablet & phone (< 1200)
- Section becomes a column (gap 56). Heading h2 24px / 33.6px / 500 / -0.72px; paragraph 12px / 15.6px / 500 / -0.24px. The Contact Info block (phone/email/social/address) is HIDDEN below 1200px.
- Form: "Enter Your Details" 14px / 16.8px / 500 / -0.28px; Field wrapper padding 8px 0 (34px tall), input 18px; select 30px tall; radio pills unchanged (2 per row); submit 40px. Form heading and list each get a FadeUp (y 24).

## Text (verbatim) — from `CONTACT` in content.ts.
