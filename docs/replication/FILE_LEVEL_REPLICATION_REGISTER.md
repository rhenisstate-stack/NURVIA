# File-Level Replication Register (Final Reconciliation)

Full machine-readable register with SHA-256 hashes, sizes, categories, and final dispositions is in `FILE_LEVEL_REPLICATION_REGISTER.csv`.

## Final Disposition Summary

- **Total Applicable Qlex Files:** 1757
- **`REPLICATED_EXACTLY` (identical SHA-256):** 1624
- **`ADAPTED_AND_VERIFIED`:** 130
- **`EXISTING_EQUIVALENT_VERIFIED`:** 2
- **`NURVIA_SPECIFIC_PRESERVED`:** 1
- **Missing / Unclassified:** 0

## Non-Identical / Adapted / Equivalent / Preserved Files

| ID | Qlex Path | NURVIA Target | Final Disposition |
|---|---|---|---|
| QLEX-0001 | `.env.local` | `apps/web/.env.local` | `ADAPTED_AND_VERIFIED` |
| QLEX-0004 | `eslint.config.mjs` | `apps/web/eslint.config.mjs` | `ADAPTED_AND_VERIFIED` |
| QLEX-0005 | `next-env.d.ts` | `apps/web/next-env.d.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0006 | `next.config.ts` | `apps/web/next.config.mjs` | `ADAPTED_AND_VERIFIED` |
| QLEX-0007 | `package-lock.json` | `apps/web/package-lock.json` | `ADAPTED_AND_VERIFIED` |
| QLEX-0008 | `package.json` | `apps/web/package.json` | `ADAPTED_AND_VERIFIED` |
| QLEX-0009 | `postcss.config.mjs` | `apps/web/postcss.config.js` | `EXISTING_EQUIVALENT_VERIFIED` |
| QLEX-0010 | `tsconfig.json` | `apps/web/tsconfig.json` | `ADAPTED_AND_VERIFIED` |
| QLEX-0011 | `tsconfig.tsbuildinfo` | `apps/web/tsconfig.tsbuildinfo` | `ADAPTED_AND_VERIFIED` |
| QLEX-0084 | `src/middleware.ts` | `apps/web/middleware.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0086 | `src/app/globals.css` | `apps/web/app/globals.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-0087 | `src/app/layout.tsx` | `apps/web/app/layout.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0088 | `src/app/(web)/layout.tsx` | `apps/web/app/(web)/layout.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0089 | `src/app/(web)/page.tsx` | `apps/web/app/page.tsx` | `NURVIA_SPECIFIC_PRESERVED` |
| QLEX-0093 | `src/app/(web)/auth/page.tsx` | `apps/web/app/(web)/auth/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0094 | `src/app/(web)/auth/login/page.tsx` | `apps/web/app/(web)/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0095 | `src/app/(web)/auth/logout/page.tsx` | `apps/web/app/(web)/auth/logout/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0096 | `src/app/(web)/auth/modals/Annex.tsx` | `apps/web/app/(web)/auth/modals/Annex.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0098 | `src/app/(web)/auth/modals/Login.tsx` | `apps/web/app/(web)/auth/modals/Login.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0099 | `src/app/(web)/auth/modals/Register.tsx` | `apps/web/app/(web)/auth/modals/Register.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0100 | `src/app/(web)/auth/modals/auth.tsx` | `apps/web/app/(web)/auth/modals/auth.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0102 | `src/app/(web)/auth/recovery/password/page.tsx` | `apps/web/app/(web)/auth/recovery/password/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0104 | `src/app/(web)/auth/register/page.tsx` | `apps/web/app/(web)/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0159 | `src/app/api/auth/account/destroy/route.ts` | `apps/web/app/api/auth/account/destroy/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0160 | `src/app/api/auth/login/route.ts` | `apps/web/app/api/auth/login/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0161 | `src/app/api/auth/logout/route.ts` | `apps/web/app/api/auth/logout/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0162 | `src/app/api/auth/recovery/password/route.ts` | `apps/web/app/api/auth/recovery/password/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0163 | `src/app/api/auth/recovery/social/route.ts` | `apps/web/app/api/auth/recovery/social/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0164 | `src/app/api/auth/register/route.ts` | `apps/web/app/api/auth/register/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0165 | `src/app/api/auth/session/route.ts` | `apps/web/app/api/auth/session/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0166 | `src/app/api/auth/social/apple/route.ts` | `apps/web/app/api/auth/social/apple/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0167 | `src/app/api/auth/social/facebook/route.ts` | `apps/web/app/api/auth/social/facebook/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0168 | `src/app/api/auth/social/github/route.ts` | `apps/web/app/api/auth/social/github/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0169 | `src/app/api/auth/social/google/route.ts` | `apps/web/app/api/auth/social/google/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0170 | `src/app/api/auth/social/linkedin/route.ts` | `apps/web/app/api/auth/social/linkedin/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0171 | `src/app/api/auth/social/microsoft/route.ts` | `apps/web/app/api/auth/social/microsoft/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0172 | `src/app/api/auth/social/onetap/route.ts` | `apps/web/app/api/auth/social/onetap/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0173 | `src/app/api/auth/support/2fa/route.ts` | `apps/web/app/api/auth/support/2fa/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0174 | `src/app/api/auth/support/account/route.ts` | `apps/web/app/api/auth/support/account/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0175 | `src/app/api/auth/support/email/route.ts` | `apps/web/app/api/auth/support/email/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0176 | `src/app/api/auth/support/message/route.ts` | `apps/web/app/api/auth/support/message/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0177 | `src/app/api/auth/support/password/route.ts` | `apps/web/app/api/auth/support/password/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0178 | `src/app/api/auth/support/phone/route.ts` | `apps/web/app/api/auth/support/phone/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0179 | `src/app/api/auth/support/social/route.ts` | `apps/web/app/api/auth/support/social/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0180 | `src/app/api/auth/validate/route.tsx` | `apps/web/app/api/auth/validate/route.ts` | `EXISTING_EQUIVALENT_VERIFIED` |
| QLEX-0181 | `src/app/api/media/[...path]/route.ts` | `apps/web/app/api/media/[...path]/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0182 | `src/app/api/nexus/dominion/subscription/item/route.ts` | `apps/web/app/api/nexus/dominion/subscription/item/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0183 | `src/app/api/nexus/dominion/subscription/package/route.ts` | `apps/web/app/api/nexus/dominion/subscription/package/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0184 | `src/app/api/nexus/strata/assessment/assessment/route.ts` | `apps/web/app/api/nexus/strata/assessment/assessment/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0185 | `src/app/api/nexus/strata/assessment/exam/route.ts` | `apps/web/app/api/nexus/strata/assessment/exam/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0186 | `src/app/api/nexus/strata/assessment/exam/diy/route.ts` | `apps/web/app/api/nexus/strata/assessment/exam/diy/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0187 | `src/app/api/nexus/strata/assessment/exam/upserts/route.ts` | `apps/web/app/api/nexus/strata/assessment/exam/upserts/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0188 | `src/app/api/nexus/strata/assessment/question/route.ts` | `apps/web/app/api/nexus/strata/assessment/question/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0189 | `src/app/api/nexus/strata/assessment/result/route.ts` | `apps/web/app/api/nexus/strata/assessment/result/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0190 | `src/app/api/nexus/strata/assessment/section/route.ts` | `apps/web/app/api/nexus/strata/assessment/section/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0191 | `src/app/api/nexus/strata/content/cognition/route.ts` | `apps/web/app/api/nexus/strata/content/cognition/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0192 | `src/app/api/nexus/strata/content/document/route.ts` | `apps/web/app/api/nexus/strata/content/document/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0193 | `src/app/api/nexus/strata/institution/cohort/route.ts` | `apps/web/app/api/nexus/strata/institution/cohort/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0194 | `src/app/api/nexus/strata/institution/department/route.ts` | `apps/web/app/api/nexus/strata/institution/department/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0195 | `src/app/api/nexus/strata/institution/division/route.ts` | `apps/web/app/api/nexus/strata/institution/division/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0196 | `src/app/api/nexus/strata/institution/institution/route.ts` | `apps/web/app/api/nexus/strata/institution/institution/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0197 | `src/app/api/nexus/strata/institution/school/route.ts` | `apps/web/app/api/nexus/strata/institution/school/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0198 | `src/app/api/nexus/strata/institution/strataclass/route.ts` | `apps/web/app/api/nexus/strata/institution/strataclass/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0199 | `src/app/api/nexus/strata/learning/concept/route.ts` | `apps/web/app/api/nexus/strata/learning/concept/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0200 | `src/app/api/nexus/strata/learning/course/route.ts` | `apps/web/app/api/nexus/strata/learning/course/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0201 | `src/app/api/nexus/strata/learning/fact/route.ts` | `apps/web/app/api/nexus/strata/learning/fact/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0202 | `src/app/api/nexus/strata/learning/lesson/route.ts` | `apps/web/app/api/nexus/strata/learning/lesson/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0203 | `src/app/api/nexus/strata/learning/program/route.ts` | `apps/web/app/api/nexus/strata/learning/program/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0204 | `src/app/api/nexus/strata/learning/subject/route.ts` | `apps/web/app/api/nexus/strata/learning/subject/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0205 | `src/app/api/nexus/strata/learning/topic/route.ts` | `apps/web/app/api/nexus/strata/learning/topic/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0206 | `src/app/api/nexus/strata/learning/unit/route.ts` | `apps/web/app/api/nexus/strata/learning/unit/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0207 | `src/app/api/nexus/strata/main/category/route.ts` | `apps/web/app/api/nexus/strata/main/category/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0208 | `src/app/api/nexus/strata/main/domain/route.ts` | `apps/web/app/api/nexus/strata/main/domain/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0209 | `src/app/api/nexus/strata/main/subcategory/route.ts` | `apps/web/app/api/nexus/strata/main/subcategory/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0210 | `src/app/api/seek/route.ts` | `apps/web/app/api/seek/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0212 | `src/app/api/system/license/route.ts` | `apps/web/app/api/system/license/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0213 | `src/app/api/system/privilege/route.ts` | `apps/web/app/api/system/privilege/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0214 | `src/app/api/system/role/route.ts` | `apps/web/app/api/system/role/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0215 | `src/app/api/users/controls/registration/control/route.ts` | `apps/web/app/api/users/controls/registration/control/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0216 | `src/app/api/users/controls/registration/option/route.ts` | `apps/web/app/api/users/controls/registration/option/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0217 | `src/app/api/users/controls/session/route.ts` | `apps/web/app/api/users/controls/session/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0218 | `src/app/api/users/seed/route.ts` | `apps/web/app/api/users/seed/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0219 | `src/app/api/users/user/route.ts` | `apps/web/app/api/users/user/route.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-0232 | `src/app/dashboards/ati-teas/auth/login/page.tsx` | `apps/web/app/dashboards/ati-teas/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0234 | `src/app/dashboards/ati-teas/auth/register/page.tsx` | `apps/web/app/dashboards/ati-teas/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0322 | `src/app/dashboards/hesi-a2/auth/login/page.tsx` | `apps/web/app/dashboards/hesi-a2/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0324 | `src/app/dashboards/hesi-a2/auth/register/page.tsx` | `apps/web/app/dashboards/hesi-a2/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0412 | `src/app/dashboards/lpn-nursing/auth/login/page.tsx` | `apps/web/app/dashboards/lpn-nursing/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0414 | `src/app/dashboards/lpn-nursing/auth/register/page.tsx` | `apps/web/app/dashboards/lpn-nursing/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0502 | `src/app/dashboards/nclex-pn/auth/login/page.tsx` | `apps/web/app/dashboards/nclex-pn/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0504 | `src/app/dashboards/nclex-pn/auth/register/page.tsx` | `apps/web/app/dashboards/nclex-pn/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0592 | `src/app/dashboards/nclex-rn/auth/login/page.tsx` | `apps/web/app/dashboards/nclex-rn/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0594 | `src/app/dashboards/nclex-rn/auth/register/page.tsx` | `apps/web/app/dashboards/nclex-rn/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0682 | `src/app/dashboards/rn-nursing/auth/login/page.tsx` | `apps/web/app/dashboards/rn-nursing/auth/login/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0684 | `src/app/dashboards/rn-nursing/auth/register/page.tsx` | `apps/web/app/dashboards/rn-nursing/auth/register/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0760 | `src/app/dashboards/shared/modal/diyExamCreation.tsx` | `apps/web/app/dashboards/shared/modal/diyExamCreation.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0762 | `src/app/dashboards/shared/section/DistinctSubjects.tsx` | `apps/web/app/dashboards/shared/section/DistinctSubjects.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-0763 | `src/app/dashboards/shared/subscription/ActiveSubscriptionPackage.tsx` | `apps/web/app/dashboards/shared/subscription/ActiveSubscriptionPackage.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1372 | `src/app/web/(livexams)/partials/components/QuestionActionNavigator.tsx` | `apps/web/app/web/(livexams)/partials/components/QuestionActionNavigator.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1518 | `src/app/web/(nexus)/layout.tsx` | `apps/web/app/web/(nexus)/layout.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1519 | `src/app/web/(nexus)/assessments/absolute/overview/page.tsx` | `apps/web/app/web/(nexus)/assessments/absolute/overview/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1520 | `src/app/web/(nexus)/programs/absolute/overview/page.tsx` | `apps/web/app/web/(nexus)/programs/absolute/overview/page.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1580 | `src/components/common/ScrollToTopButton.tsx` | `apps/web/components/common/ScrollToTopButton.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1582 | `src/components/common/ThemeToggleButton.tsx` | `apps/web/components/common/ThemeToggleButton.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1583 | `src/components/common/dashboards/elements/DashboardPreloader.tsx` | `apps/web/components/common/dashboards/elements/DashboardPreloader.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1586 | `src/components/common/dashboards/modals/AccessReminderModals.tsx` | `apps/web/components/common/dashboards/modals/AccessReminderModals.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1587 | `src/components/common/dashboards/modals/DashboardsAccessGate.tsx` | `apps/web/components/common/dashboards/modals/DashboardsAccessGate.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1588 | `src/components/common/dashboards/modals/useExamAccessGuard.tsx` | `apps/web/components/common/dashboards/modals/useExamAccessGuard.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1589 | `src/components/common/modals/seek/SeekModal.tsx` | `apps/web/components/common/modals/seek/SeekModal.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1590 | `src/components/dashboards/includes/navbar/dropdowns/Dropdown.tsx` | `apps/web/components/dashboards/includes/navbar/dropdowns/Dropdown.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1591 | `src/components/dashboards/includes/navbar/dropdowns/DropdownItem.tsx` | `apps/web/components/dashboards/includes/navbar/dropdowns/DropdownItem.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1592 | `src/components/dashboards/includes/sidebar/tooltips/SidebarTooltip.tsx` | `apps/web/components/dashboards/includes/sidebar/tooltips/SidebarTooltip.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1593 | `src/components/panel/exam/tools/CustomMiniCalculator.tsx` | `apps/web/components/panel/exam/tools/CustomMiniCalculator.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1596 | `src/lib/config/config.ts` | `apps/web/lib/config/config.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1597 | `src/lib/config/siteHeaders.ts` | `apps/web/lib/config/siteHeaders.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1598 | `src/lib/config/siteLinks.ts` | `apps/web/lib/config/siteLinks.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1599 | `src/lib/constants/dashboards/nexus/vista/quotes.ts` | `apps/web/lib/constants/dashboards/nexus/vista/quotes.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1600 | `src/lib/constants/strata/dynamicFormEnums.ts` | `apps/web/lib/constants/strata/dynamicFormEnums.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1602 | `src/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext.tsx` | `apps/web/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1605 | `src/lib/contexts/panel/layout/theme/PanelThemeContext.tsx` | `apps/web/lib/contexts/panel/layout/theme/PanelThemeContext.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1607 | `src/lib/contexts/web/assessment/live/useLiveExamActionContext.tsx` | `apps/web/lib/contexts/web/assessment/live/useLiveExamActionContext.tsx` | `ADAPTED_AND_VERIFIED` |
| QLEX-1726 | `src/lib/services/auth/loginService.ts` | `apps/web/lib/services/auth/loginService.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1730 | `src/lib/services/auth/socialService.ts` | `apps/web/lib/services/auth/socialService.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1735 | `src/lib/services/nexus/strata/examService.ts` | `apps/web/lib/services/nexus/strata/examService.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1737 | `src/lib/services/partial/helper/systemSessionHeaders.ts` | `apps/web/lib/services/partial/helper/systemSessionHeaders.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1749 | `src/lib/utils/sessions/clearSystemUserSessionCookies.ts` | `apps/web/lib/utils/sessions/clearSystemUserSessionCookies.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1750 | `src/lib/utils/sessions/generateSystemUserSessionCookies.ts` | `apps/web/lib/utils/sessions/generateSystemUserSessionCookies.ts` | `ADAPTED_AND_VERIFIED` |
| QLEX-1752 | `src/styles/dashboards/editors/tiptap/global.css` | `apps/web/styles/dashboards/editors/tiptap/global.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-1753 | `src/styles/dashboards/forms/global.css` | `apps/web/styles/dashboards/forms/global.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-1754 | `src/styles/dashboards/nexus/strata/hierarchy/global.css` | `apps/web/styles/dashboards/nexus/strata/hierarchy/global.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-1755 | `src/styles/dashboards/sidebars/left/global.css` | `apps/web/styles/dashboards/sidebars/left/global.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-1756 | `src/styles/dashboards/sidebars/right/global.css` | `apps/web/styles/dashboards/sidebars/right/global.css` | `ADAPTED_AND_VERIFIED` |
| QLEX-1757 | `src/styles/web/globals.css` | `apps/web/styles/web/globals.css` | `ADAPTED_AND_VERIFIED` |
