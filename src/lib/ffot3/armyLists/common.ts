import type { RoleOption } from "../formations";

/* Equipment Notes shared by the NATO lists. */

/** The M109A1-4 card ends in 1993; allies then field the M109A6. */
export const NATO_SP155: RoleOption[] = [
  { years: [1963, 1993], options: ["M109A1-4 SP 155mm How"] },
  { years: [1994, 2015], options: ["M109A6 SP 155mm How"] },
];

/** The M114 card ends in 1978; the generic 155mm How covers later years. */
export const M114: RoleOption[] = [{ options: ["155mm How", "M114 155mm How"] }];
